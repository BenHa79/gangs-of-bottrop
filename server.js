// ============================================================
// SERVER — Der Pate von Bottrop v4
// ============================================================
// Startet einen lokalen Entwicklungsserver auf Port 3000.
// Liefert alle statischen Dateien aus dem Projektordner aus.
//
// Start: node server.js
// Spiel: http://localhost:3000
//
// ── MULTIPLAYER TODO ─────────────────────────────────────────
// Socket.io ist bereits installiert und hier eingebunden.
// Um Multiplayer zu aktivieren:
//
//  1. Den Block  /* MULTIPLAYER_START … MULTIPLAYER_END */
//     unten auskommentieren
//  2. In js/api.js die saveRemote() / loadRemote() Stubs
//     implementieren (Socket.io Client: io() auf Port 3000)
//  3. Spieler-State im io.on('connection') Block verwalten
//  4. Alle Browser → http://<Host-IP>:3000
//
// Benötigte Socket.io Events (Vorschlag):
//   Client → Server:  'game:save'   { playerId, state }
//   Client → Server:  'game:action' { type, payload }
//   Server → Client:  'game:sync'   { buildings[] }
//   Server → Client:  'game:event'  { type, data }
// ─────────────────────────────────────────────────────────────

'use strict';

const express   = require('express');
const http      = require('http');
const path      = require('path');
// const { Server } = require('socket.io');   // ← MULTIPLAYER: Zeile aktivieren

const PORT = process.env.PORT || 3000;
const app  = express();
const server = http.createServer(app);

// ── MULTIPLAYER_START — auskommentiert bis Multiplayer aktiv ──
//
// const io = new Server(server, {
//   cors: { origin: '*' }
// });
//
// const players = {};  // { socketId → { playerId, state } }
//
// io.on('connection', socket => {
//   console.log(`[socket] Verbunden: ${socket.id}`);
//
//   socket.on('game:save', ({ playerId, state }) => {
//     players[socket.id] = { playerId, state };
//     // Gebäude-Besitz an alle anderen senden
//     socket.broadcast.emit('game:sync', {
//       buildings: state.buildings,
//       playerName: state.player.name,
//     });
//   });
//
//   socket.on('game:action', ({ type, payload }) => {
//     socket.broadcast.emit('game:event', { type, payload });
//   });
//
//   socket.on('disconnect', () => {
//     console.log(`[socket] Getrennt: ${socket.id}`);
//     delete players[socket.id];
//   });
// });
//
// ── MULTIPLAYER_END ───────────────────────────────────────────

// Statische Dateien: gesamtes Projektverzeichnis
app.use(express.static(path.join(__dirname)));

// Alle anderen Routen → index.html (Single-Page-App)
app.get('/{*path}', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Server starten
server.listen(PORT, () => {
  console.log('');
  console.log('  ╔══════════════════════════════════════╗');
  console.log(`  ║  Der Pate von Bottrop — Server v4    ║`);
  console.log(`  ║  http://localhost:${PORT}               ║`);
  console.log('  ╚══════════════════════════════════════╝');
  console.log('');
  console.log('  → Spiel im Browser öffnen:');
  console.log(`    http://localhost:${PORT}`);
  console.log('');
  console.log('  → Server stoppen: Ctrl+C');
  console.log('');
});
