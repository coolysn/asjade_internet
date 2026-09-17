const WORDS = [
  { word: "KOSK", category: "LOODUS" },
  { word: "VIRMALINE", category: "LOODUS" },
  { word: "KOMPASS", category: "REIS" },
  { word: "KÜÜNLALÕKE", category: "KODU" },
  { word: "RABARBER", category: "TOIT" },
  { word: "KARUSSELL", category: "LINN" }
];
const ALPHABET = "AÄBCDEFGHIIJKLMNOÕPQRSTUÜVWXYZ".split("");
const STORAGE_KEY = "sonajaht-state";

class WordService {
  constructor() {
    this.state = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null") || {
      wordIndex: 0, round: 4, score: 1, streak: 2, mistakes: 0, guessed: [], events: [
        { time: "10:42:08", text: "Voor 04 alustati." },
        { time: "10:42:12", text: "Sõna valitud teenusest." },
        { time: "10:42:18", text: "Kontroller on valmis." }
      ]
    };
  }
  get current() { return WORDS[this.state.wordIndex % WORDS.length]; }
  save() { localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state)); }
  addEvent(text) {
    const now = new Date().toLocaleTimeString("et-EE", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    this.state.events.unshift({ time: now, text });
    this.state.events = this.state.events.slice(0, 5);
  }
  newWord() {
    this.state.wordIndex = (this.state.wordIndex + 1) % WORDS.length;
    this.state.round += 1;
    this.state.mistakes = 0;
    this.state.guessed = [];
    this.addEvent(`Uus sõna: ${this.current.category.toLowerCase()}.`);
    this.save();
  }
  askWord() { this.addEvent("Sama sõna saadeti küsimiseks."); this.save(); }
  guess(letter) {
    if (this.state.guessed.includes(letter) || this.isOver()) return;
    this.state.guessed.push(letter);
    if (!this.current.word.includes(letter)) this.state.mistakes += 1;
    if (this.isWon()) { this.state.score += 1; this.state.streak += 1; this.addEvent("Sõna arvatud. Tubli töö!"); }
    if (this.state.mistakes === 6) { this.state.streak = 0; this.addEvent("Voor lõppes: sõna jäi peitu."); }
    this.save();
  }
  isWon() { return [...new Set(this.current.word)].every((letter) => this.state.guessed.includes(letter)); }
  isOver() { return this.isWon() || this.state.mistakes >= 6; }
}

const service = new WordService();
const $ = (selector) => document.querySelector(selector);

function render() {
  const { state, current } = service;
  $("#roundTitle").textContent = `Voor ${String(state.round).padStart(2, "0")}`;
  $("#categoryLabel").textContent = current.category;
  $("#roundStat").textContent = String(state.round).padStart(2, "0");
  $("#scoreStat").textContent = String(state.score).padStart(2, "0");
  $("#streakStat").textContent = String(state.streak).padStart(2, "0");
  $("#mistakeCount").textContent = state.mistakes;
  $("#wordDisplay").textContent = [...current.word].map((letter) => state.guessed.includes(letter) || service.isOver() ? letter : "_").join(" ");
  $("#usedLetters").textContent = state.guessed.length ? state.guessed.join(" · ") : "—";
  $("#eventCount").textContent = `${String(state.events.length).padStart(2, "0")} sündmust`;
  $("#gameMessage").textContent = service.isWon() ? "Sõna on leitud. Alusta uut vooru!" : state.mistakes >= 6 ? `Õige sõna oli ${current.word}.` : "Vali täht või küsi mängijalt vihjet.";
  $("#eventLog").innerHTML = state.events.map((event) => `<div class="event"><time>${event.time}</time><p>${event.text}</p></div>`).join("");
  ["head", "body"].forEach((id) => $("#" + id).classList.toggle("visible", state.mistakes >= (id === "head" ? 1 : 2)));
  $("#keyboard").innerHTML = ALPHABET.map((letter) => `<button class="key ${state.guessed.includes(letter) ? (current.word.includes(letter) ? "hit" : "miss") : ""}" type="button" ${state.guessed.includes(letter) || service.isOver() ? "disabled" : ""} data-letter="${letter}">${letter}</button>`).join("");
}

$("#newWordButton").addEventListener("click", () => { service.newWord(); render(); });
$("#askWordButton").addEventListener("click", () => { service.askWord(); render(); $("#gameMessage").textContent = "Küsimus on mängijale saadetud."; });
$("#keyboard").addEventListener("click", (event) => { if (event.target.dataset.letter) { service.guess(event.target.dataset.letter); render(); } });
$("#sessionId").textContent = `SJ-${String((service.state.round * 37) % 1000).padStart(3, "0")}`;
render();