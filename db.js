const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3-multiple-ciphers');
const { loadKey } = require('./keys');
const { logLine, logWarn, logFail } = require('./log');
// Die eine Ansage dieser Datei bleibt im Neben-Thread still: der
// Bestandslauf oeffnet dieselbe Datei aus seinem eigenen Thread.
const { isMainThread } = require('worker_threads');

const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const DB_FILE = path.join(DATA_DIR, 'katalog.sqlite');
const key = loadKey(DATA_DIR);

function open(file) {
  const db = new Database(file);
  db.pragma("cipher='sqlcipher'");
  db.pragma(`key="x'${key.hex}'"`);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  return db;
}

/* Den Schluessel der Datei wechseln, nur von keytool.js bei angehaltener
   Instanz. PRAGMA rekey laeuft im WAL-Modus nicht: erst auf DELETE
   umschalten, wechseln, im finally zurueckschalten. */
function changeKey(newHex) {
  if (!/^[0-9a-fA-F]{64}$/.test(String(newHex)))
    throw new Error('Der neue Schluessel ist kein 64-stelliger Hexwert.');
  const before = db.pragma('journal_mode', { simple: true });
  db.pragma('journal_mode = DELETE');
  try {
    db.pragma(`rekey="x'${String(newHex).toLowerCase()}'"`);
  } finally {
    db.pragma('journal_mode = WAL');
  }
  return { before, after: db.pragma('journal_mode', { simple: true }) };
}

/* Welche Verfahren wirklich laufen, abgelesen und nicht behauptet: `cipher`
   und `journal_mode` fragt die geoeffnete Datei selbst. Keine Paketversion --
   ein Name sagt, wie gerechnet wird, eine Nummer, welche Luecke passt. */
function method() {
  return {
    cipher: String(db.pragma('cipher', { simple: true }) || ''),
    keyBits: key.hex.length * 4,
    journal: String(db.pragma('journal_mode', { simple: true }) || '').toUpperCase()
  };
}

/* Kein Backtick in diesem String, auch nicht in einem SQL-Kommentar: das
   ganze Schema ist ein Template-String, und ein Backtick beendet ihn. */
