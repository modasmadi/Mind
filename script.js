document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

function initApp() {
    console.log("Mind AI App Loaded");

    // Safe Streak Loading
    try {
        const streak = localStorage.getItem('mind_streak') || 0;
        const el = document.getElementById('streak-count');
        if (el) el.innerText = streak;
    } catch (e) { console.error("Streak Error", e); }

    // Safe Theme Loading
    try {
        if (localStorage.getItem('mind_theme') === 'light') {
            document.body.classList.add('light-mode');
        }
        updateThemeIcon();
    } catch (e) { console.error("Theme Error", e); }

    // Init Goals
    renderGoals();
}

// --- Navigation ---
window.switchPage = function (pageId) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active-page'));

    // Show target page
    const target = document.getElementById('page-' + pageId);
    if (target) target.classList.add('active-page');

    // Update Nav
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

    // Manual mapping for safety
    const navItems = document.querySelectorAll('.nav-item');
    if (pageId === 'home' && navItems[0]) navItems[0].classList.add('active');
    if (pageId === 'mind' && navItems[1]) navItems[1].classList.add('active');
    if (pageId === 'goals' && navItems[2]) navItems[2].classList.add('active');
    if (pageId === 'gym' && navItems[3]) navItems[3].classList.add('active');
    if (pageId === 'tools' && navItems[4]) navItems[4].classList.add('active');
};

// --- Theme System ---
window.toggleTheme = function () {
    document.body.classList.toggle('light-mode');
    const theme = document.body.classList.contains('light-mode') ? 'light' : 'dark';
    localStorage.setItem('mind_theme', theme);
    updateThemeIcon();
};

function updateThemeIcon() {
    const btn = document.querySelector('.theme-btn i');
    if (!btn) return;
    btn.className = document.body.classList.contains('light-mode') ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
}

// --- Modal System ---
window.openTool = function (toolName) {
    const modal = document.getElementById('tool-modal');
    const body = document.getElementById('modal-body');
    const tpl = document.getElementById('tpl-' + toolName);

    if (!modal || !body || !tpl) {
        console.error("Tool Template Missing: " + toolName);
        return;
    }

    body.innerHTML = tpl.innerHTML;
    modal.classList.remove('hidden');
};

window.closeTool = function () {
    const modal = document.getElementById('tool-modal');
    if (modal) modal.classList.add('hidden');
    stopFocus();
    stopTimer();
    stopAllNoise();
};

// --- Focus Timer ---
let focusInterval = null;
let focusSeconds = 0;

window.setFocusTime = function (mins) {
    stopFocus();
    const input = getModalElement('#focus-input');
    if (input) input.value = mins;
    focusSeconds = mins * 60;
    updateFocusDisplay();
};

window.startFocus = function () {
    if (focusInterval) return;

    const input = getModalElement('#focus-input');
    if (input && input.value) {
        const val = parseInt(input.value);
        if (!isNaN(val)) {
            // Only update if requested time is different significantly or 0
            if (focusSeconds === 0 || Math.abs(focusSeconds - val * 60) > 60) {
                focusSeconds = val * 60;
            }
        }
    }

    if (focusSeconds <= 0) {
        alert("⚠️ الرجاء تحديد الوقت أولاً");
        return;
    }

    updateFocusDisplay();
    focusInterval = setInterval(() => {
        focusSeconds--;
        if (focusSeconds <= 0) {
            stopFocus();
            try {
                new Audio('https://assets.mixkit.co/sfx/preview/mixkit-alarm-digital-clock-beep-989.mp3').play();
            } catch (e) { console.log("Audio play error"); }
            alert("⏰ انتهى وقت التركيز!");
        }
        updateFocusDisplay();
    }, 1000);
};

window.stopFocus = function () {
    if (focusInterval) clearInterval(focusInterval);
    focusInterval = null;
};

function updateFocusDisplay() {
    const el = getModalElement('#focus-display');
    if (!el) return;
    let m = Math.floor(focusSeconds / 60);
    let s = focusSeconds % 60;
    el.innerText = (m < 10 ? '0' + m : m) + ':' + (s < 10 ? '0' + s : s);
}

// --- White Noise ---
window.toggleNoise = function (type) {
    const audio = document.getElementById('audio-' + type);
    const btn = getModalElement('#btn-' + type);

    if (!audio) return;

    if (audio.paused) {
        audio.play().catch(e => console.log("Audio error", e));
        if (btn) btn.classList.add('playing');
    } else {
        audio.pause();
        if (btn) btn.classList.remove('playing');
    }
};

function stopAllNoise() {
    ['rain', 'fire'].forEach(t => {
        const a = document.getElementById('audio-' + t);
        if (a) { a.pause(); a.currentTime = 0; }
    });
}

// --- Goals System ---
const goalsKey = 'mind_goals_v1';
let goals = [];
try {
    goals = JSON.parse(localStorage.getItem(goalsKey)) || [];
} catch (e) { goals = []; }

window.addGoal = function () {
    const input = document.getElementById('new-goal-text');
    if (!input) return;
    const text = input.value.trim();
    if (!text) return;

    goals.push({ text: text, done: false });
    saveGoals();
    renderGoals();
    input.value = '';
};

window.toggleGoal = function (index) {
    if (goals[index]) {
        goals[index].done = !goals[index].done;
        saveGoals();
        renderGoals();
    }
};

window.deleteGoal = function (index) {
    goals.splice(index, 1);
    saveGoals();
    renderGoals();
};

function saveGoals() {
    localStorage.setItem(goalsKey, JSON.stringify(goals));
}

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

