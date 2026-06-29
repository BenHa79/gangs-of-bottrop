// ============================================================
// API — Datenschicht — Der Pate von Bottrop v4
// ============================================================
// Alle Operationen gehen über den Server (PostgreSQL).
// Kein localStorage mehr — Spielstand ist kontogebunden.
// ============================================================

// Standard-HQ (kann in Account-Erstellung überschrieben werden)
const DEFAULT_HQ = {
  address: 'Sterkrader Straße 211, Bottrop',
  lat:     51.5178,
  lng:     6.9008,
};

const api = {

  // ── Spielstand speichern (fire-and-forget) ──────────────────
  // Gibt sofort true zurück — Fehler landen in der Konsole.
  save(data) {
    if (!data) return;
    fetch('/api/player', {
      method:  'PUT',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(data),
    }).catch(e => console.error('[api.save]', e));
    return true;
  },

  // ── Spielstand laden ────────────────────────────────────────
  async load() {
    try {
      const res = await fetch('/api/me');
      if (!res.ok) return null;
      const data = await res.json();
      return data.player || null;
    } catch (e) {
      console.error('[api.load]', e);
      return null;
    }
  },

  // ── Session prüfen (beim App-Start) ─────────────────────────
  // Gibt G zurück wenn Cookie gültig, sonst null.
  async checkSession() {
    try {
      const res = await fetch('/api/me');
      if (!res.ok) return null;
      const data = await res.json();
      return data.player || null;
    } catch (e) {
      return null;
    }
  },

  // ── Einloggen ───────────────────────────────────────────────
  async login(username, password) {
    const res = await fetch('/api/login', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login fehlgeschlagen');
    return data.player;
  },

  // ── Registrieren ────────────────────────────────────────────
  async register(username, password) {
    const res = await fetch('/api/register', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Registrierung fehlgeschlagen');
    return data.player;
  },

  // ── Ausloggen ───────────────────────────────────────────────
  async logout() {
    await fetch('/api/logout', { method: 'POST' }).catch(() => {});
    location.reload();
  },

  // ── Spielstand löschen (lokal) ──────────────────────────────
  clear() { /* kein localStorage mehr — Logout stattdessen */ },

  // ── Gebäude-Besitz speichern (owned = true/false) ───────────
  saveBuilding(osmId, owned) {
    if (!G) return;
    // Lokalen State sofort aktualisieren (für reaktive UI)
    if (!G.buildingStatus) G.buildingStatus = {};
    if (owned) G.buildingStatus[String(osmId)] = true;
    else       delete G.buildingStatus[String(osmId)];

    // Server asynchron informieren
    const method = owned ? 'POST' : 'DELETE';
    fetch(`/api/buildings/${osmId}`, { method })
      .catch(e => console.error('[api.saveBuilding]', e));
    api.save(G);
  },

  // ── Gebäude-Status (lokaler Cache) ──────────────────────────
  getBuilding(osmId) {
    if (!G?.buildingStatus) return false;
    return G.buildingStatus[String(osmId)] === true;
  },

  // ── Alle Gebäude vom Server laden ───────────────────────────
  // Gibt Array zurück: [{ osm_id, owner_id, owner_name, ... }]
  async fetchBuildings() {
    try {
      const res = await fetch('/api/buildings');
      if (!res.ok) return { buildings: [], userId: null };
      return await res.json();          // { ok, userId, buildings }
    } catch (e) {
      console.error('[api.fetchBuildings]', e);
      return { buildings: [], userId: null };
    }
  },

  // ── Alle eigenen Gebäude als Array zurückgeben ──────────────
  getAllOwnedBuildings() {
    if (!G?.buildingStatus) return [];
    return Object.keys(G.buildingStatus).filter(k => G.buildingStatus[k] === true);
  },
};
