// ============================================================
// GAME CONSTANTS — Der Pate von Bottrop v4
// ============================================================

const RANKS = [
  { name: 'Neuling',       honor: 0 },
  { name: 'Straßenköter',  honor: 50 },
  { name: 'Soldat',        honor: 200 },
  { name: 'Capo',          honor: 600 },
  { name: 'Unterboss',     honor: 1500 },
  { name: 'Pate',          honor: 4000 },
];

const XP_TABLE = [0,100,250,500,900,1500,2400,3700,5500,8000,12000,17000,24000,33000,45000];

const STAT_UPGRADES = [
  { key:'str', label:'Stärke',   icon:'💪', desc:'Mehr Schaden im Kampf', baseCost:200, costMult:1.5 },
  { key:'end', label:'Ausdauer', icon:'🛡️', desc:'Mehr HP im Kampf',      baseCost:200, costMult:1.5 },
  { key:'lck', label:'Glück',    icon:'🍀', desc:'Bessere Item-Drops',    baseCost:150, costMult:1.4 },
  { key:'inf', label:'Einfluss', icon:'🎩', desc:'+5% Schutzgeld',        baseCost:300, costMult:1.6 },
];

const BUILDING_TYPES = [
  { type:'Wohnhaus',   icon:'🏢', baseIncome:30,   strength:0,   energyCost:3,  travelBase:15,  xp:10,   honor:2,   isResidential:true  },
  { type:'Kiosk',      icon:'🏪', baseIncome:60,   strength:4,   energyCost:5,  travelBase:20,  xp:20,   honor:5,   isResidential:false },
  { type:'Imbiss',     icon:'🌭', baseIncome:100,  strength:7,   energyCost:10, travelBase:35,  xp:40,   honor:8,   isResidential:false },
  { type:'Tankstelle', icon:'⛽', baseIncome:180,  strength:12,  energyCost:15, travelBase:55,  xp:60,   honor:15,  isResidential:false },
  { type:'Restaurant', icon:'🍝', baseIncome:320,  strength:20,  energyCost:20, travelBase:75,  xp:100,  honor:25,  isResidential:false },
  { type:'Supermarkt', icon:'🛒', baseIncome:480,  strength:30,  energyCost:25, travelBase:95,  xp:150,  honor:35,  isResidential:false },
  { type:'Nachtclub',  icon:'🎵', baseIncome:750,  strength:45,  energyCost:35, travelBase:135, xp:250,  honor:60,  isResidential:false },
  { type:'Spielhalle', icon:'🎰', baseIncome:1100, strength:65,  energyCost:45, travelBase:175, xp:400,  honor:100, isResidential:false },
  { type:'Juwelier',   icon:'💍', baseIncome:1800, strength:90,  energyCost:60, travelBase:235, xp:600,  honor:150, isResidential:false },
  { type:'Kasino',     icon:'🎲', baseIncome:4500, strength:150, energyCost:80, travelBase:355, xp:1000, honor:300, isResidential:false },
];

