# Gebäude-Sprites — Der Pate von Bottrop

## Aktueller Stand

Im Ordner liegen bereits **10 selbst-generierte Pixel-Art Sprites** (64×64 px, RGBA PNG),
die sofort funktionieren. Das Spiel lädt sie automatisch beim Start.

| Datei | Gebäude | Beschreibung |
|---|---|---|
| `wohnhaus.png`   | Wohnhaus   | Graues Betongebäude, Fenstergitter |
| `kiosk.png`      | Kiosk      | Gelb/orange, Markise, Tresen |
| `imbiss.png`     | Imbiss     | Rot/weiß, Ausgabefenster, Leuchtreklame |
| `tankstelle.png` | Tankstelle | Überdachung, zwei Zapfsäulen |
| `restaurant.png` | Restaurant | Warme Töne, Tische von oben |
| `supermarkt.png` | Supermarkt | Grau, Parkstreifen, Schaufenster |
| `nachtclub.png`  | Nachtclub  | Dunkel, Neon-Glow, Tanzfläche |
| `spielhalle.png` | Spielhalle | Automaten von oben, bunte Screens |
| `juwelier.png`   | Juwelier   | Elegant, Gold-Rahmen, Vitrinen |
| `kasino.png`     | Kasino     | Dunkelrot, Roulette-Tisch sichtbar |

---

## Optional: Durch Kenney.nl CC0-Assets ersetzen

Falls du professionellere Sprites bevorzugst, kannst du die Dateien 1:1 ersetzen.
Die generierten PNGs dienen dann nur als Vorlage für die Größe.

### Empfohlene Packs (alle CC0-lizenziert)

#### 1. Tiny Town *(16×16, RPG/Overworld)*
- **Download:** https://kenney.nl/assets/tiny-town
- Klick auf „Continue without donating…"
- ZIP enthält `PNG/Default/`-Ordner mit Einzelsprites

Mapping (Beispiel — passe nach Inhalt des ZIPs an):

| Kenney-Datei | Umbenennen zu |
|---|---|
| `buildingA.png` | `wohnhaus.png` |
| `shop_A.png` | `kiosk.png` |
| `shop_B.png` | `restaurant.png` |
| `factory_A.png` | `supermarkt.png` |

#### 2. Topdown Shooter Redux *(Top-Down, modern/urban)*
- **Download:** https://kenney.nl/assets/topdown-shooter-redux
- Enthält Gebäude, Fahrzeuge, Straßen im urbanen Stil

#### 3. Roguelike/RPG Pack *(16×16, 1700 Sprites)*
- **Download:** https://kenney.nl/assets/roguelike-rpg-pack
- Enthält Stadtgebäude unter `Buildings/`

### Sprite-Anforderungen

Das Spiel akzeptiert **jede PNG-Größe** — sie wird automatisch auf die
Gebäude-Größe auf dem Canvas skaliert. Empfohlen: quadratisch, min. 16×16 px.

`imageSmoothingEnabled = false` ist gesetzt → Pixel-Art bleibt scharf.

### So tauscht du Sprites aus

1. ZIP herunterladen und entpacken
2. Passende PNG-Dateien in diesen Ordner kopieren
3. Auf die Namen oben umbenennen (z.B. `wohnhaus.png`)
4. `index.html` im Browser öffnen — fertig

Nicht gefundene Sprites werden einfach weggelassen (leeres Gebäude-Rechteck).
