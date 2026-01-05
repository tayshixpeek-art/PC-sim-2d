// ... (Весь блок shopItems остаётся без изменений) ...
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

let playerMoney = 230;
let isPCAssembled = false;
let isMining = false;
let miningInterval = null;
let currentCategory = 'cpu';

// Получаем имя текущего игрока
const currentUser = sessionStorage.getItem('userName') || "Guest";

const workbenchContainer = document.getElementById('workbench-container');
const monitorContainer = document.getElementById('monitor');
const shopContainer = document.getElementById('shop-container');
const moneyEls = [document.getElementById('money'), document.getElementById('shopMoney')];
const statusText = document.getElementById('status');
const slots = document.querySelectorAll('.slot');
const powerBtn = document.getElementById('power-btn');
const tabBtns = document.querySelectorAll('.tab-btn');

function createItemElement(data, parent) {
    const itemEl = document.createElement('div');
    itemEl.classList.add('item');
    itemEl.setAttribute('data-part', data.type);
    itemEl.setAttribute('data-price', data.price);
    // Добавляем ID для сохранения
    itemEl.setAttribute('data-id', data.id);
    itemEl.innerHTML = `<img src="${data.imageFile}" ondragstart="return false">`;
    addDragLogic(itemEl);
    parent.appendChild(itemEl);
    return itemEl;
}

// --- СИСТЕМА СОХРАНЕНИЙ АККАУНТА ---
function saveAccountData() {
    // Собираем детали в слотах
    let slotData = [];
    slots.forEach((slot, index) => {
        if (slot.children.length > 0) {
            const item = slot.querySelector('.item');
            slotData.push({
                slotIndex: index,
                itemId: parseInt(item.getAttribute('data-id'))
            });
        }
    });

    // Собираем детали на верстаке
    let workbenchData = [];
    const wbItems = workbenchContainer.querySelectorAll('.item');
    wbItems.forEach(item => {
        workbenchData.push(parseInt(item.getAttribute('data-id')));
    });

    const saveData = {
        money: playerMoney,
        slots: slotData,
        workbench: workbenchData,
        assembled: isPCAssembled
    };

    // Сохраняем под уникальным ключом игрока
    localStorage.setItem('pcSim_Save_' + currentUser, JSON.stringify(saveData));
}

function loadAccountData() {
    const dataJSON = localStorage.getItem('pcSim_Save_' + currentUser);
    if (!dataJSON) return; // Если сохранений нет, начинаем с 1500

    const data = JSON.parse(dataJSON);
    
    // Восстанавливаем деньги
    playerMoney = data.money;
    updateMoneyUI();

    // Восстанавливаем детали в слотах
    data.slots.forEach(savedSlot => {
        const itemData = shopItems.find(i => i.id === savedSlot.itemId);
        if (itemData) {
            const itemEl = createItemElement(itemData, slots[savedSlot.slotIndex]);
            slots[savedSlot.slotIndex].classList.add('filled');
            itemEl.style.width = '100%'; 
            itemEl.style.height = '100%'; 
            itemEl.style.zIndex = '1';
        }
    });

    // Восстанавливаем детали на верстаке
    data.workbench.forEach(itemId => {
        const itemData = shopItems.find(i => i.id === itemId);
        if (itemData) {
            createItemElement(itemData, workbenchContainer);
        }
    });

    checkBuild();
}

// --- МАГАЗИН ---
function filterShop(category) {
    currentCategory = category;
    tabBtns.forEach(btn => btn.classList.remove('active'));
    const activeBtn = Array.from(tabBtns).find(btn => btn.innerText.toLowerCase().includes(category === 'motherboard' ? 'мать' : category));
    if(activeBtn) activeBtn.classList.add('active');
    else if(category === 'storage') tabBtns[4].classList.add('active');
    else if(category === 'psu') tabBtns[6].classList.add('active');
    renderShop();
}

function renderShop() {
    shopContainer.innerHTML = '';
    const filteredItems = shopItems.filter(item => item.category === currentCategory);
    filteredItems.forEach(item => {
        const card = document.createElement('div');
        card.classList.add('shop-item-card');
        const priceColor = item.price > 500 ? '#e74c3c' : '#27ae60';
        card.innerHTML = `
            <div>
                <img src="${item.imageFile}" width="30" height="30">
                <h3 style="margin:2px 0;">${item.name}</h3>
                <span style="color:${priceColor}; font-weight:bold;">$${item.price}</span>
            </div>
            <button class="buy-btn" onclick="buyItem(${item.id})">Купить</button>
        `;
        shopContainer.appendChild(card);
    });
}

