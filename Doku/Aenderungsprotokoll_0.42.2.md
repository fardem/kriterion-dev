# Änderungsprotokoll 0.42.2 — „Die eigene Ansicht ohne Kopfzeile"

**Gebaut am 26. September 2026 auf 0.42.1. Fingerprint `59983d51`, davor
`526a9c34`.**

Wunsch des Betreibers vom selben Tag, nach dem Einspielen von 0.42.1. Ohne
Auftrag. Schema: nein. Austauschformat: 19.

---

## 1. Was sich ändert

| | 0.42.1 | 0.42.2 |
|---|---|---|
| Kopf der eigenen Ansicht | Kopfzeile von Kriterion, darunter die Leiste | nur die Leiste: ← Titel des Eintrags, Dateiname, ↓ |
| Lage | im Fluss der Seite, `height: 100dvh` | fest über dem ganzen Fenster, `position: fixed; inset: 0` |

Mit 0.42.1 war die Ansicht ein paar Pixel höher als das Fenster: unter `#app`
steht die Versionszeile (`public/index.html`:36). Der Hinweis „Angezeigt vom
Document Server …" wurde deshalb unten abgeschnitten. Die feste Ebene hat
diese Höhe nicht mehr.

`renderFileView()` ruft `subhead()` und `wireSubhead()` nicht mehr. Die Regel
`.fileview .masthead` entfällt.

---

## 2. Die Bilanz

| | 0.42.1 | 0.42.2 |
|---|---:|---:|
| Regelzeilen des Stilblatts | 1.693 | **1.692** |
| Rückbauten | 1.156 | **1.158** |
| Prüfungen im Prüfstand | 7.420 | **7.420** |

Zwei Prüfungen in `test/release_042.js` prüfen jetzt die neue Form: keine
Kopfzeile in der Ansicht, `position: fixed; inset: 0` im Stilblatt.

Rückbauten:

| Nr | Rückbau | rot in |
|---|---|---|
| 1237 | Die Ansicht trägt wieder die Kopfzeile von Kriterion | Die Ansicht: ohne Kopfzeile von Kriterion, mit Weg zurueck, Dateiname, einem Betrachter |
| 1238 | Die Ansicht liegt nicht mehr fest über dem Fenster | Die Ansicht liegt fest ueber dem ganzen Fenster, der Betrachter bekommt die Resthoehe |

**2 rot, 0 stumm.** Beide waren im Lauf zusätzlich rot in „Und es stehen genau
1693 Regelzeilen da": die Zahl im Test war nach dem Wegfall von
`.fileview .masthead` noch die alte. Sie steht jetzt auf 1692; der volle Lauf
danach ist grün.

---

## 3. Fahrplan

Eingetragen am selben Tag:

- **0.43.0:** Vorgabe des Betreibers, wer bearbeiten darf. Der Hochladende
  setzt je Datei den Haken „Bearbeiten durch alle"; ohne ihn bearbeitet nur
  er, der Admin darf dann nur löschen. Die Vorgabe für den Haken steht auf der
  Karte „Dokumente". Schema: ja.
- **0.44.0, neu:** Verweise auf Dateien und Fotos in Kommentar und
  Beschreibung. Der kleine Betrachter einer Bürodatei lädt erst auf Klick.