const SCHEMA = `
CREATE TABLE IF NOT EXISTS product_categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE COLLATE NOCASE,
  -- IN WELCHER SPRACHE DIESER NAME GESCHRIEBEN IST. NULL IST ERLAUBT UND
  -- BEDEUTET „weiss niemand"; die Karte bietet einen Knopf zum Zuordnen an.
  -- Eine neue Zeile entsteht nie mehr ohne Sprachvermerk.
  language TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  rejected INTEGER NOT NULL DEFAULT 0,
  -- WANN, WARUM UND VON WEM abgelehnt wurde. Die drei gehoeren zu rejected und
  -- ersetzen es NICHT. ALLE DREI SIND NULLBAR -- eine alte Ablehnung kennt
  -- weder Datum noch Verfasser --, und beim Ausschalten bleiben sie stehen.
  rejected_at TEXT,
  rejected_reason TEXT,
  -- ON DELETE SET NULL wie an jedem Traeger: ein entfernter
  -- Zugang nimmt die Entscheidung nicht mit, nur seinen Namen davon.
  rejected_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  tested INTEGER NOT NULL DEFAULT 0,
  -- favorite wird nicht mehr beschrieben. Der Favorit gehoert einem Benutzer
  -- und steht in item_pins; die Spalte bleibt nur stehen, damit eine bestehende
  -- und eine frische Instanz dasselbe Schema tragen.
  favorite INTEGER NOT NULL DEFAULT 0,
  product_category_id INTEGER REFERENCES product_categories(id) ON DELETE SET NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  -- ON DELETE SET NULL, nicht CASCADE: ein entfernter Benutzer darf nicht den
  -- halben Bestand mitnehmen. Gilt fuer jede user_id an Inhalten.
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL
);

-- photos traegt ZWEI Arten in EINER Tabelle: zwei Tabellen hiessen zwei
-- sortierte Listen und damit zwei Quellen fuer die Frage nach dem Hauptbild.
-- Was die Spalten bei einem Video bedeuten:
--
--   Spalte           bei kind = 'image'      bei kind = 'video'
--   ---------------  --------------------  ----------------------------
--   data             das Originalbild      die VIDEODATEI
--   thumb            Kachel 400 px         STANDBILD 400 px
--   medium           1600 px               STANDBILD 1600 px
--   focus_x/focus_y  Ausschnitt der Kachel dasselbe, am Standbild
--   zoom             wie eng der Ausschn. dasselbe, am Standbild
--   duration            NULL                  Sekunden
--
-- Das Standbild erzeugt der Browser des Hochladenden und nicht der Server:
-- es ist eine Vorschau und kein Beleg.
CREATE TABLE IF NOT EXISTS photos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  item_id INTEGER NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  mime_type TEXT NOT NULL,
  data BLOB NOT NULL,
  thumb BLOB,
  medium BLOB,
  -- Kein CHECK auf die beiden erlaubten Werte, obwohl SQLite einen annaehme:
  -- die Menge stuende dann zweimal -- hier und dort, wo der Server sie prueft.
  -- Zwei Stellen fuer dieselbe Liste laufen auseinander.
  kind TEXT NOT NULL DEFAULT 'image',   -- 'image' | 'video'
  duration INTEGER,                      -- Sekunden, nur bei Video
  -- Fokuspunkt in Prozent. DAS ORIGINAL BLEIBT UNANGETASTET; geschnitten wird
  -- ausschliesslich die Ableitung thumb, und zwar am Server. DIE DREI WERTE
  -- SIND DAS REZEPT der Kachel -- der Ausschnitt ist jederzeit aenderbar.
  focus_x REAL NOT NULL DEFAULT 50,
  focus_y REAL NOT NULL DEFAULT 50,
  -- Der dritte Wert dieser Art heisst zoom und steht GANZ UNTEN, nicht hier.
  -- Der Grund steht dort.
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  -- WIE ENG DAS FENSTER SITZT, in Prozent: 100 heisst „so weit wie das Bild
  -- hergibt", 400 viermal so nah. Er steht hier unten, weil ADD COLUMN eine
  -- Spalte immer hinten anhaengt; die Spanne steht im Server, nicht als CHECK.
  zoom REAL NOT NULL DEFAULT 100
);
CREATE INDEX IF NOT EXISTS idx_photos_item ON photos(item_id, sort_order);

-- Ein Link gehoert dem, der ihn eintraegt, nicht dem Verfasser des Eintrags.
-- ON DELETE SET NULL und ausdruecklich NICHT NOT NULL: die Spalte muss den
-- Fall aushalten, in dem eine Zeile in users doch verschwindet.
CREATE TABLE IF NOT EXISTS links (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  item_id INTEGER NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_links_item ON links(item_id, sort_order);

-- UNIQUE(item_id, day, user_id): zwei Leute am selben Datum sind kein
-- Konflikt, sondern zwei Testtage.
CREATE TABLE IF NOT EXISTS test_days (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  item_id INTEGER NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  day TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  UNIQUE(item_id, day, user_id)
);
CREATE INDEX IF NOT EXISTS idx_testdays_item ON test_days(item_id, day);

CREATE TABLE IF NOT EXISTS rating_criteria (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  -- DAS GEWICHT im Gesamtschnitt; 1 heisst „zaehlt wie jedes andere", erlaubt
  -- ist 0,2 bis 2. KEIN CHECK hier: die Spanne stuende sonst zweimal, hier und
  -- als GEWICHT_MIN/GEWICHT_MAX im Server. REAL und nicht Hundertstel.
  weight REAL NOT NULL DEFAULT 1.0,
  -- ZU WELCHEM KASTEN DIESES KRITERIUM GEHOERT: 'before' ist die Einschaetzung
  -- vor dem Test, 'after' das Urteil danach. KEIN CHECK hier -- die Menge der
  -- Werte steht als PHASEN genau einmal, in server.js. UNIQUE(name) bleibt global.
  phase TEXT NOT NULL DEFAULT 'after',
  -- IN WELCHER SPRACHE DIESER NAME GESCHRIEBEN IST -- dieselbe Spalte mit
  -- derselben Bedeutung wie an product_categories. NULL heisst „unbekannt"
  -- und nicht „keine".
  language TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

/* DIE NAMEN JE SPRACHE: zwei Tabellen daneben und keine Spalte an den
   vorhandenen -- eine zweite Zeile je Sprache traefe sonst jede Bewertung im
   Bestand. Ohne Zeile gilt der Name der Grundtabelle. */
CREATE TABLE IF NOT EXISTS criterion_names (
  criterion_id INTEGER NOT NULL REFERENCES rating_criteria(id) ON DELETE CASCADE,
  language TEXT NOT NULL,
  name TEXT NOT NULL,
  UNIQUE(criterion_id, language)
);
CREATE TABLE IF NOT EXISTS category_names (
  category_id INTEGER NOT NULL REFERENCES product_categories(id) ON DELETE CASCADE,
  language TEXT NOT NULL,
  name TEXT NOT NULL,
  UNIQUE(category_id, language)
);

-- Jeder Benutzer hat seine eigene Zeile je Kriterium.
CREATE TABLE IF NOT EXISTS ratings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  item_id INTEGER NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  criterion_id INTEGER NOT NULL REFERENCES rating_criteria(id) ON DELETE CASCADE,
  value INTEGER NOT NULL DEFAULT 0,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  -- WANN DIESER WERT ZULETZT GESETZT WURDE -- die Zeile entsteht beim ersten
  -- Stern und wird danach ueberschrieben. OHNE VORGABEWERT: eine Zeile ohne
  -- Zeitpunkt heisst „unbekannt", und die Glocke uebergeht sie.
  set_at TEXT,
  UNIQUE(item_id, criterion_id, user_id)
);

CREATE TABLE IF NOT EXISTS comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  item_id INTEGER NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  -- Zwei unabhaengige Merkmale, frei kombinierbar wie "getestet"/"abgelehnt"
  -- beim Eintrag: die Art (note/report) und das Anpinnen.
  kind TEXT NOT NULL DEFAULT 'note',
  pinned INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  -- DER EINGRIFFSVERMERK, Ausnahme von „kein Aenderungsverlauf": eine Aussage
  -- ueber den JETZIGEN Zustand, kein Wer, kein Wann. Hochgezaehlt nur, wenn ein
  -- ANDERER als der Verfasser ein Bild entfernt; nicht zuruecksetzbar.
  images_removed INTEGER NOT NULL DEFAULT 0,
  -- DAS FAELLIGKEITSDATUM EINER AUFGABE: EIN DATUM, KEINE UHRZEIT, als Text
  -- 'JJJJ-MM-TT' wie test_days.day -- so ordnet der Zeichenvergleich wie der
  -- Kalender. NULL heisst „ohne Datum", und es haengt nicht an kind.
  due_date TEXT
);

-- Bilder in Kommentaren. Eigene Tabelle statt einer Spalte an attachments:
-- ein Anhang gehoert dem Eintrag, ein Kommentarbild dem Kommentar und geht mit
-- ihm. Gespeichert wird nur das umkodierte Bild, nie das Original.
CREATE TABLE IF NOT EXISTS comment_images (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  comment_id INTEGER NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
  filename TEXT NOT NULL DEFAULT 'bild.jpg',
  data BLOB NOT NULL,
  thumb BLOB,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_comment_images_comment ON comment_images(comment_id);
CREATE INDEX IF NOT EXISTS idx_comments_item ON comments(item_id);

-- WEN EIN KOMMENTAR MARKIERT: DIE ZUGANGSNUMMER UND NICHT DER NAME -- ein
-- freigegebener Name zeigte sonst auf den Falschen. handle sagt nur, WIE die
-- Markierung im Text steht; angezeigt wird immer aus der Nummer.
CREATE TABLE IF NOT EXISTS comment_mentions (
  comment_id INTEGER NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  handle TEXT NOT NULL,
  PRIMARY KEY (comment_id, user_id)
);
-- Die Glocke fragt „was ist neu und markiert MICH" -- also nach user_id.
CREATE INDEX IF NOT EXISTS idx_comment_mentions_user ON comment_mentions(user_id);

CREATE TABLE IF NOT EXISTS tags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE COLLATE NOCASE,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS item_tags (
  item_id INTEGER NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  tag_id INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (item_id, tag_id)
);
CREATE INDEX IF NOT EXISTS idx_item_tags_tag ON item_tags(tag_id);

-- Tags an Testtagen. Derselbe Tagvorrat wie am Eintrag, aber eine eigene
-- Verknuepfung: der Filter der Uebersicht greift nur auf Tags am Eintrag zu.
CREATE TABLE IF NOT EXISTS test_day_tags (
  test_day_id INTEGER NOT NULL REFERENCES test_days(id) ON DELETE CASCADE,
  tag_id INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (test_day_id, tag_id)
);
CREATE INDEX IF NOT EXISTS idx_test_day_tags_tag ON test_day_tags(tag_id);

-- Anhaenge am Eintrag. mime_type ist der vom Browser gemeldete Typ und dient
-- NUR der Anzeige -- ausgeliefert wird nie mit diesem Wert. Eine Datei gehoert
-- dem, der sie hochlaedt, nicht dem Verfasser des Eintrags.
CREATE TABLE IF NOT EXISTS attachments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  item_id INTEGER NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  mime_type TEXT NOT NULL DEFAULT '',
  size INTEGER NOT NULL DEFAULT 0,
  data BLOB NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_attachments_item ON attachments(item_id);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- Zugang. role ist eine Leiter: user < admin < owner -- ein Wert, kein
-- zweites Feld, damit "ein Eigentuemer ist immer auch Admin" baulich wahr ist.
--   user        -- schreibt eigene Beitraege, sonst nichts
--   admin       -- verwaltet den Bestand, sperrt und loescht BENUTZER
--   owner       -- dazu: Rollen vergeben, an Admins ran, Export, Import,
--                  Schluesselwert
-- status: active | locked | deleted.
--   locked      -- Anmeldung abgewiesen, laufende Sitzung faellt, Inhalte bleiben
--   deleted     -- der GRABSTEIN: die Zeile bleibt mit ihrer id stehen, der Name
--                  ist mit deleted-<id> ueberschrieben und damit freigegeben.
--                  Ein Zugang wird NIE aus der Tabelle entfernt.
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE COLLATE NOCASE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  email TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  last_login TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- user_id ist die Wurzel des Mehrbenutzerbetriebs: erst wenn eine Sitzung
-- sagen kann, WER da ist, laesst sich ueberhaupt etwas zuordnen.
-- ON DELETE CASCADE: mit dem Benutzer gehen seine Sitzungen.
CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  last_seen TEXT NOT NULL DEFAULT (datetime('now'))
);
-- Der Primaerschluessel liegt auf token; jede Frage nach den Sitzungen EINES
-- Benutzers laese sonst die ganze Tabelle. Ein Index fasst die Zeilenform
-- nicht an und legt sich bei jedem Start selbst nach.
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);

-- Die Bremse gegen Durchprobieren. Eine eigene Tabelle und keine Spalte an
-- users: gezaehlt wird je IP und je Name, und eine IP hat keinen Zugang.
-- who traegt seine Art mit, 'ip:…' oder 'name:…'; until nur bei der IP.
CREATE TABLE IF NOT EXISTS login_attempts (
  who TEXT PRIMARY KEY,
  tries INTEGER NOT NULL DEFAULT 0,
  until TEXT,
  seen_at TEXT NOT NULL DEFAULT (datetime('now'))
);
-- seen_at traegt den letzten Versuch; daran raeumt cleanupAttempts() auf.
CREATE INDEX IF NOT EXISTS idx_login_attempts_seen ON login_attempts(seen_at);

/* EIN MECHANISMUS, ZWEI ANLAESSE -- Einladung und Ruecksetzung. GESPEICHERT
   WIRD NUR DER HASH, SHA-256 ohne Salz: die Zeile wird ueber den
   Primaerschluessel gefunden und nicht gesucht. used_at bleibt stehen. */
CREATE TABLE IF NOT EXISTS tokens (
  hash TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  purpose TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  used_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
-- Gefragt wird ueber den Hash ODER nach allen Token EINES Benutzers -- beim
-- Einloesen fallen die uebrigen, beim Sperren und Entfernen ebenso. Dieselbe
-- Ueberlegung wie bei idx_sessions_user.
CREATE INDEX IF NOT EXISTS idx_tokens_user ON tokens(user_id);

/* DIE WARTESCHLANGE DER SELBSTANMELDUNG -- EINE ANFRAGE IST NOCH KEIN ZUGANG:
   kein Passwort, keine Rolle. hash ist nicht der Primaerschluessel -- die
   Adminrouten sprechen eine Zeile ueber eine NUMMER an. */
CREATE TABLE IF NOT EXISTS requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  hash TEXT NOT NULL UNIQUE,
  username TEXT NOT NULL,
  email TEXT NOT NULL,
  confirmed_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

/* DER ZWEITE FAKTOR, freiwillig je Zugang; user_id ist der Primaerschluessel.
   secret liegt im Klartext -- ein TOTP-Geheimnis wird nachgerechnet, nicht
   geprueft. last_counter nimmt nur einen ECHT GROESSEREN Zeitschritt an. */
CREATE TABLE IF NOT EXISTS two_factor (
  user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  secret TEXT NOT NULL,
  confirmed_at TEXT,
  last_counter INTEGER,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

/* DIE WIEDERHERSTELLUNGSCODES -- eine Zeile je Code, weil „jeder genau einmal"
   eine Eigenschaft der ZEILE ist. hash ist SHA-256 ohne Salz, der Klartext
   steht nirgends. Geraeumt wird nicht nach einer Frist. */
CREATE TABLE IF NOT EXISTS two_factor_codes (
  hash TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  used_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
-- Gefragt wird ueber den Hash ODER nach allen Codes EINES Zugangs -- die Zahl
-- fuer die Karte, das Ersetzen, das Abschalten. Dieselbe Ueberlegung wie bei
-- idx_tokens_user.
CREATE INDEX IF NOT EXISTS idx_two_factor_codes_user ON two_factor_codes(user_id);

/* DAS SICHERHEITSPROTOKOLL: wer Zugang hatte und wer die Instanz als Ganzes
   angefasst hat -- KEIN AENDERUNGSVERLAUF und keine Namensspalte, gespeichert
   werden Nummern. Freitext von aussen kommt nicht hinein. */
CREATE TABLE IF NOT EXISTS security_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  at TEXT NOT NULL DEFAULT (datetime('now')),
  event TEXT NOT NULL,
  actor INTEGER REFERENCES users(id) ON DELETE SET NULL,
  target INTEGER REFERENCES users(id) ON DELETE SET NULL,
  detail TEXT
);
-- Gefragt wird immer nach den JUENGSTEN Zeilen und geraeumt nach dem Alter --
-- beides ueber at. Wie bei idx_trash_at ist ein Index keine Migration.
CREATE INDEX IF NOT EXISTS idx_log_at ON security_log(at);

-- Der Favorit: eine Aussage eines Benutzers ueber einen Eintrag, keine
-- Eigenschaft des Eintrags -- deshalb eine eigene Tabelle. ON DELETE CASCADE an
-- BEIDEN Spalten; SET NULL verbietet der Primaerschluessel.
CREATE TABLE IF NOT EXISTS item_pins (
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  item_id INTEGER NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (user_id, item_id)
);
-- Der Index ist keine Zierde: beim Loeschen eines Eintrags sucht die Kaskade
-- ueber item_id, und der Primaerschluessel greift nur von links. item_tags hat
-- aus genau demselben Grund idx_item_tags_tag.
CREATE INDEX IF NOT EXISTS idx_item_pins_item ON item_pins(item_id);

-- Die persoenliche Haelfte von settings. ON DELETE CASCADE: eine persoenliche
-- Einstellung ohne Benutzer bedeutet nichts. Kein zusaetzlicher Index --
-- user_id steht an erster Stelle des Primaerschluessels.
CREATE TABLE IF NOT EXISTS user_settings (
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  value TEXT NOT NULL,
  PRIMARY KEY (user_id, key)
);

-- DER PAPIERKORB FASST KEINE BESTEHENDE ABFRAGE AN: kein Zustand 'deleted' an
-- items. content traegt den Exportumschlag ohne die Bytes -- zwanzig 20-MB-
-- Videos waeren als Base64 533 MB, und Node haelt keinen String ueber 512 MB.
CREATE TABLE IF NOT EXISTS trash (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  deleted_at TEXT NOT NULL DEFAULT (datetime('now')),
  deleted_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_trash_at ON trash(deleted_at);

-- Eine Zeile je Blob; die Nummer part ist die aus dem Paket. WARUM EINE ZEILE
-- JE BLOB: eine BLOB-Zeile wird ganz in den Arbeitsspeicher gelesen, hier
-- hoechstens 50 MB. SQLite traegt in einer Zelle rund 950 MB.
CREATE TABLE IF NOT EXISTS trash_bytes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  trash_id INTEGER NOT NULL REFERENCES trash(id) ON DELETE CASCADE,
  part INTEGER NOT NULL,
  data BLOB NOT NULL,
  UNIQUE(trash_id, part)
);
`;

