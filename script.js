// --- Global State ---
let streak = localStorage.getItem('mind_streak') || 0;
document.getElementById('streak-count').innerText = streak;

// Theme Init
if (localStorage.getItem('mind_theme') === 'light') {
    document.body.classList.add('light-mode');
    updateThemeIcon();
}

// --- Navigation ---
function switchPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active-page'));
    document.getElementById('page-' + pageId).classList.add('active-page');

    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    const map = { 'home': 0, 'mind': 1, 'goals': 2, 'gym': 3, 'tools': 4 };
    document.querySelectorAll('.nav-item')[map[pageId]].classList.add('active');
}

// --- Theme System ---
function toggleTheme() {
    document.body.classList.toggle('light-mode');
    localStorage.setItem('mind_theme', document.body.classList.contains('light-mode') ? 'light' : 'dark');
    updateThemeIcon();
}

function updateThemeIcon() {
    const isLight = document.body.classList.contains('light-mode');
    const btn = document.querySelector('.theme-btn i');
    if (btn) {
        btn.className = isLight ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
    }
}


// --- Tool Modal System ---
function openTool(toolName) {
    const modal = document.getElementById('tool-modal');
    const body = document.getElementById('modal-body');
    const tpl = document.getElementById('tpl-' + toolName);

    if (!tpl) return;
    body.innerHTML = tpl.innerHTML;
    modal.classList.remove('hidden');
}

function closeTool() {
    const modal = document.getElementById('tool-modal');
    modal.classList.add('hidden');
    // Stop any running timers/noise when closing
    stopFocus();
    stopTimer();
    stopAllNoise();
}

// --- Focus Timer (Updated) ---
let focusInterval = null;
let focusSeconds = 0;

window.setFocusTime = function (mins) {
    stopFocus(); // Reset logic
    const modal = document.getElementById('modal-body');
    const input = modal.querySelector('#focus-input');
    if (input) input.value = mins;
    focusSeconds = mins * 60;
    updateFocusDisplay();
}

window.startFocus = function () {
    if (focusInterval) return; // Already running

    const modal = document.getElementById('modal-body');
    const input = modal.querySelector('#focus-input');

    // Check input if seconds are 0 OR if user changed input manually
    if (input && input.value) {
        const inputSecs = parseInt(input.value) * 60;
        // If current seconds are way off from input (e.g. finished or changed), update
        if (focusSeconds === 0 || Math.abs(focusSeconds - inputSecs) > 60) {
            focusSeconds = inputSecs;
        }
    }

    if (focusSeconds <= 0) { alert("حدد الوقت أولاً"); return; }

    updateFocusDisplay(); // Update immediately
    focusInterval = setInterval(() => {
        focusSeconds--;
        if (focusSeconds <= 0) {
            stopFocus();
            new Audio('https://assets.mixkit.co/sfx/preview/mixkit-alarm-digital-clock-beep-989.mp3').play();
            alert("⏰ انتهى وقت التركيز!");
        }
        updateFocusDisplay();
    }, 1000);
}

window.stopFocus = function () {
    clearInterval(focusInterval);
    focusInterval = null;
}

function updateFocusDisplay() {
    const modal = document.getElementById('modal-body');
    const el = modal.querySelector('#focus-display');
    if (!el) return;

    let m = Math.floor(focusSeconds / 60);
    let s = focusSeconds % 60;
    el.innerText = `${pad(m)}:${pad(s)}`;
}

// --- White Noise ---
window.toggleNoise = function (type) {
    const audio = document.getElementById('audio-' + type);
    const btn = document.getElementById('modal-body').querySelector('#btn-' + type);

    if (audio.paused) {
        audio.play();
        btn.classList.add('playing');
    } else {
        audio.pause();
        btn.classList.remove('playing');
    }
}
function stopAllNoise() {
    ['rain', 'fire'].forEach(t => {
        const a = document.getElementById('audio-' + t);
        if (a) { a.pause(); a.currentTime = 0; }
    });
}

// --- Goals System ---
const goalsKey = 'mind_goals_v1';
let goals = JSON.parse(localStorage.getItem(goalsKey)) || [];
renderGoals();

function addGoal() {
    const input = document.getElementById('new-goal-text');
    const text = input.value.trim();
    if (!text) return;
    goals.push({ text: text, done: false });
    saveGoals();
    renderGoals();
    input.value = '';
}

function toggleGoal(index) {
    goals[index].done = !goals[index].done;
    saveGoals();
    renderGoals();
}

function deleteGoal(index) {
    goals.splice(index, 1);
    saveGoals();
    renderGoals();
}

function saveGoals() { localStorage.setItem(goalsKey, JSON.stringify(goals)); }

function renderGoals() {
    const list = document.getElementById('goals-list');
    const empty = document.getElementById('empty-state');
    if (!list) return;
    list.innerHTML = '';

    if (goals.length === 0) {
        if (empty) empty.style.display = 'block';
    } else {
        if (empty) empty.style.display = 'none';
        goals.forEach((g, i) => {
            const li = document.createElement('li');
            li.className = `goal-item ${g.done ? 'done' : ''}`;
            li.innerHTML = `
                <i class="fa-regular ${g.done ? 'fa-square-check' : 'fa-square'}"></i>
                <span style="flex-grow:1; margin-right:10px;">${g.text}</span>
                <i class="fa-solid fa-trash" onclick="deleteGoal(${i}); event.stopPropagation();" style="color:#e74c3c; font-size:0.8rem;"></i>
            `;
            li.onclick = () => toggleGoal(i);
            list.appendChild(li);
        });
    }
}

