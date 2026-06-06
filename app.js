const PACK_LIMIT = 10;
const CARDS_PER_PACK = 5;
const RESET_MS = 12 * 60 * 60 * 1000;

const STORAGE_PACK = "t48_pack_state_v8";
const STORAGE_COLLECTION = "t48_collection_v8";
const STORAGE_DUPE = "t48_dupe_v8";

let pendingPackAmount = 0;
let currentFilter = "ALL";
let currentMemberFilter = "ALL";
let slashStartX = 0;
let slashStartY = 0;
let isSlashing = false;

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

const normalTiers = tiers.filter(t => t.name !== "Infinity");

function getTierClass(tier){
  return tier.toLowerCase().replaceAll(" ","-");
}

function getMemberImage(member, tier){
  return `images/${member.slug}/${getTierClass(tier)}.jpg`;
}

const members = [
  {name:"FREYA", slug:"freya", jiko:"Gadis koleris yang suka berimajinasi, terangi harimu dengan senyum karamelku. Halo semua, aku Freya."},
  {name:"CHRISTY", slug:"christy", jiko:"Peduli dan berbaik hati, siapa dia? Chriiiis-ty."},
  {name:"MARSHA", slug:"marsha", jiko:"Seperti piza yang dinanti-nantikan semua orang, selalu nantikan aku, ya! Halo, aku Marsha."}
];

const infinityCard = {
  member:"OGURI YUI AKB",
  tier:"Infinity",
  cardId:"OGURI_YUI_AKB_INFINITY",
  img:"images/oguri-yui-akb/infinity.jpg",
  jiko:'Mi~nna no HAATO wo (Tocchau, tocchau) Nippon kara kimashita "Yuiyui" koto Oguri Yui desu.'
};

function getTotalCards(){
  return members.length * normalTiers.length + 1;
}

function getPackState(){
  let data = JSON.parse(localStorage.getItem(STORAGE_PACK) || "{}");

  if(typeof data.used !== "number"){
    data = {used:0, resetAt:null};
  }

  if(data.resetAt && Date.now() >= data.resetAt){
    data = {used:0, resetAt:null};
  }

  localStorage.setItem(STORAGE_PACK, JSON.stringify(data));
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

  return "Normal";
}

