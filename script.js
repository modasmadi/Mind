document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

function initApp() {
    startNewDayLogic();
    try {
        const el = document.getElementById('streak-count');
        if (el) el.innerText = localStorage.getItem('mind_streak') || 0;
    } catch (e) { }
    try {
        if (localStorage.getItem('mind_theme') === 'light') document.body.classList.add('light-mode');
    } catch (e) { }

    renderGoals();
    renderWater();
    renderHabits();
    loadDailyQuote();
}

// --- NAVIGATION ---
window.switchPage = function (pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active-page'));
    const target = document.getElementById('page-' + pageId);
    if (target) target.classList.add('active-page');

    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    // Map: Dashboard=0, Mind=1, Gym=2, Tools=3
    const map = { 'dashboard': 0, 'mind': 1, 'gym': 2, 'tools': 3 };
    const navs = document.querySelectorAll('.nav-item');
    if (navs[map[pageId]]) navs[map[pageId]].classList.add('active');
};

// --- GYM & FITNESS LOGIC ---
window.calcBMI = function () {
    const w = parseFloat(document.getElementById('weight').value);
    const h = parseFloat(document.getElementById('height').value);
    if (!w || !h) return;
    const bmi = w / ((h / 100) * (h / 100));
    let status = bmi < 18.5 ? "نحافة" : bmi < 24.9 ? "وزن مثالي" : "وزن زائد";
    let color = bmi < 18.5 ? "#f1c40f" : bmi < 24.9 ? "#2ecc71" : "#e74c3c";

    const res = document.getElementById('bmi-result');
    res.innerHTML = `<h2 style="color:${color}">${bmi.toFixed(1)}</h2><p>${status}</p>`;
    res.classList.remove('hidden');
};

window.getWorkout = function () {
    const muscle = document.getElementById('muscle-group').value;
    const res = document.getElementById('workout-result');
    const workouts = {
        'chest': "1. Barbell Bench Press (3x10)\n2. Incline Dumbbell Press (3x12)\n3. Cable Flys (3x15)\n4. Push-ups (3xFailure)",
        'back': "1. Deadlift (3x8)\n2. Pull-ups (3xMax)\n3. Bent Over Row (3x10)\n4. Lat Pulldown (3x12)",
        'legs': "1. Squat (3x8)\n2. Leg Press (3x12)\n3. Romanian Deadlift (3x10)\n4. Calf Raises (4x15)",
        'shoulders': "1. Overhead Press (3x10)\n2. Lateral Raises (3x15)\n3. Front Raises (3x12)\n4. Face Pulls (3x15)",
        'arms': "1. Bicep Curls (3x12)\n2. Tricep Dips (3x12)\n3. Hammer Curls (3x12)\n4. Skullcrushers (3x12)"
    };

    // Show Loading
    res.innerHTML = "جارِ تحضير الجدول...";
    res.classList.remove('hidden');

    setTimeout(() => {
        res.innerHTML = `<h4>💪 تمارين ${muscle.toUpperCase()}</h4><div style="text-align:left; direction:ltr; margin-top:10px; font-weight:bold; line-height:1.6;">${workouts[muscle] || "No Data"}</div>`;
    }, 500);
};

window.calcTDEE = function () {
    const w = parseFloat(getVal('tdee-weight'));
    const h = parseFloat(getVal('tdee-height'));
    const age = parseFloat(getVal('tdee-age'));
    const gender = getVal('tdee-gender');
    const act = parseFloat(getVal('tdee-activity'));

    if (!w || !h || !age) return;

    // Mifflin-St Jeor
    let bmr = (10 * w) + (6.25 * h) - (5 * age);
    bmr += (gender === 'male' ? 5 : -161);

    const tdee = Math.round(bmr * act);

    setModalHtml('tdee-result', `
        <div style="text-align:center">
            <h3>سعرات المحافظة: <span style="color:var(--primary)">${tdee}</span></h3>
            <hr style="border-color:var(--border); margin:10px 0">
            <p>📉 للتنشف: <b style="color:#e74c3c">${tdee - 500}</b></p>
            <p>📈 للتضخيم: <b style="color:#2ecc71">${tdee + 500}</b></p>
        </div>
    `);
};

