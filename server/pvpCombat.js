// ============================================================
// PVP COMBAT RESOLVER — Der Pate von Bottrop v4
// ============================================================
// Entscheidet Spieler-gegen-Spieler-Kämpfe serverseitig (nie dem
// Client vertrauen — sonst könnte ein manipulierter Client einem
// echten anderen Spieler das Gebäude stehlen). Nutzt dieselben
// Formeln wie der Client (js/combatFormulas.js), damit Anzeige und
// Server-Entscheidung nicht auseinanderlaufen.
//
// effects-Reihenfolge unten MUSS mit SPECIAL_EVENTS in
// js/constants.js übereinstimmen (Index-basierte Referenz):
//   0 stun_enemy, 1 extra_dmg, 2 none, 3 extra_dmg, 4 player_stumble, 5 none
// ============================================================

'use strict';

const { computeMaxHP, computeAttackDamage, computeCritChance } = require('../js/combatFormulas');

const SPECIAL_EFFECTS = ['stun_enemy', 'extra_dmg', 'none', 'extra_dmg', 'player_stumble', 'none'];
const MAX_ROUNDS = 60;

// attacker/defender: { level, stats, equip }
function resolvePvp(attacker, defender) {
  const aWeaponBonus = (attacker.equip.waffe && attacker.equip.waffe.bonus.str) || 0;
  const dWeaponBonus = (defender.equip.waffe && defender.equip.waffe.bonus.str) || 0;

  const playerMaxHP = computeMaxHP(attacker.stats, attacker.level);
  const enemyMaxHP  = computeMaxHP(defender.stats, defender.level);
  let playerHP = playerMaxHP;
  let enemyHP  = enemyMaxHP;

  const rounds = [];
  let round = 0;

  while (playerHP > 0 && enemyHP > 0 && round < MAX_ROUNDS) {
    round++;

    let pDmg = computeAttackDamage(attacker.stats, aWeaponBonus);
    const crit = Math.random() < computeCritChance(attacker.stats);
    if (crit) pDmg = Math.floor(pDmg * 2);

    let eDmg = computeAttackDamage(defender.stats, dWeaponBonus);

    let special = null;
    if (Math.random() < 0.15) {
      const index = Math.floor(Math.random() * SPECIAL_EFFECTS.length);
      const effect = SPECIAL_EFFECTS[index];
      if (effect === 'stun_enemy')     eDmg = 0;
      if (effect === 'extra_dmg')      pDmg = Math.floor(pDmg * 1.5);
      if (effect === 'player_stumble') pDmg = Math.floor(pDmg * 0.5);
      special = { index, effect };
    }

    enemyHP  -= pDmg;
    playerHP -= eDmg;

    rounds.push({
      round, pDmg, eDmg, crit, special,
      playerHpAfter: Math.max(0, playerHP),
      enemyHpAfter:  Math.max(0, enemyHP),
    });
  }

  // Unentschieden/Rundenlimit -> Verteidiger behält Heimvorteil
  const win = enemyHP <= 0 && playerHP > 0;

  return { win, rounds, playerMaxHP, enemyMaxHP };
}

module.exports = { resolvePvp };