const WOHNHAUS_SCENES = [
  { portrait:'👵', name:'Erna Schulz', title:'Rentnerin, 3. Stock',
    text:'Du klingelst. Hinter der Tür hörst du Pantoffeln schlurfen. Dann – Stille. Der Spion wird zugeklebt. Du hörst nur noch leises Beten.',
    result:'Erna zahlt. Kommentarlos. Sie hat schon schlimmeres überlebt. Die DDR zum Beispiel.' },
  { portrait:'👨‍🦳', name:'Klaus-Dieter P.', title:'Hausmeister & Blockwart',
    text:'Du trittst ein. Klaus-Dieter tritt sofort mit einem Klemmbrett entgegen. "Ich brauch Ihren Ausweis, einen unterschriebenen Mietvertrag und—" Du schaust ihn nur an.',
    result:'Klaus-Dieter zahlt. Er trägt den Betrag sorgfältig in sein Klemmbrett ein. Rubrik: "Sonstige Ausgaben".' },
  { portrait:'👩‍🦱', name:'Monika T.', title:'Mutter von vier Kindern',
    text:'"Ich mach die Tür NICHT auf!" schallt es von innen. Dann Kinderstimmen: "Mama wer ist das?" – "NIEMAND. Macht den Fernseher lauter."',
    result:'Ein Umschlag wird unter der Tür durchgeschoben. Kein Wort. Respektvolle Lösung.' },
  { portrait:'🧔', name:'Waldemar K.', title:'Student im 11. Semester',
    text:'"Alter, ich bin gerade am Zocken." Er öffnet die Tür in Unterhose. Dann sieht er dich. Dann sieht er deine Männer. Dann schließt er die Tür. Dann öffnet er sie wieder.',
    result:'Waldemar zahlt in Kleingeld. Viel Kleingeld. Du nimmst es trotzdem.' },
  { portrait:'👴', name:'Herbert M.', title:'Rentner & Schachspieler',
    text:'Herbert öffnet sofort. "Ich hab\' auf Sie gewartet", sagt er ruhig. "Schach?" Er deutet auf ein aufgebautes Brett. Du lehnst ab. Trotzdem respektierst du ihn.',
    result:'Herbert zahlt. Er schüttelt dir die Hand. "Saubere Arbeit", sagt er. Du weißt nicht warum, aber das tut gut.' },
  { portrait:'👩', name:'Sandra B.', title:'Friseurin, Erdgeschoss',
    text:'"OH GOTT NEIN" – das ist alles was du von drinnen hörst. Dann Laufen. Dann Stille. Du harrst aus. Sandra kommt mit einem Briefumschlag zurück.',
    result:'Sandra zahlt. "Können Sie meinem Mann nichts sagen?" Du nickst. Diskretion gehört zum Handwerk.' },
];

