
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

// --- CORE APP LOGIC ---
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

// Navigation
window.switchPage = function (pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active-page'));
    const target = document.getElementById('page-' + pageId);
    if (target) target.classList.add('active-page');

    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    // Map: Dashboard=0, Gym=1, Tools=2
    const map = { 'dashboard': 0, 'gym': 1, 'tools': 2 };
    const navs = document.querySelectorAll('.nav-item');
    if (navs[map[pageId]]) navs[map[pageId]].classList.add('active');
};

// --- GYM SECTION ---
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
    let bmr = (10 * w) + (6.25 * h) - (5 * age) + (gender === 'male' ? 5 : -161);
    const tdee = Math.round(bmr * act);
    setModalHtml('tdee-result', `<div style="text-align:center"><h3>سعرات المحافظة: <span style="color:var(--primary)">${tdee}</span></h3><hr style="border-color:var(--border); margin:10px 0"><p>📉 للتنشف: <b style="color:#e74c3c">${tdee - 500}</b></p><p>📈 للتضخيم: <b style="color:#2ecc71">${tdee + 500}</b></p></div>`);
};

window.calcOneRepMax = function () {
    const w = parseFloat(getVal('rm-weight')), r = parseFloat(getVal('rm-reps'));
    if (!w || !r) return;
    const max = Math.round(w * (1 + r / 30));
    setModalHtml('rm-result', `<h2 style="color:var(--accent)">${max} kg</h2><p>قوتك القصوى التقديرية</p>`);
};

// --- DASHBOARD LOGIC ---
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
    localStorage.setItem('mind_habits', JSON.stringify(habits)); renderHabits(); checkStreak();
};

