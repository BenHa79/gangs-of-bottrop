#!/usr/bin/env python3
"""
Wohngebaeude-Grundrisse aus Overpass API holen (300m um HQ).
Speichert: assets/data/wohngebaeude.json

Nutzung:
  cd D:/Der Pate
  python tools/fetch_wohngebaeude.py 51.5178 6.9008
  python tools/fetch_wohngebaeude.py          (liest HQ_POS aus js/config.js)
"""
import urllib.request
import urllib.error
import json
import sys
import re
import os

# ── Koordinaten aus Kommandozeile oder config.js lesen ─────────

if len(sys.argv) >= 3:
    LAT, LON = float(sys.argv[1]), float(sys.argv[2])
else:
    cfg_path = os.path.join(os.path.dirname(__file__), "..", "js", "config.js")
    try:
        cfg = open(cfg_path, encoding="utf-8").read()
    except FileNotFoundError:
        print("Fehler: js/config.js nicht gefunden. Bitte aus D:/Der Pate ausfuehren.")
        sys.exit(1)
    m = re.search(r"HQ_POS\s*:\s*\[([\d.]+),\s*([\d.]+)\]", cfg)
    if not m:
        print("Fehler: HQ_POS nicht in config.js gefunden.")
        sys.exit(1)
    LAT, LON = float(m.group(1)), float(m.group(2))

print(f"Hole Wohngebaeude um [{LAT}, {LON}] (300m Radius) ...")

# ── Overpass-Query (out geom: Koordinaten direkt am Way) ────────

URL = "https://overpass-api.de/api/interpreter"

QUERY = (
    "[out:json][timeout:60];\n"
    "(\n"
    f'  way["building"="residential"](around:300,{LAT},{LON});\n'
    f'  way["building"="apartments"](around:300,{LAT},{LON});\n'
    f'  way["building"="house"](around:300,{LAT},{LON});\n'
    f'  way["building"="detached"](around:300,{LAT},{LON});\n'
    f'  way["building"="semidetached_house"](around:300,{LAT},{LON});\n'
    ");\n"
    "out geom;"
)

HEADERS = {
    # Overpass API verlangt einen User-Agent — ohne diesen: HTTP 406
    "User-Agent":   "DerPateBottrop/1.0 (Spielentwicklung; Kontakt: lokal)",
    "Content-Type": "application/x-www-form-urlencoded",
    "Accept":       "application/json",
}

req = urllib.request.Request(URL, data=QUERY.encode("utf-8"), method="POST")
for key, val in HEADERS.items():
    req.add_header(key, val)

# ── Anfrage senden ──────────────────────────────────────────────

try:
    with urllib.request.urlopen(req, timeout=90) as resp:
        raw = resp.read()
except urllib.error.HTTPError as e:
    body = e.read().decode("utf-8", errors="replace")[:300]
    print(f"HTTP-Fehler {e.code}: {e.reason}")
    print(f"Antwort: {body}")
    sys.exit(1)
except urllib.error.URLError as e:
    print(f"Verbindungsfehler: {e.reason}")
    print("Tipp: Internetverbindung pruefen / Overpass-API erreichbar?")
    sys.exit(1)

# ── Ergebnis verarbeiten ────────────────────────────────────────

result = json.loads(raw)
elements = result.get("elements", [])
ways     = [e for e in elements if e.get("type") == "way"]
no_geom  = [w for w in ways if "geometry" not in w]

print(f"  {len(ways)} Wohngebaeude erhalten ({len(ways) - len(no_geom)} mit Geometrie).")

if no_geom:
    print(f"  Hinweis: {len(no_geom)} Ways ohne Geometrie (werden ignoriert).")

if not ways:
    print("Warnung: Keine Gebaeude gefunden. Koordinaten korrekt?")
    print(f"  HQ: [{LAT}, {LON}]")
    sys.exit(1)

# ── Speichern ───────────────────────────────────────────────────

out = os.path.join(
    os.path.dirname(os.path.abspath(__file__)),
    "..", "assets", "data", "wohngebaeude.json"
)
out = os.path.normpath(out)

with open(out, "w", encoding="utf-8") as f:
    json.dump(result, f, ensure_ascii=False, indent=2)

print(f"Gespeichert: {out}")
print("Fertig. Server neu starten damit die Karte aktualisiert wird.")
