const PACK_LIMIT = 10;
const CARDS_PER_PACK = 5;
const RESET_MS = 12 * 60 * 60 * 1000;

const STORAGE_PACK = "t48_pack_state_v7";
const STORAGE_COLLECTION = "t48_collection_v7";
const STORAGE_DUPE = "t48_dupe_v7";

let pendingPackAmount = 0;
let currentFilter = "ALL";

const tiers = [
 {name:"Normal", rate:45},
 {name:"Rare", rate:30},
 {name:"Super Rare", rate:15},
 {name:"Super Star Rare", rate:6},
 {name:"Ultra Rare", rate:2.8},
 {name:"Legendary Rare", rate:0.8},
 {name:"Secret", rate:0.35},
 {name:"Infinity", rate:0.05}
];

const normalTiers = tiers.filter(t => t.name !== "INFINITY");

function getTierClass(tier){
  switch(tier){
    case "Normal": return "normal";
    case "Rare": return "rare";
    case "Super Rare": return "super-rare";
    case "Super Star Rare": return "super-star-rare";
    case "Ultra Rare": return "ultra-rare";
    case "Legendary Rare": return "legendary-rare";
    case "Secret": return "secret";
    case "Infinity": return "infinity";
    default: return "normal";
  }
}

function getMemberImage(member, tier){
  return `images/${member.slug}/${getTierClass(tier)}.jpg`;
}