function generateCard(){
  const tier = pickTier();

  if(tier === "Infinity"){
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

  document.getElementById("packOverlay").style.display = "flex";
  document.getElementById("packBox").classList.remove("opening");
}

function tearPack(){
  const box = document.getElementById("packBox");
  const overlay = document.getElementById("packOverlay");

  if(box.classList.contains("opening")) return;

  box.classList.add("opening");
  overlay.classList.add("slash-open");

  setTimeout(() => {
    overlay.style.display = "none";
    overlay.classList.remove("slash-open");
    openPack(pendingPackAmount, true);
  }, 950);
}

function openPack(packAmount, countDaily){
  const results = [];

  for(let i = 0; i < packAmount * CARDS_PER_PACK; i++){
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
  dropCardEffect();
  updateHeaderOnly();
}

function showCards(cards){
  const area = document.getElementById("cardArea");
  if(!area) return;

  area.innerHTML = "";
  area.classList.remove("pack-five-layout");

if(cards.length === 5){
  area.classList.add("pack-five-layout");
}

  cards.forEach((c, index) => {
    setTimeout(() => {
      const rareClass = ["Ultra Rare","Legendary Rare","Secret","Infinity"].includes(c.tier)
        ? "rare-" + getTierClass(c.tier)
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

  if(["Ultra Rare","Legendary Rare","Secret","Infinity"].includes(card.tier)){
    setTimeout(() => {
      triggerRareEffects([card]);
      showRareCardModal(card);
      cardElement.classList.add("rare-reveal-boom");
    }, 500);
  }
}

function showRareCardModal(card){
  const modal = document.getElementById("rareCardModal");
  const content = document.getElementById("rareModalContent");

  if(!modal || !content) return;

  const tierClass = getTierClass(card.tier);

  content.innerHTML = `
    <div class="rare-modal-card ${tierClass}">
      <div class="rare-tier-badge">${card.tier}</div>
      <img src="${card.img}">
      <h2>${card.member}</h2>
      <p>${card.jiko}</p>
    </div>

    <div class="rare-modal-info">
      <div class="rare-title">${card.tier}</div>
      <div class="rare-member">${card.member}</div>
      <div class="rare-sub">Klik × untuk menutup</div>
    </div>
  `;

  modal.classList.add("show");
}

function closeRareModal(){
  const modal = document.getElementById("rareCardModal");
  if(modal) modal.classList.remove("show");
}

function showBigRareCard(card){
  const overlay = document.getElementById("bigCardOverlay");
  const box = document.getElementById("bigCardBox");

  if(!overlay || !box) return;

  const tierClass = getTierClass(card.tier);

  box.innerHTML = `
    <div class="big-card-content ${tierClass}">
      <button class="big-close" onclick="closeBigRareCard()">×</button>
      <div class="tier">${card.tier}</div>
      <img src="${card.img}">
      <div class="name">${card.member}</div>
      <div class="jiko">${card.jiko}</div>
    </div>
  `;

  overlay.style.display = "flex";
}

function closeBigRareCard(){
  const overlay = document.getElementById("bigCardOverlay");
  if(overlay) overlay.style.display = "none";
}

function dropCardEffect(){
  const area = document.getElementById("cardArea");
  if(!area) return;

  area.classList.remove("drop-start");
  void area.offsetWidth;
  area.classList.add("drop-start");
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

function claimBonusPack(){
  let dupe = getDupe();

  if(dupe < 10){
    alert("Duplicate belum cukup. Butuh 10 duplicate untuk 1 pack tambahan.");
    return;
  }

  setDupe(dupe - 10);
  openPack(1, false);
  updateHeaderOnly();
}

function triggerRareEffects(cards){
  const priority = ["Infinity","Secret","Legendary Rare","Ultra Rare"];
  const best = priority.find(tier => cards.some(card => card.tier === tier));

  if(!best) return;

  showRareOverlay(best);

  if(typeof confetti === "function"){
    confetti({
      particleCount: best === "Infinity" ? 450 : 220,
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
  }, tier === "Infinity" ? 4200 : 2600);
}

function setFilter(tier){
  currentFilter = tier;
  updateCollection();
}

function setMemberFilter(memberName){
  currentMemberFilter = memberName;
  updateCollection();
}

function renderMemberFilter(){
  const select = document.getElementById("memberFilter");
  if(!select) return;

  select.innerHTML = `<option value="ALL">Semua Member</option>`;

  members.forEach(member => {
    select.innerHTML += `<option value="${member.name}">${member.name}</option>`;
  });

  select.innerHTML += `<option value="OGURI YUI AKB">OGURI YUI AKB</option>`;
}

function updateCollection(){
  const grid = document.getElementById("collection");
  if(!grid) return;

  const col = getCollection();
  grid.innerHTML = "";

  members.forEach(member => {
    if(currentMemberFilter !== "ALL" && currentMemberFilter !== member.name) return;

    normalTiers.forEach(t => {
      if(currentFilter !== "ALL" && currentFilter !== t.name) return;

      const id = member.name + "_" + t.name;
      const owned = col.includes(id);
      const imgPath = getMemberImage(member, t.name);

      grid.innerHTML += `
        <div class="mini ${getTierClass(t.name)} ${owned ? "" : "locked"}">
          <b>${t.name}</b><br>
          <img src="${imgPath}" onerror="this.src='https://via.placeholder.com/300x400/111111/ffffff?text=${encodeURIComponent(member.name)}'">
          ${owned ? member.name : "???"}
        </div>
      `;
    });
  });

  if((currentFilter === "ALL" || currentFilter === "Infinity") &&
     (currentMemberFilter === "ALL" || currentMemberFilter === "OGURI YUI AKB")){

    const owned = col.includes(infinityCard.cardId);

    grid.innerHTML += `
      <div class="mini infinity ${owned ? "" : "locked"}">
        <b>Infinity</b><br>
        <img src="${infinityCard.img}" onerror="this.src='https://via.placeholder.com/300x400/111111/ffffff?text=OGURI+YUI'">
        ${owned ? infinityCard.member : "???"}
      </div>
    `;
  }
}

function formatCountdown(ms){
  if(ms <= 0) return "-";

  const h = Math.floor(ms / (1000 * 60 * 60));
  const m = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  const s = Math.floor((ms % (1000 * 60)) / 1000);

  return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
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
    resetText.innerText = state.resetAt ? formatCountdown(state.resetAt - Date.now()) : "-";
  }

  if(collectionCount){
    collectionCount.innerText = `${getCollection().length} / ${getTotalCards()}`;
  }

  if(dupeCount){
    dupeCount.innerText = `${getDupe()} / 10`;
  }
}

function updateUI(){
  updateHeaderOnly();
  updateCollection();
}

document.addEventListener("DOMContentLoaded", () => {
  const packBox = document.getElementById("packBox");

if(packBox){
  packBox.addEventListener("pointerdown", e => {
    isSlashing = true;
    slashStartX = e.clientX;
    slashStartY = e.clientY;
  });

  packBox.addEventListener("pointerup", e => {
    if(!isSlashing) return;

    const dx = Math.abs(e.clientX - slashStartX);
    const dy = Math.abs(e.clientY - slashStartY);

    isSlashing = false;

    if(dx > 70 || dy > 70){
      tearPack();
    }
  });
}
  
  const packOverlay = document.getElementById("packOverlay");

  if(packOverlay){
    packOverlay.addEventListener("click", tearPack);
  }

  renderMemberFilter();
  updateUI();

  setInterval(updateHeaderOnly, 1000);
});