/* WAS BEIM OEFFNEN LAEUFT, DARF ZWEIMAL LAUFEN: der Bestandslauf oeffnet
   dieselbe Datei aus einem eigenen Thread. Jede Zeile hier ist wiederholbar --
   IF NOT EXISTS, OR IGNORE oder ein Schreiben nur bei Abweichung. */
const db = open(DB_FILE);

/* searchFold() -- die eine Faltung der Suche, ohne Sprache. Die vier i von
   Unicode fallen auf eines, `ß` und `ss` auf `ss`; der Preis: „Masse" findet
   auch „Maße". null wird zum leeren String -- `NULL > 0` ist nie wahr. */
const searchFold = (s) => (s === null || s === undefined ? ''
  : String(s).toLowerCase().replace(/\u0307/g, '').replace(/\u0131/g, 'i')
      .replace(/\u00df/g, 'ss'));

/* kkl() -- die Faltung, in SQL eingehaengt: SQLites lower() faltet nur ASCII.
   deterministic: ohne die Angabe verbietet SQLite den Aufruf in einem Index
   oder einer erzeugten Spalte. */
db.function('kkl', { deterministic: true }, searchFold);

db.exec(SCHEMA);

/* Die Probe auf einen unvollstaendigen Bestand -- sie meldet, sie sperrt
   nicht. Gefragt wird der Bestand und kein Merker. Sie steht HINTER
   db.exec(SCHEMA): was danach fehlt, ist eine Spalte und keine Tabelle. */