const members = [
{name:"FREYA",slug:"freya",jiko:"Gadis koleris yang suka berimajinasi, terangi harimu dengan senyum karamelku. Halo semua, aku Freya!."},
{name:"CHRISTY",slug:"christy",jiko:"Peduli dan berbaik hati, siapa dia? Chriiiis-ty!."},
{name:"MARSHA",slug:"marsha",jiko:"Seperti piza yang dinanti-nantikan semua orang, selalu nantikan aku, ya! Halo, aku Marsha!."}
{name:"FENI",img:"images/feni.jpg",jiko:"Template jiko Feni. Silakan edit sendiri."},
{name:"GITA",img:"images/gita.jpg",jiko:"Template jiko Gita. Silakan edit sendiri."},
{name:"ELI",img:"images/eli.jpg",jiko:"Template jiko Eli. Silakan edit sendiri."},
{name:"OLLA",img:"images/olla.jpg",jiko:"Template jiko Olla. Silakan edit sendiri."},
{name:"MUTHE",img:"images/muthe.jpg",jiko:"Template jiko Muthe. Silakan edit sendiri."},
{name:"LULU",img:"images/lulu.jpg",jiko:"Template jiko Lulu. Silakan edit sendiri."},
{name:"FLORA",img:"images/flora.jpg",jiko:"Template jiko Flora. Silakan edit sendiri."},
{name:"MARSHA",img:"images/marsha.jpg",jiko:"Template jiko Marsha. Silakan edit sendiri."},
{name:"KATHRINA",img:"images/kathrina.jpg",jiko:"Template jiko Kathrina. Silakan edit sendiri."},
{name:"JESSI",img:"images/jessi.jpg",jiko:"Template jiko Jessi. Silakan edit sendiri."},
{name:"LYNN",img:"images/lynn.jpg",jiko:"Template jiko Lynn. Silakan edit sendiri."},
{name:"RAISHA",img:"images/raisha.jpg",jiko:"Template jiko Raisha. Silakan edit sendiri."},
{name:"AMANDA",img:"images/amanda.jpg",jiko:"Template jiko Amanda. Silakan edit sendiri."},
{name:"INDIRA",img:"images/indira.jpg",jiko:"Template jiko Indira. Silakan edit sendiri."},
{name:"ALIA",img:"images/alia.jpg",jiko:"Template jiko Alia. Silakan edit sendiri."},
{name:"ANIN",img:"images/anin.jpg",jiko:"Template jiko Anin. Silakan edit sendiri."},
{name:"CATHY",img:"images/cathy.jpg",jiko:"Template jiko Cathy. Silakan edit sendiri."},
{name:"LANA",img:"images/lana.jpg",jiko:"Template jiko Lana. Silakan edit sendiri."},
{name:"AUREL",img:"images/aurel.jpg",jiko:"Template jiko Aurel. Silakan edit sendiri."},
{name:"ELIN",img:"images/elin.jpg",jiko:"Template jiko Elin. Silakan edit sendiri."},
{name:"GENDIS",img:"images/gendis.jpg",jiko:"Template jiko Gendis. Silakan edit sendiri."},
{name:"GREESELL",img:"images/greesell.jpg",jiko:"Template jiko Greesell. Silakan edit sendiri."},
{name:"NALA",img:"images/nala.jpg",jiko:"Template jiko Nala. Silakan edit sendiri."},
{name:"NAYLA",img:"images/nayla.jpg",jiko:"Template jiko Nayla. Silakan edit sendiri."},
{name:"REGIE",img:"images/regie.jpg",jiko:"Template jiko Regie. Silakan edit sendiri."},
{name:"RIBKA",img:"images/ribka.jpg",jiko:"Template jiko Ribka. Silakan edit sendiri."},
{name:"TRISHA",img:"images/trisha.jpg",jiko:"Template jiko Trisha. Silakan edit sendiri."},
{name:"VICTORIA",img:"images/victoria.jpg",jiko:"Template jiko Victoria. Silakan edit sendiri."},
{name:"MOREEN",img:"images/moreen.jpg",jiko:"Template jiko Moreen. Silakan edit sendiri."},
{name:"MICHELLE",img:"images/michelle.jpg",jiko:"Template jiko Michelle. Silakan edit sendiri."},
{name:"ABEY",img:"images/abey.jpg",jiko:"Template jiko Abey. Silakan edit sendiri."},
{name:"ADLINE",img:"images/adline.jpg",jiko:"Template jiko Adline. Silakan edit sendiri."},
{name:"ALYA",img:"images/alya.jpg",jiko:"Template jiko Alya. Silakan edit sendiri."},
{name:"ARALIE",img:"images/aralie.jpg",jiko:"Template jiko Aralie. Silakan edit sendiri."},
{name:"AURHEL",img:"images/aurhel.jpg",jiko:"Template jiko Aurhel. Silakan edit sendiri."},
{name:"CHELSEA",img:"images/chelsea.jpg",jiko:"Template jiko Chelsea. Silakan edit sendiri."},
{name:"CYNTHIA",img:"images/cynthia.jpg",jiko:"Template jiko Cynthia. Silakan edit sendiri."},
{name:"DAISY",img:"images/daisy.jpg",jiko:"Template jiko Daisy. Silakan edit sendiri."},
{name:"DANELLA",img:"images/danella.jpg",jiko:"Template jiko Danella. Silakan edit sendiri."},
{name:"DELYNN",img:"images/delynn.jpg",jiko:"Template jiko Delynn. Silakan edit sendiri."},
{name:"GEMMA",img:"images/gemma.jpg",jiko:"Template jiko Gemma. Silakan edit sendiri."},
{name:"JEANE",img:"images/jeane.jpg",jiko:"Template jiko Jeane. Silakan edit sendiri."},
{name:"LEVI",img:"images/levi.jpg",jiko:"Template jiko Levi. Silakan edit sendiri."},
{name:"LIA",img:"images/lia.jpg",jiko:"Template jiko Lia. Silakan edit sendiri."},
{name:"NACHIA",img:"images/nachia.jpg",jiko:"Template jiko Nachia. Silakan edit sendiri."},
{name:"AFFERA",img:"images/affera.jpg",jiko:"Template jiko Affera. Silakan edit sendiri."},
{name:"CARISSA",img:"images/carissa.jpg",jiko:"Template jiko Carissa. Silakan edit sendiri."},
{name:"BELLA",img:"images/bella.jpg",jiko:"Template jiko Bella. Silakan edit sendiri."},
{name:"FAHIRA",img:"images/fahira.jpg",jiko:"Template jiko Fahira. Silakan edit sendiri."},
{name:"FATIMAH",img:"images/fatimah.jpg",jiko:"Template jiko Fatimah. Silakan edit sendiri."},
{name:"HEIDI",img:"images/heidi.jpg",jiko:"Template jiko Heidi. Silakan edit sendiri."},
{name:"MAXINE",img:"images/maxine.jpg",jiko:"Template jiko Maxine. Silakan edit sendiri."},
{name:"PUTRY",img:"images/putry.jpg",jiko:"Template jiko Putry. Silakan edit sendiri."},
{name:"RALYNE",img:"images/ralyne.jpg",jiko:"Template jiko Ralyne. Silakan edit sendiri."},
{name:"SONA",img:"images/sona.jpg",jiko:"Template jiko Sona. Silakan edit sendiri."},
{name:"MEMBER59",img:"images/member59.jpg",jiko:"Template jiko Member 59. Silakan edit sendiri."},
{name:"MEMBER60",img:"images/member60.jpg",jiko:"Template jiko Member 60. Silakan edit sendiri."},
{name:"MEMBER61",img:"images/member61.jpg",jiko:"Template jiko Member 61. Silakan edit sendiri."},
{name:"MEMBER62",img:"images/member62.jpg",jiko:"Template jiko Member 62. Silakan edit sendiri."}
];

