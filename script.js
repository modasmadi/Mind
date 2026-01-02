// --- Global State ---
let streak = localStorage.getItem('mind_streak') || 0;
document.getElementById('streak-count').innerText = streak;

// --- Navigation ---
function switchPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active-page'));
    document.getElementById('page-' + pageId).classList.add('active-page');

    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    const map = { 'home': 0, 'mind': 1, 'goals': 2, 'gym': 3, 'tools': 4 };
    document.querySelectorAll('.nav-item')[map[pageId]].classList.add('active');
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
    // Stop any running timers when closing
    stopFocus();
    stopTimer();
}

// --- Focus Timer (Countdown) ---
let focusInterval = null;
let focusSeconds = 0;

window.setFocusTime = function (mins) {
    const modal = document.getElementById('modal-body');
    const input = modal.querySelector('#focus-input');
    if (input) input.value = mins;
    focusSeconds = mins * 60;
    updateFocusDisplay();
}

window.startFocus = function () {
    if (focusInterval) return;
    const modal = document.getElementById('modal-body');
    const input = modal.querySelector('#focus-input');

    // If input has value, use it
    if (input && input.value && focusSeconds === 0) {
        focusSeconds = parseInt(input.value) * 60;
    }

    if (focusSeconds <= 0) { alert("حدد الوقت أولاً"); return; }

    focusInterval = setInterval(() => {
        focusSeconds--;
        if (focusSeconds <= 0) {
            stopFocus();
            // Alarm logic here (Visual for now)
            alert("⏰ انتهى وقت التركيز! استرح قليلاً.");
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
    if (!list) return; // Guard
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

// --- Gym Logic ---
function calcBMI() {
    const w = parseFloat(document.getElementById('weight').value);
    const h = parseFloat(document.getElementById('height').value);
    if (!w || !h) return;
    const bmi = w / ((h / 100) * (h / 100));
    let status = "", color = "";
    if (bmi < 18.5) { status = "نحافة"; color = "#f1c40f"; }
    else if (bmi < 24.9) { status = "وزن مثالي"; color = "#2ecc71"; }
    else if (bmi < 29.9) { status = "وزن زائد"; color = "#e67e22"; }
    else { status = "سمنة"; color = "#e74c3c"; }
    document.getElementById('bmi-result').innerHTML = `<h2 style="color:${color}">${bmi.toFixed(1)}</h2><p>${status}</p>`;
    document.getElementById('bmi-result').classList.remove('hidden');
}

function getWorkout() {
    const muscle = document.getElementById('muscle-group').value;
    const workouts = {
        'chest': '1. بنش برس (4x10)<br>2. تفتيح تجميع (3x12)<br>3. ضغط مائل (3x10)<br>4. متوازي (3xFailure)',
        'back': '1. سحب عالي (4x12)<br>2. سحب أرضي (3x10)<br>3. منشار دمبل (3x12)<br>4. قطنية (4x15)',
        'legs': '1. سكوات (4x8)<br>2. ضغط أرجل (3x12)<br>3. رفرفة أمامي (3x15)<br>4. سمانة (4x20)',
        'arms': '1. تجميع باي (3x12)<br>2. هامر (3x10)<br>3. مسطرة تراي (3x12)<br>4. حبل تراي (3x15)'
    };
    document.getElementById('workout-result').innerHTML = `<h3 style="color:var(--accent)">🔥 تمارين ${muscle.toUpperCase()}</h3><p style="line-height:2;">${workouts[muscle]}</p>`;
    document.getElementById('workout-result').classList.remove('hidden');
}

// --- Helpers ---
function getVal(id) {
    const modal = document.getElementById('modal-body');
    const el = modal.querySelector('#' + id);
    return el ? el.value : '';
}
function setHtml(id, html) {
    const modal = document.getElementById('modal-body');
    const el = modal.querySelector('#' + id);
    if (el) { el.innerHTML = html; el.classList.remove('hidden'); }
}
function showLoading(cb) {
    document.getElementById('global-loading').classList.remove('hidden');
    setTimeout(() => {
        document.getElementById('global-loading').classList.add('hidden');
        cb();
    }, 1000);
}

// --- Bindings for Templates in Modal ---
window.calculateLove = function () {
    const n1 = getVal('name1'), n2 = getVal('name2');
    if (!n1) return;
    showLoading(() => {
        const hash = Math.floor(Math.random() * 50) + 50;
        setHtml('love-result', `<h1 style="color:#ff7675">${hash}%</h1><p>حب أبدي!</p>`);
    });
}
window.predictMoney = function () {
    if (!getVal('money-name')) return;
    showLoading(() => {
        const fortunes = ["مليونير قريباً", "دخل مستقر", "ثروة عقارية"];
        setHtml('money-result', `<h3>${fortunes[Math.floor(Math.random() * fortunes.length)]}</h3>`);
    });
}
window.getLuck = function () {
    showLoading(() => {
        const msgs = ["يومك سعيد", "خبر سار", "انتبه لصحتك"];
        setHtml('luck-result', `<h3>${msgs[Math.floor(Math.random() * msgs.length)]}</h3>`);
    });
}
window.interpretDream = function () {
    const t = getVal('dreamInput');
    if (!t) return;
    showLoading(() => {
        setHtml('dream-result', `<p>هذا الحلم يدل على رغبة مكبوتة في التغيير. (${t.substring(0, 10)}...)</p>`);
    });
}
window.analyzePersonality = function () {
    if (!getVal('p-name')) return;
    showLoading(() => {
        setHtml('personality-result', `<h3>شخصية قيادية! 🦁</h3>`);
    });
}
window.makeDecision = function () {
    if (!getVal('decision-input')) return;
    showLoading(() => {
        setHtml('decision-result', `<h3>توكل على الله ✅</h3>`);
    });
}
window.suggestBabyName = function () {
    const g = getVal('baby-gender');
    showLoading(() => {
        const n = g === 'boy' ? "ريان" : "جوري";
        setHtml('baby-result', `<h1>${n}</h1>`);
    });
}
window.findSpiritAnimal = function () {
    if (!getVal('animal-name')) return;
    showLoading(() => {
        setHtml('animal-result', `<h3>🦅 الصقر</h3>`);
    });
}

// --- Calculator & Stopwatch ---
let calcStr = "";
window.appendCalc = function (v) { calcStr += v; updateCalc(); }
window.chooseOp = function (v) { calcStr += v; updateCalc(); }
window.clearCalc = function () { calcStr = ""; updateCalc(); }
window.calculate = function () { try { calcStr = eval(calcStr); } catch { calcStr = "Error" } updateCalc(); }
function updateCalc() {
    const modal = document.getElementById('modal-body');
    const el = modal.querySelector('#calc-display');
    if (el) el.value = calcStr;
}

let timerInt = null, secs = 0;
window.startTimer = function () {
    if (timerInt) return;
    timerInt = setInterval(() => {
        secs++;
        const modal = document.getElementById('modal-body');
        const el = modal.querySelector('#timer-display');
        if (el) el.innerText = new Date(secs * 1000).toISOString().substr(11, 8);
    }, 1000);
}
window.stopTimer = function () { clearInterval(timerInt); timerInt = null; }
window.resetTimer = function () {
    stopTimer(); secs = 0;
    const modal = document.getElementById('modal-body');
    const el = modal.querySelector('#timer-display');
    if (el) el.innerText = "00:00:00";
}

function pad(n) { return n < 10 ? '0' + n : n; }
