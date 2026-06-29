// ============================================================
// MAIN — Der Pate von Bottrop v4
// ============================================================

// --------------- Save / Load ---------------

function newGame(name) {
  return {
    version: 4,
    player: {
      name,
      level: 1, xp: 0,
      money: 500,
      energy: 100, maxEnergy: 100, energyLastReset: Date.now(),
      honor: 0,
      stats:      { str: 5, end: 50, lck: 5, inf: 1, rep: 0 },
      statLevels: { str: 0, end: 0, lck: 0, inf: 0 },
      equip: {}, inventory: [],
    },
    buildingStatus: {},   // osmId (string) → true  (owned)
    mission:    null,
    sgeldTimer: Date.now() + 86_400_000,
    marktTimer: Date.now() + 86_400_000,
    marktSeed:  Math.floor(Math.random() * 10000),
    log:        [],
  };
}

function saveGame() {
  if (G) api.save(G);
}

function loadGame() {
  return api.load();
}

// --------------- Building interaction ---------------

function canTake(b) {
  if (!G)             return { ok: false, reason: '' };
  if (b.ownedByOther) return { ok: false, reason: 'Fremdes Revier' };
  if (b.owned)        return { ok: false, reason: 'Bereits dein' };
  if (G.mission)      return { ok: false, reason: '⏳ Auftrag läuft' };
  if (G.player.energy < b.data.energyCost)
    return { ok: false, reason: `❌ Zu wenig Energie (${b.data.energyCost} nötig)` };
  if (!b.data.isResidential) {
    const power = G.player.stats.str + G.player.level * 3;
    if (power < b.data.strength)
      return { ok: false, reason: `❌ Zu schwach (Stärke ~${b.data.strength} nötig)` };
  }
  return { ok: true, reason: b.data.isResidential ? '✅ Einschüchtern möglich' : '✅ Du bist stark genug' };
}

// --------------- Mission ---------------

function startMission(b) {
  G.player.energy -= b.data.energyCost;
  G.mission = {
    buildingOsmId: b.osmId,         // OSM-ID — stabil über Neustarts hinweg
    endsAt:        Date.now() + b.data.travelBase * 1000,
    totalDuration: b.data.travelBase,
    buildingName:  b.label || b.data.type,
    buildingIcon:  b.data.icon,
    isResidential: b.data.isResidential,
  };
  addLog(`🚗 Unterwegs: ${b.data.icon} ${b.label || b.data.type}`, 'good');
  saveGame(); updateHUD(); drawCity();
}

function checkMission() {
  if (!G?.mission) return;
  if (isProcessing) return;   // Einschüchterung-Screen noch offen — nicht erneut feuern
  if (Date.now() >= G.mission.endsAt) arriveAtBuilding();
  else                                 updateMissionBar();
}

function arriveAtBuilding() {
  const b = buildings.find(x => x.osmId === G.mission.buildingOsmId)
         || buildings[G.mission.buildingIdx];   // Fallback: alter Spielstand
  if (!b) { G.mission = null; return; }
  updateMissionBar();
  if (b.data.isResidential) openEinschuechterung(b);
  else                       openKampf(b);
}

// --------------- Game loop ---------------

function gameLoop() {
  if (!G) return;
  updateEnergy();
  checkMission();
  checkSchutzgeld();
  checkMarktTimer();
  updateHUD();
  drawCity();
}

// --------------- Startup ---------------

async function startGame() {
  document.getElementById('start-screen').classList.remove('active');
  document.getElementById('game-screen').classList.add('active');

  // Patch old saves
  if (!G.player.statLevels)              G.player.statLevels = { str:0, end:0, lck:0, inf:0 };
  if (G.player.stats.end === undefined)  G.player.stats.end  = 50;
  if (G.player.honor === undefined)      G.player.honor      = 0;
  if (!G.marktTimer)                     G.marktTimer = Date.now() + 86_400_000;
  if (!G.marktSeed)                      G.marktSeed  = Math.floor(Math.random() * 10000);

  // Migration: altes G.buildings-Format ignorieren (kein OSM-ID-Mapping möglich)
  if (!G.buildingStatus) G.buildingStatus = {};

  // Leaflet-Karte + Wohngebäude laden
  // (loadWohngebaeude() liest owned-Status via api.getBuilding(osmId))
  await initMap();

  // Farben nach geladenem Besitz-Status setzen
  updateMapColors();

  updateHUD(); renderLog();
  addLog('Willkommen in Bottrop, Pate.', 'good');
  addLog('Tipp: Nimm zuerst Wohngebäude ein um zu wachsen.', '');
  setInterval(gameLoop, 1000);
}

// ============================================================
// EVENT LISTENERS (DOM ready)
// ============================================================

// ── Auth: Login ──────────────────────────────────────────────
document.getElementById('btn-login').addEventListener('click', async () => {
  const username = document.getElementById('auth-username').value.trim();
  const password = document.getElementById('auth-password').value;
  const errEl    = document.getElementById('auth-error');
  errEl.textContent = '';
  if (!username || !password) { errEl.textContent = 'Benutzername und Passwort eingeben.'; return; }
  try {
    document.getElementById('btn-login').disabled = true;
    G = await api.login(username, password);
    await startGame();
  } catch (e) {
    errEl.textContent = e.message;
  } finally {
    document.getElementById('btn-login').disabled = false;
  }
});

// ── Auth: Registrieren ───────────────────────────────────────
document.getElementById('btn-register').addEventListener('click', async () => {
  const username = document.getElementById('auth-username').value.trim();
  const password = document.getElementById('auth-password').value;
  const errEl    = document.getElementById('auth-error');
  errEl.textContent = '';
  if (!username || !password) { errEl.textContent = 'Benutzername und Passwort eingeben.'; return; }
  try {
    document.getElementById('btn-register').disabled = true;
    G = await api.register(username, password);
    await startGame();
  } catch (e) {
    errEl.textContent = e.message;
  } finally {
    document.getElementById('btn-register').disabled = false;
  }
});