const NPC_DATA = {
  'Kiosk': {
    npcs:[{ name:'Ali Yilmaz', title:"Kiosk-König seit '87", portrait:'🧔', quote:'"14 Stunden täglich. Versuch\'s ruhig."', danger:'⭐' }],
    hp:50, str:4,
    sceneBefore:(n)=>`Du betrittst den Kiosk. Es riecht nach altem Kaffee. ${n.name} schaut dich über die Brille an.`,
    sceneWin:(n)=>`${n.name} hebt die Hände: "Okay! Aber die Zeitungsrechnung von Frau Müller zahlst du selbst!"`,
    sceneLose:(n)=>`${n.name} wirft dir abgelaufenes Bounty nach: "Und kauf was, wenn du wiederkommst!"`,
    winScene:'🤕', loseScene:'😤',
  },
  'Imbiss': {
    npcs:[{ name:'Döner-Dieter', title:'Grillmeister & Pazifist', portrait:'👨‍🍳', quote:'"Ich hab\' ein Messer und Schärfe-Stufe 5. Überleg\' es dir."', danger:'⭐⭐' }],
    hp:80, str:8,
    sceneBefore:(n)=>`Der Geruch von frischem Döner liegt in der Luft. ${n.name} steht mit dem Messer hinterm Tresen.`,
    sceneWin:(n)=>`${n.name} schüttelt den Kopf: "Schön... aber mein Rezept geb\' ich NICHT raus." Er reicht dir einen Döner. "Auf Kosten des ehemaligen Hauses."`,
    sceneLose:(n)=>`${n.name} schmeißt dir Soße nach: "Extra scharf! Für Leute wie dich!"`,
    winScene:'🌯👊', loseScene:'🔥😅',
  },
  'Tankstelle': {
    npcs:[
      { name:'Heinz-Werner', title:'Tankwart & Schrauber', portrait:'🧔‍♂️', quote:'"Ich hab\' nen Scheibenwischer und ich weiß wie man ihn benutzt."', danger:'⭐⭐⭐' },
      { name:'Rüdiger P.', title:'Pächter seit 1998', portrait:'👨‍🔧', quote:'"Mein Cousin ist Polizist. Mehrere Cousins sogar."', danger:'⭐⭐⭐' },
    ],
    hp:120, str:14,
    sceneBefore:(n)=>`Benzingeruch. ${n.name} wischt Hände an einem Lappen ab und mustert dich.`,
    sceneWin:(n)=>`${n.name} hat ein blaues Auge: "Du kannst die Tankstelle haben. Aber ich tank\' weiterhin kostenlos." Er tippt auf die Stirn. "Das ist nicht verhandelbar."`,
    sceneLose:(n)=>`${n.name} schlägt dir mit dem Scheibenwischer: "30 Liter Super oder mach die Tür zu!"`,
    winScene:'⛽🤕', loseScene:'🔧😂',
  },
  'Restaurant': {
    npcs:[{ name:'Salvatore Mancini', title:'Chefkoch & Familienmensch', portrait:'👨‍🍳', quote:'"Ich hab\' Nonnas Versprechen gegeben nie aufzugeben. Sie wurde 97."', danger:'⭐⭐⭐⭐' }],
    hp:170, str:22,
    sceneBefore:(n)=>`Basilikumduft. ${n.name} kommt mit Schürze und Nudelholz aus der Küche.`,
    sceneWin:(n)=>`${n.name} wischt eine Träne: "Nonnas Rezepte gehören trotzdem mir." Er reicht den Schlüssel. "Heute Abend essen wir zusammen. Das ist Pflicht."`,
    sceneLose:(n)=>`${n.name} verfolgt dich mit dem Nudelholz: "UND BESTELL BEIM NÄCHSTEN MAL WENIGSTENS PASTA!"`,
    winScene:'🍝🏆', loseScene:'🍝😵',
  },
  'Supermarkt': {
    npcs:[{ name:'Norbert K.', title:'Filialleiter, Typ Verwaltungsmensch', portrait:'👔', quote:'"Ich manage 40 Mitarbeiter und 8000 Artikel. Du bist Artikel 8001."', danger:'⭐⭐⭐⭐' }],
    hp:220, str:32,
    sceneBefore:(n)=>`Neonlicht, Fahrstuhlmusik. ${n.name} kommt mit Klemmbrett auf dich zu.`,
    sceneWin:(n)=>`${n.name} reicht widerwillig die Schlüssel: "Die Kühlkette wird eingehalten. Das ist nicht verhandelbar." Blaues Auge, aufrechte Haltung.`,
    sceneLose:(n)=>`${n.name} ruft Security: "Hausverbot! Kaufen Sie Ihre Milch woanders!"`,
    winScene:'🛒✅', loseScene:'🛒🚫',
  },
  'Nachtclub': {
    npcs:[{ name:'Big Manni', title:'Türsteher, Betreiber, Problem', portrait:'🦾', quote:'"Gästeliste voll. Für immer."', danger:'⭐⭐⭐⭐⭐' }],
    hp:300, str:48,
    sceneBefore:(n)=>`Bass dröhnt durch Wände. ${n.name} verschränkt Arme. Er ist größer als erwartet.`,
    sceneWin:(n)=>`${n.name} sitzt auf dem Boden: "Okay. Du bist drin." Schlüssel vom Schankraum. "Die Musik bestimme ICH."`,
    sceneLose:(n)=>`${n.name} schmeißt dich persönlich raus. Du landest auf dem Bürgersteig.`,
    winScene:'🎵👑', loseScene:'🎵😵',
  },
  'Spielhalle': {
    npcs:[{ name:'Freddy "Münze"', title:'Patriarch & Geldwäscher (buchhalterisch)', portrait:'🕹️', quote:'"Ich hab\' hier mehr Geld gewaschen als du je gesehen hast. Buchhalterisch."', danger:'💀💀💀' }],
    hp:400, str:68,
    sceneBefore:(n)=>`Blinkende Automaten, Münzgeräusche. ${n.name} lächelt kalt.`,
    sceneWin:(n)=>`${n.name} nickt: "Respekt. Ich hab\' Leute gefeuert die schlechter waren." Reicht dir einen Münzbeutel. "Auf mich."`,
    sceneLose:(n)=>`${n.name} lacht: "Komm wieder, wenn du Level 20 bist. Vielleicht."`,
    winScene:'🎰👑', loseScene:'🎰💀',
  },
  'Juwelier': {
    npcs:[{ name:'Viktor S.', title:'Juwelier & diskreter Geschäftsmann', portrait:'💎', quote:'"Ich schätze Werte. Menschen und Steine gleichermaßen. Du bist kein Diamant."', danger:'💀💀💀💀' }],
    hp:550, str:95,
    sceneBefore:(n)=>`Ticken von Uhren. ${n.name} legt die Lupe nieder und betrachtet dich wie ein schlechtes Exemplar.`,
    sceneWin:(n)=>`${n.name} verbeugt sich: "Ich hatte falsch geschätzt." Übergibt Tresorschlüssel. "Den Code ändere ich natürlich."`,
    sceneLose:(n)=>`${n.name} lässt diskret die Jalousien runter: "Auf Wiedersehen. Oder auch nicht."`,
    winScene:'💍🏆', loseScene:'💎😶',
  },
  'Kasino': {
    npcs:[{ name:'Der Sizilianer', title:'Unbekannt. Gefürchtet.', portrait:'🎭', quote:'"..."', danger:'💀💀💀💀💀' }],
    hp:900, str:155,
    sceneBefore:(n)=>`Das Kasino ist still. Zu still. ${n.name} sitzt am Haupttisch. Er schaut dich nicht an. Er muss nicht.`,
    sceneWin:(n)=>`Der Sizilianer steht auf, nickt einmal. Kein Wort. Legt den Schlüssel auf den Tisch und geht. Irgendwie ist das beängstigender als eine Niederlage.`,
    sceneLose:(n)=>`Du erinnerst dich an wenig. Irgendwann wachst du draußen auf. Er lässt Gegner leben. Als Warnung.`,
    winScene:'🎲👑', loseScene:'🎲💀',
  },
};

