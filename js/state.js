// ============================================================
// GLOBAL STATE — Der Pate von Bottrop v4
// ============================================================

const VAR_GREEN2 = '#2ecc71';

// Mutable runtime state
let G         = null;    // main game save object
let buildings = [];      // array of building instances

let kampfState  = null;      // current combat state
let einschState = null;      // current intimidation state
let selInv      = null;      // selected inventory item

let ttBuilding  = null;      // building shown in sidebar
let ttLocked    = false;     // sidebar locked on click

let marktItems  = [];        // current black-market offerings
let marktTimer  = 0;

// Sprite images (nicht mehr für Karte genutzt)
const sprites    = {};
const gameImages = {};

// ── Mission / scene lock ──────────────────────────────────────
let isProcessing = false;  // true while Einschüchterung screen is open
