# Messverfahren: Proxys auf dem Intel N100

**Aufgestellt am 30. September 2026, neu gefasst am 1. Oktober 2026** für 0.55.0
(B1 in `Doku/Auftrag_0.55.0.md`). Gemessen wird, wie schnell der N100 des
Betreibers ein Video der A6700 in einen Proxy umwandelt: mit Quick Sync und nur
mit der CPU. Dazu prüft die Messung, ob die Intel-Treiber aus Debian auf dem
N100 kodieren. Kriterion ist dabei nicht beteiligt.

Ziel der Umwandlung (F8, F16, F21 und V10 im Auftrag):

- die kürzere Seite höchstens 1080 Pixel; das Seitenverhältnis bleibt, ein
  kleineres Video behält seine Größe. Ein Hochkant-Video bleibt so gespeichert
  wie das Original, die Drehung bleibt als Metadatum im Proxy
- die Bildrate des Originals
- H.264 mit 0,23 Mbit je Bild, höchstens 7,5 Mbit/s: 24p 5,52, 25p 5,75,
  30p 6,9 Mbit/s, ab 50p 7,5 Mbit/s; ein Keyframe alle 2 Sekunden
- Ton AAC mit 128 kbit/s, MP4 mit der `moov`-Box vorn

Das ergibt je Stunde 2,5 GB bei 24p, 3,2 GB bei 30p und 3,4 GB ab 50p. Bis
zum 2. Oktober 2026 galten 5, 8 oder 16 Mbit/s nach der Bildrate (F17) und
damit 2,3, 3,7 oder 7,3 GB; F21 hat die Regel ersetzt.

Die erste Fassung vom 30. September setzte 30 Bilder je Sekunde fest. Bei 25p
und 50p, wie bei einer A6700 in Europa üblich, hätte der Proxy geruckelt. Seit
V10 bleibt die Bildrate.

Das Skript in Abschnitt 6 macht die Schritte 2 bis 5 in einem Lauf.

---

## 1. Voraussetzungen

- Docker auf dem N100 und Zugang zum Internet. Das Skript lädt
  `node:22-bookworm-slim`, falls es fehlt, und zweimal rund 140 MB Pakete aus
  Debian.
- `ls -l /dev/dri` zeigt `renderD128`. Fehlt es, hat der Host keinen Treiber
  für die Grafik geladen; dann misst das Skript nur Weg C.
- Ein leerer Ordner, etwa `~/messung/`, mit Kopien direkt von der Kamera:
  - je Aufnahmeformat, das genutzt wird, ein Video von 1 bis 2 Minuten
  - ein Video von mindestens 10 Minuten für die Dauerlast
  - ein Video in HLG, wenn in HLG aufgenommen wird (F14)
- Platz im Ordner für die Proxys: je Minute Video und Weg 40 bis 120 MB.
- Weg C belegt alle Kerne. Kriterion läuft weiter, antwortet aber langsamer.

---

## 2. Quick Sync prüfen

Zwei Sekunden Testbild, kodiert über VA-API mit fester Bitrate:

```sh
ffmpeg -hide_banner -init_hw_device vaapi=va:/dev/dri/renderD128 -filter_hw_device va \
  -f lavfi -i testsrc2=duration=2:size=1920x1080:rate=30 \
  -vf format=nv12,hwupload -c:v h264_vaapi -b:v 5M -maxrate 5M -bufsize 10M -f null -
```

Endet der Befehl ohne Fehler, kodiert Quick Sync H.264 mit fester Bitrate.
Gelingt er nur ohne `-b:v 5M -maxrate 5M -bufsize 10M`, lädt der Host
vermutlich die HuC-Firmware nicht; die Wege A und B brauchen sie.

Kodiert Quick Sync nicht, zeigen drei Befehle auf dem Host die Ursache:

```sh
grep -E 'DRIVER|PCI_ID' /sys/class/drm/renderD128/device/uevent
ls /lib/firmware/i915/ | grep -E 'adlp_guc|tgl_huc'
dmesg | grep -i -E 'i915|guc|huc|wedged'
```

