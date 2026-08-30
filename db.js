const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3-multiple-ciphers');
const { loadKey } = require('./keys');

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

/* --- Den Schluessel der Datei wechseln -----------------------------------
   Gerufen ausschliesslich von schluessel.js auf dem Wirt, bei angehaltener
   Anlage. Es steht hier, weil hier auch journal_mode gesetzt wird.

   PRAGMA rekey LAEUFT IM WAL-MODUS NICHT ("Rekeying is not supported in WAL
   journal mode"), und open() setzt WAL bei jedem Oeffnen -- also erst auf
   DELETE umschalten, wechseln, zurueckschalten (Stolperstein 128). Die
   Rueckschaltung steht im finally: scheitert der Wechsel, bliebe die Anlage
   sonst still im DELETE-Modus zurueck.

   EIN ABBRUCH MITTENDRIN IST FOLGENLOS, solange das Rollback-Journal
   ueberlebt -- danach oeffnet der alte Schluessel, der neue wird abgewiesen,
   es entsteht kein halber Zustand. Faellt das Journal weg, ist alles verloren:
   DAS ist der Grund fuer die Sicherung davor. Es waechst auf die Groesse der
   Datenbank. */
function wechsleSchluessel(neuHex) {
  if (!/^[0-9a-fA-F]{64}$/.test(String(neuHex)))
    throw new Error('Der neue Schluessel ist kein 64-stelliger Hexwert.');
  const vorher = db.pragma('journal_mode', { simple: true });
  db.pragma('journal_mode = DELETE');
  try {
    db.pragma(`rekey="x'${String(neuHex).toLowerCase()}'"`);
  } finally {
    db.pragma('journal_mode = WAL');
  }
  return { vorher, nachher: db.pragma('journal_mode', { simple: true }) };
}

/* --- Welche Verfahren wirklich laufen -----------------------------------
   DIE KENNZAHLEN NENNEN SIE, UND SIE STEHEN DESHALB HIER UND NICHT DORT.
   Eine Kopie der Angaben in der Oberflaeche waere eine zweite Wahrheit: wer
   hier eines Tages den Journalmodus umstellt, aendert die Anzeige nicht mit,
   und die Karte behauptete dann etwas, das nicht mehr stimmt.
   ABGELESEN, NICHT BEHAUPTET: `cipher` und `journal_mode` fragt die geoeffnete
   Datei selbst, die Schluessellaenge ist die des Schluessels, der wirklich
   gesetzt wurde. Nur "scrypt" kommt von woanders -- es steht in auth.js und
   wird dort in jeden gespeicherten Wert geschrieben; der Server haengt es an.

   KEINE PAKETVERSION, NICHT EINE. Ein Verfahrensname sagt, WIE gerechnet wird,
   und das ist unbedenklich: wer die Anlage betreibt, darf wissen, worauf seine
   Daten liegen. Eine Versionsnummer sagt dagegen, WELCHE Luecke passt. */
function verfahren() {
  return {
    cipher: String(db.pragma('cipher', { simple: true }) || ''),
    schluesselBits: key.hex.length * 4,
    journal: String(db.pragma('journal_mode', { simple: true }) || '').toUpperCase()
  };
}

