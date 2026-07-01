// ============================================================
// SERVER — Der Pate von Bottrop v4
// ============================================================
// Start lokal:  node server.js
// Spiel:        http://localhost:3000
// DB init:      npm run db:init
// ============================================================

'use strict';

const express      = require('express');
const http         = require('http');
const path         = require('path');
const { Pool }     = require('pg');
const bcrypt       = require('bcryptjs');
const cookieParser = require('cookie-parser');
const crypto       = require('crypto');
const rateLimit    = require('express-rate-limit');
const { XP_TABLE, STAT_UPGRADE_INCREMENTS, BASE_STATS, findKnownItem } = require('./server/gameData');

const PORT   = process.env.PORT || 3000;
const app    = express();
const server = http.createServer(app);

// ── Datenbank-Pool ────────────────────────────────────────────
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

pool.connect()
  .then(c => { c.release(); console.log('  DB verbunden.'); })
  .catch(e => console.warn('  DB nicht erreichbar:', e.message));

// ── Middleware ────────────────────────────────────────────────
app.use(express.json());
app.use(cookieParser());

// Nur die tatsächlich benötigten Ordner öffentlich servieren —
// server.js, package.json, db/, tools/ etc. bleiben unzugänglich.
app.use('/css',    express.static(path.join(__dirname, 'css')));
app.use('/js',     express.static(path.join(__dirname, 'js')));
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// Brute-Force-Schutz für Login/Registrierung
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit:    20,
  standardHeaders: true,
  legacyHeaders:   false,
  message: { error: 'Zu viele Versuche. Bitte später erneut versuchen.' },
});

// ── Auth-Middleware ───────────────────────────────────────────
async function requireAuth(req, res, next) {
  const token = req.cookies.session_token;
  if (!token) return res.status(401).json({ error: 'Nicht eingeloggt' });
  try {
    const { rows } = await pool.query(
      'SELECT user_id FROM sessions WHERE token = $1 AND expires_at > NOW()',
      [token]
    );
    if (!rows.length) return res.status(401).json({ error: 'Session abgelaufen' });
    req.userId = rows[0].user_id;
    next();
  } catch (e) {
    console.error('[auth]', e.message);
    res.status(500).json({ error: 'Datenbankfehler' });
  }
}

// ── Helper: G-Objekt aus DB zusammenstellen ───────────────────
async function loadPlayerData(userId) {
  const { rows: [u] } = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
  if (!u) return null;
  // Inventar aus separater Tabelle laden
  const { rows: invRows } = await pool.query(
    'SELECT item_data FROM inventory WHERE user_id = $1 AND equipped_slot IS NULL ORDER BY id ASC',
    [userId]
  );
  const inventory = invRows.map(r => r.item_data || {});
  return {
    version:  4,
    userId:   u.id,
    player: {
      name:            u.username,
      level:           u.level,
      xp:              u.xp,
      money:           u.money,
      energy:          u.energy,
      maxEnergy:       u.max_energy,
      energyLastReset: Number(u.energy_last_reset) || Date.now(),
      honor:           u.honor,
      stats: {
        str: u.staerke,
        end: u.ausdauer,
        ges: u.geschicklichkeit || 5,
        lck: u.glueck,
        inf: u.einfluss,
        rep: u.respekt,
        cha: u.charisma || 1,
      },
      statLevels: u.stat_levels || { str: 0, end: 0, lck: 0, inf: 0 },
      equip:      u.equip      || {},
      inventory,
    },
    buildingStatus: {},
    mission:    u.mission    || null,
    sgeldTimer: Number(u.sgeld_timer) || (Date.now() + 86_400_000),
    marktTimer: Number(u.markt_timer) || (Date.now() + 86_400_000),
    marktSeed:  u.markt_seed || Math.floor(Math.random() * 10000),
    log:        u.log        || [],
  };
}