window.calcOneRepMax = function () {
    const w = parseFloat(getVal('rm-weight'));
    const r = parseFloat(getVal('rm-reps'));
    if (!w || !r) return;

    // Epley Formula
    const max = Math.round(w * (1 + r / 30));
    setModalHtml('rm-result', `<h2 style="color:var(--accent)">${max} kg</h2><p>قوتك القصوى التقديرية</p>`);
};


// --- DASHBOARD (Water/Habits) ---
function startNewDayLogic() {
    const today = new Date().toDateString();
    const lastVisit = localStorage.getItem('mind_last_visit');
    if (lastVisit !== today) {
        localStorage.setItem('mind_water', 0);
        let habits = JSON.parse(localStorage.getItem('mind_habits')) || defaultHabits();
        habits.forEach(h => h.done = false);
        localStorage.setItem('mind_habits', JSON.stringify(habits));
        localStorage.setItem('mind_last_visit', today);
        localStorage.setItem('mind_streak_today', 'false');
    }
}
function defaultHabits() { return [{ text: "🕋 الصلاة في وقتها", done: false }, { text: "📖 قراءة صفحة قرآن", done: false }, { text: "🏃‍♂️ مشي / رياضة", done: false }, { text: "🤐 الصيام عن الكلام السلبي", done: false }]; }
function renderHabits() {
    const list = document.getElementById('habits-list'); if (!list) return;
    const habits = JSON.parse(localStorage.getItem('mind_habits')) || defaultHabits();
    if (!localStorage.getItem('mind_habits')) localStorage.setItem('mind_habits', JSON.stringify(habits));
    list.innerHTML = '';
    habits.forEach((h, i) => {
        const li = document.createElement('li');
        li.className = `habit-item ${h.done ? 'done' : ''}`;
        li.innerHTML = `<i class="fa-regular ${h.done ? 'fa-square-check' : 'fa-square'}"></i><span>${h.text}</span>`;
        li.onclick = () => toggleHabit(i);
        list.appendChild(li);
    });
}
window.toggleHabit = function (i) {
    const habits = JSON.parse(localStorage.getItem('mind_habits'));
    habits[i].done = !habits[i].done;
    localStorage.setItem('mind_habits', JSON.stringify(habits));
    renderHabits(); checkStreak();
};
function renderWater() {
    const grid = document.getElementById('water-grid');
    const disp = document.getElementById('water-count');
    if (!grid) return;
    const count = parseInt(localStorage.getItem('mind_water') || 0);
    if (disp) disp.innerText = count;
    grid.innerHTML = '';
    for (let i = 0; i < 8; i++) {
        const cup = document.createElement('i');
        cup.className = `fa-solid fa-glass-water water-cup ${i < count ? 'filled' : ''}`;
        cup.onclick = () => toggleWater(i);
        grid.appendChild(cup);
    }
}
window.toggleWater = function (i) {
    let count = parseInt(localStorage.getItem('mind_water') || 0);
    if (i < count) count = i; else count = i + 1;
    localStorage.setItem('mind_water', count);
    renderWater(); checkStreak();
};
function checkStreak() {
    if (localStorage.getItem('mind_streak_today') === 'true') return;
    const habits = JSON.parse(localStorage.getItem('mind_habits')) || [];
    const water = parseInt(localStorage.getItem('mind_water') || 0);
    if (habits.every(h => h.done) || water >= 8) {
        let s = parseInt(localStorage.getItem('mind_streak') || 0);
        localStorage.setItem('mind_streak', ++s);
        localStorage.setItem('mind_streak_today', 'true');
        document.getElementById('streak-count').innerText = s;
        alert("🔥 مذهل! زاد الستريك اليومي!");
    }
}

