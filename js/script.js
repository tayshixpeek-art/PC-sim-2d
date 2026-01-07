   import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, set, get, child } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyD-37EEdtFq2N4JXzbA8ndUtqBZ-ei4Gf8",
  authDomain: "pc-sim-2d.firebaseapp.com",
  databaseURL: "https://pc-sim-2d-default-rtdb.firebaseio.com",
  projectId: "pc-sim-2d",
  storageBucket: "pc-sim-2d.firebasestorage.app",
  messagingSenderId: "449307845492",
  appId: "1:449307845492:web:8e351324e1026f79fc4221"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const currentUser = sessionStorage.getItem('userName');
if (!currentUser) window.location.href = "login.html";

const shopItems = [
  { id: 101, name: "Celeron", type: "cpu", price: 30, imageFile: "svg/cpu.svg", category: "cpu" },
  { id: 102, name: "Core i3", type: "cpu", price: 100, imageFile: "svg/cpu.svg", category: "cpu" },
  { id: 103, name: "Ryzen 5", type: "cpu", price: 150, imageFile: "svg/cpu.svg", category: "cpu" },
  { id: 104, name: "Core i7", type: "cpu", price: 350, imageFile: "svg/cpu.svg", category: "cpu" },
  { id: 105, name: "Ryzen 9", type: "cpu", price: 800, imageFile: "svg/cpu.svg", category: "cpu" },
  { id: 201, name: "GT 710", type: "gpu", price: 40, imageFile: "svg/gpu.svg", category: "gpu" },
  { id: 202, name: "GTX 1050", type: "gpu", price: 120, imageFile: "svg/gpu.svg", category: "gpu" },
  { id: 203, name: "RTX 3060", type: "gpu", price: 300, imageFile: "svg/gpu.svg", category: "gpu" },
  { id: 204, name: "RTX 4080", type: "gpu", price: 1000, imageFile: "svg/gpu.svg", category: "gpu" },
  { id: 205, name: "RTX 5090", type: "gpu", price: 2500, imageFile: "svg/gpu.svg", category: "gpu" },
  { id: 301, name: "Office Board", type: "motherboard", price: 40, imageFile: "svg/mb.svg", category: "motherboard" },
  { id: 302, name: "Gaming B550", type: "motherboard", price: 120, imageFile: "svg/mb.svg", category: "motherboard" },
  { id: 303, name: "Z790 Elite", type: "motherboard", price: 300, imageFile: "svg/mb.svg", category: "motherboard" },
  { id: 401, name: "4GB RAM", type: "ram", price: 15, imageFile: "svg/ram.svg", category: "ram" },
  { id: 402, name: "16GB RAM", type: "ram", price: 50, imageFile: "svg/ram.svg", category: "ram" },
  { id: 403, name: "64GB RAM", type: "ram", price: 200, imageFile: "svg/ram.svg", category: "ram" },
  { id: 501, name: "HDD 500GB", type: "storage", price: 20, imageFile: "svg/disk.svg", category: "storage" },
  { id: 502, name: "SSD 1TB", type: "storage", price: 60, "imageFile": "svg/disk.svg", category: "storage" },
  { id: 503, name: "SSD 4TB", type: "storage", price: 250, "imageFile": "svg/disk.svg", category: "storage" },
  { id: 601, name: "Cooler", type: "cooler", price: 10, imageFile: "svg/cooler.svg", category: "cooler" },
  { id: 602, name: "Snowman", type: "cooler", price: 40, imageFile: "svg/cooler.svg", category: "cooler" },
  { id: 603, name: "Water 360", type: "cooler", price: 150, imageFile: "svg/cooler.svg", category: "cooler" },
  { id: 701, name: "300W PSU", type: "psu", price: 20, imageFile: "svg/psu.svg", category: "psu" },
  { id: 702, name: "600W PSU", type: "psu", price: 60, imageFile: "svg/psu.svg", category: "psu" },
  { id: 703, name: "1200W PSU", type: "psu", price: 200, imageFile: "svg/psu.svg", category: "psu" }
];

let playerMoney = 1500;
let isPCAssembled = false;
let isMining = false;
let miningInterval = null;
let currentCategory = 'cpu';

const workbenchContainer = document.getElementById('workbench-container');
const monitorContainer = document.getElementById('monitor');
const shopContainer = document.getElementById('shop-container');
const moneyEls = [document.getElementById('money'), document.getElementById('shopMoney')];
const statusText = document.getElementById('status');
const slots = document.querySelectorAll('.slot');
const powerBtn = document.getElementById('power-btn');
const tabBtns = document.querySelectorAll('.tab-btn');

