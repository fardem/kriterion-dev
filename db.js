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

/* Den Schluessel der Datei wechseln. Gerufen nur von keytool.js auf dem
   Wirt, bei angehaltener Instanz; es steht hier, weil hier journal_mode
   gesetzt wird.
   PRAGMA rekey laeuft im WAL-Modus nicht -- also erst auf DELETE umschalten,
   wechseln, zurueckschalten. Die Rueckschaltung steht im finally.
   Ein Abbruch mittendrin ist folgenlos, solange das Rollback-Journal
   ueberlebt; faellt es weg, ist alles verloren. Daher die Sicherung davor. */
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

/* Welche Verfahren wirklich laufen -- fuer die Kennzahlen. Abgelesen und
   nicht behauptet: `cipher` und `journal_mode` fragt die geoeffnete Datei
   selbst, die Schluessellaenge ist die des gesetzten Schluessels. "scrypt"
   haengt der Server aus auth.js an.
   Keine Paketversion: ein Verfahrensname sagt, wie gerechnet wird, eine
   Versionsnummer sagt, welche Luecke passt. */
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
  -- IN WELCHER SPRACHE DIESER NAME GESCHRIEBEN IST -- 0.25.0, Bauabschnitt 1.
  -- Bis 0.24.6 stand das nirgends, und baseLanguage() schrieb die Zeile
  -- derjenigen Sprache zu, die GERADE Vorgabe ist. Wer die Vorgabe wechselte,
  -- verschob damit den ganzen Bestand von einer Namenstafel in die andere --
  -- kein Datenverlust, eine falsche Zuordnung (Befund A1).
  -- NULL IST ERLAUBT UND BEDEUTET ETWAS: „in welcher Sprache dieser Name
  -- geschrieben ist, weiss niemand". Das war der Zustand eines Bestands, der
  -- die Spalte nachgeruestet bekam -- der Block von 0.25.0 fuellte sie
  -- ausdruecklich NICHT (F2 jener Runde), und die Karte bietet bis heute einen
  -- Knopf zum Zuordnen an. Das System behauptet nie etwas Falsches.
  -- AB 0.25.0 ENTSTEHT KEINE ZEILE MEHR OHNE SPRACHVERMERK: der Anlegeweg
  -- traegt die Sprache des Rufers ein, der Import die der Datei.
  language TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  rejected INTEGER NOT NULL DEFAULT 0,
  -- WANN, WARUM UND VON WEM abgelehnt wurde. Die drei gehoeren zu rejected und
  -- ersetzen es NICHT: ein zweites Merkmal "Ergebnis" daneben waeren zwei
  -- Wahrheiten ueber dieselbe Sache. Das vorhandene Merkmal
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
  -- ON DELETE SET NULL wie an jedem Traeger: ein entfernter
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
  -- weiter; der zweite beschrieb den Weg, und der ist ein anderer geworden.
  -- DIE DREI WERTE SIND DAS REZEPT fuer die Kachel -- deshalb ist der
  -- Ausschnitt jederzeit aenderbar.
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
  -- Reihenfolgen, und der Pruefstand haelt genau das fest. Gefunden hat es
  -- die Zeile, die 0.16.0 dafuer hinterlassen hat, beim allerersten Lauf der
  -- Migrationsgruppe dieser Runde.
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
  -- DEFAULT 'after', und jede Zeile bekommt ihn aus dem DEFAULT und nicht aus
  -- einem UPDATE -- so hat es 0.21.0 beim Nachruesten gehalten, und der Grund
  -- gilt unveraendert: jeder andere Wert aenderte still saemtliche
  -- Gesamtschnitte. Was heute Kriterium ist, ist Bewertungskriterium.
  -- UNIQUE(name) BLEIBT GLOBAL und wandert nicht auf (name, phase): ein Name,
  -- ein Kasten. Die Einschraenkung zu aendern hiesse Tabellenneubau (SQLite
  -- kennt kein ALTER CONSTRAINT), und „Wunsch" in beiden Kaesten waere fuer
  -- den Benutzer ohnehin ein Raetsel.
  phase TEXT NOT NULL DEFAULT 'after',
  -- IN WELCHER SPRACHE DIESER NAME GESCHRIEBEN IST -- 0.25.0, Bauabschnitt 1.
  -- Dieselbe Spalte mit derselben Bedeutung wie an product_categories, und
  -- aus demselben Grund: die Grundzeile trug bis 0.24.6 keinen Sprachvermerk
  -- und wurde deshalb derjenigen Sprache zugerechnet, die gerade Vorgabe war.
  -- NULL heisst „unbekannt" und nicht „keine".
  language TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Jeder Benutzer hat seine eigene Zeile je Kriterium.
