// ============================================================
// COMBAT & INTIMIDATION — Der Pate von Bottrop v4
// ============================================================

// --------------- Loot ---------------

function rollDrop(strength) {
  if (Math.random() > 0.4 + G.player.stats.lck * 0.02) return null;
  let tier;
  if      (strength <= 5)  tier = 'tier1';
  else if (strength <= 15) tier = Math.random() < 0.7 ? 'tier1' : 'tier2';
  else if (strength <= 40) tier = Math.random() < 0.5 ? 'tier2' : 'tier3';
  else                     tier = Math.random() < 0.4 ? 'tier3' : 'tier4';
  const pool = ITEMS[tier];
  return pool[Math.floor(Math.random() * pool.length)];
}

// --------------- Rank-up check ---------------

function checkRankUp() {
  const honor = G.player.honor;
  const prevHonor = honor - (kampfState?.building?.data?.honor || 0);
  for (const rk of RANKS) {
    if (rk.honor > 0 && honor >= rk.honor && prevHonor < rk.honor) {
      addLog(`⚜️ Neuer Rang: ${rk.name}!`, 'honor');
      showToast(`⚜️ ${rk.name}!`);
    }
  }
}

// --------------- Einschüchterung (residential) ---------------

function openEinschuechterung(b) {
  isProcessing = true;    // checkMission() sperren — verhindert Mehrfach-Öffnung
  G.mission    = null;    // Mission sofort clearen, nicht erst auf "Weitermachen" warten
  saveGame();

  const scene = WOHNHAUS_SCENES[Math.floor(Math.random() * WOHNHAUS_SCENES.length)];
  einschState = { building: b, scene };

  document.getElementById('einsch-name').textContent = b.label || 'Wohngebäude';
  document.getElementById('einsch-addr').textContent = b.building
    ? 'Wohngebäude \u00b7 ' + b.building
    : 'Wohngebäude';

  // Portrait: spezifisches Bild für bekannte NPCs, anwohner_gruppe für alle anderen
  const portraitImg   = document.getElementById('einsch-portrait-img');
  const portraitEmoji = document.getElementById('einsch-portrait');
  const NPC_PORTRAITS = {
    'Waldemar K.': 'assets/images/npcs/waldemar.jpeg',
    'Herbert M.':  'assets/images/npcs/herbert.jpeg',
  };
  const imgSrc = NPC_PORTRAITS[scene.name] || 'assets/images/npcs/anwohner_gruppe.jpeg';
  if (portraitImg) {
    portraitImg.src = imgSrc;
    portraitImg.style.display = 'block';
    if (portraitEmoji) portraitEmoji.style.display = 'none';
  } else if (portraitEmoji) {
    portraitEmoji.style.display = 'block';
    portraitEmoji.textContent = scene.portrait;
  }

  document.getElementById('einsch-anwohner-name').textContent = scene.name;
  document.getElementById('einsch-anwohner-title').textContent = scene.title;
  document.getElementById('einsch-text').textContent = scene.text;
  document.getElementById('einsch-result').textContent = '💶 ' + scene.result;
  document.getElementById('einschuechterung-screen').classList.add('open');
}

// --------------- Kampf (combat) ---------------

function openKampf(b) {
  const nd  = NPC_DATA[b.data.type] || NPC_DATA['Kiosk'];
  const npc = nd.npcs[Math.floor(Math.random() * nd.npcs.length)];
  kampfState = {
    building:     b,
    npcData:      nd,
    npc,
    playerHP:     100 + G.player.stats.end + G.player.level * 8,
    playerMaxHP:  100 + G.player.stats.end + G.player.level * 8,
    enemyHP:      nd.hp + b.data.strength * 2,
    enemyMaxHP:   nd.hp + b.data.strength * 2,
    round:        0,
  };

  document.getElementById('ka-art').textContent       = b.data.icon;
  document.getElementById('ka-name').textContent      = b.data.type;
  document.getElementById('ka-desc').textContent      = nd.sceneBefore(npc);
  document.getElementById('ka-portrait').textContent  = npc.portrait;
  document.getElementById('ka-npc-name').textContent  = npc.name;
  document.getElementById('ka-npc-title').textContent = npc.title;
  document.getElementById('ka-npc-quote').textContent = npc.quote;
  document.getElementById('ka-hp').textContent        = kampfState.enemyHP;
  document.getElementById('ka-str').textContent       = nd.str + b.data.strength;
  document.getElementById('ka-danger').textContent    = npc.danger;

  showPhase('ankunft');
  document.getElementById('kampf-screen').classList.add('open');
}

function showPhase(p) {
  ['ankunft', 'kampf', 'ergebnis'].forEach(x =>
    document.getElementById('phase-' + x).classList.toggle('active', x === p)
  );
}

function updateKampfBars() {
  const ks = kampfState;
  const pp = Math.max(0, ks.playerHP / ks.playerMaxHP * 100);
  const ep = Math.max(0, ks.enemyHP  / ks.enemyMaxHP  * 100);
  document.getElementById('kk-player-hp-bar').style.width  = pp + '%';
  document.getElementById('kk-player-hp-text').textContent = `${Math.max(0, ks.playerHP)}/${ks.playerMaxHP}`;
  document.getElementById('kk-enemy-hp-bar').style.width   = ep + '%';
  document.getElementById('kk-enemy-hp-text').textContent  = `${Math.max(0, ks.enemyHP)}/${ks.enemyMaxHP}`;
  document.getElementById('kk-round').textContent          = ks.round;
}

