#!/usr/bin/env node
/**
 * Datenbank initialisieren — einmalig ausführen:
 *   npm run db:init
 *
 * Voraussetzung: DATABASE_URL ist als Umgebungsvariable gesetzt.
 * Auf Railway: Variablen werden automatisch gesetzt.
 * Lokal: .env-Datei anlegen (siehe .env.example) + dotenv installieren,
 *   oder: DATABASE_URL=postgres://... node db/init.js
 */
'use strict';

const { Pool } = require('pg');
const fs       = require('fs');
const path     = require('path');

// .env laden falls vorhanden (lokal)
try { require('dotenv').config(); } catch {}

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('Fehler: DATABASE_URL ist nicht gesetzt.');
  console.error('Railway: Variable wird automatisch gesetzt.');
  console.error('Lokal:   export DATABASE_URL=postgres://user:pass@host:5432/db');
  process.exit(1);
}

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function main() {
  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
  console.log('Verbinde mit Datenbank…');
  const client = await pool.connect();
  try {
    console.log('Führe schema.sql aus…');
    await client.query(schema);
    console.log('✓ Tabellen erstellt (oder bereits vorhanden).');
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(e => {
  console.error('Fehler:', e.message);
  process.exit(1);
});