const SCHEMA = `
CREATE TABLE IF NOT EXISTS product_categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE COLLATE NOCASE,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  rejected INTEGER NOT NULL DEFAULT 0,
  -- WANN, WARUM UND VON WEM abgelehnt wurde. Die drei gehoeren zu rejected und
  -- ersetzen es NICHT: ein zweites Merkmal "Ergebnis" daneben waeren zwei
  -- Wahrheiten ueber dieselbe Sache (Stolperstein 47). Das vorhandene Merkmal
  -- bekommt, was ihm fehlt.
  -- ALLE DREI SIND NULLBAR, und zwar nicht aus Bequemlichkeit: eine Ablehnung
  -- aus einer Anlage vor 0.14.0 kennt weder Datum noch Verfasser, und ein
  -- erfundener Wert waere schlimmer als ein leerer. Ein Grund ist ausserdem
  -- freiwillig.
  -- ZURUECKGENOMMEN WIRD DAS MERKMAL, NICHT DIE ANGABE: beim Ausschalten von
  -- rejected bleiben die drei stehen. Sie gingen sonst verloren, ohne dass
  -- sie jemand wiederherstellen koennte -- und der Dialog bietet die alte
  -- Begruendung beim erneuten Ablehnen als Vorschlag an.
  -- tested bekommt bewusst NICHTS davon: "getestet" ist ein Zustand und keine
  -- Entscheidung. Wer beides gleich behandelt, baut die Haelfte umsonst.
  rejected_at TEXT,
  rejected_grund TEXT,
  -- ON DELETE SET NULL wie an jedem Traeger (Stolperstein 54): ein entfernter
  -- Zugang nimmt die Entscheidung nicht mit, nur seinen Namen davon.
  rejected_von INTEGER REFERENCES users(id) ON DELETE SET NULL,
  tested INTEGER NOT NULL DEFAULT 0,
  -- favorite wird nicht mehr beschrieben. Der Favorit gehoert einem Benutzer
  -- und steht in item_pins; die Spalte bleibt nur stehen, damit Bestands- und
  -- Neuanlage dasselbe Schema tragen. Nie wieder hineinschreiben: es waere
  -- eine zweite Wahrheit ueber dieselbe Sache.
  favorite INTEGER NOT NULL DEFAULT 0,
  product_category_id INTEGER REFERENCES product_categories(id) ON DELETE SET NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  -- ON DELETE SET NULL, nicht CASCADE: ein entfernter Benutzer darf nicht den
  -- halben Bestand mitnehmen. Gilt fuer jede user_id an Inhalten.
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL
);

-- photos traegt ZWEI Arten in EINER Tabelle. Zwei Tabellen hiessen zwei
-- sortierte Listen und damit zwei Quellen fuer die Frage, was das Hauptbild
-- ist. Der Tabellenname wandert deshalb NICHT mit (dieselbe Regel wie bei
-- katalog.sqlite): ein umbenannter Name brauchte einen Tabellenneubau und
-- braechte nichts.
--
-- WAS DIE VORHANDENEN SPALTEN BEI EINEM VIDEO BEDEUTEN -- die einzige Stelle,
-- an der steht, warum data je nach art etwas anderes ist:
--
--   Spalte           bei art = 'bild'      bei art = 'video'
--   ---------------  --------------------  ----------------------------
--   data             das Originalbild      die VIDEODATEI
--   thumb            Kachel 400 px         STANDBILD 400 px
--   medium           1600 px               STANDBILD 1600 px
--   focus_x/focus_y  Ausschnitt der Kachel dasselbe, am Standbild
--   dauer            NULL                  Sekunden
--
-- Das Standbild erzeugt der Browser des Hochladenden, nicht der Server: er
-- oeffnet nie ein Video. Damit ist das Standbild AUCH NICHT UEBERPRUEFBAR --
-- es ist eine Vorschau, keine Aussage. Wer es fuer einen Beleg haelt, irrt.
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
  art TEXT NOT NULL DEFAULT 'bild',   -- 'bild' | 'video'
  dauer INTEGER,                      -- Sekunden, nur bei Video
  -- Fokuspunkt in Prozent. Schneidet nichts weg: die Datei bleibt unangetastet,
  -- die beiden Werte verschieben nur das sichtbare Fenster der quadratischen
  -- Vorschau (object-position).
  focus_x REAL NOT NULL DEFAULT 50,
  focus_y REAL NOT NULL DEFAULT 50,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_photos_item ON photos(item_id, sort_order);

-- Ein Link gehoert dem, der ihn eintraegt, nicht dem Verfasser des Eintrags:
-- er erscheint nur dort, wo man ihn hinsetzt. Damit ist links der fuenfte
-- Traeger neben items, comments, test_days und ratings.
-- ON DELETE SET NULL und ausdruecklich NICHT NOT NULL: der Grabstein haelt die
-- Nummer zwar am Leben, aber die Spalte muss den Fall aushalten, in dem eine
-- Zeile in users doch verschwindet.
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
  -- Das GEWICHT dieses Kriteriums im Gesamtschnitt. 1 heisst "zaehlt wie
  -- jedes andere". Erlaubt ist 0,2 bis 2, und nur positiv: NULL, 0 und alles
  -- Negative sind es nicht. Bei Gewicht 0 waere der Nenner eines Eintrags, an
  -- dem nur dieses Kriterium bewertet ist, null, und die Division ginge nicht
  -- auf; ein negatives Gewicht kehrte die Aussage um -- eine gute Note zoege
  -- den Schnitt nach unten -- und braeche die Zusicherung [1,5] mit.
  -- Verrechnet wird als gewichteter MITTELWERT, nicht als Summe: dadurch
  -- liegt der Gesamtschnitt immer zwischen 1 und 5, ohne dass das irgendwo
  -- durchgesetzt werden muesste.
  -- KEIN CHECK an dieser Stelle, und der Grund ist nicht, dass SQLite es
  -- nicht koennte -- ADD COLUMN nimmt einen CHECK an, und er greift danach.
  -- Der Grund ist, dass die Spanne dann ZWEIMAL stuende: hier und in
  -- GEWICHT_MIN/GEWICHT_MAX im Server. Zwei Stellen fuer dieselbe Grenze
  -- laufen auseinander, und die zweite meldete sich nicht als Absage mit
  -- Meldung, sondern als abgebrochene Schreibung.
  -- REAL und nicht Hundertstel als INTEGER: eine Umrechnung an jeder
  -- Lesestelle vergisst irgendwann jemand. photos.focus_x geht denselben Weg.
  gewicht REAL NOT NULL DEFAULT 1.0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Jeder Benutzer hat seine eigene Zeile je Kriterium.
CREATE TABLE IF NOT EXISTS ratings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  item_id INTEGER NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  criterion_id INTEGER NOT NULL REFERENCES rating_criteria(id) ON DELETE CASCADE,
  value INTEGER NOT NULL DEFAULT 0,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  -- WANN DIESER WERT ZULETZT GESETZT WURDE. Er heisst nicht created_at, und
  -- das ist kein Geschmack: die Zeile entsteht beim ersten Stern und wird
  -- danach ueberschrieben (ON CONFLICT DO UPDATE). Was hier steht, ist der
  -- Zeitpunkt der letzten Setzung -- und genau der ist gemeint, wenn die
  -- Glocke fragt, ob seit meinem letzten Blick jemand bewertet hat.
  -- OHNE VORGABEWERT, und zwar mit Absicht. Eine Zeile ohne Zeitpunkt heisst
  -- „die Anlage weiss nicht, wann das war" -- das gilt fuer alles, was vor
  -- 0.16.0 entstanden ist, und ebenso fuer eingespielte Bewertungen: die
  -- Exportdatei traegt den Zeitpunkt nicht (Format 11 bleibt Format 11), und
  -- ein datetime('now') beim Einspielen machte daraus die Behauptung, sie
  -- seien eben erst vergeben worden. Die Glocke uebergeht Zeilen ohne Zeitpunkt.
  -- ALTER TABLE ADD COLUMN kann in SQLite ohnehin keinen nicht-konstanten
  -- Vorgabewert setzen; frisch angelegt und migriert sehen damit gleich aus.
  gesetzt_am TEXT,
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
  -- DER EINGRIFFSVERMERK. Bewusste Ausnahme von "kein Aenderungsverlauf":
  -- eine Aussage ueber den JETZIGEN Zustand, kein Wer, kein Wann, keine
  -- Kette. Ohne sie verschwaende ein zerstoererischer Eingriff in eine fremde
  -- Aussage wortlos. Hochgezaehlt nur, wenn ein ANDERER als der Verfasser ein
  -- Bild entfernt; der Verfasser raeumt bei sich auf, das ist kein Eingriff.
  -- Nicht zuruecksetzbar, und NIE im Textfeld -- dort taete der Admin genau
  -- das, was er nicht darf.
  -- Die Vorgabe 0 greift fuer jede Bestandszeile; Migrationscode braucht es
  -- deshalb nicht.
  images_removed INTEGER NOT NULL DEFAULT 0
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
-- NUR der Anzeige -- ausgeliefert wird nie mit diesem Wert, siehe server.js.
-- Eine Datei gehoert dem, der sie hochlaedt, nicht dem Verfasser des Eintrags:
-- sie erscheint nur dort, wo man sie hinsetzt. Damit ist attachments der
-- sechste Traeger -- dieselbe Form und derselbe Grund wie bei links.
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

-- Zugang. role ist eine Leiter: user < admin < eigentuemer -- ein Wert, kein
-- zweites Feld, damit "ein Eigentuemer ist immer auch Admin" baulich wahr ist.
--   user        -- schreibt eigene Beitraege, sonst nichts
--   admin       -- verwaltet den Bestand, sperrt und loescht BENUTZER
--   eigentuemer -- dazu: Rollen vergeben, an Admins ran, Export, Import,
--                  Schluesselwert
-- status: aktiv | gesperrt | geloescht.
--   gesperrt  -- Anmeldung abgewiesen, laufende Sitzung faellt, Inhalte bleiben
--   geloescht -- der GRABSTEIN: die Zeile bleibt mit ihrer id stehen, damit
--                user_id weiterhin auf etwas zeigt; der Name ist mit
--                geloescht-<id> ueberschrieben und damit freigegeben. Ein
--                Zugang wird NIE aus der Tabelle entfernt: ON DELETE SET NULL
--                machte seinen Bestand sonst herrenlos, und ordneBestandZu()
--                schoebe ihn beim naechsten Start still dem Eigentuemer zu.
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE COLLATE NOCASE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  email TEXT,
  status TEXT NOT NULL DEFAULT 'aktiv',
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
-- Benutzers -- sperren, loeschen, spaeter "Meine Sitzungen" -- laese sonst die
-- ganze Tabelle. Ein Index ist keine Migration: er fasst die Zeilenform nicht an
-- und legt sich bei jedem Start selbst nach, in frischer wie bestehender Anlage.
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);

/* EIN MECHANISMUS, ZWEI ANLAESSE -- Einladung und Ruecksetzung. Beide enden
   im selben Vorgang: jemand setzt sein Passwort selbst, ueber einen Link mit
   begrenzter Haltbarkeit.

   GESPEICHERT WIRD NUR DER HASH: SHA-256, einmal, OHNE Salz -- und das ist
   strenger als der Bestand daneben, denn sessions.token steht im Klartext.
   scrypt schuetzt RATBARE Geheimnisse; ein Token traegt 256 Zufallsbits. Ohne
   Salz ist der Hash ein Schluessel: die Zeile wird ueber den
   Primaerschluessel GEFUNDEN statt gesucht, ein zeitunabhaengiger Vergleich
   hat hier nichts zu tun. Mit Salz je Zeile muesste eine Route VOR der
   Anmeldung bei jedem Versuch jede Zeile durchrechnen.

   zweck IST DIE FESTSTELLUNG EINES VORGANGS -- welcher Knopf gedrueckt wurde.
   Daran haengt kein Recht, kein Filter und kein Ablauf; der Text am
   Bildschirm leitet sich aus dem ZUSTAND ab (hat der Zugang schon ein
   Passwort), nicht aus dieser Spalte.

   benutzt_am BLEIBT STEHEN statt die Zeile zu loeschen: es ist die einzige
   Spur, dass eine Einladung angenommen wurde. raeumeTokensAuf() haelt die
   Tabelle klein.

   created_at steht ausdruecklich da: aus ablauf minus sieben Tage
   zurueckzurechnen waere richtig, bis die Frist wechselt -- und danach still
   falsch.

   ON DELETE CASCADE: ein Token ohne Benutzer oeffnet nichts. Im Betrieb
   greift die Kaskade nie -- ein Zugang wird zum Grabstein --, deshalb raeumen
   entferneZugang() und setzeStatus() die Token ausdruecklich selbst mit weg.
   Ein offener Link auf einen gesperrten Zugang waere sonst ein Weg an der
   Sperre vorbei. */
CREATE TABLE IF NOT EXISTS tokens (
  hash TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  zweck TEXT NOT NULL,
  ablauf TEXT NOT NULL,
  benutzt_am TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
-- Gefragt wird ueber den Hash (Primaerschluessel) ODER nach allen Token EINES
-- Benutzers -- beim Einloesen fallen die uebrigen, beim Sperren und Entfernen
-- ebenso. Dieselbe Ueberlegung wie bei idx_sessions_user, und wie dort ist ein
-- Index keine Migration.
CREATE INDEX IF NOT EXISTS idx_tokens_user ON tokens(user_id);

/* DIE WARTESCHLANGE DER SELBSTANMELDUNG -- EINE ANFRAGE IST NOCH KEIN ZUGANG.
   Hier steht, WER gefragt hat, und sonst nichts: kein Passwort, kein Recht,
   keine Rolle. Ein Zugang wird daraus erst, wenn ein Admin freischaltet --
   dann ueber legeZugangAn und einen Einladungstoken wie jeder andere.

   EINE EIGENE TABELLE UND KEIN DRITTER ZWECK IN tokens, und der Grund ist
   baulich: tokens.user_id ist NOT NULL und zeigt auf users. Eine Anfrage hat
   noch keinen Zugang, auf den sie zeigen koennte.

   hash IST DERSELBE MECHANISMUS WIE BEIM TOKEN (SHA-256 ohne Salz,
   Begruendung dort). Er ist trotzdem NICHT der Primaerschluessel: die
   Adminrouten sprechen eine Zeile ueber eine NUMMER an, und ein Geheimnis hat
   in einem Pfad nichts verloren -- dort stuende es im Zugriffsprotokoll, in
   der Verlaufsliste und womoeglich im Referrer.

   DER LINK IN DER BESTAETIGUNGSMAIL HAT KEINE PASSWORTKRAFT: er setzt
   bestaetigt_am, mehr nicht. Deshalb steht hier kein password_hash und keine
   Rolle -- was es nicht gibt, kann kein Weg hereinlassen.

   username UND email SIND FREITEXT VON AUSSEN -- der einzige, der ueberhaupt
   gespeichert wird. Sie gehen VOR dem Schreiben durch dieselben Pruefungen
   wie ein echter Zugang (pruefeName, mail.istAdresse), und von hier aus NIE
   ins Sicherheitsprotokoll.

   bestaetigt_am NULL HEISST "noch nicht bestaetigt". Diese Zeilen erscheinen
   beim Admin nicht und verfallen nach ANFRAGE_STUNDEN; die bestaetigten
   warten, so lange es dauert. Ein zweites Feld fuer den Zustand waere eine
   zweite Wahrheit neben dem Zeitpunkt.

   KEIN FREMDSCHLUESSEL: es gibt niemanden, auf den er zeigen koennte.
   KEIN MIGRATIONSBLOCK: anders als eine SPALTE legt
   CREATE TABLE IF NOT EXISTS eine fehlende TABELLE bei jedem Start an
   (Stolperstein 13 gilt der Spalte). Es bleibt bei fuenf markierten
   Bloecken. */
CREATE TABLE IF NOT EXISTS anfragen (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  hash TEXT NOT NULL UNIQUE,
  username TEXT NOT NULL,
  email TEXT NOT NULL,
  bestaetigt_am TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

/* DER ZWEITE FAKTOR -- ZWEI TABELLEN, UND SIE SIND NICHT DASSELBE.
   FREIWILLIG, JE ZUGANG: wer keine Zeile hat, hat keinen zweiten Faktor.

   user_id IST DER PRIMAERSCHLUESSEL UND NICHT EINE SPALTE DANEBEN: ein Zugang
   hat einen zweiten Faktor oder keinen. Eine eigene Nummer erlaubte zwei
   Zeilen an einem Zugang und damit zwei Wahrheiten darueber, welches
   Geheimnis gilt.

   geheim LIEGT IM KLARTEXT, und das ist der Unterschied zu Passwort und
   Token: ein Passwort wird GEPRUEFT, also genuegt sein Hash; ein
   TOTP-Geheimnis wird NACHGERECHNET, also braucht die Anlage den Wert selbst.
   DIE VERSCHLUESSELTE DATENBANK IST DIE EINZIGE SCHICHT DARUEBER
   (Projektstand, Abschnitt 3). Der JSON-Export traegt es nicht, die Sicherung
   ueber VACUUM INTO sehr wohl, eine Kontrollausgabe nie.

   bestaetigt_am NULL HEISST "angefangen, noch nicht bestaetigt" -- erst ein
   gueltiger Code aus dem Telefon setzt den Zeitpunkt. SOLANGE ER LEER IST,
   VERLANGT DIE ANMELDUNG NICHTS, sonst sperrte ein abgebrochenes Einschalten
   den Zugang aus.

   letzter_zaehler IST DIE GANZE BAUFORM GEGEN WIEDERVERWENDUNG: angenommen
   wird nur ein Zeitschritt, der ECHT GROESSER ist als der zuletzt
   verbrauchte. Etwas schaerfer als "derselbe Code nicht zweimal" -- dafuer
   EINE Regel statt einer Liste, die jemand raeumen muesste. NULL heisst
   "noch keiner verbraucht".

   ON DELETE CASCADE: mit dem Zugang geht sein zweiter Faktor; entferneZugang()
   raeumt ihn ausdruecklich selbst mit weg.
   UND setzeStatus() TUT DAS AUSDRUECKLICH NICHT: ein gesperrter Zugang
   behaelt seinen zweiten Faktor. Sonst waere "sperren und wieder freigeben"
   der Weg, an dem ein Admin einen FREMDEN zweiten Faktor abstreift. */
CREATE TABLE IF NOT EXISTS zweifaktor (
  user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  geheim TEXT NOT NULL,
  bestaetigt_am TEXT,
  letzter_zaehler INTEGER,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

/* DIE WIEDERHERSTELLUNGSCODES -- EINE ZEILE JE CODE, UND DAS IST DER GRUND
   FUER DIE ZWEITE TABELLE: "jeder genau einmal" ist eine Eigenschaft der
   ZEILE. Eine Liste in einer Spalte braechte den Zustand "verbraucht" in eine
   zweite Form -- als geloeschten Listeneintrag (dann ist nicht mehr zu sehen,
   wie viele es einmal waren) oder als Marke im Text.

   hash IST SHA-256 OHNE SALZ, wie beim Token und aus derselben Begruendung.
   DER KLARTEXT STEHT IN KEINER SPALTE KEINER ZEILE: er entsteht einmal, wird
   einmal gezeigt und ist danach fort.

   benutzt_am BLEIBT STEHEN statt die Zeile zu loeschen -- nur so kann die
   Karte "noch 6 von 8" sagen.

   GERAEUMT WIRD NICHT NACH EINER FRIST, anders als bei Token und Anfragen:
   ein Wiederherstellungscode liegt auf einem Zettel und soll genau dann
   tragen, wenn das Telefon seit Monaten weg ist. Weg kommen die Zeilen nur
   beim Neuerzeugen oder Abschalten, beides in einer Transaktion.

   ON DELETE CASCADE aus demselben Grund wie oben. */
CREATE TABLE IF NOT EXISTS zweifaktor_codes (
  hash TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  benutzt_am TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
-- Gefragt wird ueber den Hash (Primaerschluessel) ODER nach allen Codes EINES
-- Zugangs -- die Zahl fuer die Karte, das Ersetzen, das Abschalten. Dieselbe
-- Ueberlegung wie bei idx_tokens_user, und wie dort ist ein Index keine
-- Migration: er fasst die Zeilenform nicht an und legt sich bei jedem Start
-- selbst nach.
CREATE INDEX IF NOT EXISTS idx_zweifaktor_codes_user ON zweifaktor_codes(user_id);

/* KEIN MIGRATIONSBLOCK FUER DIE BEIDEN: anders als eine SPALTE legt
   CREATE TABLE IF NOT EXISTS eine fehlende TABELLE bei jedem Start an
   (Stolperstein 13 gilt der Spalte). Es bleibt bei FUENF markierten
   Bloecken. */

/* DAS SICHERHEITSPROTOKOLL -- ES HAELT FEST, WER ZUGANG HATTE UND WER DIE
   ANLAGE ALS GANZES ANGEFASST HAT.

   ES IST KEIN AENDERUNGSVERLAUF, und das ist die tragende Grenze: kein
   Eintragstitel, kein Kommentartext, keine Bewertung, keine Note. Was die
   ANLAGE betrifft, nicht was jemand GESAGT hat.

   KEINE NAMENSSPALTE, obwohl sie verlockt: entferneZugang() ueberschreibt
   username, und eine Kopie hier waere die eine Stelle im Projekt, die den
   Grabstein rueckgaengig macht. Gespeichert werden Nummern.

   wer UND ziel SIND DIE FESTSTELLUNG EINES VORGANGS -- wer den Knopf
   gedrueckt hat und an wem. Daran haengt kein Recht und kein Filter, und
   beide gehoeren deshalb ausdruecklich NICHT in ordneBestandZu(): dort
   stillschweigend den Eigentuemer einzusetzen machte aus einer Feststellung
   eine Falschaussage.

   wer IS NULL HEISST "UEBER zugang.js AUF DEM WIRT" -- mit genau einer
   Ausnahme, und die ist an der Spalte was zu erkennen: bei einer
   gescheiterten Anmeldung gibt es keinen angemeldeten Benutzer.

   BEI EINER GESCHEITERTEN ANMELDUNG STEHT DER GETIPPTE NAME NIRGENDS. ziel
   traegt die Nummer nur, wenn der Name einen vorhandenen Zugang traf --
   sonst NULL. Freitext von aussen kommt in diese Tabelle nicht hinein; sonst
   landete frueher oder spaeter ein ins falsche Feld getipptes Passwort darin.

   merkmal TRAEGT AUSSCHLIESSLICH WERTE AUS EINER GESCHLOSSENEN LISTE im
   Quelltext (MERKMALE in auth.js). Damit ist "in keiner Zeile steht etwas,
   was dort nicht hingehoert" baulich wahr statt durchgesetzt.

   ON DELETE SET NULL statt CASCADE: mit dem Menschen verschwindet der Vorgang
   nicht. */
CREATE TABLE IF NOT EXISTS sicherheitsprotokoll (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  am TEXT NOT NULL DEFAULT (datetime('now')),
  was TEXT NOT NULL,
  wer INTEGER REFERENCES users(id) ON DELETE SET NULL,
  ziel INTEGER REFERENCES users(id) ON DELETE SET NULL,
  merkmal TEXT
);
-- Gefragt wird immer nach den JUENGSTEN Zeilen und geraeumt nach dem Alter --
-- beides ueber am. Wie bei idx_papierkorb_am ist ein Index keine Migration.
CREATE INDEX IF NOT EXISTS idx_protokoll_am ON sicherheitsprotokoll(am);

-- Der Favorit: eine Aussage eines Benutzers ueber einen Eintrag, keine
-- Eigenschaft des Eintrags -- deshalb eine eigene Tabelle. Es gibt nur Zeilen
-- fuer tatsaechliche Favoriten.
-- ON DELETE CASCADE an BEIDEN Spalten: mit dem Eintrag geht sein Favorit, mit
-- dem Benutzer seiner. SET NULL verbietet der Primaerschluessel; eine nullbare
-- Spalte mit UNIQUE waere falsch, weil NULL im UNIQUE als verschieden gilt.
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

-- Die persoenliche Haelfte von settings: eine Tabelle fuer alle persoenlichen
-- Schluessel. ON DELETE CASCADE: eine persoenliche Einstellung ohne Benutzer
-- bedeutet nichts. Kein zusaetzlicher Index noetig -- user_id steht an erster
-- Stelle des Primaerschluessels, die Kaskade greift ihn von links.
CREATE TABLE IF NOT EXISTS user_settings (
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  value TEXT NOT NULL,
  PRIMARY KEY (user_id, key)
);

-- DER PAPIERKORB FASST KEINE EINZIGE BESTEHENDE ABFRAGE AN, und das ist die
-- tragende Regel seiner Bauform. Kein Zustand 'geloescht' an items: der
-- beruehrte jede Abfrage im ganzen System, und jede vergessene Stelle waere
-- ein stiller Fehler. Ein geloeschter Eintrag ist WIRKLICH weg -- er liegt nur
-- zusaetzlich noch als Paket daneben.
--
-- KEIN MIGRATIONSBLOCK, und das ist nachgestellt statt geglaubt: anders als
-- eine Spalte legt CREATE TABLE IF NOT EXISTS eine fehlende TABELLE bei jedem
-- Start an (Stolperstein 13 gilt der Spalte, nicht der Tabelle). Der
-- Pruefstand entfernt sie von Hand aus einer bestehenden Anlage, startet
-- einmal und sieht nach -- dieselbe Probe wie beim Index auf sessions.user_id.
--
-- geloescht_von IST KEIN TRAEGER WIE items.user_id. Es ist die Feststellung
-- eines VORGANGS, so wie created_at -- wer den Knopf gedrueckt hat. Daran
-- haengt kein Recht und kein Filter. Die Spalte gehoert deshalb ausdruecklich
-- NICHT in ordneBestandZu(): das Auffangnetz beantwortet, wem herrenloser
-- BESTAND zufaellt; hier stillschweigend den Eigentuemer einzusetzen machte
-- aus einer Feststellung eine Falschaussage. Ein entfernter Zugang erscheint
-- wie ueberall als "Gelöschter Benutzer <nr>".
--
-- titel STEHT ABSICHTLICH ZWEIMAL -- hier und im Paket. Er steht hier, damit
-- die Liste lesbar ist, ohne jede Zeile zu entpacken; bei zwanzig Zeilen waere
-- das zwanzigmal JSON.parse ueber ein Paket. Eine zweite Wahrheit kann daraus
-- nicht werden: das Wiederherstellen liest ausschliesslich inhalt und diese
-- Spalte nie.
--
-- inhalt IST EIN VOLLSTAENDIGER EXPORTUMSCHLAG MIT EINEM EINTRAG -- bis auf
-- die Bytes. Fotos, Videos, Dateien und Kommentarbilder tragen statt Base64
-- eine NUMMER und liegen in papierkorb_bytes daneben. Der Grund ist gemessen:
-- zwanzig Videos zu je 20 MB sind als Base64 533 MB in EINEM String, und Node
-- haelt keinen String ueber 512 MB. Zippen half nicht -- der String entstuende
-- davor. Deshalb TEXT und eine zweite Tabelle statt eines gezippten BLOB.
CREATE TABLE IF NOT EXISTS papierkorb (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  geloescht_am TEXT NOT NULL DEFAULT (datetime('now')),
  geloescht_von INTEGER REFERENCES users(id) ON DELETE SET NULL,
  titel TEXT NOT NULL,
  inhalt TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_papierkorb_am ON papierkorb(geloescht_am);

-- Eine Zeile je Blob. Die Nummer nr ist die, die im Paket steht; UNIQUE haelt
-- fest, dass zu einer Nummer genau ein Paket Bytes gehoert.
-- ON DELETE CASCADE: eine Papierkorbzeile ohne ihre Bytes waere ein Paket, das
-- sich nicht mehr auspacken laesst.
-- WARUM EINE ZEILE JE BLOB und nicht ein grosser Blob: eine BLOB-Zeile wird
-- nicht stueckweise gelesen, sondern ganz in den Arbeitsspeicher. Je Zeile
-- sind das hoechstens 50 MB (die Grenze am Anhang). Und wenn Teil II des
-- Videopapiers Dateien bis 2 GB bringt, teilt sich eine Datei hier auf
-- mehrere nr auf -- SQLite traegt in einer Zelle rund 950 MB.
CREATE TABLE IF NOT EXISTS papierkorb_bytes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  papierkorb_id INTEGER NOT NULL REFERENCES papierkorb(id) ON DELETE CASCADE,
  nr INTEGER NOT NULL,
  daten BLOB NOT NULL,
  UNIQUE(papierkorb_id, nr)
);
`;