- `DRIVER=i915` und eine `PCI_ID` mit `8086:` zeigen die Intel-Grafik am
  Kernel-Treiber. Der N100 hat `8086:46D1`.
- Fehlt `/lib/firmware/i915/`, fehlt die Firmware für GuC und HuC. Der
  Intel-Mediatreiber meldet dann `iHD_drv_video.so init failed`, ffmpeg
  `Input/output error`. Nach der Installation den Host neu starten.

| System | Paket mit der Firmware für `i915` |
|---|---|
| Debian 12 | `firmware-misc-nonfree` (20230210-5) |
| Debian 12 mit Firmware aus `bookworm-backports` | `firmware-intel-graphics` (20250410-2~bpo12+1) |
| Debian 13 | `firmware-intel-graphics` (20250410-2) |
| Ubuntu | `linux-firmware` (nicht geprüft) |

Seit den Firmware-Paketen von 2025 enthält `firmware-misc-nonfree` keine Datei
für `i915` mehr. Geprüft am 1. Oktober 2026 im Inhalt der Pakete. Gefunden auf
dem N100 des Betreibers: OpenMediaVault auf Debian 12, Kernel 6.12.95 aus den
Backports, installiert nur `firmware-misc-nonfree` 20250410-2~bpo12+1.

---

## 3. Das Aufnahmeformat

`ffprobe` nennt `codec_name` und `pix_fmt`:

| `codec_name` | `pix_fmt` | Aufnahmeformat | Quick Sync dekodiert |
|---|---|---|---|
| `hevc` | `yuv420p10le` | XAVC HS 4:2:0 10 Bit | ja |
| `hevc` | `yuv422p10le` | XAVC HS 4:2:2 10 Bit | ja |
| `h264` | `yuv420p` | XAVC S 4:2:0 8 Bit | ja |
| `h264` | `yuv422p10le` | XAVC S 4:2:2 10 Bit oder XAVC S-I | nein |

---

## 4. Umwandeln

`KW` und `KH` begrenzen die kürzere Seite auf 1080 Pixel:

```sh
KW="'if(gt(iw,ih),-2,min(1080,iw))'"
KH="'if(gt(iw,ih),min(1080,ih),-2)'"
```

`-noautorotate` lässt ein Hochkant-Video so liegen, wie es gespeichert ist.
Ohne die Option dreht ffmpeg das Bild zuerst; ein Hochkant-Video in 1080p wurde
dann zu 608×1080. Geprüft am 1. Oktober 2026 mit einem Proxy der A6700
(1920×1080, Drehung −90°): mit der Option 1920×1080, Drehung −90°.

`MBIT`, `BUF` und `GOP` folgen aus der Bildrate. `MBIT` ist 0,23 je Bild,
höchstens 7,5; `BUF` ist doppelt so groß. `GOP` ist die Zahl der Bilder in
2 Sekunden. Bei 25p also `MBIT=5.75 BUF=11.5 GOP=50`, bei 50p
`MBIT=7.5 BUF=15 GOP=100`.

**A — Quick Sync**, Dekodieren und Kodieren in der Grafik, für HEVC und H.264
mit 8 Bit und 4:2:0:

```sh
ffmpeg -hwaccel vaapi -hwaccel_device /dev/dri/renderD128 -hwaccel_output_format vaapi \
  -noautorotate -i C0001.MP4 -vf "scale_vaapi=w=$KW:h=$KH:format=nv12" \
  -c:v h264_vaapi -b:v ${MBIT}M -maxrate ${MBIT}M -bufsize ${BUF}M -g $GOP \
  -c:a aac -b:a 128k -movflags +faststart C0001.proxy-A.mp4
```

**B — gemischt**, für H.264 mit 4:2:2 oder 10 Bit: die CPU dekodiert, die Grafik
kodiert:

