const AudioContext = window.AudioContext || window.webkitAudioContext;
let ctx = new AudioContext();

function resumeCtx() {
    if (ctx.state === 'suspended') ctx.resume();
}

// 1. ИЗВЛЕЧЕНИЕ
function playRemoveSound() {
    resumeCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine'; 
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
    osc.start();
    osc.stop(ctx.currentTime + 0.15);
}

// 2. УСТАНОВКА
function playInstallSound() {
    resumeCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'triangle'; 
    osc.frequency.setValueAtTime(300, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
}

// 3. ЗАПУСК ПК (КУЛЕРЫ + БИП)
function playBootSound() {
    resumeCtx();
    const t = ctx.currentTime;
    
    // БИП
    const beepOsc = ctx.createOscillator();
    const beepGain = ctx.createGain();
    beepOsc.connect(beepGain);
    beepGain.connect(ctx.destination);
    beepOsc.type = 'square';
    beepOsc.frequency.setValueAtTime(800, t);
    beepGain.gain.setValueAtTime(0.1, t);
    beepGain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
    beepOsc.start(t);
    beepOsc.stop(t + 0.1);

    // ВЕНТИЛЯТОРЫ
    const fanOsc = ctx.createOscillator();
    const fanGain = ctx.createGain();
    fanOsc.connect(fanGain);
    fanGain.connect(ctx.destination);
    fanOsc.type = 'sawtooth';
    fanOsc.frequency.setValueAtTime(100, t);
    fanOsc.frequency.exponentialRampToValueAtTime(400, t + 1.5); 
    fanGain.gain.setValueAtTime(0.05, t);
    fanGain.gain.linearRampToValueAtTime(0, t + 1.5);
    fanOsc.start(t);
    fanOsc.stop(t + 1.5);
}

// 4. МОНЕТКА (МАЙНИНГ)
function playMiningSound() {
    resumeCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine'; 
    osc.frequency.setValueAtTime(1200, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1800, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
}
