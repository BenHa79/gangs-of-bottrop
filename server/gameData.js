// ============================================================
// GAME DATA (Server-Kopie) — Der Pate von Bottrop v4
// ============================================================
// Autoritative Spieldaten für serverseitige Plausibilitätsprüfungen.
// Muss inhaltlich mit js/constants.js übereinstimmen (Items, Stat-
// Upgrades, XP-Tabelle, Gebäudetypen) — Änderungen dort auch hier
// nachziehen.
// ============================================================

'use strict';

const XP_TABLE = [0,100,250,500,900,1500,2400,3700,5500,8000,12000,17000,24000,33000,45000];

const BASE_STATS = { str: 5, end: 50, ges: 5, lck: 5, inf: 1, rep: 0, cha: 1 };

const BUILDING_TYPES = [
  { type:'Wohnhaus',   baseIncome:30,   strength:0,   energyCost:3,  xp:10,   honor:2,   isResidential:true  },
  { type:'Kiosk',      baseIncome:60,   strength:4,   energyCost:5,  xp:20,   honor:5,   isResidential:false },
  { type:'Imbiss',     baseIncome:100,  strength:7,   energyCost:10, xp:40,   honor:8,   isResidential:false },
  { type:'Tankstelle', baseIncome:180,  strength:12,  energyCost:15, xp:60,   honor:15,  isResidential:false },
  { type:'Restaurant', baseIncome:320,  strength:20,  energyCost:20, xp:100,  honor:25,  isResidential:false },
  { type:'Supermarkt', baseIncome:480,  strength:30,  energyCost:25, xp:150,  honor:35,  isResidential:false },
  { type:'Nachtclub',  baseIncome:750,  strength:45,  energyCost:35, xp:250,  honor:60,  isResidential:false },
  { type:'Spielhalle', baseIncome:1100, strength:65,  energyCost:45, xp:400,  honor:100, isResidential:false },
  { type:'Juwelier',   baseIncome:1800, strength:90,  energyCost:60, xp:600,  honor:150, isResidential:false },
  { type:'Kasino',     baseIncome:4500, strength:150, energyCost:80, xp:1000, honor:300, isResidential:false },
];

function findBuildingType(type) {
  if (typeof type !== 'string') return null;
  return BUILDING_TYPES.find(t => t.type === type) || null;
}

// key -> Statwert-Zuwachs pro Upgrade-Stufe (siehe js/constants.js STAT_UPGRADES)
const STAT_UPGRADE_INCREMENTS = { str: 2, end: 15, lck: 1, inf: 1, ges: 1, cha: 1 };