const db = open(DB_FILE);

/* kkl() -- KLEINSCHREIBUNG NACH UNICODE, IN SQL EINGEHAENGT.
   SQLites lower() faltet AUSSCHLIESSLICH ASCII: lower('Ü') bleibt
   'Ü', und dasselbe gilt fuer LIKE. Eine Suche darauf faende
   "STICHSAEGE UEBERGROSS" bei der Eingabe "uebergross" nicht -- unauffaellig,
   und mit Umlauten faellt der Treffer wirklich weg. toLowerCase() aus JS
   faltet nach Unicode; die Klemme, die aus dem Suchtext Kleinbuchstaben
   macht, gibt es damit genau einmal.

   deterministic: gleicher Wert, gleiches Ergebnis, immer. Ohne die Angabe
   verbietet SQLite den Aufruf in einem Index oder einer erzeugten Spalte.

   NULL WIRD ZUM LEEREN STRING und nicht zu NULL: instr(NULL, 'x') ist NULL,
   und `NULL > 0` ist in SQL nie wahr -- eine fehlende Beschreibung waere
   damit kein "kein Treffer", sondern ein Wert, mit dem sich nicht rechnen
   laesst. */
db.function('kkl', { deterministic: true }, (s) => (s === null ? '' : String(s).toLowerCase()));

