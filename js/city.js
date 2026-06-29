// ============================================================
// CITY — LEAFLET KARTE — Der Pate von Bottrop v4
// ============================================================

// --------------- Bild-Loader (NPC-Portraits) ---------------

function loadSprites() {
  return Promise.resolve();
}

function loadGameImages() {
  const paths = { waldemar: 'assets/images/npcs/waldemar.jpeg' };
  const p = Object.entries(paths).map(([key, src]) => new Promise(res => {
    const img = new Image();
    img.onload  = () => { gameImages[key] = img; res(); };
    img.onerror = () => res();
    img.src = src;
  }));
  return Promise.all(p);
}

// --------------- Polygon-Style (Farben nach Anforderung) ----

function getBuildingStyle(b) {
  const isSelected = ttLocked && ttBuilding === b;

  if (isSelected) return { color: '#ffe040', weight: 3,   fillColor: '#ffe040', fillOpacity: 0.60 };
  if (b.hovered && b.owned)  return { color: '#ffffff', weight: 2, fillColor: '#1ec858', fillOpacity: 0.40 };
  if (b.hovered && !b.owned) return { color: '#ffffff', weight: 2, fillColor: '#c01818', fillOpacity: 0.40 };
  if (b.owned)    return { color: '#1ec858', weight: 2,   fillColor: '#1ec858', fillOpacity: 0.40 };
  return                 { color: '#c01818', weight: 2,   fillColor: '#c01818', fillOpacity: 0.40 };
}

// --------------- Karten-Farben aktualisieren ---------------

function updateMapColors() {
  for (const b of buildings) {
    const poly = bPolygons[b.osmId];
    if (poly) poly.setStyle(getBuildingStyle(b));
  }
}

function drawCity() { updateMapColors(); }

// --------------- Leaflet-State ----------------------------

let leafletMap  = null;
const bPolygons = {};   // osmId (string) → L.Polygon

// --------------- Wohngebäude laden (Overpass out geom) ----
// out geom: geometry[] direkt auf dem way-Element (kein Node-Lookup nötig)

async function loadWohngebaeude() {
  let data;
  try {
    const resp = await fetch('assets/data/wohngebaeude.json');
    if (!resp.ok) throw new Error('HTTP ' + resp.status);
    data = await resp.json();
  } catch (e) {
    console.error('[city] wohngebaeude.json Ladefehler:', e);
    buildings = [];
    return;
  }

  const wohnhausData = BUILDING_TYPES.find(t => t.type === 'Wohnhaus');
  if (!wohnhausData) { buildings = []; return; }

  buildings = [];
  for (const el of data.elements) {
    if (el.type !== 'way' || !el.geometry || el.geometry.length < 3) continue;

    // out geom liefert geometry: [{lat, lon}, ...] direkt am Way
    const coords = el.geometry.map(g => [g.lat, g.lon]);

    // Adress-Label zusammensetzen
    const t     = el.tags || {};
    const label = t['addr:street'] && t['addr:housenumber']
      ? t['addr:street'] + ' ' + t['addr:housenumber']
      : (t.name || '');

    buildings.push({
      osmId:    String(el.id),
      idx:      buildings.length,
      data:     wohnhausData,
      label,
      building: t.building || 'residential',
      coords,
      owned:    api.getBuilding(el.id),
      hovered:  false,
    });
  }

  renderBuildingPolygons();
}

// --------------- Polygon-Layer zeichnen ------------------

function renderBuildingPolygons() {
  if (!leafletMap) return;

  // Alte Polygone entfernen
  for (const poly of Object.values(bPolygons)) leafletMap.removeLayer(poly);
  Object.keys(bPolygons).forEach(k => delete bPolygons[k]);

  for (const b of buildings) {
    const poly = L.polygon(b.coords, getBuildingStyle(b)).addTo(leafletMap);

    // Leaflet-nativer Tooltip (Gebäudeinfo beim Hover)
    const tipLabel = b.label || '🏠 Wohngebäude';
    poly.bindTooltip(
      `<b>${tipLabel}</b><br><em>OSM #${b.osmId}</em><br>${b.owned ? '✅ Eingenommen' : '🔴 Nicht eingenommen'}`,
      { sticky: true, direction: 'top', offset: [0, -4] }
    );

    poly.on('mouseover', () => {
      if (ttLocked) return;
      b.hovered = true;
      poly.setStyle(getBuildingStyle(b));
      showTooltip(b, false);
    });

    poly.on('mouseout', () => {
      if (ttLocked) return;
      b.hovered = false;
      poly.setStyle(getBuildingStyle(b));
      hideTooltip();
    });

    poly.on('click', e => {
      L.DomEvent.stopPropagation(e);
      buildings.forEach(bl => { bl.hovered = false; });

      if (ttLocked && ttBuilding === b) {
        ttLocked   = false;
        ttBuilding = null;
        hideTooltip();
      } else {
        ttLocked   = true;
        ttBuilding = b;
        showTooltip(b, true);
      }
      updateMapColors();
    });

    bPolygons[b.osmId] = poly;
  }

  // Klick auf leere Karte → Auswahl aufheben
  leafletMap.off('click');
  leafletMap.on('click', () => {
    if (ttLocked) {
      ttLocked   = false;
      ttBuilding = null;
      buildings.forEach(bl => { bl.hovered = false; });
      hideTooltip();
      updateMapColors();
    }
  });
}

// --------------- Leaflet Karte initialisieren ------------

async function initMap() {
  // Leaflet-Standard-Icons auf lokale Pfade umbiegen
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconUrl:       'assets/lib/images/marker-icon.png',
    iconRetinaUrl: 'assets/lib/images/marker-icon-2x.png',
    shadowUrl:     'assets/lib/images/marker-shadow.png',
  });

  leafletMap = L.map('leaflet-map', {
    center:             CONFIG.MAP_CENTER,
    zoom:               CONFIG.MAP_ZOOM,
    minZoom:            CONFIG.MAP_MIN_ZOOM,
    maxZoom:            CONFIG.MAP_MAX_ZOOM,
    maxBounds:          CONFIG.MAP_BOUNDS,
    maxBoundsViscosity: 0.9,
    zoomControl:        true,
  });

  L.tileLayer(CONFIG.TILE_URL, {
    attribution: CONFIG.TILE_ATTRIBUTION,
    maxZoom:     19,
  }).addTo(leafletMap);

  // ── HQ-Marker: goldenes Icon, nicht klickbar ──────────────
  const hqIcon = L.divIcon({
    html:       '<div class="map-hq-icon">⚜</div>',
    className:  '',
    iconSize:   [36, 36],
    iconAnchor: [18, 18],
  });
  L.marker(CONFIG.HQ_POS, { icon: hqIcon, interactive: false })
    .addTo(leafletMap)
    .bindTooltip('<b>⚜ Hauptquartier</b><br><em>Sterkrader Str. 211</em>', { permanent: false });

  // ── Schwarzmarkt-Marker: klickbar ────────────────────────
  const bahnhofIcon = L.divIcon({
    html:       '<div class="map-bahnhof-icon">🚉</div>',
    className:  '',
    iconSize:   [38, 38],
    iconAnchor: [19, 19],
  });
  L.marker(CONFIG.BAHNHOF_POS, { icon: bahnhofIcon })
    .addTo(leafletMap)
    .bindTooltip('<b>🚉 Schwarzmarkt</b><br><em>Klicken zum Öffnen</em>', { sticky: true })
    .on('click', () => openMarkt());

  // ── Wohngebäude-Polygone laden ───────────────────────────
  await loadWohngebaeude();
}