/* Die sechs Tabellen, die frueher deutsch hiessen. Steht eine noch unter dem
   alten Namen da, hat die DDL daneben eine leere neue angelegt und die Zeilen
   liegen unsichtbar im alten Namen. */
const LEGACY_TABLES = [
  ['anfragen', 'requests'], ['sicherheitsprotokoll', 'security_log'],
  ['papierkorb', 'trash'], ['papierkorb_bytes', 'trash_bytes'],
  ['zweifaktor', 'two_factor'], ['zweifaktor_codes', 'two_factor_codes']
];

/* JEDE SPALTE EINZELN, mit drei Angaben: Tabelle, Spalte und der Name, unter
   dem sie frueher dalag (oder null). DER ALTE NAME IST DIE GENAUERE DIAGNOSE:
   steht er da, fehlt nicht die Spalte, sondern die Umbenennung. */
const REQUIRED_COLUMNS = [
  ['comments',           'images_removed',  null],
  ['links',              'user_id',         null],
  ['attachments',        'user_id',         null],
  ['rating_criteria',    'weight',          'gewicht'],
  ['photos',             'kind',            'art'],
  ['photos',             'duration',        'dauer'],
  ['items',              'rejected_at',     null],
  ['items',              'rejected_reason', 'rejected_grund'],
  ['items',              'rejected_by',     'rejected_von'],
  ['ratings',            'set_at',          'gesetzt_am'],
  ['photos',             'zoom',            null],
  ['rating_criteria',    'phase',           null],
  ['tokens',             'purpose',         'zweck'],
  ['tokens',             'expires_at',      'ablauf'],
  ['tokens',             'used_at',         'benutzt_am'],
  ['product_categories', 'language',        null],
  ['rating_criteria',    'language',        null],
  ['comments',           'due_date',        null]
];

