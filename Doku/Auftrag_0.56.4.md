# Auftrag 0.56.4 — „Vollbild am Telefon, Kontraste“

**Aufgestellt am 3. Oktober 2026.** Grundlage ist
`Doku/Vorschlaege_Claude_0.56.x.md`: Paket 3 (Vollbild) und Paket 4
(Kontraste) aus der Bewertung vom 3. Oktober 2026, dazu F55.

Zeilennummern gelten für `a1bf892`.

---

## 0. Vor dem Bau: die offenen Fragen

### Vorgaben des Betreibers

| Nr. | Punkt | Vorgabe |
|---|---|---|
| V1 | alle | Paket 3 und Paket 4 zusammen; „kann man paket 4 dazu nehmen oder ist es zu aufwändig“ (Chat, 3. Oktober 2026) |
| V2 | F55 | „das überlasse ich dir“; F55 kommt mit (Chat, 3. Oktober 2026) |
| V3 | S2 | Entscheidung erst nach Bildschirmfotos der drei Varianten, hell und dunkel (Chat, 3. Oktober 2026) |

### Fragen

| Nr. | Frage | Mögliche Antworten | Antwort |
|---|---|---|---|
| F1 | V8: Was zeigt ein Tipp auf das Bild oder der Knopf? | 100 % an der Stelle, Knopf „100 %“ · zweifach an der Stelle · zwei Stufen | **100 % an der Stelle** (Empfehlung). Wortlaut: „besser wäre einfach den Knopf "100%" zu benennen“ |
| F2 | V12: Pfeile ‹ › auf dem Telefon? | während der Wiedergabe weg · auf Touch immer weg · wie heute | **während der Wiedergabe weg** (Empfehlung) |
| F3 | V5: Kopfzeile hochkant am Telefon? | eigene Zeile mit Name und Titel · nur der Dateiname | **eigene Zeile mit Name und Titel** (Empfehlung) |
| F4 | S2: Rand der Eingabefelder? | B: eigene Farbe mit 3 : 1 · A: der vorhandene kräftigere Rand · wie heute | **B** (Empfehlung) |

---

## 1. Die Punkte

### Vollbild

| Nr. | Fix |
|---|---|
| V8 | Ein Klick, ein Doppeltipp oder der Knopf „100 %“ zeigt das Original Pixel für Pixel; der angetippte Punkt bleibt an seiner Stelle. Der Knopf zentriert. `list.zoomFull` und `list.clickZoomHint` nennen „100 %“ |
| V5 | Hochkant am Telefon steht über den Knöpfen eine eigene Zeile mit dem Titel; ✕ bleibt oben rechts. Bei Dateien der Dateiname, daneben klein der Titel des Eintrags |
| V12 | Ohne Zeiger (`hover: none`) sind die Pfeile während der Wiedergabe eines Videos ausgeblendet |
| V13 | Pfeile und Bühne halten `env(safe-area-inset-*)` ein |
| V15 | Die Ecke der Rollbalken ist durchsichtig; ohne Zeiger hat die gezoomte Bühne keine Rollbalken |
| V16 | Kacheln ohne Standbild im Streifen sind nicht abgedunkelt; „WEBM“ in `--text-2` |
| V17 | „Ganz laden“ zeigt den Fortschritt im Knopf; `.lb-loaded` entfällt. Der Knopf hat eine feste Mindestbreite |
| V19 | Die Vorschau im Eintrag setzt das Wischen bei jedem `touchstart` neu und wischt nicht bei gezoomter Seite |

### Kontraste

| Nr. | Fix |
|---|---|
| S1 | Fokusrahmen und Feldfokus in `--accent-edge`; im hellen Schema 5,38 : 1 auf Weiß statt 2,61 |
| S2 | `--input-edge` für `.input`, `.ta` und `.select`: 3 : 1 gegen die Karte |
| S3 | `--on-photo-strong` für die Pfeile im Bild und die Werkzeuge beim Zeigen; ▶ in `--on-photo`; ★ auf Fotos in `--badge-gold`. Beide Schemata gleich |
| S5 | Knöpfe, die nur bei Hover erscheinen, erscheinen auch mit Tastaturfokus |
| S6 | Fokus im Datei- und Ordnermenü mit Rahmen |
| S12 | Die Rücknahmen ohne Zeiger nehmen die Werte der Ausgangsregeln (`.vnav` .86, `.lb-nav` .9) |

### Anmeldebremse

| Nr. | Fix |
|---|---|
| F55 | Der Zähler je Adresse gilt bei IPv6 für das ganze /64 |

---

## 2. Prüfstand und Dokumentation

- Neue Gruppen in `test/release_056.js`, Rückbauten je Punkt.
- Kontraste vorher und nachher gerechnet.
- Anleitung in drei Sprachen: Zoom, Kopfzeile, Pfeile.
- CHANGELOG, Änderungsprotokoll 0.56.4, Fahrplan,
  `Doku/Vorschlaege_Claude_0.56.x.md`. Version 0.56.4, Fingerprint.