function renderWater() {
    const grid = document.getElementById('water-grid'), disp = document.getElementById('water-count');
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
    localStorage.setItem('mind_water', count); renderWater(); checkStreak();
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

// --- TOOLS SYSTEM ---
window.openTool = function (name) {
    const modal = document.getElementById('tool-modal');
    const body = document.getElementById('modal-body');
    const tpl = document.getElementById('tpl-' + name);

    if (!modal || !body || !tpl) { console.error('Tool not found:', name); return; }

    body.innerHTML = tpl.innerHTML;
    modal.classList.remove('hidden');

    // Initializations per tool
    if (name === 'calculator') clearCalc();
    // Chat logic ensures state is preserved if needed, or resets?
    // For now simple reopen is fine.
};

window.closeTool = function () {
    const m = document.getElementById('tool-modal');
    if (m) m.classList.add('hidden');

    // Stop all background activities
    stopFocus();
    stopTimer();
    stopAllNoise();
    stopBreathing(); // IMPORTANT: Stop breathing on close
};

window.toggleTheme = function () {
    document.body.classList.toggle('light-mode');
    localStorage.setItem('mind_theme', document.body.classList.contains('light-mode') ? 'light' : 'dark');
};

// --- UTILITIES (Timer, Focus, Calc) ---
let fInt = null, fS = 0, tInt = null, tS = 0, cStr = "0";
window.setFocusTime = (m) => { stopFocus(); const i = getModalElement('#focus-input'); if (i) i.value = m; fS = m * 60; udF(); };
window.startFocus = () => { if (fInt) return; udF(); fInt = setInterval(() => { fS--; if (fS <= 0) { stopFocus(); alert("⏰"); } udF(); }, 1000); };
window.stopFocus = () => { if (fInt) clearInterval(fInt); fInt = null; };
function udF() { const e = getModalElement('#focus-display'); if (e) { let m = Math.floor(fS / 60), s = fS % 60; e.innerText = (m < 10 ? '0' + m : m) + ':' + (s < 10 ? '0' + s : s); } }

window.activeOscillators = {};
window.AudioContext = window.AudioContext || window.webkitAudioContext;
window.toggleNoise = (t) => {
    if (!window.AudioContext) return;
    if (!window.aCtx) window.aCtx = new window.AudioContext();
    if (window.aCtx.state === 'suspended') window.aCtx.resume();
    const b = document.getElementById('modal-body').querySelector('#btn-' + t);

    if (window.activeOscillators[t]) {
        window.activeOscillators[t].stop();
        window.activeOscillators[t] = null;
        if (b) b.classList.remove('playing');
        return;
    }
    stopAllNoise();

    const src = window.aCtx.createBufferSource();
    const buf = window.aCtx.createBuffer(1, window.aCtx.sampleRate * 2, window.aCtx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    src.buffer = buf;
    src.loop = true;

    const f = window.aCtx.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.value = t === 'rain' ? 400 : 800;

    const g = window.aCtx.createGain();
    g.gain.value = 0.5;

    src.connect(f); f.connect(g); g.connect(window.aCtx.destination);
    src.start();
    window.activeOscillators[t] = src;
    if (b) b.classList.add('playing');
};
window.stopAllNoise = () => {
    Object.keys(window.activeOscillators).forEach(k => {
        if (window.activeOscillators[k]) {
            try { window.activeOscillators[k].stop(); } catch (e) { }
            window.activeOscillators[k] = null;
        }
    });
    const bs = document.querySelectorAll('.noise-btn');
    bs.forEach(b => b.classList.remove('playing'));
};

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

// Quote & Helpers
const quotes = ["لا تتوقف.", "اصنع مستقبلك.", "ثق بالله ثم بنفسك.", "الالتزام سر النجاح."];
function loadDailyQuote() {
    const b = document.getElementById('daily-quote-text');
    if (!b) return;
    if (localStorage.getItem('mind_quote_date') !== new Date().toDateString()) {
        localStorage.setItem('mind_quote_date', new Date().toDateString());
        localStorage.setItem('mind_quote_text', quotes[Math.floor(Math.random() * quotes.length)]);
    }
    b.innerText = localStorage.getItem('mind_quote_text');
}
window.addGoal = () => { const i = document.getElementById('new-goal-text'); if (!i.value) return; const g = JSON.parse(localStorage.getItem('mind_goals_v1') || '[]'); g.push({ text: i.value, done: false }); localStorage.setItem('mind_goals_v1', JSON.stringify(g)); renderGoals(); i.value = ''; };
window.toggleGoal = (i) => { const g = JSON.parse(localStorage.getItem('mind_goals_v1')); g[i].done = !g[i].done; localStorage.setItem('mind_goals_v1', JSON.stringify(g)); renderGoals(); };
window.deleteGoal = (i) => { const g = JSON.parse(localStorage.getItem('mind_goals_v1')); g.splice(i, 1); localStorage.setItem('mind_goals_v1', JSON.stringify(g)); renderGoals(); };
function renderGoals() { const l = document.getElementById('goals-list'); if (!l) return; const g = JSON.parse(localStorage.getItem('mind_goals_v1') || '[]'); l.innerHTML = g.map((x, i) => `<li class="goal-item ${x.done ? 'done' : ''}" onclick="toggleGoal(${i})"><i class="fa-regular ${x.done ? 'fa-square-check' : 'fa-square'}"></i><span style="flex:1;margin-right:10px">${x.text}</span><i class="fa-solid fa-trash" onclick="deleteGoal(${i});event.stopPropagation()"></i></li>`).join(''); document.getElementById('empty-state').style.display = g.length ? 'none' : 'block'; }
function getVal(id) { const e = getModalElement('#' + id); return e ? e.value : ''; }
function getModalElement(s) { const m = document.getElementById('modal-body'); return m ? m.querySelector(s) : document.querySelector(s); }
function setModalHtml(id, h) { const e = getModalElement('#' + id); if (e) { e.innerHTML = h; e.classList.remove('hidden'); } }

// --- BREATHING EXERCISE ---
let breathInterval;
let isBreathing = false;

window.toggleBreathing = function () {
    const btn = document.getElementById('breath-btn');
    if (isBreathing) {
        stopBreathing();
        if (btn) { btn.innerText = "ابدأ التمرين"; btn.style.background = "var(--primary)"; }
    } else {
        startBreathing();
        if (btn) { btn.innerText = "إيقاف"; btn.style.background = "#e74c3c"; }
    }
};

function startBreathing() {
    isBreathing = true;
    const container = document.querySelector('.circle-container');
    const text = document.getElementById('breath-text');
    const instruction = document.getElementById('breath-instruction');
    if (!container || !text) return;

    text.innerText = "شهيق";
    instruction.innerText = "تنفس ببطء وعمق...";
    container.className = 'circle-container grow';

    breathAnimation();
    breathInterval = setInterval(breathAnimation, 12000);
}

function breathAnimation() {
    if (!isBreathing) return;
    const container = document.querySelector('.circle-container');
    const text = document.getElementById('breath-text');
    const instruction = document.getElementById('breath-instruction');

    // Inhale
    text.innerText = "شهيق";
    instruction.innerText = "استنشق الهواء عبر أنفك...";
    container.className = 'circle-container grow';

    setTimeout(() => {
        if (!isBreathing) return;
        // Hold
        text.innerText = "احبس";
        instruction.innerText = "احتفظ بالهواء في صدرك...";

        setTimeout(() => {
            if (!isBreathing) return;
            // Exhale
            text.innerText = "زفير";
            instruction.innerText = "أخرج الهواء ببطء من فمك...";
            container.className = 'circle-container shrink';
        }, 4000);
    }, 4000);
}

function stopBreathing() {
    isBreathing = false;
    clearInterval(breathInterval);
    breathInterval = null;
    const container = document.querySelector('.circle-container');
    const text = document.getElementById('breath-text');
    if (container) container.className = 'circle-container';
    if (text) text.innerText = "جاهز؟";
}

// --- GRATITUDE JOURNAL ---
window.saveGratitude = function () {
    const input = document.getElementById('gratitude-input');
    const text = input.value.trim();
    if (!text) return alert("اكتب شيئاً أولاً! 😊");

    const entries = JSON.parse(localStorage.getItem('mind_gratitude')) || [];
    entries.unshift({ date: new Date().toLocaleDateString('ar-EG'), text: text });
    localStorage.setItem('mind_gratitude', JSON.stringify(entries));

    input.value = "";
    alert("تم الحفظ! شعور رائع! 💖");
    viewGratitudeHistory();
};

window.viewGratitudeHistory = function () {
    const container = document.getElementById('gratitude-history');
    if (!container) return;

    const entries = JSON.parse(localStorage.getItem('mind_gratitude')) || [];
    if (entries.length === 0) {
        container.innerHTML = "<p style='text-align:center;'>لا يوجد مدخلات سابقة.</p>";
    } else {
        container.innerHTML = entries.map(e => `
            <div style="background:#222; padding:10px; margin-bottom:10px; border-radius:8px; border:1px solid #444;">
                <div style="color:#888; font-size:0.8rem; margin-bottom:5px;">${e.date}</div>
                <div style="color:white;">${e.text}</div>
            </div>
        `).join('');
    }
    container.classList.remove('hidden');
};

// --- AI CHAT LOGIC (Multi-Provider with File Support) ---
const GROQ_API_KEY = "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";
const GEMINI_API_KEY = "AIzaSyDjZZAhl0kh87BQGGxHB2rgwS1NCs16A9c";

let currentFile = null; // {type: 'image'|'pdf'|'doc'|'txt', data: string, name: string}
let chatHistory = [];

// Initialize PDF.js
if (typeof pdfjsLib !== 'undefined') {
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
}

// Helper to get elements from modal
function getChatElement(selector) {
    const modal = document.getElementById('modal-body');
    return modal ? modal.querySelector(selector) : null;
}

// Handle all file types
window.handleFileUpload = async function (input) {
    const file = input.files[0];
    if (!file) return;

    const fileName = file.name;
    const fileType = file.type;
    const extension = fileName.split('.').pop().toLowerCase();

    // Show loading
    showFilePreview(fileName, 'جارِ القراءة...');

    try {
        if (fileType.startsWith('image/')) {
            // Image file
            const reader = new FileReader();
            reader.onload = (e) => {
                currentFile = {
                    type: 'image',
                    data: e.target.result.split(',')[1],
                    dataUrl: e.target.result,
                    name: fileName
                };
                showImagePreview(e.target.result, fileName);
            };
            reader.readAsDataURL(file);

        } else if (extension === 'pdf') {
            // PDF file
            const text = await extractPDFText(file);
            currentFile = { type: 'pdf', data: text, name: fileName };
            showFilePreview(fileName, `📄 ${text.length} حرف`, 'fa-file-pdf', '#e74c3c');

        } else if (extension === 'docx' || extension === 'doc') {
            // Word file
            const text = await extractWordText(file);
            currentFile = { type: 'doc', data: text, name: fileName };
            showFilePreview(fileName, `📝 ${text.length} حرف`, 'fa-file-word', '#2980b9');

        } else if (extension === 'txt') {
            // Text file
            const text = await file.text();
            currentFile = { type: 'txt', data: text, name: fileName };
            showFilePreview(fileName, `📃 ${text.length} حرف`, 'fa-file-lines', '#27ae60');

        } else {
            throw new Error('نوع الملف غير مدعوم');
        }
    } catch (e) {
        clearFile();
        alert('خطأ في قراءة الملف: ' + e.message);
    }
};

// Extract text from PDF
async function extractPDFText(file) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let text = '';

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map(item => item.str).join(' ') + '\n';
    }
    return text.trim();
}