// ── Helper: G → DB speichern ──────────────────────────────────
async function savePlayerData(userId, G) {
  const p = G.player;
  await pool.query(`
    UPDATE users SET
      level = $1, xp = $2, money = $3,
      energy = $4, max_energy = $5, energy_last_reset = $6,
      honor = $7,
      staerke = $8, ausdauer = $9, geschicklichkeit = $10, glueck = $11, einfluss = $12, respekt = $13, charisma = $14,
      stat_levels = $15, equip = $16,
      mission = $17,
      sgeld_timer = $18, markt_timer = $19, markt_seed = $20,
      log = $21, last_login = NOW()
    WHERE id = $22
  `, [
    p.level, p.xp, p.money,
    p.energy, p.maxEnergy, String(p.energyLastReset || Date.now()),
    p.honor,
    p.stats.str, p.stats.end, p.stats.ges || 5, p.stats.lck, p.stats.inf, p.stats.rep, p.stats.cha || 1,
    JSON.stringify(p.statLevels || {}),
    JSON.stringify(p.equip      || {}),
    JSON.stringify(G.mission    || null),
    String(G.sgeldTimer || 0),
    String(G.marktTimer || 0),
    G.marktSeed || 0,
    JSON.stringify((G.log || []).slice(0, 50)),
    userId,
  ]);
}

// ── Helper: Zahlenwerte klemmen/validieren ────────────────────
function clampNumber(value, min, max, fallback) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, Math.floor(n)));
}

// ── Helper: Client-Spielstand gegen bekannte Spielregeln prüfen ─
// Der Client berechnet Kampf/Loot/Preise selbst und schickt den
// kompletten Zustand per PUT /api/player. Damit niemand über die
// Konsole beliebige Werte setzen kann, werden Stats aus statLevels
// + Ausrüstung neu berechnet und Items/Inventar gegen den
// bekannten Item-Katalog geprüft, statt dem Client blind zu glauben.
function sanitizePlayerData(G) {
  const inP = (G && typeof G.player === 'object' && G.player) || {};

  const statLevels = {};
  for (const key of Object.keys(STAT_UPGRADE_INCREMENTS)) {
    statLevels[key] = clampNumber(inP.statLevels && inP.statLevels[key], 0, 300, 0);
  }

  const equip = {};
  if (inP.equip && typeof inP.equip === 'object') {
    for (const [slot, item] of Object.entries(inP.equip)) {
      const known = findKnownItem(item);
      if (known) equip[slot] = known;
    }
  }

  const stats = { ...BASE_STATS };
  for (const [key, inc] of Object.entries(STAT_UPGRADE_INCREMENTS)) {
    stats[key] += statLevels[key] * inc;
  }
  for (const item of Object.values(equip)) {
    for (const [k, v] of Object.entries(item.bonus || {})) {
      stats[k] = (stats[k] || 0) + v;
    }
  }

  const inventory = (Array.isArray(inP.inventory) ? inP.inventory : [])
    .slice(0, 300)
    .map(findKnownItem)
    .filter(Boolean);

  const level      = clampNumber(inP.level, 1, XP_TABLE.length, 1);
  const maxEnergy  = Math.min(200, 100 + level * 5);

  return {
    player: {
      level,
      xp:              clampNumber(inP.xp, 0, 10_000_000, 0),
      money:           clampNumber(inP.money, 0, 100_000_000, 0),
      energy:          clampNumber(inP.energy, 0, maxEnergy, maxEnergy),
      maxEnergy,
      energyLastReset: Math.min(Date.now(), clampNumber(inP.energyLastReset, 0, Date.now(), Date.now())),
      honor:           clampNumber(inP.honor, 0, 10_000_000, 0),
      stats,
      statLevels,
      equip,
      inventory,
    },
    mission:    G.mission ?? null,
    sgeldTimer: clampNumber(G.sgeldTimer, 0, Number.MAX_SAFE_INTEGER, Date.now() + 86_400_000),
    marktTimer: clampNumber(G.marktTimer, 0, Number.MAX_SAFE_INTEGER, Date.now() + 86_400_000),
    marktSeed:  clampNumber(G.marktSeed, 0, 999_999, 0),
    log:        Array.isArray(G.log) ? G.log.slice(0, 50) : [],
  };
}

// ── Helper: Session-Cookie setzen ────────────────────────────
function setSessionCookie(res, token) {
  res.cookie('session_token', token, {
    httpOnly: true,
    maxAge:   30 * 24 * 60 * 60 * 1000,   // 30 Tage
    sameSite: 'lax',
    secure:   process.env.NODE_ENV === 'production',
  });
}

// ════════════════════════════════════════════════════════════
// AUTH ROUTES
// ════════════════════════════════════════════════════════════