// --- TOOLS & UTILS ---
window.openTool = function (name) {
    const modal = document.getElementById('tool-modal');
    const body = document.getElementById('modal-body');
    const tpl = document.getElementById('tpl-' + name);
    if (!modal || !body || !tpl) { console.error('Tool not found:', name); return; }
    body.innerHTML = tpl.innerHTML;
    modal.classList.remove('hidden');
    if (name === 'calculator') clearCalc();
    if (name === 'gratitude') renderGratitudeHistory();
};
window.closeTool = function () {
    const m = document.getElementById('tool-modal');
    if (m) m.classList.add('hidden');
    stopFocus(); stopTimer(); stopAllNoise();
};
window.toggleTheme = function () {
    document.body.classList.toggle('light-mode');
    localStorage.setItem('mind_theme', document.body.classList.contains('light-mode') ? 'light' : 'dark');
};

// --- GRATITUDE ---
window.saveGratitude = function () {
    const i1 = getVal('grat-1'), i2 = getVal('grat-2'), i3 = getVal('grat-3');
    if (!i1 && !i2 && !i3) return;
    const h = JSON.parse(localStorage.getItem('mind_gratitude') || '[]');
    h.unshift({ date: new Date().toLocaleDateString('ar-EG'), items: [i1, i2, i3].filter(x => x) });
    localStorage.setItem('mind_gratitude', JSON.stringify(h));
    renderGratitudeHistory();
};
function renderGratitudeHistory() {
    const c = document.getElementById('gratitude-history'); if (!c) return;
    const h = JSON.parse(localStorage.getItem('mind_gratitude') || '[]');
    c.innerHTML = h.map(e => `<div class="journal-entry"><span class="date">${e.date}</span><ul>${e.items.map(i => `<li>${i}</li>`).join('')}</ul></div>`).join('');
}

// --- CALCULATOR / TIMER / NOISE (Minified) ---
let fInt = null, fS = 0, tInt = null, tS = 0, cStr = "0";
window.setFocusTime = (m) => { stopFocus(); const i = getModalElement('#focus-input'); if (i) i.value = m; fS = m * 60; udF(); };
window.startFocus = () => { if (fInt) return; udF(); fInt = setInterval(() => { fS--; if (fS <= 0) { stopFocus(); alert("⏰"); } udF(); }, 1000); };
window.stopFocus = () => { if (fInt) clearInterval(fInt); fInt = null; };
function udF() { const e = getModalElement('#focus-display'); if (e) { let m = Math.floor(fS / 60), s = fS % 60; e.innerText = (m < 10 ? '0' + m : m) + ':' + (s < 10 ? '0' + s : s); } }
window.activeOscillators = {};
window.toggleNoise = (t) => { if (!window.aCtx) { window.aCtx = new (window.AudioContext || window.webkitAudioContext)(); } if (window.aCtx.state === 'suspended') window.aCtx.resume(); const b = document.getElementById('modal-body').querySelector('#btn-' + t); if (window.activeOscillators[t]) { window.activeOscillators[t].stop(); window.activeOscillators[t] = null; if (b) b.classList.remove('playing'); return; } stopAllNoise(); const src = window.aCtx.createBufferSource(), buf = window.aCtx.createBuffer(1, window.aCtx.sampleRate * 2, window.aCtx.sampleRate), d = buf.getChannelData(0); for (let i = 0; i < d.length; i++)d[i] = Math.random() * 2 - 1; src.buffer = buf; src.loop = true; const f = window.aCtx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = t === 'rain' ? 400 : 800; const g = window.aCtx.createGain(); g.gain.value = 0.5; src.connect(f); f.connect(g); g.connect(window.aCtx.destination); src.start(); window.activeOscillators[t] = src; if (b) b.classList.add('playing'); };
window.stopAllNoise = () => { Object.keys(window.activeOscillators).forEach(k => { if (window.activeOscillators[k]) { try { window.activeOscillators[k].stop(); } catch (e) { } window.activeOscillators[k] = null; } }); const bs = document.querySelectorAll('.noise-btn'); bs.forEach(b => b.classList.remove('playing')); };
window.startTimer = () => { if (tInt) return; tInt = setInterval(() => { tS++; const e = getModalElement('#timer-display'); if (e) e.innerText = new Date(tS * 1000).toISOString().substr(11, 8); }, 1000); };
window.stopTimer = () => { clearInterval(tInt); tInt = null; };
window.resetTimer = () => { stopTimer(); tS = 0; const e = getModalElement('#timer-display'); if (e) e.innerText = "00:00:00"; };
window.appendCalc = (v) => { if (cStr === "0" || cStr === "Error") cStr = v; else cStr += v; udC(); };
window.chooseOp = (o) => { if (cStr.slice(-1).match(/[+\-*/]/)) return; cStr += o; udC(); };
window.clearCalc = () => { cStr = "0"; udC(); };
window.toggleSign = () => { if (!isNaN(parseFloat(cStr))) { cStr = (parseFloat(cStr) * -1).toString(); udC(); } };
window.percent = () => { if (!isNaN(parseFloat(cStr))) { cStr = (parseFloat(cStr) / 100).toString(); udC(); } };
window.calculate = () => { try { cStr = eval(cStr.replace('×', '*').replace('÷', '/')).toString(); if (cStr.includes('.')) { const a = cStr.split('.'); if (a[1].length > 5) cStr = parseFloat(cStr).toFixed(5); } } catch { cStr = "Error"; } udC(); };
function udC() { const e = getModalElement('#calc-display'); if (e) e.value = cStr; }