/* ======== DIE NAMEN JE SPRACHE — 0.24.3, Bauabschnitt 6a (F8, F8a, F8b) ====

   ZWEI TABELLEN DANEBEN UND KEINE SPALTE AN DEN VORHANDENEN, und das ist die
   Bedingung der ganzen Runde: ratings.criterion_id mit
   UNIQUE(item_id, criterion_id, user_id) und items.product_category_id
   zeigen auf die Zeilen von rating_criteria und product_categories. Eine
   ZWEITE ZEILE je Sprache traefe damit jede Bewertung im Bestand -- sie hinge
   danach an der Sprachfassung statt am Kriterium.

   EIN KRITERIUM BLEIBT EIN KRITERIUM, in wie vielen Sprachen es auch heisst.
   Was hier steht, ist sein NAME in einer weiteren Sprache und nicht ein
   zweites Kriterium.

   UNIQUE(name) IN rating_criteria BLEIBT UNANGETASTET. Es zu aendern hiesse
   Tabellenneubau -- SQLite kennt kein ALTER CONSTRAINT --, und der Nutzen
   waere keiner: der Name in der Grundtabelle ist der der zuerst angelegten
   Sprache, und der ist weiterhin einmalig.

   KEIN UNIQUE UEBER (language, name): dass zwei Kriterien in einer zweiten
   Sprache gleich heissen, ist ein Fehler des Eigentuemers und keiner der
   Ablage -- und eine Klemme in der Datenbank saehe aus wie ein Absturz. Die
   Absage steht im Schreibweg, mit Satz.

   OHNE ZEILE GILT DER NAME DER GRUNDTABELLE. Der Rueckfall ist damit kein
   Zustand, sondern eine Lage: er gilt genau so lange, wie fuer eine Sprache
   noch nichts dasteht (Nachtrag zu E9/E11, Punkt 4). */
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
  images_removed INTEGER NOT NULL DEFAULT 0,
  -- DAS FAELLIGKEITSDATUM EINER AUFGABE -- 0.29.0, Befund 3.
  -- EIN DATUM, KEINE UHRZEIT, und das ist eine Entscheidung ueber die Sache:
  -- eine Aufgabe in einem Bewertungsarchiv ist an einem TAG faellig und nicht
  -- um 14:30. Eine Uhrzeit waere eine Genauigkeit, die niemand pflegt -- und
  -- ein Feld, das niemand pflegt, wird zur zweiten Wahrheit.
  -- 'JJJJ-MM-TT' ALS TEXT, wie test_days.day: in dieser Form ordnet der
  -- Zeichenvergleich wie der Kalender, und SQLite kennt ohnehin keinen
  -- eigenen Datumstyp.
  -- EINE SPALTE AN comments UND KEINE NEUE TABELLE: die Tabelle traegt die
  -- Aufgaben schon (kind = 'task'), und ein Datum daneben ist eine Spalte.
  -- FREIWILLIG -- NULL heisst "ohne Datum", und eine Aufgabe ohne Datum ist
  -- genau das, was sie vor dieser Runde war. Es gibt keinen Vorgabewert:
  -- ein selbst gesetztes Datum waere eine Behauptung ueber etwas, das niemand
  -- gesagt hat.
  -- SIE HAENGT NICHT AN kind. Wer eine Aufgabe zur Notiz zurueckschaltet,
  -- behaelt das Datum -- schaltet er wieder auf Aufgabe, steht es noch da.
  -- Ein Datum beim Umschalten zu loeschen waere eine Wegnahme, die niemand
  -- verlangt hat, und sie fiele erst beim Zurueckschalten auf.
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

