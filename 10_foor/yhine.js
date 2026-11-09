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