const ITEMS_TIER1 = [
  { name:'Kaputtes Bügeleisen',      icon:'🪣', slot:'waffe',      stat:'STÄ +2',  humor:'Schwer, heiß, gefährlich. Nicht zum Bügeln.',                bonus:{str:2},  tier:1 },
  { name:'Socke mit Sand',            icon:'🧦', slot:'waffe',      stat:'STÄ +1',  humor:'Omas Geheimwaffe. Riecht noch leicht.',                      bonus:{str:1},  tier:1 },
  { name:'Regenschirm (kaputt)',      icon:'☂️',  slot:'waffe',      stat:'STÄ +1',  humor:'Öffnet sich manchmal. Meistens im Kampf.',                   bonus:{str:1},  tier:1 },
  { name:'Omas Krückstock',           icon:'🦯', slot:'waffe',      stat:'STÄ +3',  humor:'Oma kämpfte damit in zwei Kriegen. Kein Witz.',              bonus:{str:3},  tier:1 },
  { name:'Zollstock (18-fach)',       icon:'📏', slot:'waffe',      stat:'STÄ +2',  humor:'Handwerker-Nunchaku. Klappt auch im wörtlichen Sinn.',       bonus:{str:2},  tier:1 },
  { name:'Bratpfanne (Teflon)',       icon:'🍳', slot:'waffe',      stat:'STÄ +3',  humor:'Antihaft. Deine Gegner haften trotzdem.',                    bonus:{str:3},  tier:1 },
  { name:'Teleskopantenne (alt)',     icon:'📡', slot:'waffe',      stat:'GES +2',  humor:'Ausziehbar bis 1,20m. Macht "SWISCH".',                     bonus:{ges:2},  tier:1 },
  { name:'Fahrradpumpe',              icon:'💨', slot:'waffe',      stat:'STÄ +2',  humor:'Schlägt und bläst. Nicht immer in dieser Reihenfolge.',      bonus:{str:2},  tier:1 },
  { name:'Konservenbüchse (voll)',    icon:'🥫', slot:'waffe',      stat:'STÄ +1',  humor:'Rindergulasch. 850g. Tut weh.',                             bonus:{str:1},  tier:1 },
  { name:'Gürtelschnalle (losgelöst)',icon:'🔩', slot:'waffe',      stat:'STÄ +2',  humor:'Von einem sehr großen Gürtel. Und einem sehr kleinen Mann.', bonus:{str:2},  tier:1 },

  { name:'Baseballmütze (rückwärts)',  icon:'🧢', slot:'kopf',      stat:'GLÜ +1',  humor:'Macht dich 40% cooler. Laut dir.',                          bonus:{lck:1},  tier:1 },
  { name:'Wollmütze (August)',         icon:'🪖', slot:'kopf',      stat:'AUS +3',  humor:'Getragen von September bis September.',                     bonus:{end:3},  tier:1 },
  { name:'Bauhelm (orange)',           icon:'⛑️',  slot:'kopf',      stat:'AUS +4',  humor:'Fundort: Baustelle. Rückgabe: nie.',                        bonus:{end:4},  tier:1 },
  { name:'Fischerhut (beige)',         icon:'🎣', slot:'kopf',      stat:'GLÜ +2',  humor:'"Ironie-Accessoire" laut Mode. Ernst laut dir.',             bonus:{lck:2},  tier:1 },
  { name:'Badekappe (Gummi)',          icon:'🏊', slot:'kopf',      stat:'GES +1',  humor:'Aerodynamisch. Respekt minimal.',                           bonus:{ges:1},  tier:1 },
  { name:'Mütze mit Bommel',           icon:'🎿', slot:'kopf',      stat:'CHA +1',  humor:'Bommel wippt bei schnellen Bewegungen. Einschüchternd.',     bonus:{cha:1},  tier:1 },
  { name:'Kronkorken-Stirnband',       icon:'👑', slot:'kopf',      stat:'RES +2',  humor:'Aus 17 Becks-Deckeln. Handgefädelt.',                       bonus:{rep:2},  tier:1 },
  { name:'Ohrenschützer (Neon)',       icon:'🎧', slot:'kopf',      stat:'AUS +2',  humor:'Schutz vor Lärm und gutem Geschmack.',                      bonus:{end:2},  tier:1 },
  { name:'Schweißband (doppelt)',      icon:'🏋️', slot:'kopf',      stat:'GES +2',  humor:'Zwei Stück, weil einmal nicht reicht.',                     bonus:{ges:2},  tier:1 },
  { name:'Kochkopf (Topfdeckel)',      icon:'🪖', slot:'kopf',      stat:'AUS +3',  humor:'Technisch gesehen ein Helm. Technisch.',                    bonus:{end:3},  tier:1 },

  { name:'Unterhemd (weiß)',           icon:'👕', slot:'körper',    stat:'AUS +5',  humor:'Klassisch. Zeitlos. Leicht vergilbt.',                      bonus:{end:5},  tier:1 },
  { name:'Karohemd (Lidl)',            icon:'👔', slot:'körper',    stat:'CHA +1',  humor:'Offiziell-informell. Knöpfe noch dran: 4 von 6.',           bonus:{cha:1},  tier:1 },
  { name:'Funktionsjacke (Discounter)',icon:'🧥', slot:'körper',    stat:'AUS +4',  humor:'10 Taschen. Inhalt: Kassenzettel und alte Pfandmarken.',    bonus:{end:4},  tier:1 },
  { name:'Regenponcho (Einweg)',       icon:'🌧️',  slot:'körper',    stat:'AUS +2',  humor:'Aus dem 1€-Regal. Hält 1,2 Einsätze.',                    bonus:{end:2},  tier:1 },
  { name:'Fleecepullover (Koralle)',   icon:'🧶', slot:'körper',    stat:'AUS +3',  humor:'Warm, bequem, ungefährlich aussehend. Perfekte Tarnung.',   bonus:{end:3},  tier:1 },
  { name:'Bodywarmer (gesteppt)',      icon:'🦺', slot:'körper',    stat:'AUS +4',  humor:'Keine Arme. Voller Stil.',                                  bonus:{end:4},  tier:1 },
  { name:'Arbeitshemd (Rückenfleck)', icon:'👕', slot:'körper',    stat:'STÄ +2',  humor:'Fleck unbekannter Herkunft. Frag nicht.',                   bonus:{str:2},  tier:1 },
  { name:'Warnweste (gelb)',           icon:'🦺', slot:'körper',    stat:'EIN +1',  humor:'Du fällst auf. Das ist manchmal der Plan.',                bonus:{inf:1},  tier:1 },
  { name:'Schlafanzugjacke (raus)',    icon:'🩴', slot:'körper',    stat:'CHA +1',  humor:'Schlafanzug outfits sind unterschätzt.',                    bonus:{cha:1},  tier:1 },
  { name:'Kneipenjacke (vergessen)',  icon:'🧥', slot:'körper',    stat:'GLÜ +2',  humor:'Jemand hat sie liegenlassen. Dein Glück.',                  bonus:{lck:2},  tier:1 },

  { name:'Jogginghose (3 Streifen)',   icon:'👖', slot:'hose',      stat:'EIN +1',  humor:'Echter Respekt auf der Straße.',                            bonus:{inf:1},  tier:1 },
  { name:'Cargohose (14 Taschen)',     icon:'👖', slot:'hose',      stat:'GES +2',  humor:'Zwei davon sind echte Taschen. Den Rest weiß keiner.',      bonus:{ges:2},  tier:1 },
  { name:'Latzhose (Dachdecker)',      icon:'👷', slot:'hose',      stat:'AUS +3',  humor:'Fundort: irgendwo. Funktion: einschüchternde Ehrlichkeit.', bonus:{end:3},  tier:1 },
  { name:'Jeans (ausgebleicht)',       icon:'👖', slot:'hose',      stat:'RES +1',  humor:'Sah schon immer so aus. War nie neu.',                     bonus:{rep:1},  tier:1 },
  { name:'Shorts (im Winter)',         icon:'🩳', slot:'hose',      stat:'GES +1',  humor:'"Mir ist nicht kalt." – Lüge. Aber Respekt.',               bonus:{ges:1},  tier:1 },
  { name:'Trainershorts (Neon)',       icon:'🩳', slot:'hose',      stat:'GES +2',  humor:'So auffällig, dass Gegner geblendet sind.',                 bonus:{ges:2},  tier:1 },
  { name:'Bundfaltenhose (Opa)',       icon:'👖', slot:'hose',      stat:'CHA +1',  humor:'Alt, ja. Aber der Schnitt sitzt.',                          bonus:{cha:1},  tier:1 },
  { name:'Skateerhose (XXXL)',         icon:'👖', slot:'hose',      stat:'GES +2',  humor:'80% Luft, 20% Stoff. 100% Style.',                          bonus:{ges:2},  tier:1 },
  { name:'Schlaghose (Seventies)',     icon:'👖', slot:'hose',      stat:'CHA +2',  humor:'Du bist deiner Zeit voraus. Oder dahinter. Egal.',          bonus:{cha:2},  tier:1 },
  { name:'Regenhose (Wanderer)',       icon:'🥾', slot:'hose',      stat:'AUS +2',  humor:'Macht Rascheln. Leute hören dich kommen. Das ist Macht.',   bonus:{end:2},  tier:1 },

  { name:'Badelatschen (Doppelgurt)', icon:'🩴', slot:'füße',      stat:'GES +1',  humor:'Schnell an, schnell aus. Notausgangsstrategie.',            bonus:{ges:1},  tier:1 },
  { name:'Turnschuhe (kein Logo)',     icon:'👟', slot:'füße',      stat:'GES +2',  humor:'Logo abgekratzt. Markenschutz ist eine Erfindung.',         bonus:{ges:2},  tier:1 },
  { name:'Gummistiefel (grün)',        icon:'🥾', slot:'füße',      stat:'AUS +3',  humor:'Für jeden Boden. Auch Parkettboden bei Razzien.',           bonus:{end:3},  tier:1 },
  { name:'Pantoffeln (Plüsch)',        icon:'🦶', slot:'füße',      stat:'CHA +1',  humor:'Überraschend einschüchternd. Niemand erwartet sie.',        bonus:{cha:1},  tier:1 },
  { name:'Wanderschuhe (Stadtmensch)',icon:'🥾', slot:'füße',      stat:'AUS +3',  humor:'Nie auf einem Berg gewesen. Trotzdem bereit.',              bonus:{end:3},  tier:1 },
  { name:'Hausschuhe (Wollfilz)',      icon:'🧦', slot:'füße',      stat:'GES +1',  humor:'Leise wie ein Schatten auf Linoleum.',                     bonus:{ges:1},  tier:1 },
  { name:'Sicherheitsschuhe (Kappe)', icon:'👞', slot:'füße',      stat:'STÄ +2',  humor:'Stahlkappe. Dein Schritt ist ein Statement.',               bonus:{str:2},  tier:1 },
  { name:'Plateauschuh (5cm)',         icon:'👠', slot:'füße',      stat:'EIN +2',  humor:'5 Zentimeter Einschüchterung. Keine Diskussion.',           bonus:{inf:2},  tier:1 },
  { name:'Clogs (Holz)',              icon:'🪵', slot:'füße',      stat:'STÄ +1',  humor:'Klopfen auf Linoleum wie Trommelwirbel.',                   bonus:{str:1},  tier:1 },
  { name:'Gartenclogs (Crocs-Klon)', icon:'🪴', slot:'füße',      stat:'GLÜ +1',  humor:'Mit Socken. Den Socken ist es egal. Dir auch.',             bonus:{lck:1},  tier:1 },

  { name:'Wollhandschuhe (Einzel)',    icon:'🧤', slot:'handschuhe',stat:'AUS +2',  humor:'Einer fehlt. Du trägst trotzdem beide.',                    bonus:{end:2},  tier:1 },
  { name:'Gummihandschuhe (Haushalt)',icon:'🧤', slot:'handschuhe',stat:'GES +1',  humor:'Gelb. Geruch: Zitrone & Bedrohung.',                       bonus:{ges:1},  tier:1 },
  { name:'Fahrradhandschuhe (offen)', icon:'🚲', slot:'handschuhe',stat:'GES +2',  humor:'Ohne Fingerkuppen. Fühlst jeden Schlag doppelt.',           bonus:{ges:2},  tier:1 },
  { name:'Gartenhandschuhe (beige)',  icon:'🌱', slot:'handschuhe',stat:'AUS +2',  humor:'Für Rosen und Schlimmeres.',                                bonus:{end:2},  tier:1 },
  { name:'Ofenhandschuhe (Paar)',     icon:'🧤', slot:'handschuhe',stat:'AUS +4',  humor:'Hitzeschutz bis 250°C. Schläge auch.',                     bonus:{end:4},  tier:1 },
  { name:'Lederhandschuhe (Billig)',   icon:'🧤', slot:'handschuhe',stat:'STÄ +2',  humor:'Kunstleder. Knistert. Wirkt trotzdem professionell.',       bonus:{str:2},  tier:1 },
  { name:'Schweißerhandschuhe',       icon:'🔧', slot:'handschuhe',stat:'STÄ +3',  humor:'Massiv. Ungefähr unbewegliche Fäuste.',                     bonus:{str:3},  tier:1 },
  { name:'Disposable Gloves (3er)',    icon:'🧤', slot:'handschuhe',stat:'GES +1',  humor:'Kommt im 3er-Pack. Du verlierst einen beim Anlegen.',       bonus:{ges:1},  tier:1 },
  { name:'Windstopper-Handschuhe',    icon:'💨', slot:'handschuhe',stat:'GES +2',  humor:'Stoppen Wind. Faustschläge nehmen sie mit.',                bonus:{ges:2},  tier:1 },
  { name:'Baumwollhandschuhe (weiß)', icon:'🤵', slot:'handschuhe',stat:'CHA +2',  humor:'Sieht seriös aus. Fingerabdrücke: keine.',                  bonus:{cha:2},  tier:1 },

  { name:'Kabelbinder (Mehrfach)',    icon:'🔗', slot:'gürtel',    stat:'GES +1',  humor:'8 Stück, zusammengesteckt. Hält die Hose. Und anderes.',    bonus:{ges:1},  tier:1 },
  { name:'Paketband als Gürtel',      icon:'📦', slot:'gürtel',    stat:'AUS +1',  humor:'Klebeband-Chic. Kostet 2,50. Wirkt rustikal.',              bonus:{end:1},  tier:1 },
  { name:'Kordel (Kapuzenpulli)',      icon:'🪢', slot:'gürtel',    stat:'GES +1',  humor:'Abgezogen und zweckentfremdet. Hält gut.',                  bonus:{ges:1},  tier:1 },
  { name:'Schuhband (extra lang)',     icon:'👟', slot:'gürtel',    stat:'GES +2',  humor:'180cm. Perfekte Gürtellänge. Niemand fragt.',               bonus:{ges:2},  tier:1 },
  { name:'Bauchtasche (Neon)',         icon:'🎒', slot:'gürtel',    stat:'EIN +2',  humor:'Trägt sich wie Macht. Inhalt: Ausweis und Pfandgeld.',      bonus:{inf:2},  tier:1 },
  { name:'Klemmgürtel (Plastik)',      icon:'🔒', slot:'gürtel',    stat:'AUS +1',  humor:'Kunststoffschnalle. Hält fast alles. Fast.',               bonus:{end:1},  tier:1 },
  { name:'Bindegarn (aufgerollt)',     icon:'🧵', slot:'gürtel',    stat:'GES +1',  humor:'Gärtner-Chic. Grün und günstig.',                          bonus:{ges:1},  tier:1 },
  { name:'Telefonkabel (gewunden)',   icon:'📞', slot:'gürtel',    stat:'AUS +2',  humor:'Aus den 90ern. Zieht sich zurück wenn du losläufst.',       bonus:{end:2},  tier:1 },
  { name:'Reflektorgürtel (Jogger)',  icon:'🏃', slot:'gürtel',    stat:'GES +2',  humor:'Du leuchtest im Dunkeln. Das macht dich unberechenbar.',    bonus:{ges:2},  tier:1 },
  { name:'Bungee-Cord (geschlossen)', icon:'🔴', slot:'gürtel',    stat:'AUS +3',  humor:'8mm stark. Dehnt bis 3m. Dann hält er.',                   bonus:{end:3},  tier:1 },

  { name:'Fake-Goldkette',             icon:'📿', slot:'hals',      stat:'RES +3',  humor:'Läuft grün an. Sieht trotzdem gut aus.',                    bonus:{rep:3},  tier:1 },
  { name:'Handy-Lanyard (Logo)',       icon:'📱', slot:'hals',      stat:'EIN +1',  humor:'Schlüsselband. "T-Mobile". Noch nie gefragt worden.',       bonus:{inf:1},  tier:1 },
  { name:'Dosenkette (Recycling)',     icon:'♻️',  slot:'hals',      stat:'CHA +1',  humor:'Aus 6 Deckeln handgenietet. Nachhaltig böse.',             bonus:{cha:1},  tier:1 },
  { name:'Spaghetti-Kette (verknoten)',icon:'🍝', slot:'hals',      stat:'GLÜ +1',  humor:'Immer verknoten. Löst sich nie. Symbol der Ausdauer.',      bonus:{lck:1},  tier:1 },
  { name:'Angelschnur-Kette',         icon:'🎣', slot:'hals',      stat:'GES +1',  humor:'0,30mm. Unsichtbar. Existiert irgendwie.',                  bonus:{ges:1},  tier:1 },
  { name:'Nummernschildkette',         icon:'🚗', slot:'hals',      stat:'RES +2',  humor:'Altes Kennzeichen. BOT-XXX. Legales Schmuckstück.',         bonus:{rep:2},  tier:1 },
  { name:'Wäscheleine-Armband',       icon:'🧺', slot:'hals',      stat:'AUS +2',  humor:'Stabilität bekannter Herkunft. Hält Wäsche.',              bonus:{end:2},  tier:1 },
  { name:'Hundemarke (leer)',          icon:'🔖', slot:'hals',      stat:'RES +2',  humor:'Kein Name drauf. Das ist Teil der Mystik.',                bonus:{rep:2},  tier:1 },
  { name:'Pfeifenband (silber)',       icon:'🎵', slot:'hals',      stat:'EIN +1',  humor:'Schiedsrichterpfeife optional. Die Kette bleibt.',          bonus:{inf:1},  tier:1 },
  { name:'Makramee-Anhänger',         icon:'🪢', slot:'hals',      stat:'CHA +2',  humor:'Handgefertigt. Oma war kreativ. Du auch.',                  bonus:{cha:2},  tier:1 },

  { name:'Signet-Ring (Silber)',       icon:'💍', slot:'hand',      stat:'GLÜ +4',  humor:'Trägt die Initiale "K". Dein Name fängt mit M an.',        bonus:{lck:4},  tier:1 },
  { name:'Kronkorken-Ring',            icon:'🍺', slot:'hand',      stat:'RES +1',  humor:'Aus Becks-Deckel zurechtgebogen. Schmerzhaft im Handschlag.', bonus:{rep:1}, tier:1 },
  { name:'Büroklammer-Ring',           icon:'🖇️',  slot:'hand',      stat:'GES +1',  humor:'Flexibel. Passt sich an. Wie du.',                          bonus:{ges:1},  tier:1 },
  { name:'Waschmünzen-Ring',          icon:'🪙', slot:'hand',      stat:'GLÜ +1',  humor:'Münze mit Loch. Perfekt für den Finger. 0,50€ Pfand.',     bonus:{lck:1},  tier:1 },
  { name:'Kabelbinder-Ring',           icon:'🔗', slot:'hand',      stat:'STÄ +1',  humor:'Weiß. Einwegschmuck. Macht "Klick".',                       bonus:{str:1},  tier:1 },
  { name:'Murmel-Ring (gebastelt)',    icon:'🔮', slot:'hand',      stat:'GLÜ +2',  humor:'Glaskugel. Sieht magisch aus. Ist ein Ring.',               bonus:{lck:2},  tier:1 },
  { name:'Teelöffel-Ring',             icon:'🥄', slot:'hand',      stat:'CHA +1',  humor:'Eingebogen. Sieht aufwendig aus. War aufwendig.',           bonus:{cha:1},  tier:1 },
  { name:'Schraubenmutter-Ring',       icon:'🔩', slot:'hand',      stat:'STÄ +2',  humor:'M8-Mutter. Sitzt fest. Sehr fest.',                         bonus:{str:2},  tier:1 },
  { name:'Gummiring (Haushalt)',       icon:'🟠', slot:'hand',      stat:'GES +1',  humor:'Orange. Für alles mögliche. Auch das.',                    bonus:{ges:1},  tier:1 },
  { name:'Kronkorken (glatt)',         icon:'⚙️',  slot:'hand',      stat:'RES +1',  humor:'Blank geschliffen. Kante: erstaunlich scharf.',             bonus:{rep:1},  tier:1 },

  { name:'Tattoo (selbst gestochen)', icon:'💪', slot:'extra',     stat:'RES +5',  humor:'"Mama" – auf dem Unterarm. Niemand lacht.',                 bonus:{rep:5},  tier:1 },
  { name:'Narbe (stolz gezeigt)',      icon:'⚔️',  slot:'extra',    stat:'EIN +2',  humor:'Fundort: Kindheit. Herkunft: Eigenverantwortung.',          bonus:{inf:2},  tier:1 },
  { name:'Aktentasche (leer)',         icon:'💼', slot:'extra',     stat:'EIN +1',  humor:'Leer. Aber wer weiß das schon.',                            bonus:{inf:1},  tier:1 },
  { name:'Einkaufstüte (Rewe)',        icon:'🛍️', slot:'extra',     stat:'GES +1',  humor:'Beste Tarnung seit dem Erfinden der Tarnung.',             bonus:{ges:1},  tier:1 },
  { name:'Kofferradio (tragbar)',      icon:'📻', slot:'extra',     stat:'CHA +2',  humor:'Spielt immer auf 10. Musik oder Gewalt. Oft beides.',       bonus:{cha:2},  tier:1 },
  { name:'Zeitungsrolle',              icon:'📰', slot:'extra',     stat:'EIN +1',  humor:'Gerollt. Offiziell zum Lesen. Inoffiziell nicht.',          bonus:{inf:1},  tier:1 },
  { name:'Kaugummi-Packung (voll)',    icon:'🍬', slot:'extra',     stat:'CHA +1',  humor:'Angeboten: Ja. Verhandlungen: gestartet.',                  bonus:{cha:1},  tier:1 },
  { name:'Taschenlampe (billig)',      icon:'🔦', slot:'extra',     stat:'EIN +1',  humor:'Blendet bei Dunkelheit. Auch tagsüber versucht.',           bonus:{inf:1},  tier:1 },
  { name:'Schlüsselbund (17 Schlüssel)',icon:'🗝️', slot:'extra',    stat:'RES +3',  humor:'Keiner weiß wofür. Du auch nicht.',                        bonus:{rep:3},  tier:1 },
  { name:'Feuerzeug (leer)',           icon:'🔥', slot:'extra',     stat:'EIN +1',  humor:'Kein Gas mehr. Aber die Geste sitzt.',                      bonus:{inf:1},  tier:1 },
];