```sh
ffmpeg -init_hw_device vaapi=va:/dev/dri/renderD128 -filter_hw_device va \
  -noautorotate -i C0001.MP4 -vf "scale=$KW:$KH,format=nv12,hwupload" \
  -c:v h264_vaapi -b:v ${MBIT}M -maxrate ${MBIT}M -bufsize ${BUF}M -g $GOP \
  -c:a aac -b:a 128k -movflags +faststart C0001.proxy-B.mp4
```

**C — nur die CPU**, für jede Datei:

```sh
ffmpeg -noautorotate -i C0001.MP4 -vf "scale=$KW:$KH,format=yuv420p" \
  -c:v libx264 -preset veryfast -b:v ${MBIT}M -maxrate ${MBIT}M -bufsize ${BUF}M -g $GOP \
  -c:a aac -b:a 128k -movflags +faststart C0001.proxy-C.mp4
```

Scheitert Weg A an einem Format, versucht das Skript Weg B.

---

## 5. Was festzuhalten ist

Das Skript schreibt eine Tafel mit diesen Spalten:

| Spalte | Inhalt |
|---|---|
| Format | `codec_name` und `pix_fmt` aus Abschnitt 3, dazu HLG oder PQ und „hochkant“ |
| Pixel, Bilder/s, Dauer | das Original, Pixel wie gespeichert |
| Video Mbit/s | Bitrate des Videos im Original, ohne Ton und Metadaten; Sony schreibt eine eigene Spur `rtmd` |
| Weg | A, B oder C aus Abschnitt 4 |
| Ziel | Bitrate des Proxys |
| Zeit | Dauer der Umwandlung |
| Faktor | Dauer des Videos ÷ Zeit |
| CPU | Rechenzeit von ffmpeg ÷ Zeit ÷ Zahl der Kerne |
| Größe | Größe des Proxys |

Faktor 1 heißt: so schnell, wie das Video läuft. Faktor 4 heißt: eine Stunde
Video in 15 Minuten. Für Videos ab 10 Minuten nennt das Skript dazu das Tempo
in der ersten und in der letzten Minute; sinkt es, drosselt der N100 unter
Wärme.

„Am Telefon“: jeden Proxy auf dem Telefon öffnen, ansehen, springen. Stimmen
Bild, Ton, Seitenverhältnis und Bewegung, bei HLG auch die Farben?

Was schnell genug ist, hat der Betreiber mit den Zahlen entschieden (F1, F20).

---

## 6. Das Skript

Das Skript liegt in `Doku/messung.sh`.

1. Die Videos in den leeren Ordner kopieren.
2. Das Skript in denselben Ordner legen. Aus einem Klon des Repositorys holt
   `git show <Branch>:Doku/messung.sh > <Ordner>/messung.sh` es, ohne den
   Arbeitsstand des Klons zu ändern.
3. Im Ordner `bash messung.sh | tee messung.txt` aufrufen. Braucht Docker
   `sudo`, dann `sudo bash messung.sh | tee messung.txt`. Die Proxys entstehen
   im Ordner, in dem das Skript aufgerufen wird.

`MBIT=7.5 bash messung.sh | tee messung.txt` setzt eine Bitrate für alle Videos
(V13). Ohne `MBIT` gilt F21: 0,23 Mbit je Bild, höchstens 7,5 Mbit/s.

`FFMPEG=schlank bash messung.sh | tee messung.txt` misst mit dem
schlanken ffmpeg aus Abschnitt 7 statt mit ffmpeg aus Debian und nennt die
Dauer des Baus. Das Image aus Debian mit dem freien Treiber baut es weiter,
nur für `ffprobe`. `FFVER` wählt die Version: 9.0.2 (Vorgabe) oder 7.1.5.

Das Skript

1. baut zwei Images aus `node:22-bookworm-slim`, dem Basis-Image von Kriterion,
   mit `ffmpeg` und einem der beiden Intel-Treiber aus Debian:
   `intel-media-va-driver` (frei) und `intel-media-va-driver-non-free`;
2. prüft mit beiden den Test aus Abschnitt 2. Kodiert keiner, lädt es
   `linuxserver/ffmpeg` und prüft damit;