// --- Gym, Calc, Helpers ---
function calcBMI() {
    const w = parseFloat(document.getElementById('weight').value);
    const h = parseFloat(document.getElementById('height').value);
    if (!w || !h) return;
    const bmi = w / ((h / 100) * (h / 100));
    let s = "", c = "";
    if (bmi < 18.5) { s = "نحافة"; c = "#f1c40f"; }
    else if (bmi < 24.9) { s = "وزن مثالي"; c = "#2ecc71"; }
    else if (bmi < 29.9) { s = "وزن زائد"; c = "#e67e22"; }
    else { s = "سمنة"; c = "#e74c3c"; }
    document.getElementById('bmi-result').innerHTML = `<h2 style="color:${c}">${bmi.toFixed(1)}</h2><p>${s}</p>`;
    document.getElementById('bmi-result').classList.remove('hidden');
}

function getWorkout() {
    const muscle = document.getElementById('muscle-group').value;
    const w = {
        'chest': '1. بنش برس (4x10)<br>2. تفتيح تجميع (3x12)<br>3. ضغط مائل (3x10)',
        'back': '1. سحب عالي (4x12)<br>2. سحب أرضي (3x10)<br>3. منشار دمبل (3x12)',
        'legs': '1. سكوات (4x8)<br>2. ضغط أرجل (3x12)<br>3. رفرفة أمامي (3x15)',
        'arms': '1. تجميع باي (3x12)<br>2. هامر (3x10)<br>3. مسطرة تراي (3x12)'
    };
    document.getElementById('workout-result').innerHTML = `<h3 style="color:var(--accent)">🔥 تمارين ${muscle.toUpperCase()}</h3><p style="line-height:2;">${w[muscle]}</p>`;
    document.getElementById('workout-result').classList.remove('hidden');
}

function getVal(id) { const el = document.getElementById('modal-body').querySelector('#' + id); return el ? el.value : ''; }
function setHtml(id, h) { const el = document.getElementById('modal-body').querySelector('#' + id); if (el) { el.innerHTML = h; el.classList.remove('hidden'); } }
function showLoading(cb) { document.getElementById('global-loading').classList.remove('hidden'); setTimeout(() => { document.getElementById('global-loading').classList.add('hidden'); cb(); }, 800); }

// Templates Bindings
window.calculateLove = function () {
    if (!getVal('name1')) return;
    showLoading(() => { const h = Math.floor(Math.random() * 50) + 50; setHtml('love-result', `<h1 style="color:#ff7675">${h}%</h1><p>حب أبدي!</p>`); });
}
window.predictMoney = function () { if (!getVal('money-name')) return; showLoading(() => { const f = ["مليونير", "دخل عالي", "استثمار ناجح"]; setHtml('money-result', `<h3>${f[Math.floor(Math.random() * f.length)]}</h3>`); }); }
window.getLuck = function () { showLoading(() => { const m = ["يوم سعيد", "فرصة قادمة", "نجاح"]; setHtml('luck-result', `<h3>${m[Math.floor(Math.random() * m.length)]}</h3>`); }); }
window.interpretDream = function () { if (!getVal('dreamInput')) return; showLoading(() => { setHtml('dream-result', `<p>تغيير قادم في حياتك (تفسير عام).</p>`); }); }
window.analyzePersonality = function () { if (!getVal('p-name')) return; showLoading(() => { setHtml('personality-result', `<h3>شخصية قوية ومحبوبة!</h3>`); }); }
window.makeDecision = function () { if (!getVal('decision-input')) return; showLoading(() => { setHtml('decision-result', `<h3>نعم، افعلها! ✅</h3>`); }); }
window.suggestBabyName = function () { showLoading(() => { const n = getVal('baby-gender') === 'boy' ? "أحمد" : "سلمى"; setHtml('baby-result', `<h1>${n}</h1>`); }); }
window.findSpiritAnimal = function () { if (!getVal('animal-name')) return; showLoading(() => { setHtml('animal-result', `<h3>🦅 الصقر</h3>`); }); }

// Calc & Timer
let calcStr = ""; window.appendCalc = function (v) { calcStr += v; uC(); } window.chooseOp = function (v) { calcStr += v; uC(); } window.clearCalc = function () { calcStr = ""; uC(); } window.calculate = function () { try { calcStr = eval(calcStr); } catch { calcStr = "Err"; } uC(); } function uC() { const el = document.getElementById('modal-body').querySelector('#calc-display'); if (el) el.value = calcStr; }
let tInt = null, s = 0;
window.startTimer = function () { if (tInt) return; tInt = setInterval(() => { s++; const el = document.getElementById('modal-body').querySelector('#timer-display'); if (el) el.innerText = new Date(s * 1000).toISOString().substr(11, 8); }, 1000); }
window.stopTimer = function () { clearInterval(tInt); tInt = null; }
window.resetTimer = function () { stopTimer(); s = 0; const el = document.getElementById('modal-body').querySelector('#timer-display'); if (el) el.innerText = "00:00:00"; }

function pad(n) { return n < 10 ? '0' + n : n; }
