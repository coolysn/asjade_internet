const KONTROLLER =
  "https://script.google.com/macros/s/AKfycbyeP6TV-C4bfMThQ-iNky07Yi7Lyd5DE3oE7l375cXhn2sxAtjSGAUec1C4AY5_Uyb7gg/exec";

const vastus = document.getElementById("vastus");
const uusNupp = document.getElementById("uus");
const kysiNupp = document.getElementById("kysi");

async function saadaKask(kask) {
  uusNupp.disabled = true;
  kysiNupp.disabled = true;
  vastus.textContent = "Ootan teenuse vastust...";

  try {
    const aadress = KONTROLLER + "?kask=" + encodeURIComponent(kask);
    const paring = await fetch(aadress);

    if (!paring.ok) {
      throw new Error("HTTP " + paring.status);
    }

    vastus.textContent = await paring.text();
  } catch (viga) {
    vastus.textContent = "Päring ebaõnnestus: " + viga.message;
  } finally {
    uusNupp.disabled = false;
    kysiNupp.disabled = false;
  }
}

uusNupp.addEventListener("click", () => saadaKask("uus"));
kysiNupp.addEventListener("click", () => saadaKask("kysi"));