function incompleteDatabase() {
  const tables = new Set(db.prepare("SELECT name FROM sqlite_master WHERE type = 'table'")
    .all().map(z => z.name));
  const findings = [];
  for (const [old, fresh] of LEGACY_TABLES)
    if (tables.has(old))
      findings.push({ place: old, fresh, kind: 'table' });
  for (const [table, column, old] of REQUIRED_COLUMNS) {
    /* FEHLT DIE TABELLE, FEHLT KEINE SPALTE. Die DDL legt jede an, die zum
       Schema gehoert; was hier trotzdem fehlte, gehoert nicht dazu, und eine
       Meldung darueber waere ein Fehlalarm. */
    if (!tables.has(table)) continue;
    const columns = db.prepare(`PRAGMA table_info(${table})`).all().map(c => c.name);
    if (columns.includes(column)) continue;
    findings.push({ place: `${table}.${column}`, kind: 'column',
                    old: old ? `${table}.${old}` : null,
                    oldThere: Boolean(old) && columns.includes(old) });
  }
  return findings;
}

/* DER KASTEN, dieselbe Form wie warnKeyBesideData() in keys.js: derselbe
   Rahmen, dieselbe Breite. ER SAGT, WAS ZU TUN IST, und nicht nur, was falsch
   ist -- ein Hinweis ohne Weg ist eine Beunruhigung. */
