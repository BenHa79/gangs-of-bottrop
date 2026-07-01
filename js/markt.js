// ============================================================
// SCHWARZMARKT — Der Pate von Bottrop v4
// ============================================================

function generateMarktItems(seed) {
  const rng = seededRandom(seed);
  const allItems = [...ITEMS.tier1, ...ITEMS.tier2, ...ITEMS.tier3, ...ITEMS.tier4];
  const result = [], used = new Set();
  while (result.length < 5) {
    const idx = Math.floor(rng() * allItems.length);
    if (!used.has(idx)) { used.add(idx); result.push(allItems[idx]); }
  }
  return result;
}

function itemPrice(item) {
  const base = { 1: 300, 2: 800, 3: 2500, 4: 8000 };
  return { money: base[item.tier] || 300, honor: item.tier * 10 };
}

function openMarkt() {
  marktItems = generateMarktItems(G.marktSeed);
  renderMarkt();
  document.getElementById('markt-screen').classList.add('open');
  document.querySelectorAll('.nav-icon-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('btn-markt-view').classList.add('active');
}

function renderMarkt() {
  const c = document.getElementById('markt-items');
  c.innerHTML = '';

  for (const item of marktItems) {
    const price       = itemPrice(item);
    const canBuyMoney = G.player.money >= price.money;
    const canBuyHonor = G.player.honor >= price.honor * 10;

    const el = document.createElement('div');
    el.className = 'markt-item';
    el.innerHTML = `
      <div class="mi-icon">${item.icon}</div>
      <div class="mi-name">${item.name}</div>
      <div class="mi-humor">${item.humor || item.stat}</div>
      <div class="mi-stat">${item.stat}</div>
      <div class="mi-price">
        <span class="price-tag money">💰 ${formatMoney(price.money)}</span>
        <span style="font-size:10px;color:var(--muted);">oder</span>
        <span class="price-tag honor">✦ ${price.honor * 10} Ehre</span>
      </div>
      <button class="mi-buy" data-pay="money" ${canBuyMoney ? '' : 'disabled'}>Mit Geld kaufen</button>
      <button class="mi-buy" data-pay="honor" ${canBuyHonor ? '' : 'disabled'}
        style="background:${canBuyHonor ? '#7c3aed' : 'var(--dim)'};color:${canBuyHonor ? '#fff' : 'var(--muted)'}">
        Mit Ehre kaufen
      </button>`;

    el.querySelectorAll('.mi-buy').forEach(btn =>
      btn.addEventListener('click', () => buyMarktItem(item, btn.dataset.pay, price))
    );
    c.appendChild(el);
  }

  document.getElementById('markt-timer').textContent =
    formatTime(Math.max(0, G.marktTimer - Date.now()) / 1000);
}

function buyMarktItem(item, payWith, price) {
  if (payWith === 'money') {
    if (G.player.money < price.money) { showToast('Zu wenig Geld!'); return; }
    G.player.money -= price.money;
  } else {
    if (G.player.honor < price.honor * 10) { showToast('Zu wenig Ehre!'); return; }
    G.player.honor -= price.honor * 10;
  }
  G.player.inventory.push({ ...item });
  marktItems = marktItems.filter(i => i !== item);
  addLog(`🚉 Gekauft: ${item.icon} ${item.name}`, 'gold');
  saveGame(); updateHUD(); renderMarkt();
  showToast(`${item.icon} ${item.name} gekauft!`);
}

function checkMarktTimer() {
  if (!G) return;
  if (Date.now() >= G.marktTimer) {
    G.marktTimer = Date.now() + 86_400_000;
    G.marktSeed  = Math.floor(Math.random() * 10000);
    marktItems   = generateMarktItems(G.marktSeed);
    addLog('🚉 Neues Angebot am Schwarzmarkt!', 'gold');
    saveGame();
  }
  if (document.getElementById('markt-screen').classList.contains('open')) {
    document.getElementById('markt-timer').textContent =
      formatTime(Math.max(0, G.marktTimer - Date.now()) / 1000);
  }
}
