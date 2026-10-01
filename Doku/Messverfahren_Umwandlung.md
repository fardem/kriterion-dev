# Messverfahren: Proxys auf dem Intel N100

**Aufgestellt am 30. September 2026, neu gefasst am 1. Oktober 2026** für 0.55.0
(B1 in `Doku/Auftrag_0.55.0.md`). Gemessen wird, wie schnell der N100 des
Betreibers ein Video der A6700 in einen Proxy umwandelt: mit Quick Sync und nur
mit der CPU. Dazu prüft die Messung, ob die Intel-Treiber aus Debian auf dem
N100 kodieren. Kriterion ist dabei nicht beteiligt.

Ziel der Umwandlung (F8, F16, F17 und V10 im Auftrag):

- höchstens 1080 Zeilen; das Seitenverhältnis bleibt, ein Video mit weniger
  Zeilen behält seine Höhe
- die Bildrate des Originals
- H.264 mit 5 Mbit/s bis 30 Bilder je Sekunde, 8 Mbit/s bis 60 und 16 Mbit/s
  darüber; ein Keyframe alle 2 Sekunden
- Ton AAC mit 128 kbit/s, MP4 mit der `moov`-Box vorn

Das ergibt je Stunde 2,3, 3,7 oder 7,3 GB.

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

`MBIT` und `GOP` folgen aus der Bildrate. `MBIT` ist 5 bis 30 Bilder je
Sekunde, 8 bis 60 und 16 darüber. `GOP` ist die Zahl der Bilder in 2 Sekunden,
bei 50p also 100.

**A — Quick Sync**, Dekodieren und Kodieren in der Grafik, für HEVC und H.264
mit 8 Bit und 4:2:0:

```sh
ffmpeg -hwaccel vaapi -hwaccel_device /dev/dri/renderD128 -hwaccel_output_format vaapi \
  -i C0001.MP4 -vf "scale_vaapi=w=-2:h='min(1080,ih)':format=nv12" \
  -c:v h264_vaapi -b:v ${MBIT}M -maxrate ${MBIT}M -bufsize $((2 * MBIT))M -g $GOP \
  -c:a aac -b:a 128k -movflags +faststart C0001.proxy-A.mp4
```

**B — gemischt**, für H.264 mit 4:2:2 oder 10 Bit: die CPU dekodiert, die Grafik
kodiert:

```sh
ffmpeg -init_hw_device vaapi=va:/dev/dri/renderD128 -filter_hw_device va \
  -i C0001.MP4 -vf "scale=-2:'min(1080,ih)',format=nv12,hwupload" \
  -c:v h264_vaapi -b:v ${MBIT}M -maxrate ${MBIT}M -bufsize $((2 * MBIT))M -g $GOP \
  -c:a aac -b:a 128k -movflags +faststart C0001.proxy-B.mp4
```

**C — nur die CPU**, für jede Datei:

```sh
ffmpeg -i C0001.MP4 -vf "scale=-2:'min(1080,ih)',format=yuv420p" \
  -c:v libx264 -preset veryfast -b:v ${MBIT}M -maxrate ${MBIT}M -bufsize $((2 * MBIT))M -g $GOP \
  -c:a aac -b:a 128k -movflags +faststart C0001.proxy-C.mp4
```

Scheitert Weg A an einem Format, versucht das Skript Weg B.

---

## 5. Was festzuhalten ist

Das Skript schreibt eine Tafel mit diesen Spalten:

| Spalte | Inhalt |
|---|---|
| Format | `codec_name` und `pix_fmt` aus Abschnitt 3, dazu HLG oder PQ |
| Pixel, Bilder/s, Mbit/s, Dauer | das Original |
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

Was schnell genug ist, entscheidet der Betreiber mit den Zahlen (F1).

---

## 6. Das Skript

1. Die Videos in den leeren Ordner kopieren.
2. Das Skript unten als `messung.sh` in denselben Ordner legen.
3. Im Ordner `bash messung.sh | tee messung.txt` aufrufen. Braucht Docker
   `sudo`, dann `sudo bash messung.sh | tee messung.txt`.

`MBIT=7.5 bash messung.sh | tee messung.txt` setzt eine Bitrate für alle Videos
(V13, F21). Ohne `MBIT` gelten 5, 8 oder 16 Mbit/s nach der Bildrate.

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
`docker image rm kriterion-messung:intel-media-va-driver kriterion-messung:intel-media-va-driver-non-free`
die beiden Images; `linuxserver/ffmpeg` ebenso, wenn das Skript es geladen hat.