const infinityCard = {
  member:"OGURI YUI AKB",
  tier:"Infinity",
  cardId:"OGURI_YUI_AKB_INFINITY",
  img:"images/oguri-yui-akb/infinity.jpg",
  jiko:"Mi~nna no HAATO wo (Tocchau, tocchau) Nippon kara kimashita "Yuiyui" koto Oguri Yui desu."
};

function getTotalCards(){
  return members.length * normalTiers.length + 1;
}

function getPackState(){
  let data = JSON.parse(localStorage.getItem(STORAGE_PACK) || "{}");

  if(typeof data.used !== "number"){
    data = {used:0, resetAt:null};
    savePackState(data);
  }

  if(data.resetAt && Date.now() >= data.resetAt){
    data = {used:0, resetAt:null};
    savePackState(data);
  }

  return data;
}

function savePackState(data){
  localStorage.setItem(STORAGE_PACK, JSON.stringify(data));
}

function getCollection(){
  return JSON.parse(localStorage.getItem(STORAGE_COLLECTION) || "[]");
}

function saveCollection(col){
  localStorage.setItem(STORAGE_COLLECTION, JSON.stringify(col));
}

function getDupe(){
  return parseInt(localStorage.getItem(STORAGE_DUPE) || "0");
}

function setDupe(num){
  localStorage.setItem(STORAGE_DUPE, String(num));
}

function pickTier(){
  let roll = Math.random() * 100;
  let sum = 0;

  for(const t of tiers){
    sum += t.rate;
    if(roll <= sum) return t.name;
  }

  return "N";
}

function generateCard(){
  const tier = pickTier();

  if(tier === "INFINITY"){
    return {...infinityCard};
  }

  const member = members[Math.floor(Math.random() * members.length)];

  return {
  member:member.name,
  tier:tier,
  cardId:member.name + "_" + tier,
  img:getMemberImage(member, tier),
  jiko:member.jiko
 };
}

function preparePack(amount){
  const state = getPackState();

  if(state.used >= PACK_LIMIT){
    alert("Pack habis. Tunggu reset 12 jam selesai dulu.");
    return;
  }

  pendingPackAmount = Math.min(amount, PACK_LIMIT - state.used);

  const overlay = document.getElementById("packOverlay");
  const box = document.getElementById("packBox");

  overlay.style.display = "flex";
  box.classList.remove("opening");
}