function buyItem(id) {
    const item = shopItems.find(i => i.id === id);
    if (playerMoney >= item.price) {
        playerMoney -= item.price;
        updateMoneyUI();
        createItemElement(item, workbenchContainer);
        statusText.innerHTML = `Куплено: ${item.name}`;
        saveAccountData(); // СОХРАНЯЕМ ПРИ ПОКУПКЕ
    } else {
        alert("Не хватает денег!");
    }
}

function updateMoneyUI() { 
    moneyEls.forEach(el => el.innerText = Math.floor(playerMoney)); 
    if (playerMoney >= 6000) {
        if (miningInterval) clearInterval(miningInterval);
        saveAccountData();
        window.location.href = "about.html";
    }
}

// --- DRAG & DROP ---
let activeItem = null;
let shiftX = 0, shiftY = 0;

function addDragLogic(el) {
    el.addEventListener('touchstart', onTouchStart, { passive: false });
    el.addEventListener('mousedown', onMouseDown);
}

function onTouchStart(e) { e.preventDefault(); startDrag(e.target.closest('.item'), e.touches[0].clientX, e.touches[0].clientY); }
function onMouseDown(e) { e.preventDefault(); startDrag(e.target.closest('.item'), e.clientX, e.clientY); }

function startDrag(item, x, y) {
    if (!item) return;
    activeItem = item;
    if (item.parentNode.classList.contains('slot')) {
        const oldSlot = item.parentNode;
        oldSlot.classList.remove('filled');
        if (typeof playRemoveSound === "function") playRemoveSound();
        if (monitorContainer.style.display === 'block') emergencyShutdown();
        checkBuild();
    }
    const rect = activeItem.getBoundingClientRect();
    shiftX = x - rect.left; shiftY = y - rect.top;
    activeItem.style.position = 'fixed'; activeItem.style.zIndex = 1000;
    activeItem.style.width = '50px'; activeItem.style.height = '50px';
    document.body.appendChild(activeItem);
    moveAt(x, y);
    document.addEventListener('touchmove', onTouchMove, { passive: false });
    document.addEventListener('touchend', onDragEnd);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onDragEnd);
}

function moveAt(x, y) { activeItem.style.left = (x - shiftX) + 'px'; activeItem.style.top = (y - shiftY) + 'px'; }
function onTouchMove(e) { e.preventDefault(); moveAt(e.touches[0].clientX, e.touches[0].clientY); }
function onMouseMove(e) { moveAt(e.clientX, e.clientY); }

function onDragEnd(e) {
    if (!activeItem) return;
    activeItem.style.display = 'none';
    let x = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
    let y = e.changedTouches ? e.changedTouches[0].clientY : e.clientY;
    let elemBelow = document.elementFromPoint(x, y);
    activeItem.style.display = 'flex';
    let slot = elemBelow ? elemBelow.closest('.slot') : null;
    if (slot) {
        const partType = activeItem.getAttribute('data-part');
        const slotType = slot.getAttribute('data-slot');
        if (partType === slotType) placeInSlot(activeItem, slot);
        else returnToWorkbench(activeItem);
    } else {
        returnToWorkbench(activeItem);
    }
    document.removeEventListener('touchmove', onTouchMove);
    document.removeEventListener('touchend', onDragEnd);
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onDragEnd);
    activeItem = null;
    saveAccountData(); // СОХРАНЯЕМ ПРИ ПЕРЕМЕЩЕНИИ
}

function placeInSlot(newItem, slot) {
    if (slot.children.length > 0) {
        const oldItem = slot.querySelector('.item');
        if (oldItem && oldItem !== newItem) returnToWorkbench(oldItem);
    }
    slot.appendChild(newItem);
    slot.classList.add('filled');
    newItem.style.position = 'static'; newItem.style.width = '100%'; newItem.style.height = '100%'; newItem.style.zIndex = '1';
    if (typeof playInstallSound === "function") playInstallSound();
    checkBuild();
}

function returnToWorkbench(item) {
    workbenchContainer.appendChild(item);
    item.style.position = 'static'; item.style.width = '50px'; item.style.height = '50px';
    item.style.top = 'auto'; item.style.left = 'auto'; item.style.transform = 'none';
}

function checkBuild() {
    let emptySlots = 0;
    slots.forEach(slot => { if (slot.children.length === 0) emptySlots++; });
    if (emptySlots === 0) {
        isPCAssembled = true;
        statusText.innerHTML = "✅ Сборка готова!";
        statusText.style.color = "#00ff00";
        powerBtn.classList.add('ready');
    } else {
        isPCAssembled = false;
        statusText.innerHTML = "Соберите ПК";
        statusText.style.color = "orange";
        powerBtn.classList.remove('ready');
    }
}

