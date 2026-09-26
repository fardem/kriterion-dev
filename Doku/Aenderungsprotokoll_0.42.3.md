# Änderungsprotokoll 0.42.3 — „Vollbild in der eigenen Ansicht"

**Gebaut am 26. September 2026 auf 0.42.2. Fingerprint `FP_NEU`, davor
`59983d51`.**

Zwei Wünsche des Betreibers vom selben Tag: auf dem Telefon, quer gehalten,
nimmt die Leiste der eigenen Ansicht zu viel Platz; auf der Karte „Dokumente"
brechen die Namen der Variablen mitten im Wort um. Ohne Auftrag. Schema: nein.
Austauschformat: 19.

---

## 1. Was sich ändert

In der Leiste der eigenen Ansicht steht zwischen Dateiname und ↓ das Zeichen
Vollbild (`ICON_FULLSCREEN`, Titel `entry.openFullscreen`). Ein Klick ruft
`requestFullscreen()` auf `.fileview-doc`. Damit füllt nur der Betrachter den
Bildschirm; Leiste und Hinweis bleiben außen vor. Zurück oder Esc beendet das
Vollbild, wie der Browser es vorgibt.

Das Zeichen steht nur, wenn

- der Document Server die Datei zeigt (`preview: 'office'`) und
- `document.fullscreenEnabled` wahr ist.

Safari auf dem iPhone kennt kein Vollbild für einzelne Elemente. Dort fehlt
das Zeichen. Ein neuer Schlüssel ist nicht nötig.

**Karte „Dokumente".** Die drei Zeilen tragen zusätzlich `kv-stack`: Name und
Wert stehen untereinander (`flex-direction: column`), der Name in `.75rem`.
Mit 0.42.1 standen sie nebeneinander; `DOCUMENT_SERVER_INTERNAL_ADDRESS` brach
dort mitten im Namen um. Andere Karten mit `.kv` bleiben, wie sie sind.

---

## 2. Die Bilanz

Gemessen am fertigen Stand gegen 0.42.2.

| | 0.42.2 | 0.42.3 |
|---|---:|---:|
| Regelzeilen des Stilblatts | 1.692 | **1.696** |
| Kommentarzeilen, 39 Dateien | 6.458 | **6.461** |
| Rückbauten | 1.158 | **1.161** |
| Prüfungen im Prüfstand | 7.420 | **PRUEFUNGEN** |

---

## 3. Der Prüfstand

Drei Prüfungen in `test/release_042.js`, Gruppe „die eigene Ansicht". jsdom
kennt kein Vollbild; der Test stellt `document.fullscreenEnabled` und
`requestFullscreen()`.

- Das Zeichen trägt den Titel `entry.openFullscreen`, und ein Klick schickt
  genau `.fileview-doc` ins Vollbild.
- Mit `document.fullscreenEnabled` falsch steht die Ansicht ohne das Zeichen.
- Die drei Zeilen der Karte tragen `kv-stack`, und beide Regeln stehen im
  Stilblatt.

`test/source.js` zählt 1.696 Regelzeilen statt 1.692: je zwei für
`.fileview-full` und `.kv-stack`.

Rückbauten:

| Nr | Rückbau | rot in |
|---|---|---|
| 1239 | Das Zeichen Vollbild schickt nichts ins Vollbild | Das Zeichen Vollbild schickt nur den Betrachter ins Vollbild des Browsers |
| 1240 | Das Zeichen Vollbild steht auch ohne Vollbild im Browser | Kann der Browser kein Vollbild, fehlt das Zeichen |
| 1241 | Die Karte Dokumente zeigt Name und Wert wieder nebeneinander | Name und Wert stehen untereinander, der Name kleiner |

GEGENPROBE

---

## 4. Nicht geprüft

Die Bauumgebung erreicht `office.dmrts.de` nicht, und jsdom hat kein Vollbild.
Offen für die Abnahme auf dem Telefon: ob der Betrachter im Vollbild quer die
ganze Fläche nutzt.