const ITEMS = {
  tier1: [
    { name:'Kaputtes Bügeleisen',    icon:'🪣', slot:'waffe',  stat:'Stärke +2',    humor:'Schwer, heiß, gefährlich. Nicht zum Bügeln.',        bonus:{str:2},  tier:1 },
    { name:'Socke mit Sand',          icon:'🧦', slot:'waffe',  stat:'Stärke +1',    humor:'Omas Geheimwaffe. Riecht noch leicht.',              bonus:{str:1},  tier:1 },
    { name:'Regenschirm (kaputt)',    icon:'☂️', slot:'waffe',  stat:'Stärke +1',    humor:'Öffnet sich manchmal. Meistens im Kampf.',           bonus:{str:1},  tier:1 },
    { name:'Omas Krückstock',         icon:'🦯', slot:'waffe',  stat:'Stärke +3',    humor:'Oma kämpfte damit in zwei Kriegen. Kein Witz.',      bonus:{str:3},  tier:1 },
    { name:'Baseballmütze (rückwärts)',icon:'🧢',slot:'kopf',  stat:'Glück +1',     humor:'Macht dich 40% cooler. Laut dir.',                   bonus:{lck:1},  tier:1 },
    { name:'Fake-Goldkette',          icon:'📿', slot:'hals',   stat:'Respekt +3',   humor:'Läuft grün an. Sieht trotzdem gut aus.',             bonus:{rep:3},  tier:1 },
    { name:'Unterhemd (weiß)',        icon:'👕', slot:'körper', stat:'Ausdauer +5',  humor:'Klassisch. Zeitlos. Leicht vergilbt.',               bonus:{end:5},  tier:1 },
    { name:'Jogginghose (3 Streifen)',icon:'👖', slot:'füße',   stat:'Einfluss +1',  humor:'Echter Respekt auf der Straße.',                     bonus:{inf:1},  tier:1 },
    { name:'Tattoo (selbst gestochen)',icon:'💪',slot:'extra',  stat:'Respekt +5',   humor:'"Mama" – auf dem Unterarm. Niemand lacht.',          bonus:{rep:5},  tier:1 },
  ],
  tier2: [
    { name:'Küchenmesser (Aldi)',     icon:'🔪', slot:'waffe',  stat:'Stärke +6',    humor:'Scharf genug für Tomaten UND Gegner.',               bonus:{str:6},  tier:2 },
    { name:'Fahrradkette',            icon:'⛓️', slot:'waffe',  stat:'Stärke +5',    humor:'War mal am Fahrrad. Fahrrad ist jetzt weg.',         bonus:{str:5},  tier:2 },
    { name:'Gangsterhut (H&M)',       icon:'🎩', slot:'kopf',   stat:'Respekt +10',  humor:'€9,99. Fühlt sich nach einer Million an.',           bonus:{rep:10}, tier:2 },
    { name:'Lederjacke (Kunstleder)', icon:'🧥', slot:'körper', stat:'Ausdauer +15', humor:'Quietscht beim Gehen. Klingt einschüchternd.',       bonus:{end:15}, tier:2 },
    { name:'Goldkette (Rummel)',       icon:'⛓️', slot:'hals',  stat:'Respekt +8',   humor:'Aus dem Automaten. 2 Euro. Goldwert: 0.',            bonus:{rep:8},  tier:2 },
    { name:'Signet-Ring (Silber)',    icon:'💍', slot:'hand',   stat:'Glück +4',     humor:'Trägt die Initiale "K". Dein Name fängt mit M an.', bonus:{lck:4},  tier:2 },
    { name:'Sonnenbrille (drinnen)',  icon:'🕶️', slot:'kopf',  stat:'Respekt +7',   humor:'Drin tragen = maximale Einschüchterung.',            bonus:{rep:7},  tier:2 },
  ],
  tier3: [
    { name:'Messer (echt)',           icon:'🗡️', slot:'waffe',  stat:'Stärke +15',   humor:'Keine Witze mehr. Das Ding ist scharf.',             bonus:{str:15}, tier:3 },
    { name:'Fedora (echter Filz)',    icon:'🎩', slot:'kopf',   stat:'Einfluss +6',  humor:"Jetzt wird's ernst.",                                bonus:{inf:6},  tier:3 },
    { name:'Maßanzug',                icon:'🤵', slot:'körper', stat:'Ausdauer +30', humor:'Vom Schneider. Nicht vom Discounter.',               bonus:{end:30}, tier:3 },
    { name:'Silberring (echt)',       icon:'💍', slot:'hand',   stat:'Glück +8',     humor:'Schwer. Massiv. Schmerzhaft im Einsatz.',            bonus:{lck:8},  tier:3 },
    { name:'Aktentasche (Leder)',     icon:'💼', slot:'extra',  stat:'Einfluss +8',  humor:'Leer. Aber wer weiß das schon.',                     bonus:{inf:8},  tier:3 },
  ],
  tier4: [
    { name:'Schrotflinte',            icon:'🔫', slot:'waffe',  stat:'Stärke +30',   humor:'Ende der Humorzone.',                                bonus:{str:30}, tier:4 },
    { name:'Diamantuhr',              icon:'⌚', slot:'hand',   stat:'Glück +20',    humor:'Tickt wie dein Herz. Teurer.',                       bonus:{lck:20}, tier:4 },
    { name:'Patenmantel',             icon:'🧣', slot:'körper', stat:'Ausdauer +60', humor:'Trägt sich wie Macht.',                              bonus:{end:60}, tier:4 },
    { name:'Siegelring',              icon:'💎', slot:'hand',   stat:'Einfluss +20', humor:'Wer diesen Ring trägt, gewinnt.',                    bonus:{inf:20}, tier:4 },
  ],
};