db.exec(SCHEMA);

// MIGRATION 0.8.3 — ENTFAELLT MIT 1.0
// Die Spalte images_removed steht in der DDL, aber CREATE TABLE IF NOT EXISTS
// ruehrt eine VORHANDENE Tabelle nicht an (Stolperstein 13). Ein Bestand aus
// 0.8.0 bis 0.8.2 traegt comments ohne diese Spalte; die Vorgabe 0 greift nur
// dort, wo die Spalte ueberhaupt existiert.
// Einmalig, wiederholbar und im Normalfall stumm. Zu 1.0 faellt dieser Block
// weg, die Spalte in der DDL bleibt.
function migration083() {
  const spalten = db.prepare('PRAGMA table_info(comments)').all().map(c => c.name);
  if (spalten.includes('images_removed')) return 0;
  db.exec('ALTER TABLE comments ADD COLUMN images_removed INTEGER NOT NULL DEFAULT 0');
  console.log('[Kriterion] comments um images_removed ergaenzt (Migration auf 0.8.3).');
  return 1;
}
migration083();
// ENDE MIGRATION 0.8.3

// MIGRATION 0.8.30 — ENTFAELLT MIT 1.0
// Die Spalte user_id steht in der DDL, aber CREATE TABLE IF NOT EXISTS ruehrt
// eine VORHANDENE Tabelle nicht an (Stolperstein 13). Ein Bestand aus 0.8.0
// bis 0.8.20 traegt links ohne diese Spalte.
// DIE BESTANDSZEILEN FALLEN AN DEN EINTRAGSVERFASSER, NICHT AN DEN
// EIGENTUEMER -- und das ist etwas anderes als die Regel im Auffangnetz
// weiter unten. Bis zu dieser Version WAREN die Links eines Eintrags die
// Sache seines Verfassers; sie ihm zu nehmen und dem Eigentuemer zu geben,
// machte aus seinen Links stillschweigend fremde. Das Auffangnetz beantwortet
// eine andere Frage zu einem anderen Zeitpunkt: wem eine Zeile zufaellt, die
// SPAETER herrenlos wird. Zwei Zeitpunkte, zwei Regeln, kein Widerspruch.
// Einmalig, wiederholbar und im Normalfall stumm. Zu 1.0 faellt dieser Block
// weg, die Spalte in der DDL bleibt.
function migration0830() {
  const spalten = db.prepare('PRAGMA table_info(links)').all().map(c => c.name);
  if (spalten.includes('user_id')) return 0;
  db.exec('ALTER TABLE links ADD COLUMN user_id INTEGER REFERENCES users(id) ON DELETE SET NULL');
  const n = db.prepare(
    'UPDATE links SET user_id = (SELECT user_id FROM items WHERE items.id = links.item_id)' +
    ' WHERE user_id IS NULL'
  ).run().changes;
  console.log(`[Kriterion] links um user_id ergaenzt (Migration auf 0.8.30); ` +
    `${n} Linkzeilen dem Verfasser ihres Eintrags zugeordnet.`);
  return 1;
}
migration0830();
// ENDE MIGRATION 0.8.30