function runRound() {
  const ks = kampfState;
  if (ks.playerHP <= 0 || ks.enemyHP <= 0) { endKampf(); return; }
  ks.round++;

  const weapon = G.player.equip['waffe'];
  const wBonus = weapon ? (weapon.bonus.str || 0) : 0;
  let pDmg = Math.max(1, Math.floor(
    (G.player.stats.str + wBonus) * 0.8 +
    Math.random() * (G.player.stats.str * 0.5 + 3)
  ));
  const crit = Math.random() < (0.05 + G.player.stats.lck * 0.01);
  if (crit) pDmg = Math.floor(pDmg * 2);

  const eStr = ks.npcData.str + ks.building.data.strength;
  let eDmg = Math.max(1, Math.floor(eStr * 0.5 + Math.random() * eStr * 0.4));

  let specText = '', specClass = '';
  if (Math.random() < 0.15) {
    const ev = SPECIAL_EVENTS[Math.floor(Math.random() * SPECIAL_EVENTS.length)];
    specText = ev.text(ks.npc); specClass = 'special';
    if (ev.effect === 'stun_enemy')     eDmg  = 0;
    if (ev.effect === 'extra_dmg')      pDmg  = Math.floor(pDmg * 1.5);
    if (ev.effect === 'player_stumble') pDmg  = Math.floor(pDmg * 0.5);
  }

  ks.enemyHP  -= pDmg;
  ks.playerHP -= eDmg;

  const wName = weapon ? weapon.name : 'Fäuste';
  let html = `<div class="kampf-round ${specClass}"><div class="round-num">Runde ${ks.round}</div><div>`;
  if (specText) html += `<em style="color:var(--gold)">✨ ${specText}</em><br>`;
  html += `Du triffst mit <strong>${wName}</strong> – <span class="dmg-player">-${pDmg} HP${crit ? ' (KRIT!!)' : ''}</span><br>`;
  html += eDmg > 0
    ? `${ks.npc.name} schlägt zurück – <span class="dmg-enemy">-${eDmg} HP</span>`
    : `${ks.npc.name} kann sich nicht wehren!`;
  html += `</div></div>`;

  const log = document.getElementById('kampf-log');
  log.insertAdjacentHTML('beforeend', html);
  log.scrollTop = log.scrollHeight;

  updateKampfBars();
  document.getElementById('kk-status').textContent =
    ks.playerHP > ks.enemyHP ? 'Du dominierst!' : 'Knapp...';

  if (ks.playerHP <= 0 || ks.enemyHP <= 0) setTimeout(endKampf, 600);
  else                                       setTimeout(runRound, 900);
}

function endKampf() {
  const ks  = kampfState;
  const won = ks.enemyHP <= 0 && ks.playerHP > 0;

  if (won) {
    ks.building.owned = true;
    G.mission = null;
    G.player.xp += ks.building.data.xp;
    checkLevelUp();
    const money = ks.building.data.baseIncome + Math.floor(Math.random() * ks.building.data.baseIncome * 0.5);
    G.player.money += money;
    G.player.honor += ks.building.data.honor;
    checkRankUp();
    const drop = rollDrop(ks.building.data.strength);
    if (drop) G.player.inventory.push({ ...drop });

    addLog(`✅ ${ks.building.data.icon} ${ks.building.data.type}! +${formatMoney(money)} +${ks.building.data.xp}XP +${ks.building.data.honor} Ehre`, 'gold');

    document.getElementById('er-scene').textContent     = ks.npcData.winScene;
    document.getElementById('er-title').textContent     = 'Sieg!';
    document.getElementById('er-title').className       = 'ergebnis-title win';
    document.getElementById('er-desc').textContent      = ks.npcData.sceneWin(ks.npc);

    let rh = `
      <div class="reward-card"><div class="rc-icon">💵</div><div class="rc-val">${formatMoney(money)}</div><div class="rc-label">Bargeld</div></div>
      <div class="reward-card"><div class="rc-icon">⭐</div><div class="rc-val">${ks.building.data.xp}</div><div class="rc-label">XP</div></div>
      <div class="reward-card"><div class="rc-icon">⚜️</div><div class="rc-val">${ks.building.data.honor}</div><div class="rc-label">Ehre</div></div>`;
    if (drop) rh += `<div class="reward-card"><div class="rc-icon">${drop.icon}</div><div class="rc-val" style="font-size:13px;">${drop.name}</div><div class="rc-label">${drop.humor || drop.stat}</div></div>`;
    document.getElementById('er-rewards').innerHTML = rh;

  } else {
    G.mission = null;
    const honorLoss = Math.floor(ks.building.data.honor * 0.3);
    G.player.honor = Math.max(0, G.player.honor - honorLoss);

    addLog(`💀 Niederlage bei ${ks.building.data.icon} ${ks.building.data.type}. -${honorLoss} Ehre`, 'bad');

    document.getElementById('er-scene').textContent     = ks.npcData.loseScene;
    document.getElementById('er-title').textContent     = 'Niederlage!';
    document.getElementById('er-title').className       = 'ergebnis-title lose';
    document.getElementById('er-desc').textContent      = ks.npcData.sceneLose(ks.npc);
    document.getElementById('er-rewards').innerHTML     =
      `<div class="reward-card"><div class="rc-icon">😞</div><div class="rc-val" style="font-size:13px;">Nichts</div><div class="rc-label">-${honorLoss} Ehre</div></div>`;
  }

  showPhase('ergebnis');
  saveGame(); updateHUD(); drawCity();
}
