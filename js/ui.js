// ============================================================
// UI / HUD — Der Pate von Bottrop v4
// ============================================================

// --------------- Rank helpers ---------------

function getRank() {
  const h = G.player.honor;
  let r = RANKS[0];
  for (const rk of RANKS) { if (h >= rk.honor) r = rk; }
  return r;
}

function getNextRank() {
  const h = G.player.honor;
  for (const rk of RANKS) { if (h < rk.honor) return rk; }
  return null;
}

// --------------- Level-up ---------------

function checkLevelUp() {
  while (G.player.level < XP_TABLE.length && G.player.xp >= XP_TABLE[G.player.level]) {
    G.player.level++;
    G.player.maxEnergy = Math.min(200, 100 + G.player.level * 5);
    addLog(`🌟 LEVEL UP! Level ${G.player.level}`, 'gold');
    showToast(`⭐ Level Up! Level ${G.player.level}`);
  }
}

// --------------- HUD ---------------

function updateHUD() {
  if (!G) return;
  document.getElementById('hud-money').textContent    = formatMoney(G.player.money);
  document.getElementById('hud-energy-text').textContent = `${G.player.energy}/${G.player.maxEnergy}`;
  document.getElementById('hud-energy-bar').style.width  = (G.player.energy / G.player.maxEnergy * 100) + '%';
  document.getElementById('hud-buildings').textContent   = buildings.filter(b => b.owned).length + '/50';
  document.getElementById('hud-honor').textContent       = G.player.honor;

  const infBonus = 1 + G.player.stats.inf * 0.05;
  document.getElementById('hud-income').textContent =
    formatMoney(buildings.filter(b => b.owned).reduce((s, b) => s + Math.floor(b.data.baseIncome * infBonus), 0));
  document.getElementById('player-name-display').textContent = G.player.name;

  // Sidebar level / rank
  document.getElementById('sb-level').textContent = G.player.level;
  const rank = getRank(), nextRank = getNextRank();
  document.getElementById('sb-rank').textContent = rank.name;

  const xpN = XP_TABLE[Math.min(G.player.level, XP_TABLE.length - 1)];
  document.getElementById('sb-xp-bar').style.width  = Math.min(100, G.player.xp / xpN * 100) + '%';
  document.getElementById('sb-xp-text').textContent = `${G.player.xp} / ${xpN} XP`;

  const honorNext = nextRank ? nextRank.honor : G.player.honor;
  const honorPrev = rank.honor;
  const honorPct  = nextRank
    ? Math.min(100, (G.player.honor - honorPrev) / (honorNext - honorPrev) * 100)
    : 100;
  document.getElementById('sb-honor-bar').style.width  = honorPct + '%';
  document.getElementById('sb-honor-text').textContent = nextRank
    ? `${G.player.honor} / ${honorNext}`
    : `${G.player.honor} MAX`;
}

// --------------- Activity log ---------------

function addLog(msg, type = '') {
  if (!G) return;
  const t = new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
  G.log.unshift({ msg, type, time: t });
  if (G.log.length > 50) G.log.pop();
  renderLog();
}

function renderLog() {
  document.getElementById('activity-log').innerHTML =
    G.log.slice(0, 20).map(e =>
      `<div class="log-entry ${e.type}"><span class="log-time">${e.time}</span>${e.msg}</div>`
    ).join('');
}

// --------------- Mission bar ---------------

function updateMissionBar() {
  const mc = document.getElementById('mission-content');
  if (!G?.mission) {
    mc.innerHTML = '<div style="font-size:11px;color:var(--muted);">Kein aktiver Auftrag</div>';
    return;
  }
  const m = G.mission;
  const remaining = Math.max(0, m.endsAt - Date.now());
  const progress  = 1 - remaining / (m.totalDuration * 1000);
  mc.innerHTML = `
    <div style="font-size:11px;color:var(--text);">${m.buildingIcon} ${m.buildingName}</div>
    <div class="mission-timer">${formatTime(remaining / 1000)}</div>
    <div class="mission-progress-bg"><div class="mission-progress-fill" style="width:${progress * 100}%"></div></div>`;
}

// --------------- Energy regen ---------------

function updateEnergy() {
  if (!G) return;
  const elapsed = (Date.now() - G.player.energyLastReset) / 1000;
  const regen   = Math.floor(elapsed * (G.player.maxEnergy / 86400));
  if (regen > 0) {
    G.player.energy = Math.min(G.player.maxEnergy, G.player.energy + regen);
    G.player.energyLastReset = Date.now();
  }
}

// --------------- Schutzgeld ---------------