function tearPack(){
  const box = document.getElementById("packBox");
  box.classList.add("opening");

  setTimeout(() => {
    document.getElementById("packOverlay").style.display = "none";
    openPack(pendingPackAmount, true);
  }, 700);
}

function openPack(packAmount, countDaily){
  const totalCards = packAmount * CARDS_PER_PACK;
  const results = [];

  for(let i = 0; i < totalCards; i++){
    results.push(generateCard());
  }

  if(countDaily){
    let state = getPackState();
    state.used += packAmount;

    if(state.used >= PACK_LIMIT && !state.resetAt){
      state.resetAt = Date.now() + RESET_MS;
    }

    savePackState(state);
  }

  showCards(results);
  triggerRareEffects(results);
  updateHeaderOnly();
}

function addToCollection(cards){
  let col = getCollection();
  let dupe = getDupe();

  cards.forEach(card => {
    if(!col.includes(card.cardId)){
      col.push(card.cardId);
    }else{
      dupe++;
    }
  });

  saveCollection(col);
  setDupe(dupe);
}

function showCards(cards){
  const area = document.getElementById("cardArea");
  if(!area) return;

  area.innerHTML = "";

  cards.forEach((c, index) => {
    setTimeout(() => {
      const rareClass = ["Ultra Rare","Legendary Rare","Secret","Infinity"].includes(c.tier)
        ? "rare-" + c.tier
        : "";

      const safeCard = encodeURIComponent(JSON.stringify(c));

      area.innerHTML += `
        <div class="card-shell ${rareClass}" data-card="${safeCard}" onclick="openSingleCard(this)">
          <div class="card-inner">
            <div class="card-back"><span>T48F</span></div>

           <div class="card-front ${getTierClass(c.tier)}">
              <div class="tier">${c.tier}</div>
              <img src="${c.img}" onerror="this.src='https://via.placeholder.com/300x400/111111/ffffff?text=${encodeURIComponent(c.member)}'">
              <div class="name">${c.member}</div>
              <div class="jiko">${c.jiko}</div>
            </div>
          </div>
        </div>
      `;
    }, index * 120);
  });
}

function openSingleCard(cardElement){
  if(cardElement.classList.contains("opened")) return;

  cardElement.classList.add("open");
  cardElement.classList.add("opened");

  const card = JSON.parse(decodeURIComponent(cardElement.dataset.card));

  addToCollection([card]);
  updateHeaderOnly();
}

function triggerRareEffects(cards){
  const priority = ["INFINITY","SECRET","LR","UR"];
  const best = priority.find(tier => cards.some(card => card.tier === tier));

  if(!best) return;

  showRareOverlay(best);

  if(typeof confetti === "function"){
    let particleCount = 160;

    if(best === "LR") particleCount = 220;
    if(best === "SECRET") particleCount = 300;
    if(best === "INFINITY") particleCount = 450;

    confetti({
      particleCount,
      spread:180,
      origin:{y:.55}
    });
  }
}

function showRareOverlay(tier){
  const overlay = document.getElementById("rareOverlay");
  const text = document.getElementById("rareText");

  if(!overlay || !text) return;

const label = {
 "Ultra Rare":"💜 ULTRA RARE 💜",
 "Legendary Rare":"🏆 LEGENDARY RARE 🏆",
 "Secret":"✨ SECRET CARD ✨",
 "Infinity":"🌌 INFINITY CARD 🌌"
};

  text.innerText = label[tier] || tier;
  overlay.style.display = "flex";

  setTimeout(() => {
    overlay.style.display = "none";
  }, tier === "INFINITY" ? 4200 : 2600);
}

function claimBonusPack(){
  let dupe = getDupe();

  if(dupe < 20){
    alert("Duplicate belum cukup. Butuh 20 duplicate untuk 1 pack tambahan.");
    return;
  }

  setDupe(dupe - 20);
  openPack(1, false);
  updateUI();
}