function saveToCloud() {
    if(!currentUser) return;
    let slotData = [];
    slots.forEach((slot, index) => {
        if (slot.children.length > 0) {
            const item = slot.querySelector('.item');
            slotData.push({ slotIndex: index, itemId: parseInt(item.getAttribute('data-id')) });
        }
    });
    let workbenchData = [];
    const wbItems = workbenchContainer.querySelectorAll('.item');
    wbItems.forEach(item => workbenchData.push(parseInt(item.getAttribute('data-id'))));
    set(ref(db, 'users/' + currentUser + '/saveData'), {
        money: playerMoney, slots: slotData, workbench: workbenchData, lastSave: new Date().toLocaleString()
    });
}

function loadFromCloud() {
    if(!currentUser) return;
    statusText.innerText = "Загрузка...";
    
    workbenchContainer.innerHTML = ''; 
    slots.forEach(slot => {
        const item = slot.querySelector('.item');
        if (item) item.remove();
        slot.classList.remove('filled');
    });

    get(child(ref(db), 'users/' + currentUser + '/saveData')).then((snapshot) => {
        if (snapshot.exists()) {
            const data = snapshot.val();
            playerMoney = data.money || 1500;
            updateMoneyUI();
            if(data.slots) {
                data.slots.forEach(s => {
                    const i = shopItems.find(x => x.id === s.itemId);
                    if(i) {
                        const el = createItemElement(i, slots[s.slotIndex], false);
                        slots[s.slotIndex].classList.add('filled');
                        el.style.width='100%'; el.style.height='100%'; el.style.zIndex='1';
                    }
                });
            }
            if(data.workbench) {
                data.workbench.forEach(id => {
                    const i = shopItems.find(x => x.id === id);
                    if(i) createItemElement(i, workbenchContainer, false);
                });
            }
            statusText.innerText = "Готово!";
            checkBuild();
        } else {
            statusText.innerText = "Новый аккаунт";
        }
    }).catch((error) => {
        console.error(error);
        statusText.innerText = "Ошибка загрузки";
    });
}

function createItemElement(data, parent, doSave = true) {
    const itemEl = document.createElement('div');
    itemEl.className = 'item';
    itemEl.setAttribute('data-part', data.type);
    itemEl.setAttribute('data-price', data.price);
    itemEl.setAttribute('data-id', data.id);
    itemEl.innerHTML = `<img src="${data.imageFile}" ondragstart="return false">`;
    addDragLogic(itemEl);
    parent.appendChild(itemEl);
    if(doSave) saveToCloud();
    return itemEl;
}

window.filterShop = function(category) {
    currentCategory = category;
    tabBtns.forEach(btn => btn.classList.remove('active'));
    renderShop();
}

function renderShop() {
    shopContainer.innerHTML = '';
    const filtered = shopItems.filter(i => i.category === currentCategory);
    filtered.forEach(item => {
        const div = document.createElement('div');
        div.className = 'shop-item-card';
        div.innerHTML = `<div><img src="${item.imageFile}" width="30"><h3 style="margin:2px 0;font-size:12px">${item.name}</h3><span style="color:#2ecc71;">$${item.price}</span></div><button class="buy-btn" onclick="buyItem(${item.id})">Купить</button>`;
        shopContainer.appendChild(div);
    });
}

window.buyItem = function(id) {
    const item = shopItems.find(i => i.id === id);
    if (playerMoney >= item.price) {
        playerMoney -= item.price;
        updateMoneyUI();
        createItemElement(item, workbenchContainer, true);
        statusText.innerHTML = `Куплено: ${item.name}`;
    } else alert("Нет денег!");
}

window.openShopModal = function() { window.filterShop('cpu'); document.getElementById("shopModal").style.display = "block"; }
window.closeShopModal = function() { document.getElementById("shopModal").style.display = "none"; }
window.openApp = function(id) { document.getElementById(id).style.display = 'flex'; }
window.closeApp = function(id) { document.getElementById(id).style.display = 'none'; }

function updateMoneyUI() { 
    moneyEls.forEach(el => el.innerText = Math.floor(playerMoney)); 
    if (playerMoney >= 6000) { saveToCloud(); window.location.href = "about.html"; }
}

let activeItem = null, shiftX = 0, shiftY = 0;
function addDragLogic(el) { el.addEventListener('touchstart', onTouchStart, {passive:false}); el.addEventListener('mousedown', onMouseDown); }
function onTouchStart(e) { e.preventDefault(); startDrag(e.target.closest('.item'), e.touches[0].clientX, e.touches[0].clientY); }
function onMouseDown(e) { e.preventDefault(); startDrag(e.target.closest('.item'), e.clientX, e.clientY); }

function startDrag(item, x, y) {
    if(!item) return;
    activeItem = item;
    if(item.parentNode.classList.contains('slot')) {
        item.parentNode.classList.remove('filled');
        if(typeof playRemoveSound==="function") playRemoveSound();
        if(monitorContainer.style.display==='block') emergencyShutdown();
        checkBuild();
    }
    const rect = activeItem.getBoundingClientRect();
    shiftX = x - rect.left; shiftY = y - rect.top;
    activeItem.style.position = 'fixed'; activeItem.style.zIndex = 1000;
    activeItem.style.width='50px'; activeItem.style.height='50px';
    document.body.appendChild(activeItem);
    moveAt(x, y);
    document.addEventListener('touchmove', onTouchMove, {passive:false});
    document.addEventListener('touchend', onDragEnd);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onDragEnd);
}

