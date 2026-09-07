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
   Gerufen ausschliesslich von keytool.js auf dem Wirt, bei angehaltener
   Instanz. Es steht hier, weil hier auch journal_mode gesetzt wird.

   PRAGMA rekey LAEUFT IM WAL-MODUS NICHT ("Rekeying is not supported in WAL
   journal mode"), und open() setzt WAL bei jedem Oeffnen -- also erst auf
   DELETE umschalten, wechseln, zurueckschalten (Stolperstein 128). Die
   Rueckschaltung steht im finally: scheitert der Wechsel, bliebe die Instanz
   sonst still im DELETE-Modus zurueck.

   EIN ABBRUCH MITTENDRIN IST FOLGENLOS, solange das Rollback-Journal
   ueberlebt -- danach oeffnet der alte Schluessel, der neue wird abgewiesen,
   es entsteht kein halber Zustand. Faellt das Journal weg, ist alles verloren:
   DAS ist der Grund fuer die Sicherung davor. Es waechst auf die Groesse der
   Datenbank. */
function changeKey(neuHex) {
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
   und das ist unbedenklich: wer die Instanz betreibt, darf wissen, worauf seine
   Daten liegen. Eine Versionsnummer sagt dagegen, WELCHE Luecke passt. */
function method() {
  return {
    cipher: String(db.pragma('cipher', { simple: true }) || ''),
    schluesselBits: key.hex.length * 4,
    journal: String(db.pragma('journal_mode', { simple: true }) || '').toUpperCase()
  };
}

/* KEIN BACKTICK IN DIESEM STRING -- auch nicht in einem SQL-Kommentar.
   Das ganze Schema ist EIN Template-String, und ein Backtick beendet ihn:
   aus der DDL wird dann Quelltext, und der Server startet nicht mehr. Der
   uebrige Quelltext dieses Projekts setzt Bezeichner in Kommentaren
   gewohnheitsmaessig in Backticks -- hier drin darf das nicht sein.
   NACHGESEHEN UND NICHT VERMUTET: beim Nachziehen der Kommentare zu 0.19.5 ist
   genau das passiert, und `node --check` hat es gefunden, bevor es jemand
   anderes tat. */
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
  -- aus einer Instanz vor 0.14.0 kennt weder Datum noch Verfasser, und ein
  -- erfundener Wert waere schlimmer als ein leerer. Ein Grund ist ausserdem
  -- freiwillig.
  -- ZURUECKGENOMMEN WIRD DAS MERKMAL, NICHT DIE ANGABE: beim Ausschalten von
  -- rejected bleiben die drei stehen. Sie gingen sonst verloren, ohne dass
  -- sie jemand wiederherstellen koennte -- und der Dialog bietet die alte
  -- Begruendung beim erneuten Ablehnen als Vorschlag an.
  -- tested bekommt bewusst NICHTS davon: "getestet" ist ein Zustand und keine
  -- Entscheidung. Wer beides gleich behandelt, baut die Haelfte umsonst.
  rejected_at TEXT,
  rejected_reason TEXT,
  -- ON DELETE SET NULL wie an jedem Traeger (Stolperstein 54): ein entfernter
  -- Zugang nimmt die Entscheidung nicht mit, nur seinen Namen davon.
  rejected_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  tested INTEGER NOT NULL DEFAULT 0,
  -- favorite wird nicht mehr beschrieben. Der Favorit gehoert einem Benutzer
  -- und steht in item_pins; die Spalte bleibt nur stehen, damit eine
  -- bestehende und eine frische Instanz dasselbe Schema tragen. Nie wieder
  -- hineinschreiben: es waere
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
-- an der steht, warum data je nach kind etwas anderes ist:
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
  kind TEXT NOT NULL DEFAULT 'image',   -- 'image' | 'video'
  duration INTEGER,                      -- Sekunden, nur bei Video
  -- Fokuspunkt in Prozent. DAS ORIGINAL BLEIBT UNANGETASTET; geschnitten wird
  -- ausschliesslich die Ableitung thumb, und zwar seit 0.19.5 am Server.
  -- Bis 0.19.4 stand hier: „Schneidet nichts weg ... die beiden Werte
  -- verschieben nur das sichtbare Fenster der quadratischen Vorschau
  -- (object-position)." Der erste Halbsatz galt fuer die DATEI und gilt
  -- weiter; der zweite beschrieb den Weg, und der ist ein anderer geworden
  -- (Stolperstein 201). DIE DREI WERTE SIND DAS REZEPT fuer die Kachel --
  -- deshalb ist der Ausschnitt jederzeit aenderbar.
  focus_x REAL NOT NULL DEFAULT 50,
  focus_y REAL NOT NULL DEFAULT 50,
  -- Der dritte Wert dieser Art heisst zoom und steht GANZ UNTEN, nicht hier.
  -- Der Grund steht dort.
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  -- WIE ENG DAS FENSTER SITZT, in Prozent. 100 heisst "so weit wie das Bild
  -- hergibt" -- also genau das, was bis 0.18.1 die einzige Moeglichkeit war;
  -- 400 heisst viermal so nah. Der dritte Wert derselben Art wie focus_x und
  -- focus_y und mit derselben Zusicherung: DAS ORIGINAL BLEIBT GANZ.
  -- Bis 0.19.4 stand hier weiter: „die Anzeige skaliert (transform: scale) und
  -- der Behaelter beschneidet. Kein Neurechnen, keine zweite Fassung."
  -- SEIT 0.19.5 WIRD SEHR WOHL NEU GERECHNET: der Server rechnet den Ausschnitt
  -- in thumb, und die Anzeige skaliert nichts mehr. Eine ZWEITE FASSUNG gibt
  -- es trotzdem nicht -- es ist dieselbe Spalte, neu abgeleitet.
  --
  -- WARUM ER HIER UNTEN STEHT UND NICHT NEBEN focus_y, wo er hingehoerte:
  -- ALTER TABLE ADD COLUMN haengt eine Spalte IMMER HINTEN AN. Stuende sie in
  -- der DDL weiter oben, saehe eine frisch angelegte Instanz anders aus als
  -- eine migrierte -- dieselbe Datenbank in zwei Spaltenreihenfolgen. Das ist
  -- keine Schoenheitsfrage: SELECT * liefert dann zwei verschiedene
  -- Reihenfolgen, und der Pruefstand haelt genau das fest (Stolperstein 273 --
  -- gefunden hat es die Zeile, die 0.16.0 dafuer hinterlassen hat, beim
  -- allerersten Lauf der Migrationsgruppe dieser Runde).
  -- set_at an ratings steht aus demselben Grund am Ende seiner Tabelle.
  --
  -- DIE VORGABE IST DER HEUTIGE ZUSTAND, wie bei focus_x/focus_y: jede
  -- vorhandene Zeile steht damit ohne Umschreiben richtig da.
  -- UNTER 100 GAEBE ES NICHT MEHR ZU SEHEN, SONDERN LEERE: der Behaelter ist
  -- quadratisch und das Bild deckt ihn bei 100 gerade eben. Die Spanne steht
  -- im Server an einer Stelle und ausdruecklich NICHT als CHECK hier -- sonst
  -- stuende sie zweimal, und die zweite meldete sich nicht als Absage,
  -- sondern als abgebrochene Schreibung (dieselbe Ueberlegung wie beim
  -- Gewicht eines Kriteriums).
  -- REAL wie focus_x, und aus demselben Grund: eine Umrechnung an jeder
  -- Lesestelle vergisst irgendwann jemand.
  zoom REAL NOT NULL DEFAULT 100
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
  weight REAL NOT NULL DEFAULT 1.0,
  -- ZU WELCHEM KASTEN DIESES KRITERIUM GEHOERT -- 0.21.0. 'before' heisst
  -- Potenzial (die Einschaetzung vor dem Test), 'after' heisst Bewertung
  -- (das Urteil danach). Zwei Werte, und sonst keiner.
  -- DEUTSCH, weil der Sprachwaechter mitliest -- und weil die Werte in SELECTs
  -- stehen, die jemand liest.
  -- KEIN CHECK an dieser Stelle, aus demselben Grund wie bei weight darueber:
  -- die Menge der Werte stuende sonst zweimal, hier und in PHASEN im Server,
  -- und die zweite meldete sich nicht als Absage mit Meldung, sondern als
  -- abgebrochene Schreibung. PHASEN steht genau einmal, in server.js.
  -- DEFAULT 'after', und die Bestandszeilen bekommen ihn aus dem DEFAULT,
  -- nicht aus einem UPDATE (Migration 0.21.0): jeder andere Wert aenderte beim
  -- Einspielen still saemtliche Gesamtschnitte. Was heute Kriterium ist, ist
  -- Bewertungskriterium.
  -- UNIQUE(name) BLEIBT GLOBAL und wandert nicht auf (name, phase): ein Name,
  -- ein Kasten. Die Einschraenkung zu aendern hiesse Tabellenneubau (SQLite
  -- kennt kein ALTER CONSTRAINT), und „Wunsch" in beiden Kaesten waere fuer
  -- den Benutzer ohnehin ein Raetsel.
  phase TEXT NOT NULL DEFAULT 'after',
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
  -- „die Instanz weiss nicht, wann das war" -- das gilt fuer alles, was vor
  -- 0.16.0 entstanden ist, und ebenso fuer eingespielte Bewertungen: die
  -- Exportdatei traegt den Zeitpunkt nicht (auch Format 12 traegt ihn nicht),
  -- ein datetime('now') beim Einspielen machte daraus die Behauptung, sie
  -- seien eben erst vergeben worden. Die Glocke uebergeht Zeilen ohne Zeitpunkt.
  -- ALTER TABLE ADD COLUMN kann in SQLite ohnehin keinen nicht-konstanten
  -- Vorgabewert setzen; frisch angelegt und migriert sehen damit gleich aus.
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

-- Zugang. role ist eine Leiter: user < admin < owner -- ein Wert, kein
-- zweites Feld, damit "ein Eigentuemer ist immer auch Admin" baulich wahr ist.
--   user        -- schreibt eigene Beitraege, sonst nichts
--   admin       -- verwaltet den Bestand, sperrt und loescht BENUTZER
--   owner -- dazu: Rollen vergeben, an Admins ran, Export, Import,
--                  Schluesselwert
-- status: active | locked | deleted.
--   locked    -- Anmeldung abgewiesen, laufende Sitzung faellt, Inhalte bleiben
--   deleted -- der GRABSTEIN: die Zeile bleibt mit ihrer id stehen, damit
--                user_id weiterhin auf etwas zeigt; der Name ist mit
--                deleted-<id> ueberschrieben und damit freigegeben. Ein
--                Zugang wird NIE aus der Tabelle entfernt: ON DELETE SET NULL
--                machte seinen Bestand sonst herrenlos, und ordneBestandZu()
--                schoebe ihn beim naechsten Start still dem Eigentuemer zu.
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
-- Benutzers -- sperren, loeschen, spaeter "Meine Sitzungen" -- laese sonst die
-- ganze Tabelle. Ein Index ist keine Migration: er fasst die Zeilenform nicht an
-- und legt sich bei jedem Start selbst nach, in frischer wie bestehender Instanz.
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

   purpose IST DIE FESTSTELLUNG EINES VORGANGS -- welcher Knopf gedrueckt wurde.
   Daran haengt kein Recht, kein Filter und kein Ablauf; der Text at
   Bildschirm leitet sich aus dem ZUSTAND ab (hat der Zugang schon ein
   Passwort), nicht aus dieser Spalte.

   used_at BLEIBT STEHEN statt die Zeile zu loeschen: es ist die einzige
   Spur, dass eine Einladung angenommen wurde. raeumeTokensAuf() haelt die
   Tabelle klein.

   created_at steht ausdruecklich da: aus expires_at minus sieben Tage
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
  purpose TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  used_at TEXT,
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
   confirmed_at, mehr nicht. Deshalb steht hier kein password_hash und keine
   Rolle -- was es nicht gibt, kann kein Weg hereinlassen.

   username UND email SIND FREITEXT VON AUSSEN -- der einzige, der ueberhaupt
   gespeichert wird. Sie gehen VOR dem Schreiben durch dieselben Pruefungen
   wie ein echter Zugang (pruefeName, mail.istAdresse), und von hier aus NIE
   ins Sicherheitsprotokoll.

   confirmed_at NULL HEISST "noch nicht bestaetigt". Diese Zeilen erscheinen
   beim Admin nicht und verfallen nach ANFRAGE_STUNDEN; die bestaetigten
   warten, so lange es dauert. Ein zweites Feld fuer den Zustand waere eine
   zweite Wahrheit neben dem Zeitpunkt.

   KEIN FREMDSCHLUESSEL: es gibt niemanden, auf den er zeigen koennte.
   KEIN MIGRATIONSBLOCK: anders als eine SPALTE legt
   CREATE TABLE IF NOT EXISTS eine fehlende TABELLE bei jedem Start an
   (Stolperstein 13 gilt der Spalte). Es bleibt bei fuenf markierten
   Bloecken. */
CREATE TABLE IF NOT EXISTS requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  hash TEXT NOT NULL UNIQUE,
  username TEXT NOT NULL,
  email TEXT NOT NULL,
  confirmed_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

/* DER ZWEITE FAKTOR -- ZWEI TABELLEN, UND SIE SIND NICHT DASSELBE.
   FREIWILLIG, JE ZUGANG: wer keine Zeile hat, hat keinen zweiten Faktor.

   user_id IST DER PRIMAERSCHLUESSEL UND NICHT EINE SPALTE DANEBEN: ein Zugang
   hat einen zweiten Faktor oder keinen. Eine eigene Nummer erlaubte zwei
   Zeilen an einem Zugang und damit zwei Wahrheiten darueber, welches
   Geheimnis gilt.

   secret LIEGT IM KLARTEXT, und das ist der Unterschied zu Passwort und
   Token: ein Passwort wird GEPRUEFT, also genuegt sein Hash; ein
   TOTP-Geheimnis wird NACHGERECHNET, also braucht die Instanz den Wert selbst.
   DIE VERSCHLUESSELTE DATENBANK IST DIE EINZIGE SCHICHT DARUEBER
   (Projektstand, Abschnitt 3). Der JSON-Export traegt es nicht, die Sicherung
   ueber VACUUM INTO sehr wohl, eine Kontrollausgabe nie.

   confirmed_at NULL HEISST "angefangen, noch nicht bestaetigt" -- erst ein
   gueltiger Code aus dem Telefon setzt den Zeitpunkt. SOLANGE ER LEER IST,
   VERLANGT DIE ANMELDUNG NICHTS, sonst sperrte ein abgebrochenes Einschalten
   den Zugang aus.

   last_counter IST DIE GANZE BAUFORM GEGEN WIEDERVERWENDUNG: angenommen
   wird nur ein Zeitschritt, der ECHT GROESSER ist als der zuletzt
   verbrauchte. Etwas schaerfer als "derselbe Code nicht zweimal" -- dafuer
   EINE Regel statt einer Liste, die jemand raeumen muesste. NULL heisst
   "noch keiner verbraucht".

   ON DELETE CASCADE: mit dem Zugang geht sein zweiter Faktor; entferneZugang()
   raeumt ihn ausdruecklich selbst mit weg.
   UND setzeStatus() TUT DAS AUSDRUECKLICH NICHT: ein gesperrter Zugang
   behaelt seinen zweiten Faktor. Sonst waere "sperren und wieder freigeben"
   der Weg, an dem ein Admin einen FREMDEN zweiten Faktor abstreift. */
CREATE TABLE IF NOT EXISTS two_factor (
  user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  secret TEXT NOT NULL,
  confirmed_at TEXT,
  last_counter INTEGER,
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

   used_at BLEIBT STEHEN statt die Zeile zu loeschen -- nur so kann die
   Karte "noch 6 von 8" sagen.

   GERAEUMT WIRD NICHT NACH EINER FRIST, anders als bei Token und Anfragen:
   ein Wiederherstellungscode liegt auf einem Zettel und soll genau dann
   tragen, wenn das Telefon seit Monaten weg ist. Weg kommen die Zeilen nur
   beim Neuerzeugen oder Abschalten, beides in einer Transaktion.

   ON DELETE CASCADE aus demselben Grund wie oben. */
CREATE TABLE IF NOT EXISTS two_factor_codes (
  hash TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  used_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
-- Gefragt wird ueber den Hash (Primaerschluessel) ODER nach allen Codes EINES
-- Zugangs -- die Zahl fuer die Karte, das Ersetzen, das Abschalten. Dieselbe
-- Ueberlegung wie bei idx_tokens_user, und wie dort ist ein Index keine
-- Migration: er fasst die Zeilenform nicht an und legt sich bei jedem Start
-- selbst nach.
CREATE INDEX IF NOT EXISTS idx_two_factor_codes_user ON two_factor_codes(user_id);

/* KEIN MIGRATIONSBLOCK FUER DIE BEIDEN: anders als eine SPALTE legt
   CREATE TABLE IF NOT EXISTS eine fehlende TABELLE bei jedem Start an
   (Stolperstein 13 gilt der Spalte). Es bleibt bei FUENF markierten
   Bloecken. */

/* DAS SICHERHEITSPROTOKOLL -- ES HAELT FEST, WER ZUGANG HATTE UND WER DIE
   INSTANZ ALS GANZES ANGEFASST HAT.

   ES IST KEIN AENDERUNGSVERLAUF, und das ist die tragende Grenze: kein
   Eintragstitel, kein Kommentartext, keine Bewertung, keine Note. Was die
   INSTANZ betrifft, nicht was jemand GESAGT hat.

   KEINE NAMENSSPALTE, obwohl sie verlockt: entferneZugang() ueberschreibt
   username, und eine Kopie hier waere die eine Stelle im Projekt, die den
   Grabstein rueckgaengig macht. Gespeichert werden Nummern.

   actor UND target SIND DIE FESTSTELLUNG EINES VORGANGS -- wer den Knopf
   gedrueckt hat und an wem. Daran haengt kein Recht und kein Filter, und
   beide gehoeren deshalb ausdruecklich NICHT in ordneBestandZu(): dort
   stillschweigend den Eigentuemer einzusetzen machte aus einer Feststellung
   eine Falschaussage.

   actor IS NULL HEISST "UEBER usertool.js AUF DEM WIRT" -- mit genau einer
   Ausnahme, und die ist an der Spalte event zu erkennen: bei einer
   gescheiterten Anmeldung gibt es keinen angemeldeten Benutzer.

   BEI EINER GESCHEITERTEN ANMELDUNG STEHT DER GETIPPTE NAME NIRGENDS. target
   traegt die Nummer nur, wenn der Name einen vorhandenen Zugang traf --
   sonst NULL. Freitext von aussen kommt in diese Tabelle nicht hinein; sonst
   landete frueher oder spaeter ein ins falsche Feld getipptes Passwort darin.

   detail TRAEGT AUSSCHLIESSLICH WERTE AUS EINER GESCHLOSSENEN LISTE im
   Quelltext (MERKMALE in auth.js). Damit ist "in keiner Zeile steht etwas,
   was dort nicht hingehoert" baulich wahr statt durchgesetzt.

   ON DELETE SET NULL statt CASCADE: mit dem Menschen verschwindet der Vorgang
   nicht. */
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
-- tragende Regel seiner Bauform. Kein Zustand 'deleted' an items: der
-- beruehrte jede Abfrage im ganzen System, und jede vergessene Stelle waere
-- ein stiller Fehler. Ein geloeschter Eintrag ist WIRKLICH weg -- er liegt nur
-- zusaetzlich noch als Paket daneben.
--
-- KEIN MIGRATIONSBLOCK, und das ist nachgestellt statt geglaubt: anders als
-- eine Spalte legt CREATE TABLE IF NOT EXISTS eine fehlende TABELLE bei jedem
-- Start an (Stolperstein 13 gilt der Spalte, nicht der Tabelle). Der
-- Pruefstand entfernt sie von Hand aus einer bestehenden Instanz, startet
-- einmal und sieht nach -- dieselbe Probe wie beim Index auf sessions.user_id.
--
-- deleted_by IST KEIN TRAEGER WIE items.user_id. Es ist die Feststellung
-- eines VORGANGS, so wie created_at -- wer den Knopf gedrueckt hat. Daran
-- haengt kein Recht und kein Filter. Die Spalte gehoert deshalb ausdruecklich
-- NICHT in ordneBestandZu(): das Auffangnetz beantwortet, wem herrenloser
-- BESTAND zufaellt; hier stillschweigend den Eigentuemer einzusetzen machte
-- aus einer Feststellung eine Falschaussage. Ein entfernter Zugang erscheint
-- wie ueberall als "Gelöschter Benutzer <nr>".
--
-- title STEHT ABSICHTLICH ZWEIMAL -- hier und im Paket. Er steht hier, damit
-- die Liste lesbar ist, ohne jede Zeile zu entpacken; bei zwanzig Zeilen waere
-- das zwanzigmal JSON.parse ueber ein Paket. Eine zweite Wahrheit kann daraus
-- nicht werden: das Wiederherstellen liest ausschliesslich content und diese
-- Spalte nie.
--
-- content IST EIN VOLLSTAENDIGER EXPORTUMSCHLAG MIT EINEM EINTRAG -- bis auf
-- die Bytes. Fotos, Videos, Dateien und Kommentarbilder tragen statt Base64
-- eine NUMMER und liegen in trash_bytes daneben. Der Grund ist gemessen:
-- zwanzig Videos zu je 20 MB sind als Base64 533 MB in EINEM String, und Node
-- haelt keinen String ueber 512 MB. Zippen half nicht -- der String entstuende
-- davor. Deshalb TEXT und eine zweite Tabelle statt eines gezippten BLOB.
CREATE TABLE IF NOT EXISTS trash (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  deleted_at TEXT NOT NULL DEFAULT (datetime('now')),
  deleted_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_trash_at ON trash(deleted_at);

-- Eine Zeile je Blob. Die Nummer part ist die, die im Paket steht; UNIQUE haelt
-- fest, dass zu einer Nummer genau ein Paket Bytes gehoert.
-- ON DELETE CASCADE: eine Papierkorbzeile ohne ihre Bytes waere ein Paket, das
-- sich nicht mehr auspacken laesst.
-- WARUM EINE ZEILE JE BLOB und nicht ein grosser Blob: eine BLOB-Zeile wird
-- nicht stueckweise gelesen, sondern ganz in den Arbeitsspeicher. Je Zeile
-- sind das hoechstens 50 MB (die Grenze am Anhang). Und wenn Teil II des
-- Videopapiers Dateien bis 2 GB bringt, teilt sich eine Datei hier auf
-- mehrere part auf -- SQLite traegt in einer Zelle rund 950 MB.
CREATE TABLE IF NOT EXISTS trash_bytes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  trash_id INTEGER NOT NULL REFERENCES trash(id) ON DELETE CASCADE,
  part INTEGER NOT NULL,
  data BLOB NOT NULL,
  UNIQUE(trash_id, part)
);
`;

/* ================= WAS BEIM OEFFNEN LAEUFT — UND DASS ES ZWEIMAL DARF ========
   NACHGESEHEN FUER 0.19.3, weil seit dieser Runde ein ZWEITER Leser dieselbe
   Datei oeffnet: der Bestandslauf requiret db.js aus seinem eigenen Thread und
   faehrt damit alles hier ein zweites Mal. Der Auftrag liess die Wahl zwischen
   einem Schalter „nur oeffnen, nicht wandern" und dem Nachweis, dass nichts
   davon zweimal schadet. Nachgesehen wurde, Zeile fuer Zeile, und es ist der
   Nachweis geworden:

     db.exec(SCHEMA)              CREATE TABLE/INDEX IF NOT EXISTS -- beim
                                  zweiten Mal geschieht nichts.
     die acht Migrationsblöcke    jeder fragt zuerst, ob die Spalte schon da
                                  ist, und kehrt sonst wortlos zurueck. Beim
                                  zweiten Mal ist sie es immer, denn der
                                  Haupt-Thread war zuerst da.
     die beiden CREATE INDEX      IF NOT EXISTS.
     das Auffangnetz              UPDATE ... AND NOT EXISTS (... eigentuemer)
     assignInventory()             UPDATE OR IGNORE ... WHERE user_id IS NULL
     die Grundausstattung         INSERT OR IGNORE
     renumberCriteria()           schreibt nur, wo die Nummer abweicht
   EIN VACUUM WAERE ES NICHT, und genau deshalb steht keines hier: es liegt in
   maintainStorage() in server.js und bleibt im Haupt-Thread.
   WAS TROTZDEM ZWEIMAL SCHADET, IST DAS GEREDE: die Ansagen an den Betreiber
   -- allen voran der halbe Bildschirm Schluesselhinweis -- haelt keys.js im
   Neben-Thread zurueck. Das ist der eine Schalter dieser Runde.
   WER HIER ETWAS ERGAENZT, PRUEFT ES GEGEN DIESE LISTE. Eine Zeile, die beim
   zweiten Lauf etwas anderes tut als beim ersten, faellt nicht auf: sie faellt
   dem Bestandslauf zur Last, und der laeuft still im Hintergrund. */
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

/* ================= MIGRATION 0.24.1 — DIE NAMEN DES BESTANDS ==============
   ENTFAELLT MIT 1.0.

   SECHS TABELLEN, SECHSUNDZWANZIG SPALTEN UND VIERUNDFUENFZIG WERTE heissen
   ab dieser Runde englisch. Ein Schemaname ist kein Inhalt, sondern Code --
   und `db.js` waere sonst der eine Ort, an dem Deutsch stehen bliebe.

   SIE STEHT VOR `db.exec(SCHEMA)` UND NICHT DAHINTER, und das ist keine
   Geschmacksfrage: die DDL legt `trash` mit `CREATE TABLE IF NOT EXISTS` an.
   Liefe sie zuerst, staende neben dem vollen `papierkorb` ein leeres `trash`,
   und `ALTER TABLE papierkorb RENAME TO trash` scheiterte an einem Namen, den
   es schon gibt. Die Zeilen waeren nicht verloren, aber unsichtbar -- der
   schlimmste aller Ausgaenge.

   DIE LISTE STEHT IN `tools/dictionary.json` UND NUR DORT (Auftrag,
   Bauabschnitt 6): dieselbe Datei, aus der das Namenswoerterbuch entsteht und
   aus der der Import alte Exportdateien uebersetzt. Zwei Listen ueber
   dieselbe Sache laufen auseinander.

   WIEDERHOLBAR UND IM NORMALFALL STUMM, wie jeder Block hier: gefragt wird
   der Bestand selbst (`sqlite_master`), nicht ein Merker. Beim zweiten Lauf
   -- und den gibt es, der Bestandslauf oeffnet dieselbe Datei aus seinem
   Thread -- ist jede Tabelle laengst umbenannt, und der Block kehrt wortlos
   zurueck. */
const WOERTERBUCH = JSON.parse(fs.readFileSync(path.join(__dirname, 'tools', 'dictionary.json'), 'utf8'));

/* DIE INDIZES DER UMBENANNTEN TABELLEN. `ALTER TABLE … RENAME TO` nimmt sie
   mit, laesst ihnen aber ihren alten NAMEN -- und die DDL legt gleich darauf
   denselben Index ein zweites Mal unter dem neuen an. Zwei Indizes ueber
   dieselben Spalten sind kein Fehler, aber doppelte Arbeit bei jedem
   Schreiben. Sie fallen deshalb hier weg; die DDL baut sie neu auf. */
const ALTE_INDIZES = Object.keys(WOERTERBUCH.indexes);

function migration0241Tabellen() {
  const da = new Set(db.prepare("SELECT name FROM sqlite_master WHERE type = 'table'")
    .all().map(z => z.name));
  const umzug = Object.entries(WOERTERBUCH.tables).filter(([alt, neu]) => da.has(alt) && !da.has(neu));
  /* DIE INDIZES FALLEN IN JEDEM FALL, auch wenn keine Tabelle mehr umzuziehen
     ist: `idx_photos_art` und `idx_photos_kachel` haengen an Tabellen, die
     ihren Namen behalten -- nur die Indizes selbst heissen deutsch. */
  const alteIndizes = db.prepare("SELECT name FROM sqlite_master WHERE type = 'index'")
    .all().map(z => z.name).filter(n => ALTE_INDIZES.includes(n));
  if (!umzug.length && !alteIndizes.length) return 0;
  db.transaction(() => {
    for (const alt of alteIndizes) db.exec(`DROP INDEX IF EXISTS ${alt}`);
    for (const [alt, neu] of umzug) db.exec(`ALTER TABLE ${alt} RENAME TO ${neu}`);
  })();
  if (!umzug.length) {
    console.log(`[Kriterion] ${alteIndizes.length} ${alteIndizes.length === 1 ? 'Index' : 'Indizes'} ` +
      `umbenannt (Migration auf 0.24.1): ${alteIndizes.join(', ')}.`);
    return alteIndizes.length;
  }
  console.log(`[Kriterion] ${umzug.length} ${umzug.length === 1 ? 'Tabelle' : 'Tabellen'} umbenannt ` +
    `(Migration auf 0.24.1): ${umzug.map(([a, b]) => `${a} → ${b}`).join(', ')}.`);
  return umzug.length;
}
migration0241Tabellen();

/* DIE SPALTEN, UNMITTELBAR HINTER DEN TABELLEN UND VOR ALLEM ANDEREN.
   ZWEI GRUENDE FUER GENAU DIESE STELLE:

   ERSTENS DIE DDL: `CREATE TABLE IF NOT EXISTS` ruehrt eine vorhandene
   Tabelle nicht an -- eine frische Instanz bekommt die neuen Namen aus dem
   Schema, eine vorhandene aus diesem Block. Beide sehen danach gleich aus.

   ZWEITENS DIE AELTEREN MIGRATIONSBLOECKE, und das ist der schaerfere Grund:
   `migration0160()` fragt, ob `ratings` die Spalte `set_at` traegt, und legt
   sie sonst an. Liefe sie VOR dieser Umbenennung, saehe sie in einem Bestand
   aus 0.16.0 nur das alte `gesetzt_am`, legte `set_at` ein ZWEITES Mal daneben
   -- und diese Umbenennung scheiterte danach an einem Namen, den es schon
   gibt. Dieselbe Falle steht an `zoom`, `phase`, `kind` und `duration`.

   `ALTER TABLE … RENAME COLUMN` kann SQLite seit 3.25 und zieht dabei jeden
   Index, jeden Fremdschluessel und jede Sicht mit. */
function migration0241Spalten() {
  const tabellen = new Set(db.prepare("SELECT name FROM sqlite_master WHERE type = 'table'")
    .all().map(z => z.name));
  const umzug = [];
  for (const [place, neu] of Object.entries(WOERTERBUCH.columns)) {
    const [tabelle, alt] = place.split('.');
    if (!tabellen.has(tabelle)) continue;
    const spalten = db.prepare(`PRAGMA table_info(${tabelle})`).all().map(c => c.name);
    if (spalten.includes(alt) && !spalten.includes(neu)) umzug.push([tabelle, alt, neu]);
  }
  if (!umzug.length) return 0;
  db.transaction(() => {
    for (const [tabelle, alt, neu] of umzug)
      db.exec(`ALTER TABLE ${tabelle} RENAME COLUMN ${alt} TO ${neu}`);
  })();
  console.log(`[Kriterion] ${umzug.length} ${umzug.length === 1 ? 'Spalte' : 'Spalten'} umbenannt ` +
    `(Migration auf 0.24.1): ${umzug.map(([t, a, b]) => `${t}.${a} → ${b}`).join(', ')}.`);
  return umzug.length;
}
migration0241Spalten();

/* DIE PAARE BLEIBEN ERREICHBAR, UND ZWAR GENAU DIESE. Eine Exportdatei ist
   ein Abzug des Bestands: eine Datei von vor 0.24.1 traegt an ihren Fotos
   `art` und `dauer`, weil die Spalten so hiessen. Der Import in server.js
   uebersetzt sie beim Einlesen -- und nimmt die Paare von HIER, nicht aus
   einer zweiten Liste. Zwei Listen laufen auseinander, sobald eine wandert. */
const COLUMNS_0241 = WOERTERBUCH.columns;

/* DIE WERTE, ALS DRITTES UND LETZTES. Ein Name im Schema ist Code; ein Wert
   IN einer Zeile ist es genauso, sobald der Quelltext ihn vergleicht --
   `z.event === 'zugang.status'` waere sonst der Ort, an dem Deutsch
   stehenbliebe (F2).

   ZWEIUNDSECHZIG PAARE: achtundfuenfzig in neun Spalten, drei am Schema und
   eines am Grabstein -- alle aus derselben Liste, aus der der
   Quelltext liest. Eine zweite Liste hier waere die eine Stelle, an der
   Umbenennung und Vergleich auseinanderlaufen koennten, ohne dass es jemand
   merkt: der Vergleich griffe einfach nie mehr.

   JEDES `UPDATE` FRAGT VORHER NACH SEINER SPALTE. Ein Bestand aus 0.8.0
   traegt `photos.kind` noch nicht -- die Spalte kommt erst aus
   migration0850() weiter unten, und die legt sie gleich mit dem neuen
   Vorgabewert an. Ohne die Frage brach der Block dort ab, bevor er die
   uebrigen acht Spalten erreicht haette.

   DER GRABSTEIN IST EIN WERT WIE JEDER ANDERE: `geloescht-7` steht als
   Benutzername in users und wird `deleted-7`. Die Oberflaeche zeigt ihn
   ohnehin nie -- sie bildet aus der NUMMER „Gelöschter Benutzer 7".

   DAS SCHEMA IN user_settings STEHT ALS JSON: der Wert ist `"dunkel"` mit
   Anfuehrungszeichen und nicht `dunkel`. Deshalb steht dieses eine Paar
   eigens da und nicht in der Schleife darueber.

   WIEDERHOLBAR UND IM NORMALFALL STUMM, wie die beiden Bloecke darueber:
   gefragt wird die Zeile selbst, nicht ein Merker. */
const WERTE_0241 = [
  ['security_log',    'event',    WOERTERBUCH.values.event],
  ['security_log',    'detail',   WOERTERBUCH.values.detail],
  ['users',           'role',     WOERTERBUCH.values.role],
  ['users',           'status',   WOERTERBUCH.values.userStatus],
  ['rating_criteria', 'phase',    WOERTERBUCH.values.phase],
  ['photos',          'kind',     WOERTERBUCH.values.photoKind],
  ['tokens',          'purpose',  WOERTERBUCH.values.tokenPurpose],
  ['settings',        'key',      WOERTERBUCH.values.setting],
  ['user_settings',   'key',      WOERTERBUCH.values.userSetting]
];
function migration0241Werte() {
  const tabellen = new Set(db.prepare("SELECT name FROM sqlite_master WHERE type = 'table'")
    .all().map(z => z.name));
  let n = 0;
  const gezaehlt = [];
  for (const [tabelle, spalte, paare] of WERTE_0241) {
    if (!tabellen.has(tabelle)) continue;
    const spalten = db.prepare(`PRAGMA table_info(${tabelle})`).all().map(c => c.name);
    if (!spalten.includes(spalte)) continue;
    const setze = db.prepare(`UPDATE ${tabelle} SET ${spalte} = ? WHERE ${spalte} = ?`);
    for (const [alt, neu] of Object.entries(paare)) {
      const r = setze.run(neu, alt);
      if (r.changes) { n += r.changes; gezaehlt.push(`${tabelle}.${spalte} ${alt} → ${neu} (${r.changes})`); }
    }
  }
  // Das Schema steht als JSON-String in user_settings.
  if (tabellen.has('user_settings')) {
    const setze = db.prepare(
      "UPDATE user_settings SET value = ? WHERE key = 'theme' AND value = ?");
    for (const [alt, neu] of Object.entries(WOERTERBUCH.values.theme)) {
      const r = setze.run(JSON.stringify(neu), JSON.stringify(alt));
      if (r.changes) { n += r.changes; gezaehlt.push(`user_settings.theme ${alt} → ${neu} (${r.changes})`); }
    }
  }
  // Der Grabstein: sein Name traegt seine eigene Nummer und wird daraus gebaut.
  if (tabellen.has('users')) {
    const r = db.prepare(
      "UPDATE users SET username = 'deleted-' || id WHERE username = 'geloescht-' || id").run();
    if (r.changes) { n += r.changes; gezaehlt.push(`users.username geloescht- → deleted- (${r.changes})`); }
  }
  if (!n) return 0;
  console.log(`[Kriterion] ${n} Werte umbenannt (Migration auf 0.24.1): ${gezaehlt.join(', ')}.`);
  return 1;
}
migration0241Werte();

/* AUCH DIE WERTE BLEIBEN ERREICHBAR -- aus demselben Grund wie die Spalten
   darueber: eine Exportdatei von vor 0.24.1 traegt `bild` an ihren Fotos und
   `vorher` an ihren Kriterien, und der Import uebersetzt beides beim
   Einlesen. */
const VALUES_0241 = WOERTERBUCH.values;
// ENDE MIGRATION 0.24.1 (Tabellen, Spalten und Werte)

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
// Die Spalte weight steht in der DDL, aber CREATE TABLE IF NOT EXISTS ruehrt
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
  if (spalten.includes('weight')) return 0;
  db.exec('ALTER TABLE rating_criteria ADD COLUMN weight REAL NOT NULL DEFAULT 1.0');
  const n = db.prepare('SELECT COUNT(*) AS n FROM rating_criteria').get().n;
  console.log(`[Kriterion] rating_criteria um weight ergaenzt (Migration auf 0.8.40); ` +
    `${n} Kriterien stehen auf dem Vorgabegewicht 1,0.`);
  return 1;
}
migration0840();
// ENDE MIGRATION 0.8.40

// MIGRATION 0.8.50 — ENTFAELLT MIT 1.0
// Die Spalten kind und duration stehen in der DDL, aber CREATE TABLE IF NOT EXISTS
// ruehrt eine VORHANDENE Tabelle nicht an (Stolperstein 13). Ein Bestand aus
// 0.8.0 bis 0.8.40 traegt photos ohne diese Spalten.
// DIE BESTANDSZEILEN BEKOMMEN 'image', und zwar aus dem DEFAULT der Spalte,
// nicht aus einem nachgeschobenen UPDATE: ALTER TABLE ... ADD COLUMN mit
// NOT NULL DEFAULT fuellt die vorhandenen Zeilen selbst. duration bleibt dabei
// NULL, und das ist richtig -- ein Foto hat keine Dauer.
// JEDE SPALTE WIRD EINZELN GEFRAGT, nicht der Block als Ganzes. Zwei
// ALTER TABLE sind zwei Anweisungen: scheitert die zweite, bleibt die erste
// stehen. Ein Block, der beim Vorhandensein von kind zurueckkehrt, liesse duration
// dann fuer immer fehlen. So heilt der naechste Start den zerrissenen Stand.
// KEINE FRAGE NACH EINEM VERFASSER, wie schon bei 0.8.40: ein Foto gehoert
// seinem Eintrag, nicht einem Verfasser. Das Auffangnetz weiter unten geht
// diese Tabelle deshalb nichts an.
// Einmalig, wiederholbar und im Normalfall stumm. Zu 1.0 faellt dieser Block
// weg, die Spalten in der DDL bleiben.
function migration0850() {
  const spalten = db.prepare('PRAGMA table_info(photos)').all().map(c => c.name);
  const fehlend = [];
  if (!spalten.includes('kind')) {
    db.exec("ALTER TABLE photos ADD COLUMN kind TEXT NOT NULL DEFAULT 'image'");
    fehlend.push('kind');
  }
  if (!spalten.includes('duration')) {
    db.exec('ALTER TABLE photos ADD COLUMN duration INTEGER');
    fehlend.push('duration');
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
// Die Spalten rejected_at, rejected_reason und rejected_by stehen in der DDL,
// aber CREATE TABLE IF NOT EXISTS ruehrt eine VORHANDENE Tabelle nicht an
// (Stolperstein 13). Ein Bestand aus 0.8.0 bis 0.13.2 traegt items ohne sie.
// KEIN NACHGESCHOBENES UPDATE, und das ist entschieden und nicht vergessen:
// eine Ablehnung aus einem Bestand vor dieser Version hat kein Datum, keinen
// Grund und keinen Verfasser -- diese Instanz weiss sie nicht. Jeder gesetzte
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
// rejected_by TRAEGT SEINEN FREMDSCHLUESSEL AUCH ALS NACHRUESTUNG: SQLite
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
  if (!spalten.includes('rejected_reason')) fehlend.push(['rejected_reason', 'ALTER TABLE items ADD COLUMN rejected_reason TEXT']);
  if (!spalten.includes('rejected_by')) fehlend.push(['rejected_by',
    'ALTER TABLE items ADD COLUMN rejected_by INTEGER REFERENCES users(id) ON DELETE SET NULL']);
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
   Bestand. Was die Instanz nicht weiss, behauptet sie nicht.
   WIEDERHOLBAR UND IM NORMALFALL STUMM, wie jeder Block hier: gefragt wird
   PRAGMA table_info, nicht ein Merker. */
function migration0160() {
  const spalten = db.prepare('PRAGMA table_info(ratings)').all().map(c => c.name);
  if (spalten.includes('set_at')) return 0;
  db.exec('ALTER TABLE ratings ADD COLUMN set_at TEXT');
  const n = db.prepare('SELECT COUNT(*) AS n FROM ratings WHERE value > 0').get().n;
  console.log(`[Kriterion] ratings um set_at ergaenzt (Migration auf 0.16.0); ` +
    `${n} vorhandene ${n === 1 ? 'Bewertung steht' : 'Bewertungen stehen'} ohne Zeitpunkt da ` +
    `und bleiben fuer die Glocke unsichtbar.`);
  return 1;
}
migration0160();
// ENDE MIGRATION 0.16.0

// MIGRATION 0.19.0 — ENTFAELLT MIT 1.0
/* DER AUSSCHNITT BEKOMMT EIN DRITTES MASS. Bis 0.18.1 trug ein Foto zwei
   Prozentwerte -- wohin das quadratische Fenster rutscht --, aber keinen
   dafuer, wie eng es sitzt. `zoom` ist dieser dritte Wert.
   MIT VORGABE, ANDERS ALS set_at AUS 0.16.0, und der Unterschied ist
   keine Geschmacksfrage: dort waere jeder nachgetragene Zeitpunkt eine
   ERFINDUNG gewesen (die Instanz weiss nicht, wann eine alte Bewertung
   entstand). Hier weiss sie es: jedes vorhandene Foto stand bisher auf
   „so weit wie moeglich", und genau das bedeutet 100. Die Vorgabe traegt
   also keine Behauptung, sondern den bisherigen Zustand.
   DAS GEHT AUCH TECHNISCH: ALTER TABLE ADD COLUMN nimmt in SQLite eine
   KONSTANTE Vorgabe an -- 100 ist eine, datetime('now') waere keine
   (Stolperstein 105).
   WIEDERHOLBAR UND IM NORMALFALL STUMM, wie jeder Block hier: gefragt wird
   PRAGMA table_info, nicht ein Merker. */
function migration0190() {
  const spalten = db.prepare('PRAGMA table_info(photos)').all().map(c => c.name);
  if (spalten.includes('zoom')) return 0;
  db.exec('ALTER TABLE photos ADD COLUMN zoom REAL NOT NULL DEFAULT 100');
  const n = db.prepare("SELECT COUNT(*) AS n FROM photos WHERE kind != 'video'").get().n;
  console.log(`[Kriterion] photos um zoom ergaenzt (Migration auf 0.19.0); ` +
    `${n} vorhandene ${n === 1 ? 'Foto steht' : 'Fotos stehen'} auf dem weitesten ` +
    `Ausschnitt und sehen damit aus wie bisher.`);
  return 1;
}
migration0190();
// ENDE MIGRATION 0.19.0

// MIGRATION 0.21.0 — ENTFAELLT MIT 1.0
/* DAS KRITERIUM BEKOMMT SEINEN KASTEN. Die Spalte phase steht in der DDL,
   aber CREATE TABLE IF NOT EXISTS ruehrt eine VORHANDENE Tabelle nicht an
   (Stolperstein 13) -- ein Bestand aus 0.8.40 bis 0.20.1 traegt
   rating_criteria ohne sie. Deshalb ueberhaupt dieser Block.
   DIE BESTANDSZEILEN BEKOMMEN 'after', und zwar aus dem DEFAULT der Spalte,
   nicht aus einem nachgeschobenen UPDATE: ALTER TABLE ... ADD COLUMN mit
   NOT NULL DEFAULT fuellt die vorhandenen Zeilen selbst. Dieselbe Regel wie
   bei weight in Migration 0.8.40, und derselbe Grund: jeder andere Wert
   aenderte beim Einspielen still saemtliche Gesamtschnitte. Was heute
   Kriterium ist, ist Bewertungskriterium. Punkt.
   DIE VORGABE TRAEGT DAMIT KEINE BEHAUPTUNG, SONDERN DEN BISHERIGEN ZUSTAND
   -- dieselbe Ueberlegung wie bei zoom in 0.19.0 und ausdruecklich nicht die
   von set_at in 0.16.0, wo jeder nachgetragene Wert eine Erfindung
   gewesen waere.
   'after' IST EINE KONSTANTE Vorgabe, und nur solche nimmt ALTER TABLE ADD
   COLUMN in SQLite an (Stolperstein 105).
   Einmalig, wiederholbar und im Normalfall stumm: gefragt wird PRAGMA
   table_info, nicht ein Merker. Zu 1.0 faellt der Block weg, die Spalte in der
   DDL bleibt. */
function migration0210() {
  const spalten = db.prepare('PRAGMA table_info(rating_criteria)').all().map(c => c.name);
  if (spalten.includes('phase')) return 0;
  db.exec("ALTER TABLE rating_criteria ADD COLUMN phase TEXT NOT NULL DEFAULT 'after'");
  const n = db.prepare("SELECT COUNT(*) AS n FROM rating_criteria WHERE phase = 'after'").get().n;
  console.log(`[Kriterion] rating_criteria um phase ergaenzt (Migration auf 0.21.0); ` +
    `${n} ${n === 1 ? 'Kriterium steht' : 'Kriterien stehen'} auf 'after' und ` +
    `${n === 1 ? 'zaehlt' : 'zaehlen'} damit weiter in die Bewertung.`);
  return 1;
}
migration0210();
// ENDE MIGRATION 0.21.0

/* ================= DIE INDIZES AUF NACHGERUESTETE SPALTEN =================
   SIE STEHEN HIER UNTEN UND NICHT IN DER DDL, und der Grund ist ein Befund des
   Pruefstands -- zweimal derselbe, in zwei Stufen.

   EIN INDEX AUF EINER NACHGERUESTETEN SPALTE GEHOERT HINTER IHRE MIGRATION
   (Stolperstein 281). `CREATE TABLE IF NOT EXISTS` ruehrt eine vorhandene
   Tabelle nicht an (Stolperstein 13): eine Datenbank aus 0.8.40 traegt
   `photos.kind` erst, nachdem migration0850() gelaufen ist, und `photos.zoom`
   erst nach migration0190(). Ein CREATE INDEX weiter oben scheitert dort mit
   „no such column" -- beim OEFFNEN der Datei, also bevor der Server ueberhaupt
   startet. Kein Fehlerbild, keine halbe Funktion: die Anwendung kommt nicht
   hoch.

   DESHALB STEHEN SIE HIER UNTEN UND NICHT JE HINTER IHRER EIGENEN MIGRATION:
   die Reihenfolge muesste sonst bei jeder neuen Migration nachgezogen werden,
   und ein Index, der zwei nachgeruestete Spalten nennt, haette gar keinen
   richtigen Platz. **Hinter der letzten Migration ist jede Spalte da.**
   *Gefunden hat das der Pruefstand: der erste Anlauf stellte den einen Index in
   die DDL (scheiterte an `kind` aus 0.8.40), der zweite hinter migration0850()
   -- und scheiterte am `zoom` aus 0.19.0.*

   ZU 1.0 FALLEN DIE MIGRATIONSBLOECKE WEG, die Spalten in der DDL bleiben --
   dann duerfen diese Zeilen mit nach oben. Der Satz steht hier, damit sie beim
   Aufraeumen nicht uebersehen werden.

   KEINE VON BEIDEN IST EINE DATENBANKSTUFE: kein Migrationsblock, keine
   Spalte, keine neue Formatnummer. */

/* WOZU DER ERSTE: `kind` steht in der Spaltenreihenfolge hinter drei Blobs
   (data, thumb, medium). Wer sie aus dem SATZ liest, muss ihn bis dorthin
   durchlaufen -- und das heisst bei einem 512-kB-Bild: die ganze Kette der
   Overflow-Seiten lesen und entschluesseln. Gemessen an einer SQLCipher-Datei
   mit 400 Zeilen a 512 kB (312 MB), je Abfrage ueber die ganze Tabelle:

     COUNT(*)                                        0,0 ms
     mime_type gruppiert  (Spalte 2, VOR den Blobs)  8,7 ms
     kind gruppiert       (Spalte 6, HINTER ihnen)   1338,8 ms
     SUM(length(data))    (Spalte 3)                 7,2 ms
     SUM(length(data)) mit WHERE kind != 'video'      1334,1 ms
     kind gruppiert, MIT diesem Index                0,1 ms

   DER UNTERSCHIED IST NICHT DIE MENGE, SONDERN DIE LAGE DER SPALTE
   (Stolperstein 279). EINE GLEICHHEIT, KEINE UNGLEICHHEIT: `WHERE kind !=
   'video'` schlaegt den Index aus, `WHERE kind IS ?` nutzt ihn. Die Abfragen in
   /api/stats holen deshalb erst die vorhandenen Arten und fragen dann je Art.

   Beim ersten Start nach dem Einspielen baut SQLite ihn einmal auf --
   gemessen 1,4 s bei 312 MB, danach steht er. */
db.exec('CREATE INDEX IF NOT EXISTS idx_photos_kind ON photos(kind)');

/* WOZU DER ZWEITE: `/api/items` holt je Eintrag die Fotoliste; jede dieser
   Zeilen traegt focus_x, focus_y, zoom, sort_order, created_at, kind und duration
   -- SIEBEN Spalten, die hinter data, thumb und medium stehen. Der Index
   `idx_photos_item` deckt davon nur `sort_order` ab; alles andere kaeme aus
   dem Satz.

   GEMESSEN AN DERSELBEN DATEI (400 Eintraege, 400 Fotos, 312 MB), je Aufruf
   ueber alle Eintraege:

     bis 0.19.2: N Abfragen, aus dem Satz               9,3 ms
     N Abfragen, aus diesem deckenden Index             3,0 ms
     EINE Abfrage, aus diesem deckenden Index           1,6 ms
     EINE Abfrage, ohne ihn                             6,3 ms

   Die Uebersicht kostete damit 26 ms; die Fotoabfrage war mit rund einem
   Drittel ihr groesster Einzelposten. Zum Vergleich die Nachbarn derselben
   Schleife: Tags 0,9 ms, Anhaenge 1,2 ms, Links 2,0 ms.

   DIE LISTE MUSS VOLLSTAENDIG SEIN: fehlt eine einzige Spalte -- created_at
   etwa --, faellt SQLite auf idx_photos_item zurueck und liest wieder den
   Satz. Nachgemessen am Abfrageplan: mit created_at steht dort „SCAN photos
   USING COVERING INDEX", ohne es „SEARCH photos USING INDEX idx_photos_item".
   Der Index staende da, saehe richtig aus und deckte nichts mehr.

   ER KOSTET FAST NICHTS: gemessen 20 kB bei 400 Zeilen -- er traegt keine
   Blobs, nur Zahlen und kurze Zeichen.

   WER IN DER UEBERSICHT EINE SPALTE ERGAENZT, ergaenzt sie AUCH HIER. Die
   Abfrage fuehrt ihre Liste als PHOTO_SPALTEN an einer Stelle, und eine
   Pruefung haelt beide gegeneinander. */
db.exec(`CREATE INDEX IF NOT EXISTS idx_photos_tile
           ON photos(item_id, sort_order, id, mime_type, focus_x, focus_y, zoom, created_at, kind, duration)`);

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
  if (n) console.log('[Kriterion] Die Instanz hatte keinen Eigentuemer; der aelteste ' +
    'berechtigte Zugang ist es jetzt (role=eigentuemer).');
}

// WEM herrenloser Bestand zufaellt, steht an genau einer Stelle -- hier. Die
// Frage liest die Rolle: der Bestand darf keinem Grabstein zufallen, denn der
// meldet sich nie wieder an. Gibt es mehrere Eigentuemer, nimmt der aelteste.
// Blankes SQL statt eines Aufrufs in auth.js: db.js darf von auth.js nichts
// wissen, die Abhaengigkeit laeuft andersherum.
function eigentuemerId() {
  return db.prepare("SELECT MIN(id) AS id FROM users WHERE role = 'owner'").get().id;
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
// Instanz gibt es noch keinen Benutzer, dem etwas zufallen koennte.
// UPDATE OR IGNORE, weil user_id bei ratings und test_days im UNIQUE steht:
// zwei herrenlose Zeilen zum selben Kriterium sind moeglich (NULL gilt im
// UNIQUE als verschieden); ohne OR IGNORE stuerbe der Start an der Verletzung.
function assignInventory() {
  const counts = {};
  let sum = 0;
  const owner = eigentuemerId();
  if (owner == null) {
    return { items: 0, comments: 0, test_days: 0, ratings: 0, links: 0, attachments: 0 };
  }
  for (const tabelle of ['items', 'comments', 'test_days', 'ratings', 'links', 'attachments']) {
    const n = db.prepare(
      `UPDATE OR IGNORE ${tabelle} SET user_id = ? WHERE user_id IS NULL`
    ).run(owner).changes;
    counts[tabelle] = n;
    sum += n;
  }
  if (sum) {
    console.log('[Kriterion] Bestand ohne Benutzer dem Eigentuemer zugeordnet: ' +
      `${counts.items} Eintraege, ${counts.comments} Kommentare, ${counts.test_days} Testtage, ` +
      `${counts.ratings} Bewertungen, ${counts.links} Links, ${counts.attachments} Dateien.`);
  }
  return counts;
}
assignInventory();

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
                   COLUMNS_0241, VALUES_0241,
                   changeKey, method,
                   renumberCriteria, assignInventory, eigentuemerId,
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
                   migration0160,
                   // MIGRATION 0.19.0 — ENTFAELLT MIT 1.0
                   migration0190,
                   // MIGRATION 0.21.0 — ENTFAELLT MIT 1.0
                   migration0210 };
