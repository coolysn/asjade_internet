//ühine kood - kella ja foori loogika

const PAEV = 86400000;   // ühes päevas on nii mitu millisekundit

// ---------- Seaded ----------
// Juhtpaneel salvestab seaded brauseri mällu (localStorage),
// veebifoor loeb need sealt.

const VAIKE_SEADED = { reziim: "AUTO", auto: 20, jalak: 10, nihe: 0, nupuAlgus: -1 };

function loeSeaded() {
    try {
        return Object.assign({}, VAIKE_SEADED,  JSON.parse(localStorage.getItem("foorSeaded")))
    } catch(e) {
        return Object.assign({}, VAIKE_SEADED);
    }
}

function salvestaSeaded(s){
    localStorage.setItem("foorSeaded", JSON.stringify(s));
}

// foori sammud
// Järjekord ja kestused (millisekundites). Sama tabel, mis Arduino koodis.

function sammud(s){
    return [
        ["AUTODE_ROHELINE", s.auto * 1000],
        ["ROHELINE_VILGUB", 3000],
        ["KOLLANE",         3000],
        ["KOIK_PUNASED_1",  2000],
        ["JALAK_ROHELINE",  s.jalak * 1000],
        ["JALAK_VILGUB",    4000],
        ["KOIK_PUNASED_2",  2000],
        ["PUNANE_KOLLANE",  2000]
    ];
}

// Terve tsükli pikkus millisekundites

function tsykliPikkus(s) {
    let kokku = 0;
    for (const samm of sammud(s)) kokku += samm[1];
    return kokku;
}

// Mis samm on käimas, kui tsükli algusest on möödunud t millisekundit
function sammAjal(s, t){
    for (const [nimi, kestus] of sammud(s)){
        if (t < kestus) return nimi;
        t -= kestus;
    }
    return  "AUTODE_ROHELINE";
}

// Foori olek antud kellaajal.
// kell = millisekundid keskööst (UTC), nihe = rohelise laine nihe sekundites
function foorOlek(s, kell, nihe) {
  if (s.reziim == "VILKUV") return "KOLLANE_VILGUB";

  if (s.reziim == "NUPP") {
    const d = kell - s.nupuAlgus;                          // kui kaua tagasi ülekäik algas
    const ylekaiguPikkus = tsykliPikkus(s) - s.auto * 1000;
    if (s.nupuAlgus < 0 || d < 0 || d >= ylekaiguPikkus) return "AUTODE_ROHELINE";
    return sammAjal(s, s.auto * 1000 + d);                 // alustame vilkuvast rohelisest
  }

  // AUTO: kõik foorid arvutavad sama kella järgi, nihe lükkab foori edasi/tagasi
  const T = tsykliPikkus(s);
  const t = ((kell - nihe * 1000) % T + T) % T;            // + T teeb ka negatiivse nihke korda
  return sammAjal(s, t);
}

// Iga oleku tuled: autode punane, kollane, roheline, jalakäija punane, roheline
// 0 = kustus, 1 = põleb, 2 = vilgub
const TULED = {
  AUTODE_ROHELINE: [0,0,1, 1,0],
  ROHELINE_VILGUB: [0,0,2, 1,0],
  KOLLANE:         [0,1,0, 1,0],
  KOIK_PUNASED_1:  [1,0,0, 1,0],
  JALAK_ROHELINE:  [1,0,0, 0,1],
  JALAK_VILGUB:    [1,0,0, 0,2],
  KOIK_PUNASED_2:  [1,0,0, 1,0],
  PUNANE_KOLLANE:  [1,1,0, 1,0],
  KOLLANE_VILGUB:  [0,2,0, 0,0]
};

// ---------- Kell ----------
// kellaParandus = kui palju arvuti kell erineb ajateenuse kellast (ms)
let kellaParandus = 0;

// Praegune kellaaeg millisekundites keskööst (UTC)
function kell() {
  return ((Date.now() + kellaParandus) % PAEV + PAEV) % PAEV;
}

// Küsib õiget aega internetist. Kui esimene teenus ei vasta, proovib teist.
async function synkroniseeriKell() {
  const teenused = [
    ["https://worldtimeapi.org/api/timezone/Etc/UTC",          j => Date.parse(j.utc_datetime)],
    ["https://timeapi.io/api/Time/current/zone?timeZone=UTC",  j => Date.parse(j.dateTime + "Z")]
  ];
  for (const [url, loeAeg] of teenused) {
    try {
      const t0 = Date.now();                       // millal küsisime
      const vastus = await fetch(url, { cache: "no-store" });
      const t1 = Date.now();                       // millal vastus tuli
      const serveriAeg = loeAeg(await vastus.json());
      if (isNaN(serveriAeg)) continue;
      // Server vastas umbes päringu keskel, seega liidame poole teekonna ajast
      kellaParandus = serveriAeg + (t1 - t0) / 2 - t1;
      return new URL(url).hostname + " (parandus " + Math.round(kellaParandus) + " ms)";
    } catch (e) {
      // see teenus ei vastanud, proovime järgmist
    }
  }
  kellaParandus = 0;
  return "arvuti oma kell (ajateenus ei vastanud)";
}