const EQUIP_SLOTS = [
  { id:'kopf',   label:'Kopf',   icon:'🎩' },
  { id:'hals',   label:'Hals',   icon:'📿' },
  { id:'körper', label:'Körper', icon:'🥼' },
  { id:'waffe',  label:'Waffe',  icon:'🔫' },
  { id:'hand',   label:'Hand',   icon:'💍' },
  { id:'füße',   label:'Füße',   icon:'👢' },
  { id:'extra',  label:'Extra',  icon:'🌟' },
];

const SPECIAL_EVENTS = [
  { text:(n)=>`${n.name} stolpert über den eigenen Schuh! Runde ausgesetzt!`, effect:'stun_enemy'    },
  { text:(n)=>`Du triffst einen empfindlichen Nerv – ${n.name} schreit auf!`,  effect:'extra_dmg'    },
  { text:(n)=>`${n.name} ruft um Hilfe. Niemand kommt.`,                        effect:'none'         },
  { text:()=>`Du findest in deiner Jackentasche... Pfefferspray?! Jackpot!`,    effect:'extra_dmg'    },
  { text:()=>`Deine Schuhsohle löst sich. Du kämpfst trotzdem weiter.`,        effect:'player_stumble'},
  { text:(n)=>`${n.name} versucht abzulenken: "Schau mal da!" Du schaust nicht.`, effect:'none'      },
];
