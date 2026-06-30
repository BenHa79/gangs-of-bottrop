// ============================================================
// HAUPTQUARTIER (HQ) — Paper Doll — Der Pate von Bottrop v4
// ============================================================

// --------------- Stat upgrade cost ---------------

function statUpgradeCost(key) {
  const lvl = G.player.statLevels[key] || 0;
  const up  = STAT_UPGRADES.find(u => u.key === key);
  return Math.floor(up.baseCost * Math.pow(up.costMult, lvl));
}

// --------------- Render stat upgrade rows ---------------

function renderStatUpgradeGrid() {
  const grid = document.getElementById('stats-upgrade-grid');
  grid.innerHTML = '';
  for (const up of STAT_UPGRADES) {
    const cost      = statUpgradeCost(up.key);
    const canAfford = G.player.money >= cost;
    const curVal    = up.key === 'end'
      ? G.player.stats.end
      : (G.player.stats[up.key] || 0);

    const row = document.createElement('div');
    row.className = 'stat-upgrade-row';
    row.innerHTML = `
      <div class="sur-icon">${up.icon}</div>
      <div class="sur-info">
        <div class="sur-label">${up.label}</div>
        <div class="sur-desc">${up.desc || ''}</div>
      </div>
      <div class="sur-val">${curVal}</div>
      <div class="sur-cost" style="color:${canAfford ? 'var(--gold)' : 'var(--muted)'}">
        💰 ${formatMoney(cost)}
      </div>
      <button class="btn-upgrade${canAfford ? '' : ' dim'}" data-key="${up.key}">+</button>`;

    row.querySelector('.btn-upgrade').addEventListener('click', () => {
      if (!canAfford) { showToast('Zu wenig Geld!'); return; }
      G.player.money -= cost;
      G.player.statLevels[up.key] = (G.player.statLevels[up.key] || 0) + 1;
      if      (up.key === 'str') G.player.stats.str += 2;
      else if (up.key === 'end') G.player.stats.end += 15;
      else if (up.key === 'lck') G.player.stats.lck += 1;
      else if (up.key === 'inf') G.player.stats.inf += 1;
      addLog(`💪 ${up.label} verbessert!`, 'good');
      saveGame(); updateHUD(); openHQ();
      showToast(`${up.icon} ${up.label} verbessert!`);
    });

    grid.appendChild(row);
  }
}

// --------------- Render paper-doll equipment slots ---------------

function renderEquipment() {
  const slots = document.querySelectorAll('#hq-screen .pd-slot');
  slots.forEach(el => {
    const slotId = el.dataset.slot;
    const item   = G.player.equip[slotId];
    const slotDef = EQUIP_SLOTS.find(s => s.id === slotId);

    const iconEl  = el.querySelector('.pd-slot-icon');
    const nameEl  = el.querySelector('.pd-slot-name');
    const bonusEl = el.querySelector('.pd-slot-bonus');

    if (item) {
      iconEl.textContent  = item.icon;
      nameEl.textContent  = item.name;
      nameEl.style.color  = 'var(--gold)';
      if (bonusEl) bonusEl.textContent = item.stat || '';
      el.classList.add('filled');
    } else {
      iconEl.textContent  = slotDef ? slotDef.icon : '?';
      nameEl.textContent  = 'Leer';
      nameEl.style.color  = 'var(--muted)';
      if (bonusEl) bonusEl.textContent = '';
      el.classList.remove('filled');
    }

    // Re-attach unequip listener (clone removes old listeners)
    const fresh = el.cloneNode(true);
    el.parentNode.replaceChild(fresh, el);
    if (item) {
      fresh.addEventListener('click', () => unequipSlot(slotId));
    }
  });
}

function unequipSlot(slotId) {
  const item = G.player.equip[slotId];
  if (!item) return;
  // Remove bonuses
  for (const [k, v] of Object.entries(item.bonus || {})) {
    G.player.stats[k] = (G.player.stats[k] || 0) - v;
  }
  G.player.inventory.push({ ...item });
  delete G.player.equip[slotId];
  addLog(`${item.icon} ${item.name} abgelegt.`, '');
  saveGame(); openHQ();
  showToast(`${item.icon} ${item.name} abgelegt`);
}

// --------------- Render inventory ---------------

function renderInventory() {
  const list = document.getElementById('inventory-list');
  list.innerHTML = '';
  if (!G.player.inventory || !G.player.inventory.length) {
    list.innerHTML = '<div class="inv-empty">Noch keine Items gefunden.<br>Einschüchtern für eine Chance auf Drops!</div>';
    return;
  }
  G.player.inventory.forEach((item, i) => {
    const slotDef  = EQUIP_SLOTS.find(s => s.id === item.slot);
    const slotLabel = slotDef ? slotDef.label : item.slot;
    const el = document.createElement('div');
    el.className = 'inv-item';
    el.innerHTML = `
      <div class="ii-icon">${item.icon}</div>
      <div class="ii-body">
        <div class="ii-name">${item.name}</div>
        <div class="ii-stat">${item.stat || ''}</div>
        <div class="ii-humor">${item.humor || ''}</div>
        <div class="ii-slot">${slotLabel} · Tier ${item.tier}</div>
      </div>`;
    el.addEventListener('click', () => openEquipModal(item, i));
    list.appendChild(el);
  });
}

// --------------- Equip modal ---------------

function openEquipModal(item, idx) {
  selInv = { item, idx };
  const slotDef  = EQUIP_SLOTS.find(s => s.id === item.slot);
  const slotLabel = slotDef ? slotDef.label : item.slot;
  document.getElementById('em-title').textContent = item.name + ' anlegen';
  document.getElementById('em-item').innerHTML = `
    <div class="ii-icon" style="font-size:32px;">${item.icon}</div>
    <div class="ii-body">
      <div class="ii-name">${item.name}</div>
      <div class="ii-stat">${item.stat || ''}</div>
      <div class="ii-humor">${item.humor || ''}</div>
      <div class="ii-slot">${slotLabel} · Tier ${item.tier}</div>
    </div>`;
  const cur = G.player.equip[item.slot];
  document.getElementById('em-desc').textContent = cur
    ? `Ersetzt: ${cur.icon} ${cur.name}`
    : `${slotLabel}-Slot ist leer`;
  document.getElementById('equip-modal').classList.add('open');
}

// --------------- Open HQ ---------------

function openHQ() {
  document.getElementById('hq-screen').classList.add('open');
  document.getElementById('hq-name').textContent  = G.player.name;
  const rank = getRank();
  document.getElementById('hq-rank').textContent  = rank.name;
  document.getElementById('hq-honor').textContent = G.player.honor;
  const xpN = XP_TABLE[Math.min(G.player.level, XP_TABLE.length - 1)];
  document.getElementById('hq-xp-bar').style.width  = Math.min(100, G.player.xp / xpN * 100) + '%';
  document.getElementById('hq-xp-text').textContent = `${G.player.xp} / ${xpN} XP  (Lv ${G.player.level})`;
  renderStatUpgradeGrid();
  renderEquipment();
  renderInventory();
}
