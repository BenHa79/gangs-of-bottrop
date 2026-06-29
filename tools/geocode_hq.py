#!/usr/bin/env python3
"""
HQ-Koordinaten per Nominatim ermitteln und in js/config.js eintragen.

Nutzung:
  cd "D:\Der Pate"
  python tools/geocode_hq.py "Sterkrader Straße 211, Bottrop"

Danach: node server.js  →  http://localhost:3000
"""
import urllib.request, json, sys, re, os

ADDRESS = sys.argv[1] if len(sys.argv) > 1 else "Sterkrader Straße 211, Bottrop"

def geocode(address):
    url = ("https://nominatim.openstreetmap.org/search"
           f"?q={urllib.parse.quote(address)}&format=json&limit=1&addressdetails=1")
    req = urllib.request.Request(url, headers={"User-Agent": "DerPate/4.0 geocoder"})
    with urllib.request.urlopen(req, timeout=10) as r:
        data = json.loads(r.read())
    if not data:
        raise ValueError(f"Keine Ergebnisse für: {address}")
    return float(data[0]["lat"]), float(data[0]["lon"]), data[0].get("display_name", "")

import urllib.parse

print(f"Geocodiere: {ADDRESS}")
lat, lon, display = geocode(ADDRESS)
print(f"→ Gefunden: {display}")
print(f"→ Koordinaten: [{lat}, {lon}]")

# config.js aktualisieren
cfg_path = os.path.join(os.path.dirname(__file__), "..", "js", "config.js")
cfg = open(cfg_path, "r", encoding="utf-8").read()

# HQ_POS und MAP_CENTER ersetzen
cfg = re.sub(
    r"(HQ_POS\s*:\s*)\[[\d., ]+\]",
    f"\\1[{lat}, {lon}]",
    cfg
)
cfg = re.sub(
    r"(MAP_CENTER\s*:\s*)\[[\d., ]+\]",
    f"\\1[{lat}, {lon}]",
    cfg
)
open(cfg_path, "w", encoding="utf-8").write(cfg)
print(f"✓ js/config.js aktualisiert: HQ_POS = [{lat}, {lon}]")

# Wohngebäude neu laden?
print("\nJetzt Wohngebäude-Daten holen:")
print(f"  python tools/fetch_wohngebaeude.py {lat} {lon}")