function emergencyShutdown() {
    isPCAssembled = false; isMining = false;
    if(miningInterval) clearInterval(miningInterval);
    document.querySelector('.mine-btn').innerText = "СТАРТ";
    monitorContainer.style.display = 'none';
    workbenchContainer.style.display = 'flex';
    powerBtn.style.display = 'block';
    statusText.innerHTML = "⚠️ ОШИБКА! Деталь извлечена!";
    statusText.style.color = "red";
    if(navigator.vibrate) navigator.vibrate(300);
}

function turnOnPC() {
    if (!isPCAssembled) { alert("Соберите ПК!"); return; }
    if (typeof playBootSound === "function") playBootSound();
    workbenchContainer.style.display = 'none';
    monitorContainer.style.display = 'block';
    powerBtn.style.display = 'none';
    calculateMiningPower();
    document.getElementById('boot-screen').style.display = 'flex';
    document.getElementById('desktop').style.display = 'none';
    setTimeout(() => {
        document.getElementById('boot-screen').style.display = 'none';
        document.getElementById('desktop').style.display = 'flex';
    }, 2000);
}

function openApp(id) { document.getElementById(id).style.display = 'flex'; }
function closeApp(id) { document.getElementById(id).style.display = 'none'; }

function calculateMiningPower() {
    let totalValue = 0;
    slots.forEach(slot => {
        const item = slot.querySelector('.item');
        if (item) {
            const price = parseInt(item.getAttribute('data-price')) || 0;
            totalValue += price;
        }
    });
    let hashrate = Math.floor(totalValue / 5);
    let income = Math.floor(hashrate / 10);
    document.getElementById('hashrate').innerText = hashrate;
    document.getElementById('income').innerText = income;
    return income;
}

function toggleMining() {
    // Очистка старого интервала
    if (miningInterval) { clearInterval(miningInterval); miningInterval = null; }
    
    if (isMining) {
        // Выключение
        isMining = false;
        document.querySelector('.mine-btn').innerText = "СТАРТ";
        saveAccountData(); 
    } else {
        // Включение
        isMining = true;
        document.querySelector('.mine-btn').innerText = "СТОП";
        
        // --- ВАЖНО: Пытаемся включить звук сразу при нажатии кнопки ---
        if (typeof resumeCtx === "function") resumeCtx();
        // -------------------------------------------------------------

        const income = calculateMiningPower();
        
        miningInterval = setInterval(() => {
            if (!isMining) { clearInterval(miningInterval); return; }
            
            playerMoney += (income || 1);
            
            // Звук монетки
            if (typeof playMiningSound === "function") playMiningSound();
            
            updateMoneyUI();
            
            // Сохранение каждые 5 секунд
            if (playerMoney % 5 === 0) saveAccountData();
            
        }, 1000);
    }
}

// ... (Весь блок с КОНСОЛЬЮ consoleInput... оставляем без изменений) ...
const consoleInput = document.getElementById('console-input');
const consoleHistory = document.getElementById('console-history');
const consoleBody = document.getElementById('console-body');
const fakeFiles = ["system32.dll", "config.sys", "mining_wallet.dat", "kernel.exe", "crypto_keys.aes", "network.xml"];

if(consoleInput) {
    consoleInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            const command = consoleInput.value.trim();
            printToConsole(`C:/User/Admin> ${command}`);
            if (command === '<txt on>') startHackerMode();
            else if (command === 'help') printToConsole("Commands: <txt on>, cls, exit");
            else if (command === 'cls') consoleHistory.innerHTML = '';
            else if (command === 'exit') closeApp('console-window');
            else if (command !== '') printToConsole(`'${command}' not found.`);
            consoleInput.value = '';
        }
    });
}

function printToConsole(text, isHacker = false) {
    const msg = document.createElement('div');
    msg.className = 'console-msg';
    if(isHacker) msg.classList.add('hacker-text');
    msg.innerText = text;
    consoleHistory.appendChild(msg);
    consoleBody.scrollTop = consoleBody.scrollHeight;
}

function startHackerMode() {
    printToConsole("Scanning...", true);
    let counter = 0;
    const interval = setInterval(() => {
        const file = fakeFiles[Math.floor(Math.random() * fakeFiles.length)];
        const hash = Math.random().toString(36).substring(7);
        printToConsole(`Checking: C:/Win/${file} [HASH:${hash}] ... OK`, true);
        counter++;
        if (counter > 40) clearInterval(interval);
    }, 50);
}

const shopModal = document.getElementById("shopModal");
function openShopModal() { filterShop('cpu'); shopModal.style.display = "block"; }
function closeShopModal() { shopModal.style.display = "none"; }

// !!! ВАЖНО: ЗАГРУЖАЕМ ДАННЫЕ ПРИ СТАРТЕ !!!
loadAccountData();
