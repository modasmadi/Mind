// --- Global State ---
let streak = localStorage.getItem('mind_streak') || 0;
document.getElementById('streak-count').innerText = streak;

// --- Navigation ---
function switchPage(pageId) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active-page'));
    // Show selected
    document.getElementById('page-' + pageId).classList.add('active-page');

    // Update Bottom Nav
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    // Simple logic to find active nav based on onclick - simpler: pass element or hardcode
    // Let's re-select based on pageId mapping
    const map = { 'home': 0, 'mind': 1, 'goals': 2, 'gym': 3, 'tools': 4 };
    document.querySelectorAll('.nav-item')[map[pageId]].classList.add('active');
}

// --- Tool Modal System ---
function openTool(toolName) {
    const modal = document.getElementById('tool-modal');
    const body = document.getElementById('modal-body');
    const tpl = document.getElementById('tpl-' + toolName);

    if (!tpl) return;

    // Clone template content
    body.innerHTML = tpl.innerHTML;
    // Re-bind events if necessary (inline onClicks work fine)

    modal.classList.remove('hidden');
}

function closeTool() {
    document.getElementById('tool-modal').classList.add('hidden');
}

// --- Goals System (To-Do) ---
const goalsKey = 'mind_goals_v1';
let goals = JSON.parse(localStorage.getItem(goalsKey)) || [];

// Render on load
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

    // Streak Logic: If all done? (Simplified: Just increment streak on first visit/action)
    updateStreak();
}

function deleteGoal(index) {
    goals.splice(index, 1);
    saveGoals();
    renderGoals();
}

function saveGoals() {
    localStorage.setItem(goalsKey, JSON.stringify(goals));
}

