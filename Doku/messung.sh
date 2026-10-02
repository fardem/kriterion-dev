#!/bin/bash
# Misst die Umwandlung in Proxys für Kriterion. Aufruf im Ordner mit den Videos:
#   bash messung.sh | tee messung.txt
# MBIT=7.5 setzt eine Bitrate für alle Videos; leer: 5, 8 oder 16 Mbit/s nach Bildrate.
# FFMPEG=schlank baut ffmpeg selbst (FFVER, Vorgabe 9.0.2) und misst damit statt mit ffmpeg aus Debian.
MBIT=${MBIT:-}
FFMPEG=${FFMPEG:-debian}
FFVER=${FFVER:-9.0.2}
# SHA-256 der Archive von ffmpeg.org; die Signaturen sind mit dem Release-Schlüssel geprüft.
case $FFVER in
  7.1.5) FFSHA=de668509caf9e35e3cd162473441fdb29538c6d96ed080292b3cf9e6fc5d558f ;;
  9.0.2) FFSHA=8c3850283eb25fa026482078a04051e0be17347b09ef81a0849bec15a96e002e ;;
  *) echo "FFVER=$FFVER: keine Prüfsumme bekannt" >&2; exit 1 ;;
esac
SCHLANK=kriterion-messung:schlank-$FFVER
DRI=${DRI:-/dev/dri/renderD128}
LSIO=linuxserver/ffmpeg:latest
NPROC=$(nproc)
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT
: >"$TMP/fehler"
: >"$TMP/dauerlast"

say() { printf '%s\n' "$*" >&2; }

# Die kürzere Seite höchstens 1080 Pixel. Ein Hochkant-Video bleibt liegend gespeichert;
# -noautorotate lässt die Drehung als Metadatum im Proxy.
KW="'if(gt(iw,ih),-2,min(1080,iw))'"
KH="'if(gt(iw,ih),min(1080,ih),-2)'"

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

