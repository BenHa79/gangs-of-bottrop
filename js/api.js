// ============================================================
// API — Datenschicht — Der Pate von Bottrop v4
// ============================================================
// Alle Speicher-/Ladeoperationen laufen ausschließlich hier.
// Tausche DIESE Datei gegen eine Server-Version aus —
// kein anderer Code muss sich ändern.
//
// ── MULTIPLAYER TODO ─────────────────────────────────────────
// Schritte für LAN-Multiplayer:
//  1. npm install express socket.io  (im /server/ Verzeichnis)
//  2. Erstelle server/server.js:
//       const io = require('socket.io')(httpServer);
//       io.on('connection', socket => { ... });
//  3. Ersetze api.save() / api.load() durch socket.emit() Calls
//  4. Alle Stubs unten zeigen das Interface — Signaturen bleiben gleich
//  5. LAN-Test: alle Browser → http://<Host-IP>:3000
//  6. Alle Funktionen sind bereits async-kompatibel (return Promise)
// ─────────────────────────────────────────────────────────────

const SAVE_KEY = 'der_pate_v4';

// ── Standard-HQ (Sterkrader Straße 211, Bottrop) ─────────────
// TODO Account-Erstellung: Spieler gibt eigene Adresse ein,
//   wird per Nominatim geocodiert und ersetzt DEFAULT_HQ.
//   Script: python tools/geocode_hq.py "Adresse, Ort"
const DEFAULT_HQ = {
  address: 'Sterkrader Straße 211, Bottrop',
  lat:      51.5178,
  lng:      6.9008,
};

const api = {

  // ── Spielstand speichern ─────────────────────────────────
  // Gibt true zurück wenn erfolgreich, false bei Fehler
  save(data) {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(data));
      return true;
    } catch (e) {
      console.error('[api.save] Fehler:', e);
      return false;
    }
  },

  // ── Spielstand laden ─────────────────────────────────────
  // Gibt das gespeicherte Objekt zurück, oder null
  load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) return JSON.parse(raw);
      // Migration: v3-Spielstand übernehmen
      const v3 = localStorage.getItem('der_pate_v3');
      if (v3) return JSON.parse(v3);
    } catch (e) {
      console.error('[api.load] Fehler:', e);
    }
    return null;
  },

  // ── Spielstand löschen ───────────────────────────────────
  clear() {
    localStorage.removeItem(SAVE_KEY);
  },

  // ── Gebäude-Besitz nach OSM-ID speichern ─────────────────
  // Speichert NUR die OSM-ID — nie Name oder Koordinaten (können sich ändern).
  // osmId: number oder string (OSM way ID, ändert sich nie)
  // owned: true = eingenommen, false = freigeben
  saveBuilding(osmId, owned) {
    if (!G) return;
    if (!G.buildingStatus) G.buildingStatus = {};
    const key = String(osmId);
    if (owned) G.buildingStatus[key] = true;
    else       delete G.buildingStatus[key];
    api.save(G);
  },

  // ── Gebäude-Status nach OSM-ID lesen ─────────────────────
  getBuilding(osmId) {
    if (!G?.buildingStatus) return false;
    return G.buildingStatus[String(osmId)] === true;
  },

  // ── Alle eingenommenen Gebäude als Array zurückgeben ─────
  // Gibt Array von osmId-Strings zurück (nur owned === true)
  getAllOwnedBuildings() {
    if (!G?.buildingStatus) return [];
    return Object.keys(G.buildingStatus).filter(k => G.buildingStatus[k] === true);
  },

  // ── MULTIPLAYER STUBS ─────────────────────────────────────
  // Identisches Interface wie oben — einfach hier implementieren

  // async saveRemote(playerId, data) {
  //   const res = await fetch(`/api/player/${playerId}/save`, {
  //     method:  'POST',
  //     headers: { 'Content-Type': 'application/json' },
  //     body:    JSON.stringify(data),
  //   });
  //   return res.ok;
  // },

  // async loadRemote(playerId) {
  //   const res = await fetch(`/api/player/${playerId}`);
  //   return res.ok ? res.json() : null;
  // },
  // // Echtzeit-Aktion an alle Mitspieler senden (Socket.io)
  // broadcastAction(type, payload) {
  //   if (window._socket) window._socket.emit('game:action', { type, payload });
  // },

  // // Gebäude-Besitz synchronisieren (Multiplayer-Konflikt-Lösung)
  // async syncBuildings(remoteStatus) {
  //   if (!G) return;
  //   G.buildingStatus = { ...remoteStatus };
  //   api.save(G);
  // },
};