3. bestimmt für jedes Video das Format und wandelt es über Weg A oder B um,
   danach über Weg C. Videos ab 10 Minuten wandelt es nur über einen Weg um;
4. schreibt die Tafel aus Abschnitt 5 nach `messung.txt`. Die Proxys liegen als
   `<Name>.proxy-A.mp4`, `-B` und `-C` neben den Videos.

Getestet am 1. Oktober 2026 auf einem Rechner ohne Quick Sync: Weg C mit
Testvideos in HEVC 4K 50p mit HLG, H.264 4K 25p mit 4:2:2 und 10 Bit, H.264
1080p 59,94p und H.264 720p 25p über 10 Minuten; dazu die Zweige ohne Quick
Sync und der Rückfall auf `linuxserver/ffmpeg`. Die Wege A und B laufen erst auf
dem N100.

Danach entfernt
`docker image rm kriterion-messung:intel-media-va-driver kriterion-messung:intel-media-va-driver-non-free kriterion-messung:schlank`
die Images; `linuxserver/ffmpeg` ebenso, wenn das Skript es geladen hat.


---

## 7. Probebau: schlankes ffmpeg

Für F19 im Auftrag gemessen am 1. und 2. Oktober 2026, in der Sitzung von
Claude. Das Skript holt das Archiv von `ffmpeg.org` mit `ADD --checksum`; das
braucht BuildKit, das Docker ab Version 23 unter Linux von selbst nimmt.

| Version | erschienen | SHA-256 | geprüft |
|---|---|---|---|
| 7.1.5 | 20. Juni 2026 | `de668509…` | bitgleich mit `ffmpeg_7.1.5.orig.tar.xz` aus Debian 13 |
| 9.0.2 | 18. September 2026 | `8c385028…` | Signatur gültig, Release-Schlüssel `FCF9 86EA 15E6 E293 A564 4F10 B432 2F04 D676 58D8` |

| Version | Bau in der Sitzung | Image | Weg C | Quick Sync auf dem N100 |
|---|---|---|---|---|
| 7.1.5 | 3:19 mit dem Herunterladen | 263 MB | geprüft | gemessen: Bau 4:39, 264 MB, Weg A 10 bis 25 % schneller als 5.1.9 |
| 9.0.2 | 3:23 mit dem Herunterladen | 264 MB | geprüft, so schnell wie 7.1.5 | nicht gemessen |

Das `Changelog` von 9.0.2 nennt für die Teile, die Kriterion benutzt, drei
neue Grenzprüfungen im Leser für MP4 und MOV (`keys`, `trun`, `sgpd`),
Korrekturen an den Decodern für H.264 und HEVC und ein Leck in dav1d. Die
neuen Funktionen von 8.0 bis 9.0 (VVC über VA-API, APV, ProRes RAW, D3D12,
Vulkan, NVENC) betreffen die Proxys nicht.

| Image | Größe |
|---|---|
| `node:22-bookworm-slim` | 227 MB |
| mit `ffmpeg` und `intel-media-va-driver` aus Debian | 705 MB |
| mit diesem schlanken ffmpeg und `intel-media-va-driver` | 263 MB |
| mit `jellyfin-ffmpeg8` 8.1.3 und seinem Intel-Treiber 26.3.5 | rund 525 MB |

Das `Dockerfile` steht im Skript in der Funktion `bau_schlank()`.

| ffmpeg | mit `-noautorotate` | gemessen |
|---|---|---|
| 5.1.9 aus Debian 12 | die Drehung bleibt | Weg C und, beim Betreiber, Weg A |
| 7.1.5, schlank | die Drehung bleibt | Weg C |
| 8.1.3 aus `jellyfin-ffmpeg8` | die Drehung geht verloren | Weg C |
| 9.0 aus `linuxserver/ffmpeg` | die Drehung bleibt | Weg C |

Gemessen mit dem Proxy der A6700 hochkant (1920×1080, Drehung −90°).
`jellyfin-ffmpeg8` ohne `-noautorotate` dreht die Pixel und liefert 1080×1920.
