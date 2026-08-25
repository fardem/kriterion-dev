#!/usr/bin/env bash
# Schluesselwechsel auf dem Wirt -- der ganze Ablauf in einem Aufruf.
#
#   ./schluessel.sh zeigen      sagt die Lage, aendert nichts
#   ./schluessel.sh wechseln    haelt an, sichert, wechselt, startet
#
# DIESES SKRIPT MACHT DEN ABLAUF, NICHT DEN WECHSEL. Der steht in
# schluessel.js und laeuft im Container: PRAGMA rekey braucht SQLCipher, und
# die Bibliothek liegt im Image. Auf dem Wirt liegt dafuer die .env -- sie wird
# dem Wegwerf-Container eigens eingehaengt. Der LAUFENDE Container bekommt sie
# nie zu sehen.
#
# WARUM DIE ANLAGE DABEI STEHT: ein laufender Server haelt katalog.sqlite im
# WAL-Modus offen, und der Wechsel muss auf DELETE umschalten. Zwei Schreiber
# an dieser Stelle sind genau der Zustand, den niemand will.
#
# DIE SICHERUNG IST PFLICHT UND KEINE EMPFEHLUNG. Bricht der Wechsel ab, stellt
# das Rollback-Journal den alten Stand her; geht das Journal verloren, ist alles
# verloren -- DAS ist der Grund fuer die Sicherung, nicht der Abbruch.
set -euo pipefail

cd "$(dirname "$0")"
BEFEHL="${1:-}"
MARKE="$(date -u +%Y-%m-%dT%H-%M-%SZ)"
# Eine NOTIZ und keine Feststellung: wer diesen Befehl ausfuehren kann, kann sie
# auch setzen. Sie steht deshalb in der .env und nicht im Sicherheitsprotokoll.
WER="$(id -un 2>/dev/null || echo unbekannt)"
[ -n "${SUDO_USER:-}" ] && WER="$SUDO_USER (sudo als $WER)"

rot() { printf '\033[31m%s\033[0m\n' "$*"; }
fett() { printf '\033[1m%s\033[0m\n' "$*"; }

if [ ! -f docker-compose.yml ]; then
  rot "Hier steht keine docker-compose.yml. Das Skript gehoert ins Projektverzeichnis."
  exit 1
fi

# Ein Wegwerf-Container aus demselben Image. --rm, keine veroeffentlichten
# Ports, und das PROJEKTVERZEICHNIS als eigene Einhaengung -- die .env ist im
# Image nicht (.dockerignore), und der LAUFENDE Container soll sie auch
# weiterhin nicht sehen.
#
# EINGEHAENGT WIRD DAS VERZEICHNIS UND NICHT DIE DATEI. Eine Datei-Einhaengung
# haengt am Inode; schluessel.js schreibt die neue .env daneben und benennt sie
# um (Stolperstein 8), und ein Umbenennen tauscht den Verzeichniseintrag --
# die Einhaengung bliebe dann auf der alten Datei stehen, und auf dem Wirt
# aendert sich nichts. Der Wegwerf-Container sieht das Projektverzeichnis
# damit unter /app/wirt; er laeuft genau einen Befehl und wird danach entfernt.
lauf() {
  docker compose run --rm --no-deps \
    ${ENV_EINHAENGUNG:+-v "$PWD:/app/wirt:rw"} \
    ${NEUER_SCHLUESSEL:+-e "NEUER_SCHLUESSEL=$NEUER_SCHLUESSEL"} \
    kriterion node schluessel.js "$@"
}