function formatCountdown(ms){
  if(ms <= 0) return "Siap";

  const h = Math.floor(ms / (1000 * 60 * 60));
  const m = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  const s = Math.floor((ms % (1000 * 60)) / 1000);

  return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
}

function updateUI(){
  const state = getPackState();
  const col = getCollection();

  const packLeft = document.getElementById("packLeft");
  const resetText = document.getElementById("resetText");
  const collectionCount = document.getElementById("collectionCount");
  const dupeCount = document.getElementById("dupeCount");

  if(packLeft){
    packLeft.innerText = `${PACK_LIMIT - state.used} / ${PACK_LIMIT}`;
  }

  if(resetText){
    if(state.resetAt){
      resetText.innerText = formatCountdown(state.resetAt - Date.now());
    }else{
      resetText.innerText = "Belum mulai";
    }
  }

  if(collectionCount){
    collectionCount.innerText = `${col.length} / ${getTotalCards()}`;
  }

  if(dupeCount){
    dupeCount.innerText = `${getDupe()} / 20`;
  }

}

function setFilter(tier){
  currentFilter = tier;
  updateCollection();
}

function updateHeaderOnly(){
  const state = getPackState();

  const packLeft = document.getElementById("packLeft");
  const resetText = document.getElementById("resetText");
  const collectionCount = document.getElementById("collectionCount");
  const dupeCount = document.getElementById("dupeCount");

  if(packLeft){
    packLeft.innerText = `${PACK_LIMIT - state.used} / ${PACK_LIMIT}`;
  }

  if(resetText){
    resetText.innerText = state.resetAt
      ? formatCountdown(state.resetAt - Date.now())
      : "Belum mulai";
  }

  if(collectionCount){
    collectionCount.innerText = `${getCollection().length} / ${getTotalCards()}`;
  }

  if(dupeCount){
    dupeCount.innerText = `${getDupe()} / 20`;
  }
}

function getTierClass(tier){

 switch(tier){

  case "Normal":
   return "normal";

  case "Rare":
   return "rare";

  case "Super Rare":
   return "super-rare";

  case "Super Star Rare":
   return "super-star-rare";

  case "Ultra Rare":
   return "ultra-rare";

  case "Legendary Rare":
   return "legendary-rare";

  case "Secret":
   return "secret";

  case "Infinity":
   return "infinity";

  default:
   return "normal";
 }
}

function updateCollection(){
  const grid = document.getElementById("collection");
  if(!grid) return;

  const col = getCollection();
  grid.innerHTML = "";

  members.forEach(member => {
    normalTiers.forEach(t => {
      if(currentFilter !== "ALL" && currentFilter !== t.name) return;

      const id = member.name + "_" + t.name;
      const owned = col.includes(id);

      grid.innerHTML += `
        <div class="mini ${owned ? "" : "locked"}">
          <b>${t.name}</b><br>
          <img src="${member.img}" onerror="this.src='https://via.placeholder.com/300x400/111111/ffffff?text=${encodeURIComponent(member.name)}'">
          ${owned ? member.name : "???"}
        </div>
      `;
    });
  });

  if(currentFilter === "ALL" || currentFilter === "INFINITY"){
    const owned = col.includes(infinityCard.cardId);

    grid.innerHTML += `
      <div class="mini ${owned ? "" : "locked"}">
        <b>INFINITY</b><br>
        <img src="${infinityCard.img}" onerror="this.src='https://via.placeholder.com/300x400/111111/ffffff?text=OGURI+YUI'">
        ${owned ? infinityCard.member : "???"}
      </div>
    `;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const packOverlay = document.getElementById("packOverlay");

  if(packOverlay){
    packOverlay.addEventListener("click", tearPack);
  }

  updateUI();

  if(document.body.dataset.page === "collection"){
    updateCollection();
  }

  setInterval(() => {
    updateHeaderOnly();
  }, 1000);
});
