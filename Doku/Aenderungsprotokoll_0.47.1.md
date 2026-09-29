# Änderungsprotokoll 0.47.1 — „Abhängigkeiten ohne bekannte Lücke“

**Gebaut am 29. September 2026 auf 0.47.0. Fingerprint `a49b4154`, davor
`636c7c11`.**

Ohne Auftrag. Schema: nein. Austauschformat: 21.

---

## 1. Vorgaben des Betreibers

| Datum | Vorgabe |
|---|---|
| 29. September 2026 | Fragetafel „npm audit“: alle drei anheben, multer und undici im erlaubten Bereich, nodemailer auf 10; `mail.js` mit dem Prüfstand prüfen; als 0.47.1, Push nur bei grünem Lauf |

---

## 2. Der Befund

`npm audit` meldete beim Bau von 0.47.0 drei Lücken der Stufe moderate. Die
Prüfung „npm audit meldet keine einzige Luecke“ in `test/selfcheck.js` war
lokal rot und in der CI von Pull Request #264 ebenso.

| Paket | Stand | Meldung | In Kriterion |
|---|---|---|---|
| `multer` | 2.3.0 | GHSA-3pph-fpjx-jg34: ein abgebrochener Upload mit `diskStorage` hinterlässt Schreibvorgänge auf der Platte | nur der Import; er ist die einzige Stelle mit `diskStorage` und steht nur dem Eigentümer-Admin offen |
| `nodemailer` | 9.1.1 | GHSA-6vj9-mwq6-2f5v: der DNS-Cache des Prozesses gibt den TLS-Namen eines Transports an den nächsten weiter | `mail.js` baut je Versand einen Transport zu dem einen eingestellten Server |
| `undici` | 8.10.0 | GHSA-3wwx-pv8p-q78v: Denial of Service über `permessage-deflate` bei WebSocket | nur im Prüfstand, über `jsdom` |

---

## 3. Die Änderung

| Paket | vorher | nachher | Bereich in `package.json` |
|---|---|---|---|
| `nodemailer` | 9.1.1 | 10.0.12 | `^9.0.5` → `^10.0.12` |
| `multer` | 2.3.0 | 2.4.0 | `^2.0.1`, unverändert |
| `undici` über `jsdom` | 8.10.0 | 8.11.2 | — |

multer 2.4.0 braucht `concat-stream` nicht mehr; damit fallen auch
`buffer-from` und `typedarray` weg. Die Lockfile führt 177 statt 180 Pakete.

nodemailer 10 bricht laut seinem Changelog nur eine Zusage: es verlangt Node
20 oder neuer. Dockerfile und CI nutzen Node 22. `mail.js` lädt
`require('nodemailer')` und ruft `createTransport()`, `sendMail()` und
`close()` mit denselben Optionen wie bisher; der CommonJS-Einstieg bleibt.

`npm audit` meldet danach keine Lücke.

---

## 4. Der Prüfstand

`test/roundtrip.js`, Gruppe „Der Beipack — 0.25.0“: der Bereich für
nodemailer ist `^10.0.12`, die Lockfile trägt multer 2.4.0 und nodemailer
10.0.12. Die Prüfung „Beipackprobe: package.json nennt die fuenf Bereiche“
hieß vorher „… dieselben fuenf Bereiche wie vor der Hebung“; mit dem neuen
Bereich für nodemailer stimmte das nicht mehr.

Den Versand prüfen die Gruppen „Der Mailversand: …“ in `test/roundtrip.js`
gegen einen SMTP-Empfänger des Prüfstands, darunter „das echte
SMTP-Gespraech“ und „die Frist wird gemessen, nicht behauptet“.

---

## 5. Die Bilanz

| | 0.47.0 | 0.47.1 |
|---|---:|---:|
| Meldungen von `npm audit` | 3 | **0** |
| Pakete in der Lockfile | 180 | **177** |
| Rückbauten | 1.259 | 1.259 |
| Prüfungen im Prüfstand | 7.687 | 7.687 |