const ITEMS_TIER2 = [
  { name:'Küchenmesser (Aldi)',     icon:'🔪', slot:'waffe',  stat:'Stärke +6',    humor:'Scharf genug für Tomaten UND Gegner.',               bonus:{str:6},  tier:2 },
  { name:'Fahrradkette',            icon:'⛓️', slot:'waffe',  stat:'Stärke +5',    humor:'War mal am Fahrrad. Fahrrad ist jetzt weg.',         bonus:{str:5},  tier:2 },
  { name:'Gangsterhut (H&M)',       icon:'🎩', slot:'kopf',   stat:'Respekt +10',  humor:'€9,99. Fühlt sich nach einer Million an.',           bonus:{rep:10}, tier:2 },
  { name:'Lederjacke (Kunstleder)', icon:'🧥', slot:'körper', stat:'Ausdauer +15', humor:'Quietscht beim Gehen. Klingt einschüchternd.',       bonus:{end:15}, tier:2 },
  { name:'Goldkette (Rummel)',       icon:'⛓️', slot:'hals',  stat:'Respekt +8',   humor:'Aus dem Automaten. 2 Euro. Goldwert: 0.',            bonus:{rep:8},  tier:2 },
  { name:'Signet-Ring (Silber)',    icon:'💍', slot:'hand',   stat:'Glück +4',     humor:'Trägt die Initiale "K". Dein Name fängt mit M an.', bonus:{lck:4},  tier:2 },
  { name:'Sonnenbrille (drinnen)',  icon:'🕶️', slot:'kopf',  stat:'Respekt +7',   humor:'Drin tragen = maximale Einschüchterung.',            bonus:{rep:7},  tier:2 },
];