function warnIncompleteDatabase(findings) {
  if (!isMainThread || !findings.length) return;
  /* DER ALTE NAME STEHT AUCH DANN DA, WENN ER NICHT MEHR LIEGT: „fehlt, und
     unter dem alten Namen liegt sie auch nicht" ist die schaerfere Auskunft
     als „fehlt". */
  const rows = findings.map(f => f.kind === 'table'
    ? `    ${f.place.padEnd(22)} was renamed to ${f.fresh};\n` +
      `    ${''.padEnd(22)} its rows are invisible to this version`
    : `    ${f.place.padEnd(22)} is missing` +
      (f.old ? (f.oldThere ? `; still present as ${f.old}`
                           : `, and not present as ${f.old} either`) : ''));
  console.warn(
    '\n' +
    '  ------------------------------------------------------------------\n' +
    '  WARNING: this database is incomplete. It is missing parts that\n' +
    '  earlier versions added while starting up. Those upgrade steps have\n' +
    '  been removed, so they never run again:\n' +
    '\n' +
    rows.join('\n') + '\n' +
    '\n' +
    '  To repair it, open this database once with the last version that\n' +
    '  still carried the upgrade steps -- the README names it -- let it\n' +
    '  start, shut it down, and come back here.\n' +
    '\n' +
    '  THIS INSTANCE STARTS ANYWAY. Nothing is blocked and nothing is\n' +
    '  changed; but every page that reads one of the parts above fails\n' +
    '  until the database has been through that version.\n' +
    '  ------------------------------------------------------------------\n'
  );
}
warnIncompleteDatabase(incompleteDatabase());

/* DIE INDIZES AUF NACHGERUESTETE SPALTEN STEHEN HIER UNTEN UND NICHT IN DER
   DDL, weil sie eine Klammer tragen: dort truege `db.exec(SCHEMA)` den
   Fehlschlag. Ein fehlender Index kostet Geschwindigkeit, keine Auskunft. */

/* WOZU DER ERSTE: `kind` steht hinter drei Blobs (data, thumb, medium). Wer
   es aus dem SATZ liest, laeuft die ganze Kette der Overflow-Seiten durch.
   Gemessen an einer SQLCipher-Datei mit 400 Zeilen a 512 kB (312 MB):

     COUNT(*)                                        0,0 ms
     mime_type gruppiert  (Spalte 2, VOR den Blobs)  8,7 ms
     kind gruppiert       (Spalte 6, HINTER ihnen)   1338,8 ms
     SUM(length(data))    (Spalte 3)                 7,2 ms
     SUM(length(data)) mit WHERE kind != 'video'      1334,1 ms
     kind gruppiert, MIT diesem Index                0,1 ms

   EINE GLEICHHEIT, KEINE UNGLEICHHEIT: `WHERE kind != 'video'` schlaegt den
   Index aus, `WHERE kind IS ?` nutzt ihn. Aufbau einmalig 1,4 s bei 312 MB. */
/* WAS EIN INDEX BRAUCHT, DER SICH AN EINER UNVOLLSTAENDIGEN DATENBANK NICHT
   ANLEGEN LAESST: er wird versucht, er faellt weich, und er sagt es in EINER
   Zeile. Der Kasten weiter oben hat schon gesagt, WAS fehlt. */
const tryIndex = (name, sql) => {
  try { db.exec(sql); } catch (e) {
    if (isMainThread)
      logWarn(`Index ${name} not created: ${e.message} -- ` +
        'see the warning above; queries run without it, only slower.');
  }
};

tryIndex('idx_photos_kind',
  'CREATE INDEX IF NOT EXISTS idx_photos_kind ON photos(kind)');

/* WOZU DER ZWEITE: `/api/items` holt je Eintrag sieben Fotospalten, die
   hinter data, thumb und medium stehen. Gemessen an derselben Datei
   (400 Eintraege, 400 Fotos, 312 MB), je Aufruf ueber alle Eintraege:

     N Abfragen, aus dem Satz                           9,3 ms
     N Abfragen, aus diesem deckenden Index             3,0 ms
     EINE Abfrage, aus diesem deckenden Index           1,6 ms
     EINE Abfrage, ohne ihn                             6,3 ms

   DIE LISTE MUSS VOLLSTAENDIG SEIN: fehlt eine Spalte, faellt SQLite auf
   idx_photos_item zurueck und liest wieder den Satz. Wer in der Uebersicht
   eine Spalte ergaenzt, ergaenzt sie AUCH HIER -- eine Pruefung haelt die
   Liste und PHOTO_SPALTEN gegeneinander. Er kostet 20 kB bei 400 Zeilen. */
tryIndex('idx_photos_tile', `CREATE INDEX IF NOT EXISTS idx_photos_tile
           ON photos(item_id, sort_order, id, mime_type, focus_x, focus_y, zoom, created_at, kind, duration)`);

