// ============================================================
// UTILITIES — Der Pate von Bottrop v4
// ============================================================

function formatMoney(n) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M €';
  if (n >= 1_000)     return (n / 1_000).toFixed(1) + 'K €';
  return n + ' €';
}

function formatTime(s) {
  s = Math.floor(s);
  if (s <= 0) return '00:00:00';
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
}

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2800);
}

/** Fisher-Yates shuffle (in-place) */
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** AABB overlap test */
function overlapsZone(x, y, w, h, zone) {
  return x < zone.x + zone.w &&
         x + w > zone.x &&
         y < zone.y + zone.h &&
         y + h > zone.y;
}

/** Seeded pseudo-random number generator */
function seededRandom(seed) {
  let s = seed;
  return () => { s = Math.sin(s) * 10000; return s - (s | 0); };
}