function renderGoals() {
    const list = document.getElementById('goals-list');
    const empty = document.getElementById('empty-state');
    list.innerHTML = '';

    if (goals.length === 0) {
        empty.style.display = 'block';
    } else {
        empty.style.display = 'none';
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

function updateStreak() {
    // Just a placeholder hook for now
    // In real app, check dates.
}


// --- Gym Logic ---
function calcBMI() {
    const w = parseFloat(document.getElementById('weight').value);
    const h = parseFloat(document.getElementById('height').value);

    if (!w || !h) return;

    const bmi = w / ((h / 100) * (h / 100));
    let status = "";
    let color = "";

    if (bmi < 18.5) { status = "نحافة"; color = "#f1c40f"; }
    else if (bmi < 24.9) { status = "وزن مثالي"; color = "#2ecc71"; }
    else if (bmi < 29.9) { status = "وزن زائد"; color = "#e67e22"; }
    else { status = "سمنة"; color = "#e74c3c"; }

    document.getElementById('bmi-result').innerHTML = `
        <h2 style="color:${color}">${bmi.toFixed(1)}</h2>
        <p>التصنيف: ${status}</p>
    `;
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

    document.getElementById('workout-result').innerHTML = `
        <h3 style="color:var(--accent)">🔥 تمارين ${muscle.toUpperCase()}</h3>
        <p style="line-height:2;">${workouts[muscle]}</p>
    `;
    document.getElementById('workout-result').classList.remove('hidden');
}

// --- Re-implementing Original Logic (Condensed) ---
// (We moved the HTML to templates, so functions need to find IDs inside modal-body BUT
// since we clone the HTML into existing DOM, the IDs are valid IF the original templates don't share IDs.
// BUT templates DO share IDs with the main DOM if we are not careful.
// Strategy: I kept IDs unique in templates.
// When openTool clones "tpl-love" into "modal-body", the IDs "name1" etc exist.
// So standard functions will work.)

// Helper
function showLoading(cb) {
    // Only works if loader in main HTML
    document.getElementById('global-loading').classList.remove('hidden');
    setTimeout(() => {
        document.getElementById('global-loading').classList.add('hidden');
        cb();
    }, 1000);
}

// 1. Love
function calculateLove() {
    // Note: When cloned, we need to querySelector inside modal-body to be safe? 
    // No, document.getElementById finds the first match. Templates are hidden "divs" but they are in DOM.
    // IDs must be unique. I used IDs in templates.
    // WARNING: IDs in templates ("tpl-love") are in the DOM tree. If I clone them to ("modal-body") then I have DUPLICATE IDs.
    // This breaks `getElementById`.

    // FIX: The templates in HTML should use CLASSES or we change logic.
    // BETTER FIX: Don't use IDs in templates? Or remove templates from DOM?

    // Let's use a simpler approach for this prototype:
    // When opening tool, we clone. But first, let's fix the duplication issue.
    // Actually, simple JS `getElementById` returns the FIRST element.
    // The "templates" div is hidden.
    // When we copy to "modal-body", we have two `name1`.
    // The one in `modal-body` is likely second in DOM order? No, `templates` is at bottom.
    // So `getElementById` might find the HIDDEN template input, not the visible modal input.
    // THIS IS A BUG RISK.

    // SOLUTION: Use context-aware selection.

    const context = document.getElementById('modal-body');
    const n1 = context.querySelector('#name1').value;
    const n2 = context.querySelector('#name2').value;

    if (!n1 || !n2) return alert("الأسماء؟");

    showLoading(() => {
        const p = Math.floor(Math.random() * 50) + 50; // Cheat: Always > 50% for happiness
        context.querySelector('#love-result').innerHTML = `<h1 style="color:#ff7675">${p}%</h1>`;
        context.querySelector('#love-result').classList.remove('hidden');
    });
}
// Rewriting functions to use `document.getElementById('modal-body').querySelector(...)` is cleaner but tedious.
// ALTERNATIVE: Use the original scripts but ensure we look at the Modal.

// I will override the functions to look inside modal-body.

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

// Love Redux
window.calculateLove = function () {
    const n1 = getVal('name1'); const n2 = getVal('name2');
    if (!n1) return;
    showLoading(() => {
        const hash = (n1.length + n2.length) * 7 % 100;
        setHtml('love-result', `<h1 style="color:#ff7675">${hash}%</h1><p>حب أبدي!</p>`);
    });
}

// Money Redux
window.predictMoney = function () {
    if (!getVal('money-name')) return;
    showLoading(() => {
        const fortunes = ["مليونير قريباً", "دخل مستقر", "ثروة عقارية"];
        const f = fortunes[Math.floor(Math.random() * fortunes.length)];
        setHtml('money-result', `<h3>${f}</h3>`);
    });
}

// Luck
window.getLuck = function () {
    showLoading(() => {
        const msgs = ["يومك سعيد", "خبر سار", "انتبه لصحتك"];
        setHtml('luck-result', `<h3>${msgs[Math.floor(Math.random() * msgs.length)]}</h3>`);
    });
}

// Dream
window.interpretDream = function () {
    const t = getVal('dreamInput');
    if (!t) return;
    showLoading(() => {
        setHtml('dream-result', `<p>هذا الحلم يدل على رغبة مكبوتة في التغيير. (${t.substring(0, 10)}...)</p>`);
    });
}

// Personality
window.analyzePersonality = function () {
    if (!getVal('p-name')) return;
    showLoading(() => {
        setHtml('personality-result', `<h3>شخصية قيادية! 🦁</h3>`);
    });
}

// Decision
window.makeDecision = function () {
    if (!getVal('decision-input')) return;
    showLoading(() => {
        setHtml('decision-result', `<h3>توكل على الله ✅</h3>`);
    });
}

// Baby
window.suggestBabyName = function () {
    const g = getVal('baby-gender'); // Select might differ?
    // It's a select. getVal gets .value, so works.
    showLoading(() => {
        const n = g === 'boy' ? "ريان" : "جوري";
        setHtml('baby-result', `<h1>${n}</h1>`);
    });
}

// Animal
window.findSpiritAnimal = function () {
    if (!getVal('animal-name')) return;
    showLoading(() => {
        setHtml('animal-result', `<h3>🦅 الصقر</h3>`);
    });
}


// --- Utility Tools Redux (Calc/Stopwatch) ---
// Calculator logic needs to bind to buttons inside modal.
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

// Stopwatch Logic
let timerInt = null;
let secs = 0;
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