// MIGRATION 0.8.31 — ENTFAELLT MIT 1.0
// Dieselbe Sache wie eine Version zuvor, nur an attachments: die Spalte steht
// in der DDL, aber CREATE TABLE IF NOT EXISTS ruehrt eine VORHANDENE Tabelle
// nicht an (Stolperstein 13). Ein Bestand aus 0.8.0 bis 0.8.30 traegt
// attachments ohne user_id.
// DIE BESTANDSZEILEN FALLEN AN DEN EINTRAGSVERFASSER, aus demselben Grund wie
// bei den Links: bis zu dieser Version WAREN die Dateien eines Eintrags die
// Sache seines Verfassers. Das Auffangnetz weiter unten beantwortet eine
// andere Frage zu einem anderen Zeitpunkt -- dort gilt der Eigentuemer.
// Einmalig, wiederholbar und im Normalfall stumm. Zu 1.0 faellt dieser Block
// weg, die Spalte in der DDL bleibt.
function migration0831() {
  const spalten = db.prepare('PRAGMA table_info(attachments)').all().map(c => c.name);
  if (spalten.includes('user_id')) return 0;
  db.exec('ALTER TABLE attachments ADD COLUMN user_id INTEGER REFERENCES users(id) ON DELETE SET NULL');
  const n = db.prepare(
    'UPDATE attachments SET user_id = (SELECT user_id FROM items WHERE items.id = attachments.item_id)' +
    ' WHERE user_id IS NULL'
  ).run().changes;
  console.log(`[Kriterion] attachments um user_id ergaenzt (Migration auf 0.8.31); ` +
    `${n} Dateien dem Verfasser ihres Eintrags zugeordnet.`);
  return 1;
}
migration0831();
// ENDE MIGRATION 0.8.31