# ffmpeg aus den Quellen, nur Lesen aller Formate und Schreiben von H.264 und AAC.
bau_schlank() {
  docker build -q -t "$SCHLANK" - >"$TMP/bau.log" 2>&1 <<EOF
FROM node:22-bookworm-slim AS ffbuild
RUN apt-get update \
 && apt-get install -y --no-install-recommends build-essential nasm pkg-config xz-utils \
      libx264-dev libva-dev libdrm-dev libdav1d-dev zlib1g-dev \
 && rm -rf /var/lib/apt/lists/*
ADD --checksum=sha256:$FFSHA \
    https://ffmpeg.org/releases/ffmpeg-$FFVER.tar.xz /src/
WORKDIR /src
RUN tar xf ffmpeg-$FFVER.tar.xz && cd ffmpeg-$FFVER \
 && ./configure --prefix=/opt/ff --disable-debug --disable-doc --disable-ffplay --disable-ffprobe \
      --disable-autodetect --enable-gpl --enable-libx264 --enable-libdav1d --enable-vaapi --enable-libdrm --enable-zlib \
      --disable-encoders --enable-encoder=libx264,h264_vaapi,aac \
      --disable-muxers --enable-muxer=mp4,mov,null \
      --disable-filters --enable-filter=scale,scale_vaapi,format,hwupload,null,anull,aresample,aformat,testsrc2 \
      --disable-devices --enable-indev=lavfi \
      --disable-protocols --enable-protocol=file,pipe,http,tcp \
 && make -j"\$(nproc)" && make install && strip /opt/ff/bin/ffmpeg

FROM node:22-bookworm-slim
RUN apt-get update \
 && apt-get install -y --no-install-recommends libx264-164 libva2 libva-drm2 libdrm2 libdav1d6 intel-media-va-driver \
 && rm -rf /var/lib/apt/lists/*
COPY --from=ffbuild /opt/ff/bin/ffmpeg /usr/local/bin/ffmpeg
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
       vf="scale_vaapi=w=$KW:h=$KH:format=nv12"; enc=(-c:v h264_vaapi) ;;
    B) dec=(-init_hw_device vaapi=va:"$DRI" -filter_hw_device va)
       vf="scale=$KW:$KH,format=nv12,hwupload"; enc=(-c:v h264_vaapi) ;;
    C) vf="scale=$KW:$KH,format=yuv420p"; enc=(-c:v libx264 -preset veryfast) ;;
  esac
  say "  Weg $weg: $f"
  local t0=$SECONDS
  ff "$img" -benchmark -nostats -progress pipe:1 -stats_period 1 -y "${dec[@]}" -noautorotate -i "$f" \
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

HWIMG= CPUIMG= PROBEIMG=
for t in intel-media-va-driver intel-media-va-driver-non-free; do
  # Mit FFMPEG=schlank dient das Image aus Debian nur noch ffprobe.
  [ "$FFMPEG" = schlank ] && [ -n "$PROBEIMG" ] && break
  say "Baue das Image mit ffmpeg und $t ..."
  if ! bau "$t"; then
    echo "- Debian mit $t: Bau fehlgeschlagen"
    grep -v '^ *$' "$TMP/bau.log" | tail -n 3 | sed 's/^/    /'
    continue
  fi
  [ -z "$PROBEIMG" ] && PROBEIMG=kriterion-messung:$t
  [ "$FFMPEG" = schlank ] && continue
  [ -z "$CPUIMG" ] && CPUIMG=kriterion-messung:$t
  [ ${#HW[@]} = 0 ] && break
  pruefe "kriterion-messung:$t" "Debian mit $t" && [ -z "$HWIMG" ] && HWIMG=kriterion-messung:$t
done
if [ "$FFMPEG" = schlank ]; then
  say "Baue das schlanke ffmpeg ..."
  t0=$SECONDS
  if bau_schlank; then
    t1=$((SECONDS - t0))
    echo "- Schlankes ffmpeg $FFVER: Bau $((t1 / 60)):$(printf '%02d' $((t1 % 60))), Image $(docker image inspect -f '{{.Size}}' "$SCHLANK" | awk '{ printf "%d MB", $1 / 1e6 + 0.5 }')"
    CPUIMG=$SCHLANK
    [ ${#HW[@]} != 0 ] && pruefe "$SCHLANK" "schlankes ffmpeg $FFVER" && HWIMG=$SCHLANK
  else
    echo "- Schlankes ffmpeg: Bau fehlgeschlagen"
    grep -v '^ *$' "$TMP/bau.log" | tail -n 5 | sed 's/^/    /'
  fi
fi
if [ "$FFMPEG" != schlank ] && [ ${#HW[@]} != 0 ] && [ -z "$HWIMG" ]; then
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
echo "| Datei | Format | Pixel | Bilder/s | Video Mbit/s | Dauer | Weg | Ziel | Zeit | Faktor | CPU | Größe |"
echo "|---|---|---|---|---|---|---|---|---|---|---|---|"

for f in *; do
  case ${f,,} in
    *.proxy-[abc].mp4) continue ;;
    *.mp4 | *.mov | *.m4v | *.mts | *.m2ts | *.mkv | *.avi | *.wmv | *.flv | *.webm) ;;
    *) continue ;;
  esac
  codec= pix= w= h= rate= trc= dur= br= vbr= rot=
  while IFS='=' read -r k v; do
    v=${v//\"/}
    case $k in
      streams_stream_0_codec_name) codec=$v ;; streams_stream_0_pix_fmt) pix=$v ;;
      streams_stream_0_width) w=$v ;; streams_stream_0_height) h=$v ;;
      streams_stream_0_r_frame_rate) rate=$v ;; streams_stream_0_color_transfer) trc=$v ;;
      streams_stream_0_bit_rate) vbr=$v ;; streams_stream_0_side_data_list_side_data_*_rotation) rot=$v ;;
      format_duration) dur=$v ;; format_bit_rate) br=$v ;;
    esac
  done < <(docker run --rm -v "$PWD:/work" -w /work --entrypoint ffprobe "${PROBEIMG:-$CPUIMG}" -v error \
             -select_streams v:0 \
             -show_entries stream=codec_name,pix_fmt,width,height,r_frame_rate,color_transfer,bit_rate:stream_side_data=rotation:format=duration,bit_rate \
             -of flat=s=_ "$f" 2>/dev/null)
  # Bitrate des Videos; ohne Angabe im Container (etwa mkv) die der ganzen Datei.
  case $vbr in '' | *[!0-9]*) vbr=$br ;; esac
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
  case $rot in 90 | -90 | 270 | -270) fmt="$fmt, hochkant" ;; esac
  fps=$(awk -v n="$n" -v d="$d" 'BEGIN { s = sprintf("%.2f", n / d); sub(/\.?0+$/, "", s); sub(/\./, ",", s); print s }')
  quelle=$(awk -v b="${vbr:-0}" 'BEGIN { printf "%.1f", b / 1e6 }')
  quelle=${quelle/./,}
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
say "Images entfernen: docker image rm kriterion-messung:intel-media-va-driver kriterion-messung:intel-media-va-driver-non-free $SCHLANK"