case "$BEFEHL" in
  zeigen)
    ENV_EINHAENGUNG=""
    lauf zeigen
    ;;

  wechseln)
    fett "Schluesselwechsel — Kriterion"
    echo

    # Kommt der Schluessel aus der .env? Dann muss sie mit, sonst nicht.
    ENV_ARGUMENTE=()
    ENV_EINHAENGUNG=""
    if [ -f .env ] && grep -qE '^[[:space:]]*ENCRYPTION_KEY[[:space:]]*=[[:space:]]*[0-9a-fA-F]{64}[[:space:]]*$' .env; then
      ENV_EINHAENGUNG="ja"
      ENV_ARGUMENTE=(--env /app/wirt/.env)
      echo "  Der Schluessel steht in der .env — sie wird nachgezogen."
    else
      echo "  In der .env steht kein Schluessel — er liegt als data/encryption.key"
      echo "  neben der Datenbank und wird dort nachgezogen."
    fi

    # 1. Die .env sichern. VOR allem anderen: sie ist die kleinste Datei und
    #    die, ohne die nichts mehr startet.
    if [ -f .env ]; then
      cp -p .env ".env.vor-schluesselwechsel-$MARKE"
      echo "  .env gesichert: .env.vor-schluesselwechsel-$MARKE"
    fi

    # 2. Den neuen Wert HIER erzeugen und nicht im Container: so geht er nie
    #    ueber eine Ausgabe, sondern nur ueber die Umgebung des Kindprozesses.
    if ! command -v openssl >/dev/null 2>&1; then
      rot "openssl fehlt — ohne es gibt es keinen neuen Schluessel."
      exit 1
    fi
    NEUER_SCHLUESSEL="$(openssl rand -hex 32)"
    export NEUER_SCHLUESSEL

    # 3. Die Anlage anhalten.
    echo "  Anlage anhalten …"
    docker compose stop

    # 4. Das Datenverzeichnis sichern. PFLICHT.
    ZIEL="../kriterion-data-vor-schluesselwechsel-$MARKE"
    echo "  Datenverzeichnis sichern nach $ZIEL …"
    cp -a data "$ZIEL"

    # 5. Der Wechsel selbst.
    if lauf wechseln "${ENV_ARGUMENTE[@]}" --wer "$WER" --ja; then
      echo
      echo "  Anlage starten …"
      docker compose up -d
      echo
      fett "  Fertig. Jetzt das Protokoll ansehen:"
      echo "      docker compose logs --tail 30 kriterion"
      echo "  Erwartet wird die Zeile „Schluessel aus ENCRYPTION_KEY geladen.“"
      echo "  bzw. die Warnung, dass der Schluessel neben der Datenbank liegt."
      echo
      echo "  Die Sicherungen von VOR dem Wechsel oeffnen sich nur mit dem ALTEN"
      echo "  Schluessel. Er steht auskommentiert in der .env bzw. in"
      echo "  .env.vor-schluesselwechsel-$MARKE — und gehoert in den Passwortspeicher."
    else
      echo
      rot "  Der Wechsel ist nicht durchgelaufen. Die Anlage bleibt ANGEHALTEN."
      rot "  Lies die Meldung darueber, bevor du irgendetwas startest."
      echo "  Zurueck geht es so:"
      echo "      rm -rf data && cp -a $ZIEL data"
      echo "      cp .env.vor-schluesselwechsel-$MARKE .env"
      echo "      docker compose up -d"
      exit 1
    fi
    ;;

  *)
    cat <<'ENDE'

Kriterion — Schluesselwechsel auf dem Wirt

  ./schluessel.sh zeigen
      Woher der Schluessel kommt, wie gross die Datenbank ist, wie viel Platz
      frei ist, wann zuletzt gewechselt wurde. Aendert nichts.

  ./schluessel.sh wechseln
      Sichert .env und Datenverzeichnis, haelt die Anlage an, gibt der
      Datenbank einen neuen Schluessel, zieht die Ablage nach und startet
      wieder. Der alte Wert bleibt auskommentiert in der .env stehen -- er
      oeffnet alle Sicherungen von vor dem Wechsel.

  ES IST DER EINZIGE VORGANG, DER BEI FALSCHER HANDHABUNG ALLES VERLIERT.
  Probier ihn an einer Wegwerfanlage aus, bevor du ihn an der echten faehrst:
      mkdir /tmp/kriterion-probe && cd /tmp/kriterion-probe

ENDE
    [ -n "$BEFEHL" ] && exit 1 || exit 0
    ;;
esac