// MIGRATION 0.8.40 — ENTFAELLT MIT 1.0
// Die Spalte gewicht steht in der DDL, aber CREATE TABLE IF NOT EXISTS ruehrt
// eine VORHANDENE Tabelle nicht an (Stolperstein 13). Ein Bestand aus 0.8.0
// bis 0.8.31 traegt rating_criteria ohne diese Spalte.
// DIE BESTANDSZEILEN BEKOMMEN 1,0, und zwar aus dem DEFAULT der Spalte, nicht
// aus einem nachgeschobenen UPDATE: ALTER TABLE ... ADD COLUMN mit NOT NULL
// DEFAULT fuellt die vorhandenen Zeilen selbst. Jeder andere Wert aenderte
// beim Einspielen still saemtliche Gesamtschnitte.
// KEINE FRAGE NACH EINEM EIGENTUEMER, anders als bei den beiden Migrationen
// darueber: ein Gewicht kann nicht herrenlos werden, es hat einen
// NOT-NULL-Vorgabewert. Das Auffangnetz weiter unten geht diese Spalte
// deshalb nichts an.
// Einmalig, wiederholbar und im Normalfall stumm. Zu 1.0 faellt dieser Block
// weg, die Spalte in der DDL bleibt.
function migration0840() {
  const spalten = db.prepare('PRAGMA table_info(rating_criteria)').all().map(c => c.name);
  if (spalten.includes('gewicht')) return 0;
  db.exec('ALTER TABLE rating_criteria ADD COLUMN gewicht REAL NOT NULL DEFAULT 1.0');
  const n = db.prepare('SELECT COUNT(*) AS n FROM rating_criteria').get().n;
  console.log(`[Kriterion] rating_criteria um gewicht ergaenzt (Migration auf 0.8.40); ` +
    `${n} Kriterien stehen auf dem Vorgabegewicht 1,0.`);
  return 1;
}
migration0840();
// ENDE MIGRATION 0.8.40