// POST /api/register
app.post('/api/register', authLimiter, async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password)
    return res.status(400).json({ error: 'Benutzername und Passwort erforderlich' });
  if (username.length < 3 || username.length > 20)
    return res.status(400).json({ error: 'Benutzername: 3–20 Zeichen' });
  if (password.length < 6)
    return res.status(400).json({ error: 'Passwort: mindestens 6 Zeichen' });

  try {
    const hash = await bcrypt.hash(password, 12);
    const now  = Date.now();
    const { rows: [user] } = await pool.query(
      `INSERT INTO users
         (username, password_hash, energy_last_reset, sgeld_timer, markt_timer, markt_seed)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      [
        username, hash,
        String(now),
        String(now + 86_400_000),
        String(now + 86_400_000),
        Math.floor(Math.random() * 10000),
      ]
    );
    const token = crypto.randomBytes(32).toString('hex');
    await pool.query(
      `INSERT INTO sessions (user_id, token, expires_at)
       VALUES ($1, $2, NOW() + INTERVAL '30 days')`,
      [user.id, token]
    );
    setSessionCookie(res, token);
    const playerData = await loadPlayerData(user.id);
    res.json({ ok: true, player: playerData });
  } catch (e) {
    if (e.code === '23505')
      return res.status(409).json({ error: 'Benutzername bereits vergeben' });
    console.error('[register]', e.message);
    res.status(500).json({ error: 'Serverfehler' });
  }
});

// POST /api/login
app.post('/api/login', authLimiter, async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password)
    return res.status(400).json({ error: 'Benutzername und Passwort erforderlich' });

  try {
    const { rows: [user] } = await pool.query(
      'SELECT id, password_hash FROM users WHERE username = $1',
      [username]
    );
    if (!user)
      return res.status(401).json({ error: 'Unbekannter Benutzer' });

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok)
      return res.status(401).json({ error: 'Falsches Passwort' });

    // Abgelaufene Sessions aufräumen
    await pool.query(
      'DELETE FROM sessions WHERE user_id = $1 AND expires_at < NOW()',
      [user.id]
    );
    const token = crypto.randomBytes(32).toString('hex');
    await pool.query(
      `INSERT INTO sessions (user_id, token, expires_at)
       VALUES ($1, $2, NOW() + INTERVAL '30 days')`,
      [user.id, token]
    );
    await pool.query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id]);

    setSessionCookie(res, token);
    const playerData = await loadPlayerData(user.id);
    res.json({ ok: true, player: playerData });
  } catch (e) {
    console.error('[login]', e.message);
    res.status(500).json({ error: 'Serverfehler' });
  }
});

// POST /api/logout
app.post('/api/logout', async (req, res) => {
  const token = req.cookies.session_token;
  if (token) {
    await pool.query('DELETE FROM sessions WHERE token = $1', [token]).catch(() => {});
  }
  res.clearCookie('session_token');
  res.json({ ok: true });
});

// GET /api/me
app.get('/api/me', requireAuth, async (req, res) => {
  try {
    const playerData = await loadPlayerData(req.userId);
    if (!playerData) return res.status(404).json({ error: 'Spieler nicht gefunden' });
    res.json({ ok: true, player: playerData });
  } catch (e) {
    console.error('[me]', e.message);
    res.status(500).json({ error: 'Serverfehler' });
  }
});

// ════════════════════════════════════════════════════════════
// SPIELER ROUTES
// ════════════════════════════════════════════════════════════

// PUT /api/player
app.put('/api/player', requireAuth, async (req, res) => {
  if (!req.body || typeof req.body.player !== 'object')
    return res.status(400).json({ error: 'Ungültige Spielerdaten' });
  try {
    const safe = sanitizePlayerData(req.body);
    await savePlayerData(req.userId, safe);
    res.json({ ok: true });
  } catch (e) {
    console.error('[save]', e.message);
    res.status(500).json({ error: 'Speicherfehler' });
  }
});

// ════════════════════════════════════════════════════════════
// GEBÄUDE ROUTES
// ════════════════════════════════════════════════════════════

// GET /api/buildings  — alle eingenommenen Gebäude (alle Spieler)
app.get('/api/buildings', requireAuth, async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT b.osm_id, b.owner_id, b.eingenommen_am, b.verteidigung_staerke,
             u.username AS owner_name
      FROM   buildings b
      LEFT JOIN users u ON u.id = b.owner_id
    `);
    res.json({ ok: true, userId: req.userId, buildings: rows });
  } catch (e) {
    console.error('[buildings]', e.message);
    res.status(500).json({ error: 'Datenbankfehler' });
  }
});

