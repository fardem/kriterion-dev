# Messverfahren: Umwandlung auf dem Intel N100

**Aufgestellt am 30. September 2026** für die Runde nach 0.52.0 (Punkt 57 in
`Doku/Fehler_und_Ideen.md`). Gemessen wird, wie schnell der N100 des Betreibers
ein Video der A6700 in eine Fassung für das Telefon umwandelt: einmal mit Quick
Sync, einmal nur mit der CPU. Kriterion ist dabei nicht beteiligt.

Ziel der Umwandlung: 1080p mit 30 Bildern je Sekunde, H.264 mit 5 Mbit/s, Ton
AAC mit 128 kbit/s, MP4 mit dem `moov`-Kasten vorn. Das ergibt rund 2,3 GB je
Stunde.

---

## 1. Voraussetzungen

- Docker auf dem N100.
- `ls -l /dev/dri` zeigt `renderD128`. Fehlt es, hat der Host keinen Treiber
  für die Grafik geladen; dann ist nur die Messung mit der CPU möglich.
- Ein Ordner mit Videos direkt von der Kamera, etwa `~/messung/`: je
  Aufnahmeformat, das genutzt wird, ein Video von mindestens 2 Minuten, dazu
  20 Minuten Material für die Dauerlast.
- Eine ruhige Zeit: Die Umwandlung belegt den Server, Kriterion läuft weiter.

Das Image `lscr.io/linuxserver/ffmpeg` enthält ffmpeg mit VA-API und den
Intel-Mediatreiber. Docker lädt es beim ersten Aufruf; danach entfernt
`docker image rm lscr.io/linuxserver/ffmpeg` es wieder.

```sh
cd ~/messung
IMG=lscr.io/linuxserver/ffmpeg:latest
DRI="--device /dev/dri:/dev/dri"
```

---

## 2. Quick Sync prüfen

Eine Sekunde Testbild, kodiert über VA-API:

```sh
docker run --rm $DRI $IMG -hide_banner \
  -init_hw_device vaapi=va:/dev/dri/renderD128 -filter_hw_device va \
  -f lavfi -i testsrc=duration=1:size=1280x720:rate=30 \
  -vf 'format=nv12,hwupload' -c:v h264_vaapi -f null -
```

Endet der Befehl ohne Fehler, kodiert Quick Sync H.264.

---

## 3. Das Aufnahmeformat feststellen

Für jede Datei, hier `C0001.MP4`:

```sh
docker run --rm -v "$PWD:/work" --entrypoint ffprobe $IMG -v error \
  -show_entries format=duration,bit_rate:stream=index,codec_type,codec_name,profile,pix_fmt,width,height,r_frame_rate,bit_rate,channels,sample_rate \
  -of default=noprint_wrappers=1 /work/C0001.MP4
```

| `codec_name` | `pix_fmt` | Aufnahmeformat | Quick Sync dekodiert |
|---|---|---|---|
| `hevc` | `yuv420p10le` | XAVC HS 4:2:0 10 Bit | ja |
| `hevc` | `yuv422p10le` | XAVC HS 4:2:2 10 Bit | ja |
| `h264` | `yuv420p` | XAVC S 4:2:0 8 Bit | ja |
| `h264` | `yuv422p10le` | XAVC S 4:2:2 10 Bit oder XAVC S-I | nein |

---

## 4. Umwandeln

`time` misst die Zeit des Laufs. Die letzte Zeile von ffmpeg nennt `speed=`,
das Vielfache der Echtzeit.

**A — Quick Sync**, Dekodieren und Kodieren in der Grafik, für HEVC und H.264
mit 8 Bit:

```sh
time docker run --rm $DRI -v "$PWD:/work" $IMG -hide_banner -y \
  -hwaccel vaapi -hwaccel_device /dev/dri/renderD128 -hwaccel_output_format vaapi \
  -i /work/C0001.MP4 \
  -vf 'scale_vaapi=w=-2:h=1080:format=nv12,fps=30' \
  -c:v h264_vaapi -b:v 5M -maxrate 5M -bufsize 10M -g 60 \
  -c:a aac -b:a 128k -movflags +faststart /work/C0001-quicksync.mp4
```

**B — gemischt**, für H.264 mit 4:2:2 und 10 Bit: die CPU dekodiert, die Grafik
kodiert:

```sh
time docker run --rm $DRI -v "$PWD:/work" $IMG -hide_banner -y \
  -init_hw_device vaapi=va:/dev/dri/renderD128 -filter_hw_device va \
  -i /work/C0001.MP4 \
  -vf 'scale=-2:1080,fps=30,format=nv12,hwupload' \
  -c:v h264_vaapi -b:v 5M -maxrate 5M -bufsize 10M -g 60 \
  -c:a aac -b:a 128k -movflags +faststart /work/C0001-gemischt.mp4
```

**C — nur die CPU**, für jede Datei:

```sh
time docker run --rm -v "$PWD:/work" $IMG -hide_banner -y \
  -i /work/C0001.MP4 \
  -vf 'scale=-2:1080,fps=30,format=yuv420p' \
  -c:v libx264 -preset veryfast -b:v 5M -maxrate 5M -bufsize 10M -g 60 \
  -c:a aac -b:a 128k -movflags +faststart /work/C0001-cpu.mp4
```

Während eines Laufs zeigt `docker stats --no-stream` in einem zweiten Fenster
die CPU-Last des Containers.

**Dauerlast:** Lauf A mit den 20 Minuten Material. `speed=` am Anfang und am
Ende festhalten; sinkt der Wert, drosselt der N100 unter Wärme.

---

## 5. Was festzuhalten ist

| Datei | Format (Abschnitt 3) | Dauer | Weg | Zeit (`real`) | Faktor (Dauer ÷ Zeit) | CPU-Last | Größe | am Telefon |
|---|---|---|---|---|---|---|---|---|
| | | | A | | | | | |
| | | | C | | | | | |

„Am Telefon“: die Datei auf dem Telefon öffnen, ansehen, springen. Stimmen Bild,
Ton und Seitenverhältnis?

Faktor 1 heißt: so schnell, wie das Video läuft. Faktor 4 heißt: eine Stunde
Video in 15 Minuten. Was schnell genug ist, entscheidet der Betreiber mit den
Zahlen.
