/* Setzt data-theme am <html>, bevor Stilblatt und app.js laden -- sonst
   blitzt bei jedem Laden das dunkle Schema auf. Eigene Datei und kein Inline-
   Script, weil script-src auf 'self' steht; synchron, ohne defer und ohne
   async. Ohne gespeicherten Wert: dunkel. Der Schluesselname steht auch in
   app.js als THEME_KEY, der alte wird noch gelesen. */
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
