#!/usr/bin/env python3
"""
Echtdaten von Overpass API holen — einmalig ausführen.
Speichert: assets/data/bottrop.json

Nutzung:
  cd "D:\Der Pate"
  python tools/fetch_osm.py
"""
import urllib.request, json, sys, os

URL  = "https://overpass-api.de/api/interpreter"
QUERY = """
[out:json][timeout:60];
(
  way["amenity"~"fuel|restaurant|fast_food|nightclub|casino|bar|pub|amusement_arcade|gambling|cafe"](around:800,51.5236,6.9228);
  way["shop"~"supermarket|convenience|fuel|jewelry|jewellery|kiosk|newsagent|deli|watches"](around:800,51.5236,6.9228);
  way["building"~"apartments|residential|house|detached"](around:800,51.5236,6.9228);
);
out body;
>;
out skel qt;
"""

def main():
    print("Frage Overpass API ab …")
    data = QUERY.strip().encode()
    req  = urllib.request.Request(URL, data=data, method="POST")
    req.add_header("Content-Type", "application/x-www-form-urlencoded")

    with urllib.request.urlopen(req, timeout=90) as resp:
        raw = resp.read()

    result = json.loads(raw)
    ways   = [e for e in result["elements"] if e["type"] == "way"]
    nodes  = [e for e in result["elements"] if e["type"] == "node"]
    print(f"  → {len(ways)} Ways, {len(nodes)} Nodes erhalten.")

    out = os.path.join(os.path.dirname(__file__), "..", "assets", "data", "bottrop.json")
    with open(out, "w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False, indent=2)
    print(f"Gespeichert: {out}")

if __name__ == "__main__":
    main()
