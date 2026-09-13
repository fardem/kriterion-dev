/* DIE GLEICHLAUTPROBE -- 0.31.1.

   SIE BEANTWORTET GENAU EINE FRAGE: sagt die Oberflaeche nach dem Umbau
   dasselbe wie vorher? Die Runde 0.31.1 verspricht das ausdruecklich -- sie
   fasst die ABLAGE der Saetze an und nicht ihren Wortlaut. Ohne diese Probe
   waere das Versprechen Geschwaetz.

   AUFRUF:
     node tools/gleichlaut.js <Ausgabedatei>
     APP=<app.js> LANGDIR=<Verzeichnis> node tools/gleichlaut.js <Ausgabe>
   Der zweite Weg misst einen ALTEN Stand; so entsteht der Vergleichspunkt.

   WAS SIE LIEST: den ganzen Quelltext, jeden Textruf durch seinen Wert
   ersetzt. Sie haengt an KEINER Zeilennummer -- verschmelzen drei Schluessel
   zu einem, kommt dieselbe Summe heraus. Genau das ist der Beleg.

   WAS SIE WEGWIRFT, und jedes Stueck hat seinen Grund:
     KOMMENTARE          -- ein neuer Absatz Erklaerung ist kein Bildschirmtext
     DIE HELFER SELBST   -- wer tMark() umbaut, aendert nicht, was dasteht
     MARKUP              -- ersatzlos, nicht auf ein Leerzeichen: ein
                            `</strong>` trennt im Browser keine Woerter
     VORLAGENKLAMMERN    -- drei Rufe nebeneinander tragen drei ${ }, ein
                            verschmolzener nur eines
     WEISSRAUM           -- Form, kein Text

   WAS SIE AUFLOEST: die Werte eines Rufs, wie fillSentence() es zur Laufzeit
   tut. Ein Einschub `${d.days || 30}` wird in dieser Runde zu `{days}` im Satz
   und zu einem Argument am Ruf; am Bildschirm steht dieselbe Zahl.

   SECHS SUMMEN UND NICHT DREI: je Sprache einmal fuer die Einzahl und einmal
   fuer die Mehrzahl. Stellte sie eine Mehrzahl als `{eins|andere}` dar, waere
   sie blind fuer den Handgriff dieser Runde -- verschmelzen zwei
   Mehrzahlobjekte zu einem, sieht dieselbe Ausgabe voellig anders aus.

   JEDER DIESER SECHS PUNKTE IST AN EINEM FEHLALARM GELERNT WORDEN, und der
   erste war der teuerste: die Probe meldete einen Verlust am eigenen
   Kommentar. EINE PROBE, DIE FALSCHEN ALARM GIBT, WIRD ABGESCHALTET -- und
   dann faengt sie auch den echten Verlust nicht mehr. */
const fs=require('fs');
const L={}; for (const c of ['de','en','tr']) L[c]=JSON.parse(fs.readFileSync((process.env.LANGDIR || 'public/languages')+'/'+c+'.json','utf8'));

/* Den GANZEN Ruf lesen, mit gezaehlten Klammern -- ein Ruf endet nicht am
   Zeilenende, und sein erstes Argument kann selbst ein Ruf sein. Derselbe
   Fehlgriff wie bei der stummen Gegenprobe 953 in 0.31.0. */
/* ZWEIMAL GERECHNET, EINMAL JE MEHRZAHLFORM -- und das ist keine Feinheit.
   Stellte die Probe eine Mehrzahl als `{eins|andere}` dar, waere sie blind
   fuer genau den Handgriff dieser Runde: verschmelzen zwei Mehrzahlobjekte zu
   einem, sieht dieselbe Ausgabe voellig anders aus. Je Form einmal gerechnet,
   bleibt der Vergleich ehrlich. */
/* DIE WERTE EINES RUFS EINSETZEN -- dasselbe, was fillSentence() zur Laufzeit
   tut. OHNE DAS IST DIE PROBE BLIND FUER DEN HAEUFIGSTEN HANDGRIFF DIESER
   RUNDE: ein Einschub `${d.days || 30}` aus dem Quelltext wird zu `{days}` im
   Satz und zu einem Argument am Ruf. Am Bildschirm steht dieselbe Zahl; ohne
   diese Einsetzung meldete die Probe einen Verlust, wo keiner ist. */
