const KONTROLLER =
  "https://script.google.com/macros/s/AKfycbxVYdciHTNOCCApm4CnTktYTC3NTX4dxHvhdq4zPsZb0lUWM_GbPsuw6mkXpWFhaG_fYg/exec";

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