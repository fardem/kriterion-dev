/* ======== WAS VOR DEM ERSTEN ANSTRICH ZU SEHEN IST — 0.23.0 ========

   ER LÄUFT VOR DEM STILBLATT UND VOR app.js, und das ist seine ganze Aufgabe.
   Das Farbschema ist eine persönliche Einstellung und steht in der Datenbank;
   bekannt ist es erst nach `GET /api/settings`. Ohne diese Zeilen blitzt bei
   JEDEM Laden das dunkle Schema auf, bevor das helle greift — der bekannteste
   Fehler dieser Bauart, und er fällt erst im Feld auf.

   WARUM EINE EIGENE DATEI UND KEIN INLINE-SCRIPT. Genau so stand er zuerst
   im Kopf der Seite, und der Browser hat ihn abgewiesen:
     „Refused to execute inline script because it violates the following
      Content Security Policy directive: script-src 'self'"
   Die Regel steht seit jeher in server.js und ist Absicht — „script-src
   bleibt streng, dort liegt die Wirkung". Ein Hash oder ein Nonce hätte sie
   aufgeweicht oder eine zweite, von Hand gepflegte Wahrheit geschaffen (der
   Hash müsste bei jeder Änderung nachgezogen werden). Eine Datei neben
   app.js braucht nichts davon: sie kommt von 'self'.
   SIE STEHT IM FINGERPRINT, OHNE DASS JEMAND SIE EINTRÄGT — bildeFingerprint()
   liest alles unter public/.
   SIE LÄDT SYNCHRON, ohne `defer` und ohne `async`: beides ließe sie NACH dem
   Stilblatt laufen, und dann hätte sie ihren Zweck verfehlt.

   `localStorage` IST KEINE ZWEITE WAHRHEIT, SONDERN DAS GEDÄCHTNIS DER
   LETZTEN. Der Server bleibt die Wahrheit: ladeEinstellungen() überschreibt
   den Wert bei jedem Laden, und er wird nie zurückgeschickt. Er wird gelesen,
   damit nichts aufblitzt — und sonst zu nichts.

   DER RANDFALL IST BENANNT UND HINGENOMMEN: zwei Benutzer an einem Browser.
   Der zweite sieht für Sekundenbruchteile das Schema des ersten, dann
   berichtigt der Server. Das ist billiger als ein Blitzen bei jedem Laden für
   jeden.

   `try/catch` IST PFLICHT: in einem privaten Fenster wirft schon der Zugriff,
   und dann muss die Vorgabe trotzdem stehen.

   OHNE GEDÄCHTNIS: DUNKEL. Wer nichts eingestellt hat, sieht, was er heute
   sieht — auch vor der Anmeldung, denn start() läuft erst danach.

   DER NAME DES SCHLÜSSELS STEHT HIER UND IN app.js (THEME_KEY). Zwei
   Stellen für dasselbe Wort, und es geht nicht anders: diese Datei läuft,
   bevor es app.js gibt. Eine Prüfung hält beide gegeneinander.

   DER ALTE NAME WIRD NOCH GELESEN — 0.24.1. Bis 0.24.0 hieß der Schlüssel
   `kriterion.thema`; ohne diese Zeile zeigte die Seite beim ERSTEN Aufschlag
   nach dem Einspielen das Vorgabeschema statt des gewählten. */
(function () {
  try {
    var t = localStorage.getItem('kriterion.theme') || localStorage.getItem('kriterion.thema');
    var light = t === 'light' || (t === 'device' && window.matchMedia
      && window.matchMedia('(prefers-color-scheme: light)').matches);
    document.documentElement.dataset.theme = light ? 'light' : 'dark';
  } catch (e) {
    document.documentElement.dataset.theme = 'dark';
  }
})();