/* DIE ADRESSE IST EINDEUTIG: ein partieller UNIQUE-Index, weil `ALTER TABLE`
   keines nachruesten kann; `WHERE email IS NOT NULL` und NOCASE wie am Namen.
   Stehen schon zwei gleiche da, scheitert er -- gemeldet, nicht verschwiegen. */
const qDoubleEmails = `
  SELECT lower(email) AS address, COUNT(*) AS n,
         group_concat(username, ', ') AS names
    FROM users
   WHERE email IS NOT NULL AND trim(email) <> '' AND status <> 'deleted'
   GROUP BY lower(email) HAVING COUNT(*) > 1
   ORDER BY lower(email)`;
/* Grabsteine zaehlen nicht mit: ein geloeschter Zugang meldet sich nie
   wieder an. Seine Adresse steht aber im Weg, also raeumt die Zeile darunter
   sie weg, bevor der Index versucht wird. */
db.prepare(`UPDATE users SET email = NULL WHERE status = 'deleted' AND email IS NOT NULL`).run();
let doubleEmails = [];
try {
  db.exec(`CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email
             ON users(email COLLATE NOCASE) WHERE email IS NOT NULL`);
} catch {
  doubleEmails = db.prepare(qDoubleEmails).all();
  logLine('The address stays without a lock: ' +
    doubleEmails.map(z => `${z.address} (${z.n})`).join(', ') +
    ' -- used more than once. The "Users" card names them.');
}
/* Bei jedem Abruf neu gefragt und nicht gemerkt -- und nur, wenn der Index
   fehlt: steht er, kann es keine doppelte Adresse geben. */
function emailsDoubled() {
  const present = db.prepare(
    `SELECT 1 FROM sqlite_master WHERE type = 'index' AND name = 'idx_users_email'`).get();
  return present ? [] : db.prepare(qDoubleEmails).all();
}

// --- Auffangnetz: die Instanz braucht einen Eigentuemer ---
// Gibt es keinen, wird es der aelteste Zugang, DER SCHON RECHTE HAT; erst wenn
// es auch keinen Admin gibt, der mit der kleinsten Nummer. Der Zwischenschritt
// ueber den Admin verhindert, dass ein ausdruecklich herabgestufter Erstzugang
// still wieder befoerdert wird. Ein Grabstein (status = 'deleted') erbt nie:
// er meldet sich nie wieder an. Wiederholbar und im Normalfall stumm.
{
  const n = db.prepare(
    "UPDATE users SET role = 'owner' WHERE id = (" +
    "  SELECT MIN(id) FROM users WHERE status != 'deleted' AND (" +
    "    role = 'admin' OR NOT EXISTS (" +
    "      SELECT 1 FROM users WHERE role = 'admin' AND status != 'deleted')))" +
    " AND NOT EXISTS (SELECT 1 FROM users WHERE role = 'owner')"
  ).run().changes;
  if (n) logLine('This instance had no owner; the oldest ' +
    'privileged account is the owner now (role=owner).');
}

// WEM herrenloser Bestand zufaellt, steht an genau einer Stelle -- hier. Die
// Frage liest die Rolle: der Bestand darf keinem Grabstein zufallen, denn der
// meldet sich nie wieder an. Gibt es mehrere Eigentuemer, nimmt der aelteste.
// Blankes SQL statt eines Aufrufs in auth.js: db.js darf von auth.js nichts
// wissen, die Abhaengigkeit laeuft andersherum.
function ownerId() {
  return db.prepare("SELECT MIN(id) AS id FROM users WHERE role = 'owner'").get().id;
}

// --- Auffangnetz: kein Bestand ohne Benutzer ---
/* Alles, was niemandem gehoert, faellt an den Eigentuemer -- auch eine
   Linkzeile und eine Datei. Im Normalbetrieb entsteht das nicht; geloeschte
   Zugaenge bleiben als Grabstein stehen, gefangen werden Fehlerfaelle. */
/* ZWEI AUFRUFSTELLEN, beide noetig: hier beim Start und in auth.js nach
   legeErstenBenutzerAn() -- in einer leeren Instanz gibt es noch keinen
   Benutzer, dem etwas zufallen koennte. */
// UPDATE OR IGNORE, weil user_id bei ratings und test_days im UNIQUE steht:
// zwei herrenlose Zeilen zum selben Kriterium sind moeglich (NULL gilt im
// UNIQUE als verschieden); ohne OR IGNORE stuerbe der Start an der Verletzung.
function assignInventory() {
  const counts = {};
  let sum = 0;
  const owner = ownerId();
  if (owner == null) {
    return { items: 0, comments: 0, test_days: 0, ratings: 0, links: 0, attachments: 0 };
  }
  for (const table of ['items', 'comments', 'test_days', 'ratings', 'links', 'attachments']) {
    /* Eine Tabelle ohne `user_id` wird uebergangen. Ohne diese Zeile stuerbe
       der Start an einem `db.prepare` ueber die fehlende Spalte. Gefragt wird
       die Tabelle selbst. */
    if (!db.prepare(`PRAGMA table_info(${table})`).all().some(c => c.name === 'user_id')) {
      counts[table] = 0;
      continue;
    }
    const n = db.prepare(
      `UPDATE OR IGNORE ${table} SET user_id = ? WHERE user_id IS NULL`
    ).run(owner).changes;
    counts[table] = n;
    sum += n;
  }
  if (sum) {
    logLine('Inventory without an account assigned to the owner: ' +
      `${counts.items} entries, ${counts.comments} comments, ${counts.test_days} test days, ` +
      `${counts.ratings} ratings, ${counts.links} links, ${counts.attachments} files.`);
  }
  return counts;
}
assignInventory();