const ITEMS_TIER3 = [
  { name:'Messer (echt)',           icon:'🗡️', slot:'waffe',  stat:'Stärke +15',   humor:'Keine Witze mehr. Das Ding ist scharf.',             bonus:{str:15}, tier:3 },
  { name:'Fedora (echter Filz)',    icon:'🎩', slot:'kopf',   stat:'Einfluss +6',  humor:"Jetzt wird's ernst.",                                bonus:{inf:6},  tier:3 },
  { name:'Maßanzug',                icon:'🤵', slot:'körper', stat:'Ausdauer +30', humor:'Vom Schneider. Nicht vom Discounter.',               bonus:{end:30}, tier:3 },
  { name:'Silberring (echt)',       icon:'💍', slot:'hand',   stat:'Glück +8',     humor:'Schwer. Massiv. Schmerzhaft im Einsatz.',            bonus:{lck:8},  tier:3 },
  { name:'Aktentasche (Leder)',     icon:'💼', slot:'extra',  stat:'Einfluss +8',  humor:'Leer. Aber wer weiß das schon.',                     bonus:{inf:8},  tier:3 },
];

const ITEMS_TIER4 = [
  { name:'Schrotflinte',            icon:'🔫', slot:'waffe',  stat:'Stärke +30',   humor:'Ende der Humorzone.',                                bonus:{str:30}, tier:4 },
  { name:'Diamantuhr',              icon:'⌚', slot:'hand',   stat:'Glück +20',    humor:'Tickt wie dein Herz. Teurer.',                       bonus:{lck:20}, tier:4 },
  { name:'Patenmantel',             icon:'🧣', slot:'körper', stat:'Ausdauer +60', humor:'Trägt sich wie Macht.',                              bonus:{end:60}, tier:4 },
  { name:'Siegelring',              icon:'💎', slot:'hand',   stat:'Einfluss +20', humor:'Wer diesen Ring trägt, gewinnt.',                    bonus:{inf:20}, tier:4 },
];

const ALL_ITEMS = [...ITEMS_TIER1, ...ITEMS_TIER2, ...ITEMS_TIER3, ...ITEMS_TIER4];

// Findet ein Item im Katalog, das exakt zu Name + Slot + Boni passt.
// Gibt die serverseitige (kanonische) Kopie zurück — nie das Client-Objekt.
function findKnownItem(candidate) {
  if (!candidate || typeof candidate !== 'object') return null;
  const bonusStr = JSON.stringify(candidate.bonus || {});
  return ALL_ITEMS.find(it =>
    it.name === candidate.name &&
    it.slot === candidate.slot &&
    JSON.stringify(it.bonus) === bonusStr
  ) || null;
}

module.exports = {
  XP_TABLE,
  BASE_STATS,
  STAT_UPGRADE_INCREMENTS,
  ALL_ITEMS,
  findKnownItem,
  BUILDING_TYPES,
  findBuildingType,
};