// POST /api/buildings/:osmId  — Gebäude einnehmen / Besitz wechseln
app.post('/api/buildings/:osmId', requireAuth, async (req, res) => {
  const { osmId } = req.params;
  const verteidigung_staerke = clampNumber(req.body && req.body.verteidigung_staerke, 0, 1000, 0);
  try {
    await pool.query(`
      INSERT INTO buildings (osm_id, owner_id, eingenommen_am, verteidigung_staerke)
      VALUES ($1, $2, NOW(), $3)
      ON CONFLICT (osm_id) DO UPDATE
        SET owner_id             = $2,
            eingenommen_am       = NOW(),
            verteidigung_staerke = $3
    `, [osmId, req.userId, verteidigung_staerke]);
    res.json({ ok: true });
  } catch (e) {
    console.error('[claim]', e.message);
    res.status(500).json({ error: 'Datenbankfehler' });
  }
});

// DELETE /api/buildings/:osmId  — Gebäude freigeben
app.delete('/api/buildings/:osmId', requireAuth, async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM buildings WHERE osm_id = $1 AND owner_id = $2',
      [req.params.osmId, req.userId]
    );
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: 'Datenbankfehler' });
  }
});

// ════════════════════════════════════════════════════════════
// INVENTAR ROUTES
// ════════════════════════════════════════════════════════════

// POST /api/inventory  — neues Item hinzufügen
app.post('/api/inventory', requireAuth, async (req, res) => {
  const item = findKnownItem(req.body);
  if (!item) return res.status(400).json({ error: 'Unbekanntes Item' });
  try {
    const itemId = item.slot + '_' + item.name.toLowerCase().replace(/\s+/g, '_').slice(0, 40);
    await pool.query(
      'INSERT INTO inventory (user_id, item_id, item_data, equipped_slot) VALUES ($1, $2, $3, NULL)',
      [req.userId, itemId, JSON.stringify(item)]
    );
    res.json({ ok: true });
  } catch (e) {
    console.error('[inventory]', e.message);
    res.status(500).json({ error: 'Datenbankfehler' });
  }
});

// DELETE /api/inventory/:id  — Item löschen
app.delete('/api/inventory/:id', requireAuth, async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM inventory WHERE id = $1 AND user_id = $2',
      [req.params.id, req.userId]
    );
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: 'Datenbankfehler' });
  }
});

// ════════════════════════════════════════════════════════════
// DEBUG / RESET
// ════════════════════════════════════════════════════════════

// POST /api/reset  — Account auf Startwerte zurücksetzen (nur eigener Account)
app.post('/api/reset', requireAuth, async (req, res) => {
  const uid = req.userId;
  const now = Date.now();
  try {
    await pool.query(`
      UPDATE users SET
        level = 1, xp = 0, money = 500,
        energy = 100, max_energy = 100, energy_last_reset = $1,
        honor = 0,
        staerke = 5, ausdauer = 50, geschicklichkeit = 5,
        glueck = 5, einfluss = 1, respekt = 0, charisma = 1,
        stat_levels = '{"str":0,"end":0,"lck":0,"inf":0}',
        equip = '{}', mission = 'null', log = '[]',
        sgeld_timer = $2, markt_timer = $2, markt_seed = $3,
        last_login = NOW()
      WHERE id = $4
    `, [String(now), String(now + 86_400_000), Math.floor(Math.random() * 10000), uid]);

    // Inventar leeren
    await pool.query('DELETE FROM inventory WHERE user_id = $1', [uid]);
    // Eigene Gebäude freigeben
    await pool.query('DELETE FROM buildings WHERE owner_id = $1', [uid]);

    console.log(`[reset] User ${uid} wurde zurückgesetzt`);
    res.json({ ok: true });
  } catch (e) {
    console.error('[reset]', e.message);
    res.status(500).json({ error: 'Reset fehlgeschlagen' });
  }
});

// ── Wildcard → SPA ────────────────────────────────────────────
app.get('/{*path}', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// ── Server starten ────────────────────────────────────────────
server.listen(PORT, () => {
  console.log('');
  console.log('  ╔══════════════════════════════════════╗');
  console.log(`  ║  Der Pate von Bottrop — Server v4    ║`);
  console.log(`  ║  http://localhost:${PORT}               ║`);
  console.log('  ╚══════════════════════════════════════╝');
  console.log('');
});