// Extract text from Word
async function extractWordText(file) {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
}

// Show file preview
function showFilePreview(name, info, iconClass = 'fa-file', iconColor = '#fff') {
    const preview = getChatElement('#file-preview');
    const fileIcon = getChatElement('#file-icon');
    const fileName = getChatElement('#file-name');
    const imagePreview = getChatElement('#image-preview');

    if (imagePreview) imagePreview.classList.add('hidden');
    if (preview) {
        preview.classList.remove('hidden');
        preview.style.display = 'flex';
    }
    if (fileIcon) {
        fileIcon.className = `fa-solid ${iconClass}`;
        fileIcon.style.color = iconColor;
    }
    if (fileName) fileName.innerHTML = `<strong>${name}</strong><br><small style="color:#888">${info}</small>`;
}

// Show image preview
function showImagePreview(dataUrl, name) {
    const imgPreview = getChatElement('#image-preview');
    const previewImg = getChatElement('#preview-img');
    const filePreview = getChatElement('#file-preview');

    if (filePreview) filePreview.classList.add('hidden');
    if (previewImg) previewImg.src = dataUrl;
    if (imgPreview) imgPreview.classList.remove('hidden');
}

// Clear file
window.clearFile = function () {
    currentFile = null;
    const fileUpload = getChatElement('#file-upload');
    const filePreview = getChatElement('#file-preview');
    const imagePreview = getChatElement('#image-preview');

    if (fileUpload) fileUpload.value = '';
    if (filePreview) { filePreview.classList.add('hidden'); filePreview.style.display = 'none'; }
    if (imagePreview) imagePreview.classList.add('hidden');
};