function setzeWerte(v, inhalt, c, form, ersetzeF) {
  const ab=inhalt.indexOf('{'), zu=inhalt.lastIndexOf('}');
  if (ab<0 || zu<ab) return v;
  const roh=ersetzeF(inhalt.slice(ab+1,zu), c, form);
  const stuecke=[]; let tiefe=0, akt='';
  for (const ch of roh) {
    if ('({['.includes(ch)) tiefe++; else if (')}]'.includes(ch)) tiefe--;
    if (ch===',' && tiefe<=0) { stuecke.push(akt); akt=''; } else akt+=ch; }
  if (akt.trim()) stuecke.push(akt);
  for (const st of stuecke) { const d=st.indexOf(':'); if (d<0) continue;
    v=v.split('{'+st.slice(0,d).trim()+'}').join(st.slice(d+1).trim()); }
  return v;
}
function ersetze(txt, c, form) {
  const wert = k => { const v=L[c][k];
    return typeof v==='string' ? v : (v ? (v[form] !== undefined ? v[form] : v.other) : '??'+k); };
  let raus='', i=0;
  const RX=/\b(tMarks|tMark|tH|t)\(\s*'([^']+)'/g;
  let m;
  while ((m=RX.exec(txt))!==null) {
    if (m.index < i) continue;
    raus += txt.slice(i, m.index);
    /* bis zur schliessenden Klammer des Rufs */
    let j=m.index; while (txt[j]!=='(') j++;
    let tiefe=1; j++; const von=j;
    while (j<txt.length && tiefe>0) { const ch=txt[j]; if(ch==='(')tiefe++; else if(ch===')')tiefe--; j++; }
    const inhalt=txt.slice(von, j-1);
    if (m[1]==='tMark') {
      const zw=inhalt.match(/'([^']+)'\s*,\s*'([^']+)'/);
      raus += zw ? setzeWerte(wert(zw[1]).split('{word}').join(wert(zw[2])), inhalt, c, form, ersetze) : '??tMark';
    } else if (m[1]==='tMarks') {
      raus += setzeWerte(wert(m[2]), inhalt, c, form, ersetze);
    } else raus += setzeWerte(wert(m[2]), inhalt, c, form, ersetze);
    i=j; RX.lastIndex=j;
  }
  raus += txt.slice(i);
  return raus;
}
/* KOMMENTARE FALLEN WEG, und das ist keine Kleinigkeit: die Probe soll sagen,
   ob die OBERFLAECHE dasselbe sagt. Ein neuer Absatz Erklaerung im Quelltext
   hat damit nichts zu tun -- und genau daran ist die erste Fassung dieser
   Probe gerissen, am eigenen Kommentar zu tMarkText. */
const ohneKommentar = t => t.replace(/\/\*[\s\S]*?\*\//g,' ').replace(/^[ \t]*\/\/.*$/gm,' ');
const app=ohneKommentar(fs.readFileSync(process.env.APP || 'public/app.js','utf8'));
/* UND DIE HELFER SELBST FALLEN AUCH WEG. Sie sind Quelltext und kein
   Bildschirmtext; wer tMark() umbaut, aendert nicht, was dasteht. Die erste
   Fassung dieser Probe hat genau daran gemeldet, als tMarkText durch tMarks
   ersetzt wurde -- ein Fehlalarm, und ein Fehlalarm macht eine Probe wertlos.
   GESCHNITTEN WIRD ZEILENWEISE UND NAMENTLICH: eine Zeile, die einen Helfer
   ZUWEIST, und alles bis zum Ende dieser Zuweisung. Die zweite Fassung suchte
   stattdessen nach dem naechsten `};` und schnitt in einer Datei, die tMarks
   noch nicht kannte, den halben Kopf weg. */
const ohneHelfer = t => { const raus=[]; let tiefe=null;
  for (const z of t.split('\n')) {
    if (tiefe===null && /^const tMark\w* = /.test(z)) tiefe=0;
    if (tiefe!==null) {
      for (const ch of z) { if ('({['.includes(ch)) tiefe++; else if (')}]'.includes(ch)) tiefe--; }
      if (tiefe<=0 && /[;}]\s*$/.test(z)) tiefe=null;
      continue; }
    raus.push(z); }
  return raus.join('\n'); };
const raus={};
for (const c of ['de','en','tr']) for (const form of ['one','other']) {
  raus[c+'/'+form]=ersetze(ohneHelfer(app),c,form)
    /* MARKUP FAELLT ERSATZLOS -- nicht auf ein Leerzeichen. Ein `</strong>`
       trennt im Browser keine Woerter, und wer es zum Leerzeichen macht, liest
       „Benutzer , seit" vor dem Umbau und „Benutzer, seit" danach und haelt
       den Unterschied fuer einen Verlust. Es war keiner. */
    .replace(/<[^>]+>/g,'')
    .replace(/`/g,'')
    /* UND DIE VORLAGENKLAMMERN AUCH. Drei Rufe nebeneinander tragen drei
       ${ } -- ein verschmolzener nur noch eines. Zaehlte die Probe sie mit,
       waere sie in dem Augenblick rot, in dem die Runde ihre Arbeit tut. */
    .replace(/\$\{|\}/g,'')
    .replace(/\s+/g,' ');          // und Weissraum auch
}
fs.writeFileSync(process.argv[2], JSON.stringify(raus));
const cr=require('crypto');
for (const k of Object.keys(raus))
  console.log(k.padEnd(10), cr.createHash('sha256').update(raus[k]).digest('hex').slice(0,16), raus[k].length+' Zeichen');