function moveAt(x,y) { activeItem.style.left=(x-shiftX)+'px'; activeItem.style.top=(y-shiftY)+'px'; }
function onTouchMove(e) { e.preventDefault(); moveAt(e.touches[0].clientX, e.touches[0].clientY); }
function onMouseMove(e) { moveAt(e.clientX, e.clientY); }

function onDragEnd(e) {
    if(!activeItem) return;
    activeItem.style.display='none';
    let x = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
    let y = e.changedTouches ? e.changedTouches[0].clientY : e.clientY;
    let elemBelow = document.elementFromPoint(x,y);
    activeItem.style.display='flex';
    let slot = elemBelow ? elemBelow.closest('.slot') : null;
    if(slot && activeItem.getAttribute('data-part') === slot.getAttribute('data-slot')) {
        if(slot.children.length>0) returnToWorkbench(slot.querySelector('.item'));
        slot.appendChild(activeItem);
        slot.classList.add('filled');
        activeItem.style.position='static'; activeItem.style.width='100%'; activeItem.style.height='100%'; activeItem.style.zIndex='1';
        if(typeof playInstallSound==="function") playInstallSound();
        checkBuild();
    } else returnToWorkbench(activeItem);
    document.removeEventListener('touchmove', onTouchMove); document.removeEventListener('touchend', onDragEnd);
    document.removeEventListener('mousemove', onMouseMove); document.removeEventListener('mouseup', onDragEnd);
    activeItem = null;
    saveToCloud();
}

function returnToWorkbench(item) {
    workbenchContainer.appendChild(item);
    item.style.position='static'; item.style.width='50px'; item.style.height='50px'; item.style.transform='none';
}

function checkBuild() {
    let empty = 0; slots.forEach(s => {if(s.children.length===0) empty++});
    isPCAssembled = (empty===0);
    powerBtn.className = isPCAssembled ? 'power-btn ready' : 'power-btn disabled';
    statusText.innerHTML = isPCAssembled ? "✅ Готово!" : "Соберите ПК";
    statusText.style.color = isPCAssembled ? "#0f0" : "orange";
}

function emergencyShutdown() {
    isPCAssembled=false; isMining=false; if(miningInterval) clearInterval(miningInterval);
    monitorContainer.style.display='none'; workbenchContainer.style.display='flex'; powerBtn.style.display='block';
    statusText.innerText="⚠️ ОШИБКА!"; statusText.style.color="red";
}

window.turnOnPC = function() {
    if(!isPCAssembled) return alert("Соберите ПК!");
    if(typeof playBootSound==="function") playBootSound();
    workbenchContainer.style.display='none'; monitorContainer.style.display='block'; powerBtn.style.display='none';
    document.getElementById('boot-screen').style.display='flex';
    setTimeout(()=>{document.getElementById('boot-screen').style.display='none'; document.getElementById('desktop').style.display='flex';}, 2000);
}

window.toggleMining = function() {
    if(miningInterval){clearInterval(miningInterval);miningInterval=null;}
    if(isMining){isMining=false; document.querySelector('.mine-btn').innerText="СТАРТ"; saveToCloud();}
    else {
        isMining=true; document.querySelector('.mine-btn').innerText="СТОП";
        if(typeof resumeCtx==="function") resumeCtx();
        let total=0; slots.forEach(s=>{const i=s.querySelector('.item'); if(i) total+=parseInt(i.getAttribute('data-price'))});
        let income = Math.floor(total/50) || 1;
        document.getElementById('hashrate').innerText = total/5;
        document.getElementById('income').innerText = income;
        miningInterval = setInterval(()=>{
            if(!isMining) return;
            playerMoney+=income;
            if(typeof playMiningSound==="function") playMiningSound();
            updateMoneyUI();
            if(playerMoney%5===0) saveToCloud();
        }, 1000);
    }
}

const consoleInput = document.getElementById('console-input');
const consoleHistory = document.getElementById('console-history');
const consoleBody = document.getElementById('console-body');
if(consoleInput) {
    consoleInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            const command = consoleInput.value.trim();
            printToConsole(`> ${command}`);
            if (command === 'help') printToConsole("Commands: cls, exit");
            else if (command === 'cls') consoleHistory.innerHTML = '';
            else if (command === 'exit') window.closeApp('console-window');
            else printToConsole("Unknown command");
            consoleInput.value = '';
        }
    });
}
function printToConsole(text) {
    const msg = document.createElement('div');
    msg.innerText = text; consoleHistory.appendChild(msg); consoleBody.scrollTop = consoleBody.scrollHeight;
}

loadFromCloud();
