// ============================================================
// COMBAT FORMULAS — geteilt zwischen Client (Browser) und Server (Node)
// ============================================================
// Läuft per <script> im Browser UND per require() in Node — kein
// Bundler nötig. Änderungen hier wirken sich auf NPC-Kampf (Client)
// und PvP-Kampf (Server, server/pvpCombat.js) gleichermaßen aus.
// ============================================================

(function (root) {
  'use strict';

  function computeMaxHP(stats, level) {
    return 100 + stats.end + level * 8;
  }

  function computeCritChance(stats) {
    return 0.05 + stats.lck * 0.01;
  }

  function computeAttackDamage(stats, weaponStrBonus) {
    return Math.max(1, Math.floor(
      (stats.str + weaponStrBonus) * 0.8 +
      Math.random() * (stats.str * 0.5 + 3)
    ));
  }

  const api = { computeMaxHP, computeCritChance, computeAttackDamage };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  } else {
    root.CombatFormulas = api;
  }
})(typeof window !== 'undefined' ? window : global);
