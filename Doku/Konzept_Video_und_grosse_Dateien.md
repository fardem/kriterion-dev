# Konzept — Große Dateien bis 2 GB

**Konzeptpapier · Stand 28. September 2026 · Teil I gebaut in 0.8.50, Teil II
abgelöst durch `Doku/Konzept_Dateien_und_Ordner.md`.**

> ## TEIL I IST GEBAUT UND STEHT NICHT MEHR HIER
>
> **Kurzvideos am Fotoplatz sind seit 0.8.50 gebaut.** Was gilt, steht ab
> Revision 25 des Projektstands **dort und nur dort** — Abschnitt 4
> (Funktionsumfang), Abschnitt 5 (die Entscheidungen), Abschnitt 5a (die
> Auslieferung) und Abschnitt 9 (was die Runde brachte). Die vollständige
> Herleitung samt Gegenprobentabelle steht in
> `Doku/Aenderungsprotokoll_0.8.50.md`.
>
> **Der Entwurf ist hier entfernt, weil er sonst eine zweite Wahrheit wäre.**
> Er ist vor dem Bau geschrieben worden und wich an fünf Stellen vom Gebauten
> ab; solange beides nebeneinander stand, musste jede Zahl an zwei Orten
> gepflegt werden — und genau daran ist Stolperstein 137 entstanden.
>
> **Wo die fünf Abweichungen jetzt stehen**, damit ältere Verweise auf die
> Abschnitte dieses Papiers noch aufgehen:
>
> | hieß hier | wo es jetzt steht |
> |---|---|
> | 3 — Datenmodell, `art` und `dauer` | Projektstand, Abschnitt 4 („Was die vorhandenen Spalten bei einem Video bedeuten") |
> | 3a — „Es gelten dieselben Regeln wie am Foto" | Projektstand, Abschnitt 4 und Abschnitt 5.7 („Fotos und Videos stehen in EINER Tabelle") |
> | 4 — das Standbild ohne `ffmpeg` | Projektstand, Abschnitt 5.7 (`ffmpeg` kommt nicht ins Image; das Standbild belegt nichts) |
> | 5/6 — Formate und Auslieferung | Projektstand, Abschnitt 5a (achte Schicht, Videoweg) |
> | 9 — Export | Projektstand, Abschnitt 4 und Abschnitt 9 (Formatnummer 9 → 10, eigener Schalter) |
>
> **Die fünf Abweichungen selbst, in einem Satz:** der ausgelieferte Typ kommt
> **nicht nach Endung**, sondern aus den ersten Bytes (`photos` speichert keinen
> Dateinamen); **`Accept-Ranges` wird geliefert**, nicht abgeschaltet; die
> Sicherheitsregel der Anwendung brauchte **`media-src 'self' blob:`**; **kein
> Videoplatz ohne Videodatei** im Export, stattdessen eine Marke in der Datei;
> und das **Standbild muss eigens in die Exportdatei**, sonst erzeugte der
> Import die Varianten aus der Videodatei.

> ## Teil II ist abgelöst und steht nicht mehr hier
>
> Am 28. September 2026 hat der Betreiber die Videos der Testtage beschlossen.
> Das Konzept steht in `Doku/Konzept_Dateien_und_Ordner.md`, der Plan in
> `Doku/Fahrplan.md` unter 0.45.0 bis 0.48.0. Der Entwurf von Teil II ist hier
> entfernt, damit es keine zweite Fassung gibt; er steht in der Git-Geschichte.
>
> | hieß hier | jetzt |
> |---|---|
> | große Datei jeder Art, an der Stelle der Anhänge | nur Videos über der Grenze „Anhang", nur im Ordner eines Testtags; dazu jede Datei eines Testtag-Ordners auf der Platte |
> | Schlüssel per `hkdf` aus dem Datenbankschlüssel | ein zufälliger Schlüssel je Datei in der Datenbank; ein Schlüsselwechsel fasst die Dateien nicht an |
> | `data/blobs/<id>` | `data/files/<zufälliger Name>` |
> | Stücke von etwa 5 MB, Tabelle `uploads` mit deutschen Spalten | Anfragen zu 8 MiB, verschlüsselt in Stücken zu 1 MiB, englische Spalten |
> | Aufräumen verwaister Dateien beim Start | Löschliste in der Datenbank, gefüllt von einem Trigger; kein Abgleich in `data/files/` |
> | Papierkorb nimmt die Dateien mit | Papierkorb übernimmt den Besitz und kopiert nichts |
> | die Sprungprobe mit CTR | gemessen mit AES-256-GCM je Stück (Konzept, Abschnitt 6.1) |