```bash
#!/bin/bash
# Misst die Umwandlung in Proxys für Kriterion. Aufruf im Ordner mit den Videos:
#   bash messung.sh | tee messung.txt
# MBIT=7.5 setzt eine Bitrate für alle Videos; leer: 5, 8 oder 16 Mbit/s nach Bildrate.
MBIT=${MBIT:-}
DRI=${DRI:-/dev/dri/renderD128}
LSIO=linuxserver/ffmpeg:latest
NPROC=$(nproc)
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT
: >"$TMP/fehler"
: >"$TMP/dauerlast"

say() { printf '%s\n' "$*" >&2; }

# Basis-Image von Kriterion mit ffmpeg und einem der beiden Intel-Treiber aus Debian.
bau() {
  docker build -q -t "kriterion-messung:$1" --build-arg TREIBER="$1" - >"$TMP/bau.log" 2>&1 <<'EOF'
FROM node:22-bookworm-slim
ARG TREIBER
RUN sed -i 's/^Components: main$/Components: main non-free/' /etc/apt/sources.list.d/debian.sources \
 && apt-get update \
 && apt-get install -y --no-install-recommends ffmpeg "$TREIBER" \
 && rm -rf /var/lib/apt/lists/*
EOF
}

ff() {
  local img=$1; shift
  docker run --rm "${HW[@]}" --user "$(id -u):$(id -g)" -v "$PWD:/work" -w /work \
    --entrypoint ffmpeg "$img" -hide_banner -nostdin "$@"
}

version() { docker run --rm --entrypoint ffmpeg "$1" -version 2>/dev/null | sed -n '1s/^ffmpeg version \([^ ]*\).*/\1/p'; }

qs() {
  local img=$1; shift
  ff "$img" -v verbose -init_hw_device vaapi=va:"$DRI" -filter_hw_device va \
    -f lavfi -i testsrc2=duration=2:size=1920x1080:rate=30 \
    -vf format=nv12,hwupload -c:v h264_vaapi "$@" -f null - >"$TMP/qs.log" 2>&1
}

# Weg A und B brauchen eine feste Bitrate; ohne HuC-Firmware kodiert der N100 nur mit fester Qualität.
pruefe() {
  if qs "$1" -b:v 5M -maxrate 5M -bufsize 10M; then
    echo "- $2: Quick Sync kodiert H.264 ($(sed -n 's/.*VAAPI driver: \(.*\)\.$/\1/p' "$TMP/qs.log" | head -n1))"
    return 0
  fi
  if qs "$1"; then
    echo "- $2: Quick Sync kodiert nur ohne feste Bitrate; vermutlich lädt der Host die HuC-Firmware nicht"
  else
    echo "- $2: Quick Sync kodiert nicht"
  fi
  grep -i -E 'libva|vaapi|fail|error' "$TMP/qs.log" | tail -n 10 | sed 's/^/    /'
  return 1
}

wandle() {
  local weg=$1 img=$2 f=$3 mbit=$4 gop=$5 aus vf dec=() enc=()
  aus="${f%.*}.proxy-$weg.mp4"
  case $weg in
    A) dec=(-hwaccel vaapi -hwaccel_device "$DRI" -hwaccel_output_format vaapi)
       vf="scale_vaapi=w=-2:h='min(1080,ih)':format=nv12"; enc=(-c:v h264_vaapi) ;;
    B) dec=(-init_hw_device vaapi=va:"$DRI" -filter_hw_device va)
       vf="scale=-2:'min(1080,ih)',format=nv12,hwupload"; enc=(-c:v h264_vaapi) ;;
    C) vf="scale=-2:'min(1080,ih)',format=yuv420p"; enc=(-c:v libx264 -preset veryfast) ;;
  esac
  say "  Weg $weg: $f"
  local t0=$SECONDS
  ff "$img" -benchmark -nostats -progress pipe:1 -stats_period 1 -y "${dec[@]}" -i "$f" \
    -vf "$vf" "${enc[@]}" -b:v "${mbit}M" -maxrate "${mbit}M" -bufsize "$(awk -v m="$mbit" 'BEGIN { print 2 * m }')M" -g "$gop" \
    -c:a aac -b:a 128k -movflags +faststart "$aus" 2>"$TMP/lauf.log" |
    while IFS= read -r z; do
      case $z in out_time_us=*) echo "$SECONDS ${z#out_time_us=}" ;; esac
    done >"$TMP/zeit"
  if [ "${PIPESTATUS[0]}" != 0 ]; then
    { echo "$f, Weg $weg:"; grep -v -e '^ *$' -e '^bench:' "$TMP/lauf.log" | tail -n 3 | sed 's/^/    /'; } >>"$TMP/fehler"
    rm -f "$aus"
    return 1
  fi
  read -r UT ST RT < <(sed -n 's/^bench: utime=\([0-9.]*\)s stime=\([0-9.]*\)s rtime=\([0-9.]*\)s.*/\1 \2 \3/p' "$TMP/lauf.log")
  [ -n "$RT" ] || { UT=0 ST=0 RT=$((SECONDS - t0 + 1)); }
  BYTES=$(stat -c %s "$aus")
}

# Tempo in der ersten und in der letzten Minute des Laufs, aus den Zeilen out_time_us von -progress.
minuten() {
  awk '{ t[NR] = $1; o[NR] = $2 + 0 }
    END {
      if (NR < 2) exit
      for (i = 2; i <= NR && t[i] - t[1] < 60; i++) ;
      if (i > NR) exit
      e = NR; while (e > 1 && o[e] <= o[e - 1]) e--
      for (j = e - 1; j > 1 && t[e] - t[j] < 60; j--) ;
      if (t[e] - t[j] < 60) exit
      s = sprintf("erste Minute %.1f-fach, letzte Minute %.1f-fach",
                  (o[i] - o[1]) / 1e6 / (t[i] - t[1]), (o[e] - o[j]) / 1e6 / (t[e] - t[j]))
      gsub(/\./, ",", s); print s
    }' "$TMP/zeit"
}

echo "# Messung vom $(date '+%d.%m.%Y %H:%M')"
echo
echo "- CPU: $(sed -n 's/^model name[[:space:]]*: //p' /proc/cpuinfo | head -n1), $NPROC Kerne; Kernel $(uname -r)"
HW=()
if [ -c "$DRI" ]; then
  HW=(--device "$DRI:$DRI" --group-add "$(stat -c %g "$DRI")")
  gpu=$(sed -n 's/^\(DRIVER\|PCI_ID\)=//p' "/sys/class/drm/${DRI##*/}/device/uevent" 2>/dev/null | tr '\n' ' ')
  echo "- Grafik: ${gpu:-unbekannt}; /lib/firmware/i915: $([ -d /lib/firmware/i915 ] && echo vorhanden || echo fehlt)"
  dmesg 2>/dev/null | grep -i -E 'guc|huc|wedged' | tail -n 4 | sed 's/^/    /'
else
  echo "- $DRI fehlt: nur Weg C"
fi

HWIMG= CPUIMG=
for t in intel-media-va-driver intel-media-va-driver-non-free; do
  say "Baue das Image mit ffmpeg und $t ..."
  if ! bau "$t"; then
    echo "- Debian mit $t: Bau fehlgeschlagen"
    grep -v '^ *$' "$TMP/bau.log" | tail -n 3 | sed 's/^/    /'
    continue
  fi
  [ -z "$CPUIMG" ] && CPUIMG=kriterion-messung:$t
  [ ${#HW[@]} = 0 ] && break
  pruefe "kriterion-messung:$t" "Debian mit $t" && [ -z "$HWIMG" ] && HWIMG=kriterion-messung:$t
done
if [ ${#HW[@]} != 0 ] && [ -z "$HWIMG" ]; then
  say "Lade $LSIO ..."
  docker pull -q "$LSIO" >/dev/null 2>&1 && pruefe "$LSIO" "$LSIO" && HWIMG=$LSIO
fi
if [ -z "$CPUIMG" ]; then
  docker pull -q "$LSIO" >/dev/null 2>&1 && CPUIMG=$LSIO
fi
if [ -z "$CPUIMG" ]; then
  echo "Kein Image mit ffmpeg; Abbruch."
  exit 1
fi
echo "- Weg A und B: ${HWIMG:-keiner}${HWIMG:+, ffmpeg $(version "$HWIMG")}"
echo "- Weg C: $CPUIMG, ffmpeg $(version "$CPUIMG")"
echo
echo "| Datei | Format | Pixel | Bilder/s | Mbit/s | Dauer | Weg | Ziel | Zeit | Faktor | CPU | Größe |"
echo "|---|---|---|---|---|---|---|---|---|---|---|---|"

for f in *; do
  case ${f,,} in
    *.proxy-[abc].mp4) continue ;;
    *.mp4 | *.mov | *.m4v | *.mts | *.m2ts | *.mkv | *.avi | *.wmv | *.flv | *.webm) ;;
    *) continue ;;
  esac
  codec= pix= w= h= rate= trc= dur= br=
  while IFS='=' read -r k v; do
    case $k in
      codec_name) codec=$v ;; pix_fmt) pix=$v ;; width) w=$v ;; height) h=$v ;;
      r_frame_rate) rate=$v ;; color_transfer) trc=$v ;; duration) dur=$v ;; bit_rate) br=$v ;;
    esac
  done < <(docker run --rm -v "$PWD:/work" -w /work --entrypoint ffprobe "$CPUIMG" -v error \
             -select_streams v:0 \
             -show_entries stream=codec_name,pix_fmt,width,height,r_frame_rate,color_transfer:format=duration,bit_rate \
             -of default=nw=1 "$f" 2>/dev/null)
  if [ -z "$codec" ]; then
    echo "| $f | kein Video | | | | | | | | | | |"
    continue
  fi
  n=${rate%/*} d=${rate#*/}
  case "$n/$d" in *[!0-9/]* | /* | */ | 0/* | */0) n=30 d=1 ;; esac
  mbit=5
  [ "$n" -gt $((30 * d)) ] && mbit=8
  [ "$n" -gt $((60 * d)) ] && mbit=16
  [ -n "$MBIT" ] && mbit=$MBIT
  gop=$(((2 * n + d - 1) / d))
  fmt="$codec $pix"
  case $trc in arib-std-b67) fmt="$fmt HLG" ;; smpte2084) fmt="$fmt PQ" ;; esac
  fps=$(awk -v n="$n" -v d="$d" 'BEGIN { s = sprintf("%.2f", n / d); sub(/\.?0+$/, "", s); sub(/\./, ",", s); print s }')
  quelle=$(awk -v b="${br:-0}" 'BEGIN { printf "%d", b / 1e6 + 0.5 }')
  laenge=$(awk -v s="${dur:-0}" 'BEGIN { s = int(s + 0.5); printf "%d:%02d", s / 60, s % 60 }')
  hw=
  if [ -n "$HWIMG" ]; then
    case "$codec/$pix" in
      hevc/* | vp9/* | av1/* | h264/yuv420p | h264/yuvj420p) hw=A ;;
      *) hw=B ;;
    esac
  fi
  if awk -v x="${dur:-0}" 'BEGIN { exit !(x >= 600) }'; then
    wege="${hw:-C}"; lang=1
  else
    wege="$hw C"; lang=0
  fi
  say "$f: $fmt, ${w}×${h}, $fps Bilder/s"
  for weg in $wege; do
    img=$CPUIMG
    [ "$weg" != C ] && img=$HWIMG
    if ! wandle "$weg" "$img" "$f" "$mbit" "$gop"; then
      echo "| $f | $fmt | ${w}×${h} | $fps | $quelle | $laenge | $weg | ${mbit/./,} Mbit/s | Fehler | | | |"
      [ "$weg" = A ] || continue
      weg=B
      if ! wandle B "$img" "$f" "$mbit" "$gop"; then
        echo "| $f | $fmt | ${w}×${h} | $fps | $quelle | $laenge | B | ${mbit/./,} Mbit/s | Fehler | | | |"
        continue
      fi
    fi
    werte=$(awk -v ut="$UT" -v st="$ST" -v rt="$RT" -v d="$dur" -v n="$NPROC" -v b="$BYTES" 'BEGIN {
      z = int(rt + 0.5)
      printf "%d:%02d | %.1f | %d %% | %d MB", z / 60, z % 60, d / rt, (ut + st) / rt / n * 100 + 0.5, b / 1e6 + 0.5 }')
    echo "| $f | $fmt | ${w}×${h} | $fps | $quelle | $laenge | $weg | ${mbit/./,} Mbit/s | ${werte//./,} |"
    if [ "$lang" = 1 ]; then
      m=$(minuten)
      echo "$f, Weg $weg: ${m:-Lauf kürzer als zwei Minuten}" >>"$TMP/dauerlast"
    fi
  done
done

if [ -s "$TMP/dauerlast" ]; then
  echo
  echo "Dauerlast:"
  sed 's/^/- /' "$TMP/dauerlast"
fi
if [ -s "$TMP/fehler" ]; then
  echo
  echo "Fehler:"
  cat "$TMP/fehler"
fi
say ""
say "Fertig. Die Proxys liegen als *.proxy-A.mp4, *.proxy-B.mp4 und *.proxy-C.mp4 neben den Videos."
say "Images entfernen: docker image rm kriterion-messung:intel-media-va-driver kriterion-messung:intel-media-va-driver-non-free"
```