-- WEN EIN KOMMENTAR MARKIERT -- 0.32.0, Bauabschnitt 2.
-- DIE ZUGANGSNUMMER UND NICHT DER NAME, und das ist die eine Entscheidung
-- dieser Tabelle (Auftrag 0.32.0, F2). Ein „@bert" im Text traegt einen NAMEN,
-- und ein geloeschter Name wird FREIGEGEBEN ("card.deleteUserHint": „der Name
-- wird frei"). Wer die Markierung aus dem Text ableitete, zeigte nach der
-- Freigabe nicht auf niemanden, sondern auf DEN FALSCHEN -- ein zweiter Mensch
-- kann den Namen laengst tragen, und niemand saehe es. Dazu kommt: „Geloeschter
-- Benutzer 7" ist aus einem Namen gar nicht zu bilden, list.deletedUser
-- verlangt die NUMMER.
-- EINE VERKNUEPFUNG UND KEINE SPALTE AN comments, obwohl der Auftrag „Spalte"
-- sagt: gemeint ist dort „gespeichert statt abgeleitet", und das ist der Kern.
-- Ein Kommentar markiert aber MEHRERE („@anna @bert schaut mal"), und eine
-- Spalte truege genau einen davon. Dieselbe Bauform wie item_tags: zwei
-- Nummern, ein zusammengesetzter Schluessel.
-- handle STEHT DANEBEN UND IST NICHT DIE WAHRHEIT. Er sagt, WIE die
-- Markierung im Text geschrieben steht -- der Browser muss das „@bert" im
-- Rohtext wiederfinden, um daraus einen Knoten zu machen. WAS angezeigt wird,
-- kommt immer aus der Nummer (authorCard) und nie aus dieser Spalte; sonst
-- stuende der Grabsteinname wieder am Bildschirm.
-- EIN ZUGANG STEHT JE KOMMENTAR EINMAL DARIN, auch wer zweimal genannt wird:
-- die Glocke sagt, DASS jemand markiert ist, nicht wie oft.
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
   CREATE TABLE IF NOT EXISTS eine fehlende TABELLE bei jedem Start an --
   die Regel gilt der Spalte. Es bleibt bei fuenf markierten Bloecken. */
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
   CREATE TABLE IF NOT EXISTS eine fehlende TABELLE bei jedem Start an --
   die Regel gilt der Spalte. Es bleibt bei FUENF markierten Bloecken. */

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
-- Start an -- die Regel gilt der Spalte, nicht der Tabelle. Der
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

/* WAS BEIM OEFFNEN LAEUFT — UND DASS ES ZWEIMAL DARF. Der Bestandslauf
   oeffnet dieselbe Datei aus seinem eigenen Thread und faehrt alles hier ein
   zweites Mal. Nichts davon schadet zweimal:

     db.exec(SCHEMA)        CREATE TABLE/INDEX IF NOT EXISTS
     incompleteDatabase()   liest nur
     die beiden CREATE INDEX  IF NOT EXISTS
     das Auffangnetz        UPDATE … AND NOT EXISTS (… eigentuemer)
     assignInventory()      UPDATE OR IGNORE … WHERE user_id IS NULL
     die Grundausstattung   INSERT OR IGNORE
     renumberCriteria()     schreibt nur, wo die Nummer abweicht

   Ein VACUUM waere es nicht; es liegt in maintainStorage() in server.js.
   Die Ansagen an den Betreiber bleiben im Neben-Thread still.
   Wer hier etwas ergaenzt, prueft es gegen diese Liste. */
const db = open(DB_FILE);

/* searchFold() -- die eine Faltung der Suche. Nadel und Heuhaufen rufen
   dieselbe Funktion; sie nimmt keine Sprache entgegen.
   Die vier i von Unicode fallen auf eines: `toLowerCase()` macht aus `İ` ein
   `i` mit kombinierendem U+0307, der Punkt faellt weg, und `ı` wird `i`.
   `ß` und `ss` treffen sich auf `ss`, und zwar nach `toLowerCase()`. Der
   Preis: „Masse" findet auch „Maße". Fuer eine Suche ist das die richtige
   Seite des Irrtums; fuer einen Vergleich waere sie falsch.
   null und undefined werden zum leeren String und nicht zu NULL:
   instr(NULL, 'x') ist NULL, und `NULL > 0` ist nie wahr. */
const searchFold = (s) => (s === null || s === undefined ? ''
  : String(s).toLowerCase().replace(/\u0307/g, '').replace(/\u0131/g, 'i')
      .replace(/\u00df/g, 'ss'));

/* kkl() -- die Faltung, in SQL eingehaengt. SQLites lower() faltet nur
   ASCII: lower('Ü') bleibt 'Ü', und dasselbe gilt fuer LIKE.
   deterministic: ohne die Angabe verbietet SQLite den Aufruf in einem Index
   oder einer erzeugten Spalte. */
db.function('kkl', { deterministic: true }, searchFold);

db.exec(SCHEMA);

/* Die Probe auf einen unvollstaendigen Bestand. Sie steht da, wo bis 0.33.0
   achtzehn Migrationsbloecke standen: eine Datenbank aus 0.13.0 oeffnet ohne
   sie widerspruchslos und ohne die Spalten, die jede Ablehnung braucht.
   Sie sperrt niemanden aus -- sie meldet. Ein Hinweis, der sich irrt, kostet
   eine Zeile im Protokoll; eine Absage, die sich irrt, den Zugang.
   Gefragt wird der Bestand und kein Merker: `sqlite_master` und
   `PRAGMA table_info`.
   Sie steht hinter db.exec(SCHEMA), weil die DDL eine fehlende Tabelle bei
   jedem Start anlegt -- was danach fehlt, ist eine Spalte.
   Im Neben-Thread bleibt sie still. Das Protokoll ist englisch. */

/* Die sechs Tabellen, die 0.24.1 umbenannt hat. Steht eine noch unter ihrem
   alten Namen da, hat die DDL daneben eine leere neue angelegt und die Zeilen
   liegen unsichtbar im alten Namen. */
const LEGACY_TABLES = [
  ['anfragen', 'requests'], ['sicherheitsprotokoll', 'security_log'],
  ['papierkorb', 'trash'], ['papierkorb_bytes', 'trash_bytes'],
  ['zweifaktor', 'two_factor'], ['zweifaktor_codes', 'two_factor_codes']
];

/* JEDE SPALTE EINZELN UND MIT IHRER FASSUNG -- F6. Fuenf Zeilen statt zwanzig
   waeren billiger und naennten das Symptom; so steht die Diagnose da.
   VIER ANGABEN JE ZEILE: Tabelle, Spalte, der Name, unter dem 0.24.1 sie
   vorgefunden haette (oder null), und die Fassung, deren Block sie gebracht
   haette. DER ALTE NAME IST DIE GENAUERE DIAGNOSE: steht er da, fehlt nicht
   die Spalte, sondern die Umbenennung -- zwei verschiedene Wege herauf.
   TABELLEN, DIE 0.24.1 SELBST UMBENANNT HAT, STEHEN HIER NICHT: ihre Spalten
   kann die Probe erst sehen, wenn die Tabelle da ist, und solange die alte
   daneben liegt, meldet die Tafel darueber den schaerferen Befund. */
const REQUIRED_COLUMNS = [
  ['comments',           'images_removed',  null,             '0.8.3'],
  ['links',              'user_id',         null,             '0.8.30'],
  ['attachments',        'user_id',         null,             '0.8.31'],
  ['rating_criteria',    'weight',          'gewicht',        '0.8.40'],
  ['photos',             'kind',            'art',            '0.8.50'],
  ['photos',             'duration',        'dauer',          '0.8.50'],
  ['items',              'rejected_at',     null,             '0.14.0'],
  ['items',              'rejected_reason', 'rejected_grund', '0.14.0'],
  ['items',              'rejected_by',     'rejected_von',   '0.14.0'],
  ['ratings',            'set_at',          'gesetzt_am',     '0.16.0'],
  ['photos',             'zoom',            null,             '0.19.0'],
  ['rating_criteria',    'phase',           null,             '0.21.0'],
  ['tokens',             'purpose',         'zweck',          '0.24.1'],
  ['tokens',             'expires_at',      'ablauf',         '0.24.1'],
  ['tokens',             'used_at',         'benutzt_am',     '0.24.1'],
  ['product_categories', 'language',        null,             '0.25.0'],
  ['rating_criteria',    'language',        null,             '0.25.0'],
  ['comments',           'due_date',        null,             '0.29.0']
];

/* DIE LETZTE FASSUNG, DIE DEN WEG HERAUF NOCH KANNTE. Sie steht an EINER
   Stelle: der Kasten nennt sie, und die Zeile darunter rechnet mit ihr.
   Eine zweite Angabe daneben liefe beim naechsten Mal von ihr weg. */
const LAST_MIGRATING_VERSION = '0.32.1';

function incompleteDatabase() {
  const tables = new Set(db.prepare("SELECT name FROM sqlite_master WHERE type = 'table'")
    .all().map(z => z.name));
  const findings = [];
  for (const [old, fresh] of LEGACY_TABLES)
    if (tables.has(old))
      findings.push({ place: old, fresh, since: '0.24.1', kind: 'table' });
  for (const [table, column, old, since] of REQUIRED_COLUMNS) {
    /* FEHLT DIE TABELLE, FEHLT KEINE SPALTE. Die DDL legt jede an, die zum
       Schema gehoert; was hier trotzdem fehlte, gehoert nicht dazu, und eine
       Meldung darueber waere ein Fehlalarm. */
    if (!tables.has(table)) continue;
    const columns = db.prepare(`PRAGMA table_info(${table})`).all().map(c => c.name);
    if (columns.includes(column)) continue;
    findings.push({ place: `${table}.${column}`, since, kind: 'column',
                    old: old && columns.includes(old) ? `${table}.${old}` : null });
  }
  return findings;
}

/* DER KASTEN. Dieselbe Form wie warnKeyBesideData() in keys.js -- und das ist
   kein Zufall, sondern das Vorbild, das der Auftrag nennt: derselbe Rahmen,
   dieselbe Breite, dieselbe Haltung. Wer eines der beiden kennt, liest das
   andere ohne Anlauf.
   ER SAGT, WAS ZU TUN IST, und nicht nur, was falsch ist. Ein Hinweis, der
   den Weg nicht nennt, ist eine Beunruhigung. */
function warnIncompleteDatabase(findings) {
  if (!isMainThread || !findings.length) return;
  const rows = findings.map(f => f.kind === 'table'
    ? `    ${f.place.padEnd(22)} renamed to ${f.fresh} in ${f.since};\n` +
      `    ${''.padEnd(22)} its rows are invisible to this version`
    : `    ${f.place.padEnd(22)} added in ${f.since}` +
      (f.old ? `; still present as ${f.old}` : ''));
  console.warn(
    '\n' +
    '  ------------------------------------------------------------------\n' +
    '  WARNING: this database is incomplete. It is missing parts that\n' +
    '  earlier versions added while starting up. Kriterion 0.33.0 removed\n' +
    '  those upgrade steps, so they never run again:\n' +
    '\n' +
    rows.join('\n') + '\n' +
    '\n' +
    `  To repair it, open this database once with Kriterion ${LAST_MIGRATING_VERSION} --\n` +
    '  the last version that still carried the upgrade steps -- let it\n' +
    '  start, shut it down, and come back here.\n' +
    '\n' +
    '  THIS INSTANCE STARTS ANYWAY. Nothing is blocked and nothing is\n' +
    '  changed; but every page that reads one of the parts above fails\n' +
    '  until the database has been through that version.\n' +
    '  ------------------------------------------------------------------\n'
  );
}
warnIncompleteDatabase(incompleteDatabase());

/* ================= DIE INDIZES AUF NACHGERUESTETE SPALTEN =================
   SIE STEHEN HIER UNTEN UND NICHT IN DER DDL, und der Grund ist ein Befund des
   Pruefstands -- zweimal derselbe, in zwei Stufen.

   EIN INDEX AUF EINER NACHGERUESTETEN SPALTE GEHOERT HINTER IHRE MIGRATION
. `CREATE TABLE IF NOT EXISTS` ruehrt eine vorhandene
   Tabelle nicht an: eine Datenbank aus 0.8.40 trug
   `photos.kind` erst, nachdem migration0850() gelaufen war, und `photos.zoom`
   erst nach migration0190(). Ein CREATE INDEX weiter oben scheiterte dort mit
   „no such column" -- beim OEFFNEN der Datei, also bevor der Server ueberhaupt
   startet. Kein Fehlerbild, keine halbe Funktion: die Anwendung kommt nicht
   hoch.
   *Gefunden hat das der Pruefstand: der erste Anlauf stellte den einen Index in
   die DDL (scheiterte an `kind` aus 0.8.40), der zweite hinter migration0850()
   -- und scheiterte am `zoom` aus 0.19.0.*

   UND SEIT 0.33.0 IST GENAU DAS DER GRUND, WARUM SIE EINE KLAMMER TRAGEN.
   Die Bloecke, hinter denen sie standen, sind gefallen; die Spalten stehen
   weiter in der DDL, aber die DDL heilt eine fehlende SPALTE nicht. Eine
   unvollstaendige Datenbank hat damit KEINE Stelle mehr, an der `zoom`
   nachwaechst -- und ohne die Klammer traefe sie hier auf „no such column"
   und die Instanz kaeme nicht hoch. DAS WAERE DIE HARTE ABSAGE, DIE DER
   BETREIBER AM 14. SEPTEMBER 2026 AUSDRUECKLICH GEKIPPT HAT (F4, Leitplanke
   L3), nur an einer Stelle, an der sie niemand bestellt hat: nicht als
   Entscheidung, sondern als Absturz.
   DER KASTEN DARUEBER HAT DEN BEFUND SCHON GENANNT, und die Zeile hier nennt
   nur noch die Folge. Ein Index, der nicht entsteht, kostet Geschwindigkeit
   und keine Auskunft -- die Abfragen laufen ohne ihn, nur langsamer. Sie
   entstehen beim naechsten Start von selbst, sobald die Datenbank ueber die
   Fassung gegangen ist, die der Kasten nennt.
   DIESELBE BAUFORM WIE AM `idx_users_email` weiter unten, und aus demselben
   Grund: ein stiller Fehlschlag waere die schlimmste Antwort.

   SIE BLEIBEN HIER UNTEN UND WANDERN NICHT IN DIE DDL. Bis 0.32.1 stand an
   dieser Stelle der Satz „zu 1.0 duerfen diese Zeilen mit nach oben" -- er
   ist mit den Bloecken hinfaellig geworden, und zwar ins Gegenteil: in der
   DDL truege `db.exec(SCHEMA)` den Fehlschlag, und DER ist nicht zu klammern,
   ohne das ganze Schema mitzuklammern.

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
. EINE GLEICHHEIT, KEINE UNGLEICHHEIT: `WHERE kind !=
   'video'` schlaegt den Index aus, `WHERE kind IS ?` nutzt ihn. Die Abfragen in
   /api/stats holen deshalb erst die vorhandenen Arten und fragen dann je Art.

   Beim ersten Start nach dem Einspielen baut SQLite ihn einmal auf --
   gemessen 1,4 s bei 312 MB, danach steht er. */
/* WAS EIN INDEX BRAUCHT, DER SICH AN EINER UNVOLLSTAENDIGEN DATENBANK NICHT
   ANLEGEN LAESST -- 0.33.0. Er wird versucht, er faellt weich, und er sagt es
   in EINER Zeile. Der Kasten weiter oben hat schon gesagt, WAS fehlt. */
const tryIndex = (name, sql) => {
  try { db.exec(sql); } catch (e) {
    if (isMainThread)
      logWarn(`Index ${name} not created: ${e.message} -- ` +
        'see the warning above; queries run without it, only slower.');
  }
};

tryIndex('idx_photos_kind',
  'CREATE INDEX IF NOT EXISTS idx_photos_kind ON photos(kind)');

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
tryIndex('idx_photos_tile', `CREATE INDEX IF NOT EXISTS idx_photos_tile
           ON photos(item_id, sort_order, id, mime_type, focus_x, focus_y, zoom, created_at, kind, duration)`);

/* ---- DIE ADRESSE IST EINDEUTIG -- 0.29.0, Befund 4 ----
   `users.email` HATTE KEIN `UNIQUE`, UND DAS WAR KEIN VERSEHEN: `ALTER TABLE`
   kann eines nicht nachruesten, und die gewanderte und die frisch angelegte
   Datenbank waeren damit VERSCHIEDEN GEBAUT -- genau die Sorte Unterschied,
   die sich erst Jahre spaeter zeigt.
   EIN PARTIELLER INDEX WIRKT AUF BEIDEN WEGEN GLEICH. Er ist keine
   Datenbankstufe: er fasst die Zeilenform nicht an und legt sich bei jedem
   Start selbst nach, in frischer wie bestehender Instanz -- dieselbe Bauform
   wie `idx_sessions_user`.
   `WHERE email IS NOT NULL` IST DER GANZE PUNKT: ohne die Bedingung waere
   schon der ZWEITE Zugang ohne Adresse eine Verletzung. In SQLite sind zwar
   mehrere NULL in einem gewoehnlichen UNIQUE erlaubt -- aber ein leerer String
   ist keine NULL, und die Bedingung sagt ausserdem, was gemeint ist.
   NOCASE, WIE AM BENUTZERNAMEN: „Anna@Haus.de" und „anna@haus.de" sind
   dieselbe Adresse. Ein Index ohne diese Angabe liesse beide nebeneinander
   stehen und haette den Befund nur halb erledigt.

   UND WAS GESCHIEHT, WENN HEUTE SCHON ZWEI GLEICHE DASTEHEN (F10):
   `CREATE UNIQUE INDEX` SCHEITERT DORT, und ein stiller Fehlschlag waere die
   schlimmste Antwort -- die Instanz saehe aus, als haette sie ein Schloss, und
   haette keins. Sie laeuft weiter, sie sagt es im Containerprotokoll, und die
   Karte „Benutzer" nennt die betroffenen Adressen. Wer sie zusammenfuehrt oder
   eine davon leert, bekommt den Index beim naechsten Start von selbst.
   GEZAEHLT WIRD VORHER UND NICHT AM FEHLERTEXT: „UNIQUE constraint failed"
   sagt nicht, WELCHE Adresse doppelt ist, und ein Text, den eine fremde
   Bibliothek formuliert, ist keine Grundlage fuer eine Bildschirmauskunft. */
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
// Alles, was niemandem gehoert, faellt an den Eigentuemer -- auch eine
// Linkzeile und eine Datei.
// ES WAR NICHT DIESELBE REGEL WIE IN DEN MIGRATIONSBLOECKEN, die bis 0.32.1
// darueber standen, und beide standen bewusst nebeneinander: die Bloecke von
// 0.8.30 und 0.8.31 beantworteten EINMALIG, wem die Links und Dateien eines
// BESTEHENDEN Eintrags gehoeren (seinem Verfasser), das Netz beantwortet
// FORTLAUFEND, wem eine Zeile zufaellt, die ihren Verfasser VERLOREN hat (dem
// Eigentuemer, wie ueberall sonst). Verschiedene Zeitpunkte, verschiedene
// Fragen -- und seit 0.33.0 gibt es nur noch die zweite. Im Normalbetrieb
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

/* Der Stempel: womit diese Datenbank laeuft. Zwei Zeilen in `settings`:
     `versionCreated`     womit sie angelegt wurde, einmal geschrieben
     `versionLastOpened`  womit sie zuletzt geoeffnet wurde, wandert mit

   `versionCreated` wird nur in einer wirklich frischen Datenbank
   geschrieben: ein `INSERT OR IGNORE` bei jedem Start truege in eine
   Datenbank aus 0.19.0 die Zeile „angelegt mit 0.33.0" ein. Eine fehlende
   Zeile heisst „aelter als der Stempel".
   Ob hier schon gearbeitet wurde, beantworten `users` und `items`; geloeschte
   Zugaenge zaehlen mit.
   Beide Schreibungen sind beliebig oft fahrbar und im Normalfall stumm. Der
   Wert steht als JSON wie jede andere Einstellungszeile. */
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
                   // der partielle Index steht (0.29.0, Befund 4).
                   emailsDoubled,
                   // Die eine Faltung der Suche -- 0.24.4 (B8). Sie geht hinaus,
                   // damit die NADEL dieselbe Funktion ruft wie der Heuhaufen und
                   // nicht eine zweite, die dasselbe tut.
                   searchFold,
                   changeKey, method,
                   renumberCriteria, assignInventory,
                   /* Was eine unvollstaendige Datenbank vermissen laesst. Geht hinaus, damit
                      der Pruefstand die Probe an einer gestellten Lage fragen
                      kann. */
                   incompleteDatabase };
