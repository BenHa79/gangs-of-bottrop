// ============================================================
// CONFIG — Der Pate von Bottrop v4
// ============================================================
// Tausche TILE_URL gegen eigene Kacheln aus
// (Mapbox, lokal gehostete OSM-Kacheln, etc.)
// Alles andere hier zentralisiert — nie hardcoded in city.js

const CONFIG = {

  // ── Tile-URL ──────────────────────────────────────────────
  // Option A (Standard): OpenStreetMap — hell, kostenlos
  TILE_URL:         'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  TILE_ATTRIBUTION: '© <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>',

  // Option B: CartoDB Dark Matter — bereits dunkle Kacheln,
  //   kein Noir-CSS-Filter nötig → in style.css .leaflet-tile-pane
  //   filter-Zeile dann auskommentieren.
  //   Einfach Option A auskommentieren und B einkommentieren:
  // TILE_URL:         'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
  // TILE_ATTRIBUTION: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> © <a href="https://carto.com/">CARTO</a>',

  // ── HQ: Sterkrader Straße 211, Bottrop ───────────────────
  // TODO Account-Erstellung: Spieler gibt eigene Adresse ein,
  //   wird per Nominatim geocodiert und ersetzt DEFAULT_HQ.
  //   Script: python tools/geocode_hq.py "Adresse, Ort"
  HQ_POS:     [51.5178, 6.9008],
  MAP_CENTER: [51.5178, 6.9008],

  MAP_ZOOM:     17,
  MAP_MIN_ZOOM: 14,
  MAP_MAX_ZOOM: 19,

  // ── Spielgebiet-Grenzen: Bottrop Stadtgebiet ──────────────
  MAP_BOUNDS: [[51.500, 6.880], [51.560, 6.960]],

  // ── Schwarzmarkt — Bottrop Hauptbahnhof ──────────────────
  BAHNHOF_POS: [51.5249, 6.9207],

  // ── Gebäude-Limit (aus OSM-Daten) ────────────────────────
  MAX_BUILDINGS: 50,
};
