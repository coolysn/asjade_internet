// Väike signaaliserver peer_id vahetamiseks + HTML server
const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

let telefoniPeerId = '';

app.use(cors());
app.use(express.json());

// Telefon saadab oma ID
app.post('/peer-id', (req, res) => {
  telefoniPeerId = req.body.id || '';
  console.log('Telefoni ID salvestatud:', telefoniPeerId);
  res.json({ ok: true });
});

// Arvuti loeb telefoni ID
app.get('/peer-id', (req, res) => {
  console.log('Arvuti küsib ID:', telefoniPeerId);
  res.json({ id: telefoniPeerId });
});

// Serveeeri staatilisi faile (peab olema pärast API route-sid)
app.use(express.static(path.join(__dirname)));

app.listen(3000, () => {
  console.log('');
  console.log('✓ Signaaliserver käib pordil 3000');
  console.log('');
  console.log('Arvutis: https://ubiquitous-guide-x5vrgvx49pvw2pgrv-3000.app.github.dev/naita.html');
  console.log('Telefonis: https://ubiquitous-guide-x5vrgvx49pvw2pgrv-3000.app.github.dev/index.html');
  console.log('');
  console.log('');
});
