// Trips-traps-trull: staatilised lehed + mängu seis + telefoni peer ID
const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

const TYHI_LAUD = '_________';
const SOBIVAD_KES = /^(uus|sinine|punane|lõpp-sinine|lõpp-punane|lõpp-viik)$/;

let seis = { laud: TYHI_LAUD, kes: 'uus', ruut: '-', versioon: 0 };
let peer = { id: '', aeg: 0 };

app.use(cors());
app.use(express.json());

// Telefon saadab oma peer ID (ja värskendab seda perioodiliselt)
app.post('/peer-id', (req, res) => {
  let id = String((req.body && req.body.id) || '');
  if (!/^[\w-]{1,100}$/.test(id)) return res.status(400).json({ ok: false });
  if (id !== peer.id) console.log('Telefoni ID:', id);
  peer = { id, aeg: Date.now() };
  res.json({ ok: true });
});

// Arvuti küsib telefoni ID ja selle vanust millisekundites
app.get('/peer-id', (req, res) => {
  res.set('Cache-Control', 'no-store');
  res.json({ id: peer.id, vanus: peer.id ? Date.now() - peer.aeg : null });
});

// Telefon saadab mängu seisu
app.post('/kaik', (req, res) => {
  let { kes, ruut, laud } = req.body || {};
  if (!SOBIVAD_KES.test(String(kes)) || !/^[_XO]{9}$/.test(String(laud))) {
    return res.status(400).json({ ok: false });
  }
  seis = { laud, kes, ruut: String(ruut || '-').slice(0, 2), versioon: seis.versioon + 1 };
  console.log('Käik:', seis.kes, seis.ruut, seis.laud);
  res.json({ ok: true });
});

// Arvuti loeb mängu seisu
app.get('/seis', (req, res) => {
  res.set('Cache-Control', 'no-store');
  res.json(seis);
});

app.use(express.static(path.join(__dirname)));

app.listen(3000, () => {
  console.log('✓ Server käib pordil 3000');
  console.log('Arvutis:  https://ubiquitous-guide-x5vrgvx49pvw2pgrv-3000.app.github.dev/naita.html');
  console.log('Telefonis: https://ubiquitous-guide-x5vrgvx49pvw2pgrv-3000.app.github.dev/index.html');
});