// MIGRATION 0.8.50 — ENTFAELLT MIT 1.0
// Die Spalten art und dauer stehen in der DDL, aber CREATE TABLE IF NOT EXISTS
// ruehrt eine VORHANDENE Tabelle nicht an (Stolperstein 13). Ein Bestand aus
// 0.8.0 bis 0.8.40 traegt photos ohne diese Spalten.
// DIE BESTANDSZEILEN BEKOMMEN 'bild', und zwar aus dem DEFAULT der Spalte,
// nicht aus einem nachgeschobenen UPDATE: ALTER TABLE ... ADD COLUMN mit
// NOT NULL DEFAULT fuellt die vorhandenen Zeilen selbst. dauer bleibt dabei
// NULL, und das ist richtig -- ein Foto hat keine Dauer.
// JEDE SPALTE WIRD EINZELN GEFRAGT, nicht der Block als Ganzes. Zwei
// ALTER TABLE sind zwei Anweisungen: scheitert die zweite, bleibt die erste
// stehen. Ein Block, der beim Vorhandensein von art zurueckkehrt, liesse dauer
// dann fuer immer fehlen. So heilt der naechste Start den zerrissenen Stand.
// KEINE FRAGE NACH EINEM VERFASSER, wie schon bei 0.8.40: ein Foto gehoert
// seinem Eintrag, nicht einem Verfasser. Das Auffangnetz weiter unten geht
// diese Tabelle deshalb nichts an.
// Einmalig, wiederholbar und im Normalfall stumm. Zu 1.0 faellt dieser Block
// weg, die Spalten in der DDL bleiben.
function migration0850() {
  const spalten = db.prepare('PRAGMA table_info(photos)').all().map(c => c.name);
  const fehlend = [];
  if (!spalten.includes('art')) {
    db.exec("ALTER TABLE photos ADD COLUMN art TEXT NOT NULL DEFAULT 'bild'");
    fehlend.push('art');
  }
  if (!spalten.includes('dauer')) {
    db.exec('ALTER TABLE photos ADD COLUMN dauer INTEGER');
    fehlend.push('dauer');
  }
  if (!fehlend.length) return 0;
  const n = db.prepare('SELECT COUNT(*) AS n FROM photos').get().n;
  console.log(`[Kriterion] photos um ${fehlend.join(' und ')} ergaenzt (Migration auf 0.8.50); ` +
    `${n} Zeilen stehen auf der Vorgabeart 'bild'.`);
  return 1;
}
migration0850();
// ENDE MIGRATION 0.8.50

// MIGRATION 0.14.0 — ENTFAELLT MIT 1.0
// Die Spalten rejected_at, rejected_grund und rejected_von stehen in der DDL,
// aber CREATE TABLE IF NOT EXISTS ruehrt eine VORHANDENE Tabelle nicht an
// (Stolperstein 13). Ein Bestand aus 0.8.0 bis 0.13.2 traegt items ohne sie.
// KEIN NACHGESCHOBENES UPDATE, und das ist entschieden und nicht vergessen:
// eine Ablehnung aus einem Bestand vor dieser Version hat kein Datum, keinen
// Grund und keinen Verfasser -- diese Anlage weiss sie nicht. Jeder gesetzte
// Wert waere erfunden, und "abgelehnt am Tag der Einspielung von dem, der
// eingespielt hat" waere die schlimmste Erfindung von allen. Die drei bleiben
// leer, und die Marke zeigt dann genau so viel, wie bekannt ist.
// JEDE SPALTE WIRD EINZELN GEFRAGT, nicht der Block als Ganzes (Stolperstein
// 108). Ein Block, der beim Vorhandensein der ersten zurueckkehrt, liesse die
// zweite und dritte fuer immer fehlen.
// UND DIE DREI ALTER TABLE LAUFEN IN EINER TRANSAKTION. Ohne sie ueberlebt bei
// einem Abbruch die erste Spalte, und die uebrigen fehlen. Die Transaktion
// verhindert den Riss, die Einzelabfrage ueberlebt ihn -- nur das Zweite hilft
// gegen einen Riss, der in einer frueheren Version entstanden ist.
// rejected_von TRAEGT SEINEN FREMDSCHLUESSEL AUCH ALS NACHRUESTUNG: SQLite
// schreibt die Spaltendefinition samt REFERENCES in den Schematext, und
// ON DELETE SET NULL greift danach wie in der DDL -- nachgemessen, nicht
// abgeschrieben. Was NICHT geht, ist eine Vorgabe ungleich NULL daneben
// (Stolperstein 105); hier steht keine, und deshalb geht es.
// Einmalig, wiederholbar und im Normalfall stumm. Zu 1.0 faellt dieser Block
// weg, die Spalten in der DDL bleiben.
function migration0140() {
  const spalten = db.prepare('PRAGMA table_info(items)').all().map(c => c.name);
  const fehlend = [];
  if (!spalten.includes('rejected_at')) fehlend.push(['rejected_at', 'ALTER TABLE items ADD COLUMN rejected_at TEXT']);
  if (!spalten.includes('rejected_grund')) fehlend.push(['rejected_grund', 'ALTER TABLE items ADD COLUMN rejected_grund TEXT']);
  if (!spalten.includes('rejected_von')) fehlend.push(['rejected_von',
    'ALTER TABLE items ADD COLUMN rejected_von INTEGER REFERENCES users(id) ON DELETE SET NULL']);
  if (!fehlend.length) return 0;
  db.transaction(() => { for (const [, sql] of fehlend) db.exec(sql); })();
  // "a, b und c" statt "a und b und c" -- bei drei Namen liest sich das
  // andere wie ein Fehler in der Zeile.
  const namen = fehlend.map(f => f[0]);
  const aufzaehlung = namen.length > 1
    ? `${namen.slice(0, -1).join(', ')} und ${namen[namen.length - 1]}` : namen[0];
  const n = db.prepare('SELECT COUNT(*) AS n FROM items WHERE rejected = 1').get().n;
  console.log(`[Kriterion] items um ${aufzaehlung} ergaenzt ` +
    `(Migration auf 0.14.0); ${n} bereits abgelehnte ${n === 1 ? 'Eintrag steht' : 'Eintraege stehen'} ` +
    `ohne Datum, Grund und Verfasser da.`);
  return 1;
}
migration0140();
// ENDE MIGRATION 0.14.0

// MIGRATION 0.16.0 — ENTFAELLT MIT 1.0
/* DIE BEWERTUNGEN BEKOMMEN EINEN ZEITPUNKT. Bis 0.15.1 trug eine Bewertung
   ihren Wert und ihren Verfasser, aber kein Wann -- und damit war „hat seit
   meinem letzten Blick jemand bewertet?" nicht zu beantworten. Die Glocke aus
   0.16.0 stellt genau diese Frage.
   OHNE VORGABEWERT UND OHNE NACHTRAGEN: die vorhandenen Zeilen bekommen NULL
   und behalten es. Ein nachgetragener Zeitpunkt waere erfunden -- entweder
   saehe alles gleich alt aus (ein fester Wert) oder alles brandneu
   (datetime('now')), und die Glocke laeutete beim ersten Start fuer den ganzen
   Bestand. Was die Anlage nicht weiss, behauptet sie nicht.
   WIEDERHOLBAR UND IM NORMALFALL STUMM, wie jeder Block hier: gefragt wird
   PRAGMA table_info, nicht ein Merker. */