// Navigation
document.getElementById('btn-hq-view').addEventListener('click', () => {
  openHQ();
  document.getElementById('markt-screen').classList.remove('open');
  setNav('btn-hq-view');
});
document.getElementById('btn-map-view').addEventListener('click', () => {
  document.getElementById('hq-screen').classList.remove('open');
  document.getElementById('markt-screen').classList.remove('open');
  setNav('btn-map-view');
});
document.getElementById('btn-markt-view').addEventListener('click', () => {
  document.getElementById('hq-screen').classList.remove('open');
  openMarkt();
});
document.getElementById('btn-close-hq').addEventListener('click', () => {
  document.getElementById('hq-screen').classList.remove('open');
  setNav('btn-map-view');
});
document.getElementById('btn-close-markt').addEventListener('click', () => {
  document.getElementById('markt-screen').classList.remove('open');
  setNav('btn-map-view');
});

// Schutzgeld modal
document.getElementById('sgeld-close').addEventListener('click', () =>
  document.getElementById('sgeld-modal').classList.remove('open')
);

// Sidebar action button
document.getElementById('tt-btn').addEventListener('click', () => {
  if (!ttBuilding || !canTake(ttBuilding).ok) return;
  startMission(ttBuilding); hideTooltip();
});

// Kampf – abort
document.getElementById('btn-abort-kampf').addEventListener('click', () => {
  G.mission = null;
  document.getElementById('kampf-screen').classList.remove('open');
  G.player.honor = Math.max(0, G.player.honor - Math.floor(kampfState?.building?.data?.honor * 0.5 || 0));
  addLog('😤 Feige zurückgezogen. Ehre verloren.', 'bad');
  saveGame(); updateHUD(); drawCity();
});

// Kampf – start fight
document.getElementById('btn-start-kampf').addEventListener('click', () => {
  showPhase('kampf');
  const weapon = G.player.equip['waffe'];
  document.getElementById('kk-player-name').textContent    = G.player.name;
  document.getElementById('kk-enemy-name').textContent     = kampfState.npc.name;
  document.getElementById('kk-enemy-portrait').textContent = kampfState.npc.portrait;
  document.getElementById('kk-weapon').textContent         = weapon ? `${weapon.icon} ${weapon.name}` : '👊 Fäuste';
  updateKampfBars();
  setTimeout(runRound, 600);
});

// Kampf – result close
document.getElementById('btn-er-close').addEventListener('click', () => {
  document.getElementById('kampf-screen').classList.remove('open');
  document.getElementById('kampf-log').innerHTML = '';
  kampfState = null;
  // Reset lock after combat
  ttLocked = false; ttBuilding = null; hideTooltip();
});

// Einschüchterung – close
document.getElementById('btn-einsch-close').addEventListener('click', () => {
  isProcessing = false;
  if (!einschState) return;
  const b = einschState.building;
  b.owned   = true;
  G.mission = null;

  // Besitz nach OSM-ID speichern (niemals nach Name oder Index)
  api.saveBuilding(b.osmId, true);

  const xp = b.data.xp, money = b.data.baseIncome, honor = b.data.honor;
  G.player.xp    += xp;
  G.player.money += money;
  G.player.honor += honor;
  checkLevelUp();
  const label = b.label || b.data.type;
  addLog(`${label} eingeschüchtert! +${formatMoney(money)} +${xp}XP +${honor} Ehre`, 'good');
  document.getElementById('einschuechterung-screen').classList.remove('open');
  ttLocked = false; ttBuilding = null; hideTooltip();
  saveGame(); updateHUD(); drawCity();
  showToast(`${label} übernommen! +${honor} Ehre`);
  einschState = null;
});

// Equipment modal
document.getElementById('em-equip').addEventListener('click', () => {
  if (!selInv) return;
  const { item, idx } = selInv;
  const old = G.player.equip[item.slot];
  if (old) {
    for (const [k, v] of Object.entries(old.bonus)) G.player.stats[k] -= v;
    G.player.inventory.push({ ...old });
  }
  G.player.equip[item.slot] = item;
  for (const [k, v] of Object.entries(item.bonus)) G.player.stats[k] += v;
  G.player.inventory.splice(idx, 1);
  document.getElementById('equip-modal').classList.remove('open');
  saveGame(); openHQ();
  showToast(`${item.icon} ${item.name} angelegt!`);
});
document.getElementById('em-cancel').addEventListener('click', () =>
  document.getElementById('equip-modal').classList.remove('open')
);

// ── Logout ───────────────────────────────────────────────────
document.getElementById('btn-logout').addEventListener('click', async () => {
  if (confirm('Wirklich ausloggen?')) await api.logout();
});

// Leaflet übernimmt Resize automatisch — kein manueller Canvas-Listener nötig

// ============================================================
// INIT — check for saved game, load sprites, then show start screen
// ============================================================
(async function init() {
  await loadSprites();
  await loadGameImages();

  // Session-Cookie prüfen — bei gültigem Cookie direkt ins Spiel
  const saved = await api.checkSession();
  if (saved) {
    G = saved;
    await startGame();
  } else {
    // Login-Formular anzeigen
    document.getElementById('session-loading').style.display = 'none';
    document.getElementById('auth-form').style.display       = 'flex';
    document.getElementById('auth-form').style.flexDirection = 'column';
    document.getElementById('auth-form').style.gap           = '12px';
  }
})();