window.handleEnter = function (e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendChatMessage();
    }
};

window.sendChatMessage = async function () {
    const input = getChatElement('#chat-input');
    if (!input) return;

    const text = input.value.trim();
    if (!text && !currentFile) return;

    // Build message text
    let userMessage = text;
    let displayMessage = text;

    if (currentFile) {
        if (currentFile.type === 'image') {
            displayMessage = text || '📷 تحليل صورة';
            appendMessage({ role: 'user', text: displayMessage, image: currentFile.dataUrl });
        } else {
            displayMessage = text ? `${text}\n\n📎 ${currentFile.name}` : `📎 ${currentFile.name}`;
            appendMessage({ role: 'user', text: displayMessage });
            userMessage = `${text}\n\n--- محتوى الملف (${currentFile.name}) ---\n${currentFile.data.substring(0, 15000)}`;
        }
    } else {
        appendMessage({ role: 'user', text: displayMessage });
    }

    input.value = '';
    const loadingId = appendLoading();

    try {
        let aiText;

        if (currentFile && currentFile.type === 'image') {
            // Use Gemini for images
            aiText = await sendToGemini(text || 'حلل هذه الصورة وصفها بالتفصيل', currentFile.data);
        } else {
            // Use Groq for text
            chatHistory.push({ role: "user", content: userMessage });
            aiText = await sendToGroq();
            chatHistory.push({ role: "assistant", content: aiText });
        }

        removeLoading(loadingId);
        appendMessage({ role: 'model', text: aiText });

        // Check if AI provided code/text that can be downloaded
        if (currentFile && (currentFile.type === 'txt' || currentFile.type === 'doc')) {
            addDownloadOption(aiText, currentFile.name);
        }

    } catch (e) {
        removeLoading(loadingId);
        appendMessage({ role: 'model', text: '🚫 خطأ: ' + e.message });
    }

    clearFile();
};

