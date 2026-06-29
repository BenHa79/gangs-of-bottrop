-- ============================================================
-- SCHEMA — Der Pate von Bottrop v4
-- PostgreSQL — einmalig ausführen mit: npm run db:init
-- ============================================================

-- ── SPIELER ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id               SERIAL PRIMARY KEY,
  username         VARCHAR(20) UNIQUE NOT NULL,
  password_hash    VARCHAR(255) NOT NULL,

  -- Hauptquartier
  hq_lat           FLOAT DEFAULT 51.5178,
  hq_lng           FLOAT DEFAULT 6.9008,
  hq_address       VARCHAR(255) DEFAULT 'Sterkrader Straße 211, Bottrop',

  -- Spielstand
  level            INT DEFAULT 1,
  xp               INT DEFAULT 0,
  money            INT DEFAULT 500,
  energy           INT DEFAULT 100,
  max_energy       INT DEFAULT 100,
  energy_last_reset BIGINT DEFAULT 0,
  honor            INT DEFAULT 0,

  -- Stats (nach Benutzer-Spezifikation)
  staerke          INT DEFAULT 5,
  ausdauer         INT DEFAULT 50,
  geschicklichkeit INT DEFAULT 5,
  glueck           INT DEFAULT 5,
  einfluss         INT DEFAULT 1,
  respekt          INT DEFAULT 0,
  charisma         INT DEFAULT 1,

  -- Komplexe Objekte als JSONB
  stat_levels      JSONB DEFAULT '{"str":0,"end":0,"lck":0,"inf":0}',
  equip            JSONB DEFAULT '{}',
  mission          JSONB DEFAULT 'null',
  log              JSONB DEFAULT '[]',

  -- Timer (Unix-Timestamps als BIGINT)
  sgeld_timer      BIGINT DEFAULT 0,
  markt_timer      BIGINT DEFAULT 0,
  markt_seed       INT DEFAULT 0,

  -- Metadaten
  created_at       TIMESTAMP DEFAULT NOW(),
  last_login       TIMESTAMP DEFAULT NOW()
);

-- ── SESSIONS ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sessions (
  id         SERIAL PRIMARY KEY,
  user_id    INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token      VARCHAR(128) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sessions_token   ON sessions(token);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);

-- ── GEBÄUDE ───────────────────────────────────────────────────
-- Nur eingenommene Gebäude stehen hier — freie Gebäude existieren nicht in der DB.
CREATE TABLE IF NOT EXISTS buildings (
  osm_id               VARCHAR(50) PRIMARY KEY,
  owner_id             INT REFERENCES users(id) ON DELETE SET NULL,
  eingenommen_am       TIMESTAMP DEFAULT NOW(),
  verteidigung_staerke INT DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_buildings_owner ON buildings(owner_id);

-- ── INVENTAR ──────────────────────────────────────────────────
-- Phase 1: Inventar wird als JSONB in users.equip/G gespeichert.
-- Diese Tabelle ist für Phase 2 (separates Item-Management) vorbereitet.
CREATE TABLE IF NOT EXISTS inventory (
  id           SERIAL PRIMARY KEY,
  user_id      INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  item_id      VARCHAR(100),
  item_data    JSONB,
  equipped_slot VARCHAR(50) DEFAULT NULL
);

CREATE INDEX IF NOT EXISTS idx_inventory_user ON inventory(user_id);