// --- Gym Logic ---
window.calcBMI = function () {
    const w = parseFloat(document.getElementById('weight').value);
    const h = parseFloat(document.getElementById('height').value);
    if (!w || !h) { alert("أدخل الوزن والطول"); return; }

    const bmi = w / ((h / 100) * (h / 100));
    let s = "", c = "";
    if (bmi < 18.5) { s = "نحافة"; c = "#f1c40f"; }
    else if (bmi < 24.9) { s = "وزن مثالي"; c = "#2ecc71"; }
    else if (bmi < 29.9) { s = "وزن زائد"; c = "#e67e22"; }
    else { s = "سمنة"; c = "#e74c3c"; }

    const res = document.getElementById('bmi-result');
    res.innerHTML = `<h2 style="color:${c}">${bmi.toFixed(1)}</h2><p>${s}</p>`;
    res.classList.remove('hidden');
};

window.getWorkout = function () {
    const muscle = document.getElementById('muscle-group').value;
    const w = {
        'chest': '1. بنش برس (4x10)<br>2. تفتيح تجميع (3x12)<br>3. ضغط مائل (3x10)',
        'back': '1. سحب عالي (4x12)<br>2. سحب أرضي (3x10)<br>3. منشار دمبل (3x12)',
        'legs': '1. سكوات (4x8)<br>2. ضغط أرجل (3x12)<br>3. رفرفة أمامي (3x15)',
        'arms': '1. تجميع باي (3x12)<br>2. هامر (3x10)<br>3. مسطرة تراي (3x12)'
    };
    const res = document.getElementById('workout-result');
    res.innerHTML = `<h3 style="color:var(--accent)">🔥 تمارين ${muscle.toUpperCase()}</h3><p style="line-height:2;">${w[muscle]}</p>`;
    res.classList.remove('hidden');
};

// --- Templates Helpers ---
function getModalElement(selector) {
    const m = document.getElementById('modal-body');
    return m ? m.querySelector(selector) : null;
}
function setModalHtml(id, html) {
    const el = getModalElement('#' + id);
    if (el) { el.innerHTML = html; el.classList.remove('hidden'); }
}
function showLoading(cb) {
    const l = document.getElementById('global-loading');
    if (l) l.classList.remove('hidden');
    setTimeout(() => {
        if (l) l.classList.add('hidden');
        cb();
    }, 800);
}
function getVal(id) {
    const el = getModalElement('#' + id);
    return el ? el.value : '';
}

// --- Magic Tools ---
window.calculateLove = function () {
    if (!getVal('name1')) return;
    showLoading(() => {
        const h = Math.floor(Math.random() * 50) + 50;
        setModalHtml('love-result', `<h1 style="color:#ff7675">${h}%</h1><p>حب أبدي!</p>`);
    });
};

window.predictMoney = function () {
    if (!getVal('money-name')) return;
    showLoading(() => {
        const f = ["مليونير قريباً", "دخل عالي ومستقر", "استثمار ناجح"];
        setModalHtml('money-result', `<h3>${f[Math.floor(Math.random() * f.length)]}</h3>`);
    });
};

window.getLuck = function () {
    showLoading(() => {
        const m = ["يومك سعيد", "خبر سار في الطريق", "ركز على أهدافك"];
        setModalHtml('luck-result', `<h3>${m[Math.floor(Math.random() * m.length)]}</h3>`);
    });
};

window.interpretDream = function () {
    if (!getVal('dreamInput')) return;
    showLoading(() => {
        setModalHtml('dream-result', `<p>هذا الحلم يشير إلى تغييرات إيجابية قادمة في حياتك.</p>`);
    });
};

window.analyzePersonality = function () {
    if (!getVal('p-name')) return;
    showLoading(() => {
        setModalHtml('personality-result', `<h3>شخصية قيادية، ذكية، ومحبوبة! 🦁</h3>`);
    });
};

window.makeDecision = function () {
    if (!getVal('decision-input')) return;
    showLoading(() => {
        setModalHtml('decision-result', `<h3>النجوم تقول: نعم، انطلق! ✅</h3>`);
    });
};

window.suggestBabyName = function () {
    showLoading(() => {
        const n = getVal('baby-gender') === 'boy' ? "ريان" : "جوري";
        setModalHtml('baby-result', `<h1>${n}</h1>`);
    });
};

window.findSpiritAnimal = function () {
    if (!getVal('animal-name')) return;
    showLoading(() => {
        setModalHtml('animal-result', `<h3>🦅 الصقر</h3>`);
    });
};

// --- Calculator ---
let calcStr = "";
window.appendCalc = function (v) { calcStr += v; updateCalc(); };
window.chooseOp = function (v) { calcStr += v; updateCalc(); };
window.clearCalc = function () { calcStr = ""; updateCalc(); };
window.calculate = function () {
    try { calcStr = eval(calcStr).toString(); } catch { calcStr = "Error"; }
    updateCalc();
};
function updateCalc() {
    const el = getModalElement('#calc-display');
    if (el) el.value = calcStr;
}

// --- Stopwatch ---
let timerInt = null;
let timerSecs = 0;
window.startTimer = function () {
    if (timerInt) return;
    timerInt = setInterval(() => {
        timerSecs++;
        const el = getModalElement('#timer-display');
        if (el) el.innerText = new Date(timerSecs * 1000).toISOString().substr(11, 8);
    }, 1000);
};
window.stopTimer = function () {
    if (timerInt) clearInterval(timerInt);
    timerInt = null;
};
window.resetTimer = function () {
    stopTimer();
    timerSecs = 0;
    const el = getModalElement('#timer-display');
    if (el) el.innerText = "00:00:00";
};