// Quote
const quotes = ["لا تتوقف.", "اصنع مستقبلك.", "ثق بالله ثم بنفسك.", "الالتزام سر النجاح."];
function loadDailyQuote() { const b = document.getElementById('daily-quote-text'); if (!b) return; if (localStorage.getItem('mind_quote_date') !== new Date().toDateString()) { localStorage.setItem('mind_quote_date', new Date().toDateString()); localStorage.setItem('mind_quote_text', quotes[Math.floor(Math.random() * quotes.length)]); } b.innerText = localStorage.getItem('mind_quote_text'); }
window.interpretDream = () => { if (!getVal('dreamInput')) return; showLoading(() => { setModalHtml('dream-result', 'خير ورزق إن شاء الله.'); }); };
window.analyzePersonality = () => { if (!getVal('p-name')) return; showLoading(() => { setModalHtml('personality-result', 'شخصية قيادية وقوية.'); }); };
window.makeDecision = () => { if (!getVal('decision-input')) return; showLoading(() => { setModalHtml('decision-result', 'توكل على الله وافعلها.'); }); };
window.addGoal = () => { const i = document.getElementById('new-goal-text'); if (!i.value) return; const g = JSON.parse(localStorage.getItem('mind_goals_v1') || '[]'); g.push({ text: i.value, done: false }); localStorage.setItem('mind_goals_v1', JSON.stringify(g)); renderGoals(); i.value = ''; };
window.toggleGoal = (i) => { const g = JSON.parse(localStorage.getItem('mind_goals_v1')); g[i].done = !g[i].done; localStorage.setItem('mind_goals_v1', JSON.stringify(g)); renderGoals(); };
window.deleteGoal = (i) => { const g = JSON.parse(localStorage.getItem('mind_goals_v1')); g.splice(i, 1); localStorage.setItem('mind_goals_v1', JSON.stringify(g)); renderGoals(); };
function renderGoals() { const l = document.getElementById('goals-list'); if (!l) return; const g = JSON.parse(localStorage.getItem('mind_goals_v1') || '[]'); l.innerHTML = g.map((x, i) => `<li class="goal-item ${x.done ? 'done' : ''}" onclick="toggleGoal(${i})"><i class="fa-regular ${x.done ? 'fa-square-check' : 'fa-square'}"></i><span style="flex:1;margin-right:10px">${x.text}</span><i class="fa-solid fa-trash" onclick="deleteGoal(${i});event.stopPropagation()"></i></li>`).join(''); document.getElementById('empty-state').style.display = g.length ? 'none' : 'block'; }
function getVal(id) { const e = getModalElement('#' + id); return e ? e.value : ''; }
function getModalElement(s) { const m = document.getElementById('modal-body'); return m ? m.querySelector(s) : document.querySelector(s); }
function setModalHtml(id, h) { const e = getModalElement('#' + id); if (e) { e.innerHTML = h; e.classList.remove('hidden'); } }
function showLoading(c) { const l = document.getElementById('global-loading'); if (l) l.classList.remove('hidden'); setTimeout(() => { if (l) l.classList.add('hidden'); c(); }, 600); }