function migration0160() {
  const spalten = db.prepare('PRAGMA table_info(ratings)').all().map(c => c.name);
  if (spalten.includes('gesetzt_am')) return 0;
  db.exec('ALTER TABLE ratings ADD COLUMN gesetzt_am TEXT');
  const n = db.prepare('SELECT COUNT(*) AS n FROM ratings WHERE value > 0').get().n;
  console.log(`[Kriterion] ratings um gesetzt_am ergaenzt (Migration auf 0.16.0); ` +
    `${n} vorhandene ${n === 1 ? 'Bewertung steht' : 'Bewertungen stehen'} ohne Zeitpunkt da ` +
    `und bleiben fuer die Glocke unsichtbar.`);
  return 1;
}
migration0160();
// ENDE MIGRATION 0.16.0

// --- Auffangnetz: die Anlage braucht einen Eigentuemer ---
// Gibt es keinen, wird es der aelteste Zugang, DER SCHON RECHTE HAT; erst wenn
// es auch keinen Admin gibt, der mit der kleinsten Nummer. Der Zwischenschritt
// ueber den Admin verhindert, dass ein ausdruecklich herabgestufter Erstzugang
// still wieder befoerdert wird. Ein Grabstein (status = 'geloescht') erbt nie:
// er meldet sich nie wieder an. Wiederholbar und im Normalfall stumm.
{
  const n = db.prepare(
    "UPDATE users SET role = 'eigentuemer' WHERE id = (" +
    "  SELECT MIN(id) FROM users WHERE status != 'geloescht' AND (" +
    "    role = 'admin' OR NOT EXISTS (" +
    "      SELECT 1 FROM users WHERE role = 'admin' AND status != 'geloescht')))" +
    " AND NOT EXISTS (SELECT 1 FROM users WHERE role = 'eigentuemer')"
  ).run().changes;
  if (n) console.log('[Kriterion] Die Anlage hatte keinen Eigentuemer; der aelteste ' +
    'berechtigte Zugang ist es jetzt (role=eigentuemer).');
}

// WEM herrenloser Bestand zufaellt, steht an genau einer Stelle -- hier. Die
// Frage liest die Rolle: der Bestand darf keinem Grabstein zufallen, denn der
// meldet sich nie wieder an. Gibt es mehrere Eigentuemer, nimmt der aelteste.
// Blankes SQL statt eines Aufrufs in auth.js: db.js darf von auth.js nichts
// wissen, die Abhaengigkeit laeuft andersherum.
function eigentuemerId() {
  return db.prepare("SELECT MIN(id) AS id FROM users WHERE role = 'eigentuemer'").get().id;
}

// --- Auffangnetz: kein Bestand ohne Benutzer ---
// Alles, was niemandem gehoert, faellt an den Eigentuemer -- auch eine
// Linkzeile und eine Datei.
// DAS IST NICHT DIESELBE REGEL WIE IN DEN MIGRATIONEN DARUEBER, und beide
// stehen bewusst nebeneinander: die Migration beantwortet einmalig, wem die
// Links eines BESTEHENDEN Eintrags gehoeren (seinem Verfasser), das Netz
// beantwortet fortlaufend, wem eine Zeile zufaellt, die ihren Verfasser
// VERLOREN hat (dem Eigentuemer, wie ueberall sonst). Verschiedene
// Zeitpunkte, verschiedene Fragen. Im Normalbetrieb
// entsteht so etwas nicht (geloeschte Zugaenge bleiben als Grabstein stehen);
// das Netz faengt Fehlerfaelle. ZWEI AUFRUFSTELLEN, beide noetig: hier beim
// Start und in auth.js nach legeErstenBenutzerAn() -- beim Start einer leeren
// Anlage gibt es noch keinen Benutzer, dem etwas zufallen koennte.
// UPDATE OR IGNORE, weil user_id bei ratings und test_days im UNIQUE steht:
// zwei herrenlose Zeilen zum selben Kriterium sind moeglich (NULL gilt im
// UNIQUE als verschieden); ohne OR IGNORE stuerbe der Start an der Verletzung.
function ordneBestandZu() {
  const zahlen = {};
  let summe = 0;
  const eigentuemer = eigentuemerId();
  if (eigentuemer == null) {
    return { items: 0, comments: 0, test_days: 0, ratings: 0, links: 0, attachments: 0 };
  }
  for (const tabelle of ['items', 'comments', 'test_days', 'ratings', 'links', 'attachments']) {
    const n = db.prepare(
      `UPDATE OR IGNORE ${tabelle} SET user_id = ? WHERE user_id IS NULL`
    ).run(eigentuemer).changes;
    zahlen[tabelle] = n;
    summe += n;
  }
  if (summe) {
    console.log('[Kriterion] Bestand ohne Benutzer dem Eigentuemer zugeordnet: ' +
      `${zahlen.items} Eintraege, ${zahlen.comments} Kommentare, ${zahlen.test_days} Testtage, ` +
      `${zahlen.ratings} Bewertungen, ${zahlen.links} Links, ${zahlen.attachments} Dateien.`);
  }
  return zahlen;
}
ordneBestandZu();

// --- Grundausstattung ---
const seedCriteria = ['Optische Erscheinung', 'Verarbeitungsqualität', 'Funktionalität'];
const insCrit = db.prepare('INSERT OR IGNORE INTO rating_criteria (name) VALUES (?)');
if (db.prepare('SELECT COUNT(*) n FROM rating_criteria').get().n === 0) {
  for (const c of seedCriteria) insCrit.run(c);
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

renumberCriteria();

// keyHex wandert mit, damit der Systembereich den vorhandenen Wert zum
// Abschreiben zeigen kann. Ausgeliefert wird er nur hinter der Anmeldung und
// nur dann, wenn er ohnehin schon neben der Datenbank liegt.
module.exports = { db, DATA_DIR, DB_FILE, keyFromEnv: key.fromEnv, keyHex: key.hex,
                   wechsleSchluessel, verfahren,
                   renumberCriteria, ordneBestandZu, eigentuemerId,
                   // MIGRATION 0.8.3 — ENTFAELLT MIT 1.0
                   migration083,
                   // MIGRATION 0.8.30 — ENTFAELLT MIT 1.0
                   migration0830,
                   // MIGRATION 0.8.31 — ENTFAELLT MIT 1.0
                   migration0831,
                   // MIGRATION 0.8.40 — ENTFAELLT MIT 1.0
                   migration0840,
                   // MIGRATION 0.8.50 — ENTFAELLT MIT 1.0
                   migration0850,
                   // MIGRATION 0.14.0 — ENTFAELLT MIT 1.0
                   migration0140,
                   // MIGRATION 0.16.0 — ENTFAELLT MIT 1.0
                   migration0160 };