// --- Grundausstattung ---
/* Die drei mitgelieferten Kriterien stehen auf Deutsch, und die Spalte
   `language` sagt es. `de` steht hier als Text und nicht als Ruf: diese Datei
   kennt die Sprachdateien nicht. */
const SEED_LANGUAGE = 'de';
const seedCriteria = ['Optische Erscheinung', 'Verarbeitungsqualität', 'Funktionalität'];
/* Ohne die Spalte `language` wird nur der Name gesetzt: ein `db.prepare`
   ueber eine fehlende Spalte scheitert beim Vorbereiten und damit beim
   Start. */
const seedHasLanguage = db.prepare('PRAGMA table_info(rating_criteria)')
  .all().some(c => c.name === 'language');
const insertCriterion = db.prepare(seedHasLanguage
  ? 'INSERT OR IGNORE INTO rating_criteria (name, language) VALUES (?, ?)'
  : 'INSERT OR IGNORE INTO rating_criteria (name) VALUES (?)');
if (db.prepare('SELECT COUNT(*) n FROM rating_criteria').get().n === 0) {
  for (const c of seedCriteria)
    if (seedHasLanguage) insertCriterion.run(c, SEED_LANGUAGE); else insertCriterion.run(c);
}

// Reihenfolge der Kriterien lueckenlos durchnummerieren; reihenfolgetreu und
// beliebig oft wiederholbar. Bewusst in JS statt als UPDATE mit Unterabfrage
// auf dieselbe Tabelle -- SQLite saehe dort bereits geaenderte Zeilen und
// nummerierte falsch.
function renumberCriteria() {
  const rows = db.prepare('SELECT id, sort_order FROM rating_criteria ORDER BY sort_order, id').all();
  const upd = db.prepare('UPDATE rating_criteria SET sort_order = ? WHERE id = ?');
  db.transaction(() => rows.forEach((r, i) => { if (r.sort_order !== i) upd.run(i, r.id); }))();
}

// --- Grundausstattung, Fortsetzung ---
const setDefault = db.prepare('INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)');
setDefault.run('title_public', JSON.stringify('Bewertungskatalog'));
setDefault.run('title_app', JSON.stringify('Model Bewertungen'));

/* Der Stempel in `settings`: `versionCreated` nur in einer wirklich frischen
   Datenbank, `versionLastOpened` bei jedem Start. Eine fehlende erste Zeile
   heisst „aelter als der Stempel". Beide sind beliebig oft fahrbar. */
const APP_VERSION = require('./package.json').version;
{
  const grown = db.prepare('SELECT COUNT(*) AS n FROM users').get().n > 0 ||
                db.prepare('SELECT COUNT(*) AS n FROM items').get().n > 0;
  if (!grown) setDefault.run('versionCreated', JSON.stringify(APP_VERSION));
  const before = db.prepare("SELECT value FROM settings WHERE key = 'versionLastOpened'").get();
  if (!before) {
    db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)')
      .run('versionLastOpened', JSON.stringify(APP_VERSION));
  } else if (before.value !== JSON.stringify(APP_VERSION)) {
    db.prepare("UPDATE settings SET value = ? WHERE key = 'versionLastOpened'")
      .run(JSON.stringify(APP_VERSION));
    /* GESAGT WIRD NUR DER WECHSEL, und nur er ist eine Nachricht. „Laeuft
       weiter unter derselben Fassung" bei jedem Start waere Gerede. */
    if (isMainThread) {
      let from = null;
      try { from = JSON.parse(before.value); } catch { from = String(before.value); }
      logLine(`This database last ran under ${from}; ` +
        `it now carries ${APP_VERSION}.`);
    }
  }
}

renumberCriteria();

// keyHex wandert mit, damit der Systembereich den vorhandenen Wert zum
// Abschreiben zeigen kann. Ausgeliefert wird er nur hinter der Anmeldung und
// nur dann, wenn er ohnehin schon neben der Datenbank liegt.
module.exports = { db, DATA_DIR, DB_FILE, keyFromEnv: key.fromEnv, keyHex: key.hex,
                   // Welche Adressen mehrfach vergeben sind -- leer, solange
                   // der partielle Index steht.
                   emailsDoubled,
                   // Die eine Faltung der Suche. Sie geht hinaus, damit die
                   // NADEL dieselbe Funktion ruft wie der Heuhaufen.
                   searchFold,
                   changeKey, method,
                   renumberCriteria, assignInventory,
                   /* Was eine unvollstaendige Datenbank vermissen laesst. Geht hinaus, damit
                      der Pruefstand die Probe an einer gestellten Lage fragen
                      kann. */
                   incompleteDatabase };