// Send to Groq (text)
async function sendToGroq() {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${GROQ_API_KEY}`
        },
        body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: [
                { role: "system", content: "أنت مساعد ذكي اسمك Mind AI. أجب بالعربية. إذا طُلب منك تصحيح ملف، قدم النسخة المصححة كاملة." },
                ...chatHistory
            ],
            max_tokens: 4096,
            temperature: 0.7
        })
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    return data.choices[0].message.content;
}

// Send to Gemini (images)
async function sendToGemini(text, imageBase64) {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{
                parts: [
                    { text: text },
                    { inline_data: { mime_type: "image/jpeg", data: imageBase64 } }
                ]
            }]
        })
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    if (!data.candidates?.[0]?.content) throw new Error('لا يوجد رد');
    return data.candidates[0].content.parts[0].text;
}

// Add download button for corrected content
function addDownloadOption(aiText, originalName) {
    // Check if response contains a code block
    const codeMatch = aiText.match(/```[\s\S]*?```/);
    if (codeMatch) {
        const chat = getChatElement('#chat-messages');
        const btn = document.createElement('button');
        btn.className = 'action-btn';
        btn.style.cssText = 'margin:10px 0; background:#27ae60; max-width:300px;';
        btn.innerHTML = '<i class="fa-solid fa-download"></i> تحميل النسخة المصححة';
        btn.onclick = () => {
            const content = codeMatch[0].replace(/```\w*\n?/g, '').replace(/```$/g, '');
            downloadFile(content, 'corrected_' + originalName);
        };
        chat.appendChild(btn);
        chat.scrollTop = chat.scrollHeight;
    }
}

// Download file
function downloadFile(content, filename) {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

function removeLoading(id) {
    const loadDiv = document.getElementById(id);
    if (loadDiv) loadDiv.remove();
}

function appendMessage(msg) {
    const chat = getChatElement('#chat-messages');
    if (!chat) return;

    const div = document.createElement('div');
    div.className = `message ${msg.role === 'user' ? 'user-message' : 'ai-message'}`;

    let avatarInfo = msg.role === 'user' ? '<div class="msg-avatar">👤</div>' : '<div class="msg-avatar">🤖</div>';
    let contentHtml = "";
    if (msg.image) contentHtml += `<img src="${msg.image}" style="max-width:200px; display:block; margin-bottom:10px; border-radius:8px;">`;

    if (msg.role === 'model') {
        if (typeof marked !== 'undefined') {
            try { contentHtml += marked.parse(msg.text); } catch (err) { contentHtml += msg.text; }
        } else {
            contentHtml += msg.text.replace(/\n/g, '<br>');
        }
    } else {
        contentHtml += msg.text.replace(/\n/g, '<br>');
    }

    div.innerHTML = `${avatarInfo}<div class="msg-content">${contentHtml}</div>`;
    chat.appendChild(div);
    chat.scrollTop = chat.scrollHeight;
}

function appendLoading() {
    const chat = getChatElement('#chat-messages');
    if (!chat) return null;

    const id = 'loading-' + Date.now();
    const div = document.createElement('div');
    div.id = id;
    div.className = 'message ai-message';
    div.innerHTML = `<div class="msg-avatar">🤖</div><div class="msg-content"><i class="fa-solid fa-circle-notch fa-spin"></i> جارِ المعالجة...</div>`;
    chat.appendChild(div);
    chat.scrollTop = chat.scrollHeight;
    return id;
}