function updateSgeldTimer() {
  if (!G) return;
  document.getElementById('sgeld-timer').textContent =
    formatTime(Math.max(0, G.sgeldTimer - Date.now()) / 1000);
  const infBonus = 1 + G.player.stats.inf * 0.05;
  const total    = buildings.filter(b => b.owned)
    .reduce((s, b) => s + Math.floor(b.data.baseIncome * infBonus), 0);
  document.getElementById('sgeld-amount-preview').textContent = formatMoney(total) + ' erwartet';
}

function collectSchutzgeld() {
  const owned = buildings.filter(b => b.owned);
  if (!owned.length) { G.sgeldTimer = Date.now() + 86_400_000; return; }

  const infBonus = 1 + G.player.stats.inf * 0.05;
  let total = 0;
  const details = [];
  for (const b of owned) {
    const inc = Math.floor(b.data.baseIncome * infBonus);
    total += inc;
    details.push(`${b.data.icon}${b.data.type}: ${formatMoney(inc)}`);
  }

  G.player.money  += total;
  G.sgeldTimer     = Date.now() + 86_400_000;
  G.player.honor  += Math.floor(owned.length * 2);
  addLog(`💰 Schutzgeld: ${formatMoney(total)}`, 'gold');

  document.getElementById('sgeld-modal-amount').textContent = formatMoney(total);
  document.getElementById('sgeld-modal-detail').textContent =
    details.slice(0, 5).join(' – ') + (details.length > 5 ? ` +${details.length - 5} weitere` : '');
  document.getElementById('sgeld-modal').classList.add('open');
  saveGame(); updateHUD();
}

function checkSchutzgeld() {
  if (!G) return;
  if (Date.now() >= G.sgeldTimer) collectSchutzgeld();
  updateSgeldTimer();
}

// --------------- Navigation ---------------

function setNav(activeId) {
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(activeId).classList.add('active');
}

// --------------- Building sidebar tooltip ---------------

function showTooltip(b, forceUpdate = false) {
  if (ttLocked && !forceUpdate) return;
  ttBuilding = b;

  document.getElementById('bi-empty').style.display   = 'none';
  document.getElementById('bi-content').style.display = 'block';

  // Icon + Name + Typ
  document.getElementById('bi-icon').textContent = b.data.icon;
  document.getElementById('bi-name').textContent = b.label || b.data.type;
  document.getElementById('bi-type').textContent = 'Wohngebäude · ' + (b.building || 'residential');

  // OSM-ID
  const osmEl = document.getElementById('bi-osm');
  if (osmEl) osmEl.textContent = b.osmId ? 'OSM #' + b.osmId : '';

  document.getElementById('bi-income').textContent   = formatMoney(b.data.baseIncome) + '/Tag';
  document.getElementById('bi-strength').textContent = 'Einschüchterung';
  document.getElementById('bi-energy').textContent   = b.data.energyCost + ' Energie';
  document.getElementById('bi-time').textContent     = formatTime(b.data.travelBase);

  const status = document.getElementById('bi-status');
  const ttBtn  = document.getElementById('tt-btn');
  const lockEl = document.getElementById('bi-lock');

  if (b.ownedByOther) {
    status.style.borderLeftColor = '#5555ee'; status.style.color = '#9090ff';
    status.textContent = `Besetzt von: ${b.ownerName || 'anderem Spieler'}`;
    ttBtn.textContent  = 'Fremdes Revier'; ttBtn.disabled = true;
  } else if (b.owned) {
    status.style.borderLeftColor = '#2ecc71'; status.style.color = '#2ecc71';
    status.textContent = 'Bereits unter deiner Kontrolle';
    ttBtn.textContent  = 'Bereits dein'; ttBtn.disabled = true;
  } else if (G?.mission) {
    status.style.borderLeftColor = '#c9973a'; status.style.color = '#c9973a';
    status.textContent = 'Du bist gerade auf Tour';
    ttBtn.textContent  = 'Auftrag läuft…'; ttBtn.disabled = true;
  } else {
    const c = canTake(b);
    status.style.borderLeftColor = c.ok ? '#c9973a' : '#8b1a1a';
    status.style.color           = c.ok ? '#c9973a' : '#8b1a1a';
    status.textContent           = c.reason;
    ttBtn.textContent            = b.data.isResidential ? 'Einschüchtern' : 'Einnehmen';
    ttBtn.disabled               = !c.ok;
  }
  if (lockEl) lockEl.textContent = ttLocked ? '🔒 Gesperrt – erneut klicken zum Lösen' : '🔓 Klicken zum Sperren';
}

function hideTooltip() {
  if (ttLocked) return;
  document.getElementById('bi-empty').style.display   = 'block';
  document.getElementById('bi-content').style.display = 'none';
  ttBuilding = null;
}
