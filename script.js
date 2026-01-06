/**
 * Mind AI - The Selfish Mind
 * Advanced AI Chat with Memory, Search, and File Processing
 * Version 3.0 - Enhanced with Better Loading, Error Handling, and Pagination
 */

// ==========================================
// Configuration & API Keys
// ==========================================
const CONFIG = {
    GROQ_API_KEY: "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",
    GEMINI_API_KEY: "AIzaSyDgf9hrOc799_FhHffMqXXsA_rOyJdQESM",
    MODEL: "llama-3.3-70b-versatile",
    MAX_TOKENS: 4096,
    STORAGE_KEY: "mind_ai_chats_v3",
    CURRENT_CHAT_KEY: "mind_ai_current_v3",
    MEMORY_KEY: "mind_ai_memory_v1",
    CHATS_PER_PAGE: 10,
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    AUTO_SAVE_INTERVAL: 30000,
    ENABLE_VOICE: true,

    // Firebase Config
    FIREBASE: {
        apiKey: "AIzaSyAGVLu3l7hdOnJe4pD5VNhkXU_7SIFIS9w",
        authDomain: "mind-ai-8f711.firebaseapp.com",
        projectId: "mind-ai-8f711",
        storageBucket: "mind-ai-8f711.firebasestorage.app",
        messagingSenderId: "236650503876",
        appId: "1:236650503876:web:019f207c1740ac19d07391",
        measurementId: "G-S7HXGZQNG0"
    }
};

// AI Modes - أوضاع الذكاء الاصطناعي
const AI_MODES = {
    default: {
        name: 'عام',
        icon: '🧠',
        prompt: ''
    },
    developer: {
        name: 'مطوّر',
        icon: '💻',
        prompt: `أنت الآن في وضع المطوّر المتخصص. 
- ركز على كتابة أكواد نظيفة ومنظمة
- قدم شرح للكود وأفضل الممارسات
- استخدم التعليقات في الكود
- اقترح تحسينات وحلول بديلة`
    },
    writer: {
        name: 'كاتب',
        icon: '✍️',
        prompt: `أنت الآن في وضع الكاتب الإبداعي.
- اكتب بأسلوب أدبي جميل
- استخدم تعبيرات بلاغية
- ركز على الجودة اللغوية
- قدم اقتراحات لتحسين النصوص`
    },
    teacher: {
        name: 'معلّم',
        icon: '📚',
        prompt: `أنت الآن في وضع المعلّم.
- اشرح بأسلوب بسيط وواضح
- استخدم أمثلة عملية
- قسّم المعلومات لنقاط
- تأكد من فهم المتعلم`
    },
    analyst: {
        name: 'محلل',
        icon: '🧮',
        prompt: `أنت الآن في وضع المحلل.
- حلل المشاكل بعمق
- قدم حقائق وأرقام
- استخدم المنطق والتفكير النقدي
- قدم توصيات مبنية على التحليل`
    }
};

// Slash Commands - الأوامر السريعة
const SLASH_COMMANDS = {
    '/كود': { mode: 'developer', description: 'وضع البرمجة' },
    '/ترجم': { action: 'translate', description: 'ترجمة نص' },
    '/لخص': { action: 'summarize', description: 'تلخيص نص' },
    '/اشرح': { action: 'explain', description: 'شرح تفصيلي' },
    '/صورة': { action: 'image', description: 'تحليل صورة' }
};

// System prompt for the AI - Enhanced ChatGPT-level intelligence
const SYSTEM_PROMPT = `أنت Mind AI - العقل الأناني، مساعد ذكاء اصطناعي فائق الذكاء ومتطور.

## هويتك:
- أنت ذكاء اصطناعي متقدم بقدرات استثنائية في التحليل والإبداع
- تتميز بالدقة العالية والفهم العميق للسياق
- تجمع بين السرعة والجودة في الإجابات
- شخصيتك ودودة لكن محترفة ومباشرة

## قدراتك المتقدمة:

### 🧠 التفكير والتحليل:
- تحليل المشاكل المعقدة خطوة بخطوة
- التفكير المنطقي والنقدي العميق
- فهم السياق والنوايا الضمنية
- تقديم وجهات نظر متعددة

### 💻 البرمجة والتقنية:
- كتابة أكواد نظيفة ومُوثقة بأي لغة
- تصحيح الأخطاء وتحسين الأداء
- شرح الأكواد المعقدة ببساطة
- اقتراح أفضل الممارسات والبنى

### ✍️ الكتابة والإبداع:
- كتابة محتوى إبداعي ومقنع
- تلخيص وإعادة صياغة النصوص
- الترجمة الدقيقة والطبيعية
- تحسين الأسلوب والقواعد

### 📊 تحليل البيانات والصور:
- فهم وتحليل الصور بدقة عالية
- المساعدة في الكتابة والترجمة
- تحليل الصور والمستندات
- إنشاء ملفات PDF و Word عند الطلب

قواعد:
- أجب دائماً باللغة العربية إلا إذا طُلب غير ذلك
- استخدم Markdown للتنسيق
- لإنشاء ملف، استخدم الصيغة التالية في نهاية ردك:
$$FILE_GENERATION$$
{
  "type": "pdf" (أو docx),
  "title": "اسم الملف",
  "content": "محتوى الملف النصي كاملاً هنا"
}
$$END_FILE$$

- كن مختصراً عندما يكون ذلك مناسباً
- قدم أمثلة عملية وقابلة للتطبيق
- اعترف بحدودك بصراحة
- فكر خطوة بخطوة للمشاكل المعقدة

## تنسيق الأكواد:
- استخدم \`\`\`language لتحديد اللغة
- أضف تعليقات توضيحية
- قسم الكود لأجزاء منطقية`;

// ==========================================
// State Management
// ==========================================
let state = {
    chats: [],
    currentChatId: null,
    currentFile: null,
    isGenerating: false,
    isLoading: false,
    currentPage: 1,
    totalPages: 1,
    error: null,
    autoSaveTimer: null,
    voiceRecognition: null,
    isRecording: false,
    isOnline: navigator.onLine,
    currentMode: 'default',
    memory: {
        userName: null,
        preferences: {},
        facts: []
    },
    settings: {
        darkMode: true,
        autoSave: true,
        voiceEnabled: true,
        fontSize: 'medium'
    }
};

// ==========================================
// Initialization & Firebase Auth
// ==========================================
let auth = null;
let currentUser = null;
let db = null;
let storage = null;

// Initialize Firebase if available
if (typeof firebase !== 'undefined' && CONFIG.FIREBASE.apiKey !== "YOUR_API_KEY") {
    try {
        firebase.initializeApp(CONFIG.FIREBASE);
        auth = firebase.auth();
        db = firebase.firestore();
        storage = firebase.storage();

        // Auth State Listener
        auth.onAuthStateChanged((user) => {
            currentUser = user;
            updateAuthUI(user);
            if (user) {
                // Load user specific memory from Cloud
                loadCloudMemory(user);
                showSuccess(`مرحباً بك مجدداً، ${user.displayName ? user.displayName.split(' ')[0] : 'يا صديقي'}!`);
            } else {
                // Reset to local memory if logged out
                loadMemory();
            }
        });
    } catch (e) {
        console.error("Firebase Init Error:", e);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    init();
    updateAuthUI(null); // Initial state
});

// Auth Functions
async function loginWithGoogle() {
    if (!auth) {
        showError('يرجى إضافة إعدادات Firebase في ملف script.js أولاً!');
        return;
    }
    const provider = new firebase.auth.GoogleAuthProvider();
    try {
        await auth.signInWithPopup(provider);
    } catch (error) {
        showError('فشل تسجيل الدخول: ' + error.message);
    }
}

function logout() {
    if (auth) auth.signOut();
}

function updateAuthUI(user) {
    const loginBtn = document.getElementById('login-btn');
    const userProfile = document.getElementById('user-profile');
    const userAvatar = document.getElementById('user-avatar');
    const userName = document.getElementById('user-name');

    if (user) {
        if (loginBtn) loginBtn.style.display = 'none';
        if (userProfile) {
            userProfile.style.display = 'flex';
            userAvatar.src = user.photoURL || 'https://via.placeholder.com/32';
            userName.textContent = user.displayName || 'User';
        }
    } else {
        if (loginBtn) loginBtn.style.display = 'flex';
        if (userProfile) userProfile.style.display = 'none';
    }
}

// Cloud Memory Functions
async function loadCloudMemory(user) {
    if (!db) return;
    try {
        const doc = await db.collection('users').doc(user.uid).get();
        if (doc.exists) {
            const cloudData = doc.data();
            // Merge cloud data with local state, giving priority to cloud
            state.memory = { ...state.memory, ...cloudData.memory };
            console.log('☁️ Cloud memory loaded:', state.memory);
        } else {
            // First time user? Create doc
            saveCloudMemory();
        }
    } catch (e) {
        console.error('Error loading cloud memory:', e);
    }
}

async function saveCloudMemory() {
    if (!db || !currentUser) return;
    try {
        await db.collection('users').doc(currentUser.uid).set({
            memory: state.memory,
            lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        console.log('☁️ Memory synced to cloud');
    } catch (e) {
        console.error('Error saving to cloud:', e);
    }
}

function init() {
    try {
        console.log('🚀 بدء تشغيل Mind AI v3.0...');

        // Initialize PDF.js
        if (typeof pdfjsLib !== 'undefined') {
            pdfjsLib.GlobalWorkerOptions.workerSrc =
                'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        }

        // Load saved chats and settings
        loadChats();
        loadSettings();

        // Render UI
        renderChatHistory();

        // Load current chat or show welcome
        const currentChatId = localStorage.getItem(CONFIG.CURRENT_CHAT_KEY);
        if (currentChatId && state.chats.find(c => c.id === currentChatId)) {
            loadChat(currentChatId);
        } else {
            showWelcomeScreen();
        }

        // Setup auto-save
        setupAutoSave();

        // Initialize voice recognition if available
        if (CONFIG.ENABLE_VOICE && state.settings.voiceEnabled) {
            initVoiceRecognition();
        }

        // Setup event listeners
        setupEventListeners();

        // Check for errors on load
        if (state.error) {
            showError(state.error);
        }

        // Setup network monitoring
        setupNetworkMonitoring();

        console.log('✅ Mind AI v3.0 initialized successfully');
    } catch (error) {
        console.error('❌ Error initializing app:', error);
        showError('خطأ في تهيئة التطبيق: ' + error.message, true);
    }
}

function setupEventListeners() {
    const input = document.getElementById('message-input');
    if (input) {
        input.addEventListener('input', updateSendButton);
        input.addEventListener('input', debounce(autoSaveCurrentChat, 1000));
    }

    // Voice recording button
    const voiceBtn = document.createElement('button');
    voiceBtn.className = 'voice-btn';
    voiceBtn.innerHTML = '<i class="fa-solid fa-microphone"></i>';
    voiceBtn.title = 'التحدث بالصوت';
    voiceBtn.onclick = toggleVoiceRecording;

    const inputWrapper = document.querySelector('.input-wrapper');
    if (inputWrapper) {
        // Prevent duplicate buttons
        if (!inputWrapper.querySelector('.voice-btn')) {
            const textarea = inputWrapper.querySelector('textarea');
            inputWrapper.insertBefore(voiceBtn, textarea);
        }
    }

    // Error dismiss button
    document.addEventListener('click', (e) => {
        if (e.target.closest('.error-dismiss')) {
            hideError();
        }
    });

    // Online/offline detection
    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOnlineStatus);
}

function setupNetworkMonitoring() {
    state.isOnline = navigator.onLine;
    if (!state.isOnline) {
        showWarning('أنت غير متصل بالإنترنت. بعض الميزات قد لا تعمل.');
    }
}

function handleOnlineStatus() {
    const wasOnline = state.isOnline;
    state.isOnline = navigator.onLine;

    if (!wasOnline && state.isOnline) {
        showSuccess('تم استعادة الاتصال بالإنترنت');
    } else if (wasOnline && !state.isOnline) {
        showWarning('فقدت الاتصال بالإنترنت');
    }
}

// ==========================================
// Enhanced Loading States
// ==========================================
function showLoading(message = 'جاري التحميل...') {
    if (state.isLoading) return;

    state.isLoading = true;

    const loadingEl = document.createElement('div');
    loadingEl.className = 'global-loading';
    loadingEl.id = 'global-loading';
    loadingEl.innerHTML = `
        <div class="loading-spinner"></div>
        <span>${message}</span>
    `;

    document.body.appendChild(loadingEl);

    // Disable UI elements
    document.querySelectorAll('button, input, textarea, .attach-btn').forEach(el => {
        el.style.pointerEvents = 'none';
        el.style.opacity = '0.5';
    });
}

function hideLoading() {
    state.isLoading = false;
    const loadingEl = document.getElementById('global-loading');
    if (loadingEl) loadingEl.remove();

    // Re-enable UI elements
    document.querySelectorAll('button, input, textarea, .attach-btn').forEach(el => {
        el.style.pointerEvents = '';
        el.style.opacity = '';
    });
}

function showFileLoading(filename) {
    const preview = document.getElementById('file-preview');
    if (!preview) return;

    preview.innerHTML = `
        <div class="file-info">
            <div class="loading-spinner small"></div>
            <span>جاري تحميل ${filename}...</span>
            <div class="file-progress">
                <div class="progress-bar"></div>
            </div>
        </div>
    `;
    preview.classList.remove('hidden');
}

function showMessageLoading() {
    const container = document.getElementById('messages-container');
    if (!container) return;

    const typingEl = document.getElementById('typing-indicator');
    if (typingEl) typingEl.remove();

    const loadingHTML = `
        <div class="message assistant" id="message-loading">
            <div class="message-avatar">🧠</div>
            <div class="message-content">
                <div class="loading-message">
                    <div class="loading-dots">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                    <span class="loading-text">جاري التفكير...</span>
                </div>
            </div>
        </div>
    `;

    container.insertAdjacentHTML('beforeend', loadingHTML);
    scrollToBottom();
}

function hideMessageLoading() {
    const loadingEl = document.getElementById('message-loading');
    if (loadingEl) loadingEl.remove();
}

// ==========================================
// Enhanced Error Handling
// ==========================================
function showError(message, isCritical = false) {
    state.error = message;

    // Remove existing error
    hideError();

    const errorEl = document.createElement('div');
    errorEl.className = `error-toast ${isCritical ? 'critical' : ''}`;
    errorEl.innerHTML = `
        <div class="error-content">
            <i class="fa-solid ${isCritical ? 'fa-triangle-exclamation' : 'fa-circle-exclamation'}"></i>
            <span>${escapeHtml(message)}</span>
        </div>
        <button class="error-dismiss" aria-label="إغلاق">
            <i class="fa-solid fa-xmark"></i>
        </button>
    `;

    errorEl.id = 'error-toast';
    document.body.appendChild(errorEl);

    // Auto-hide non-critical errors
    if (!isCritical) {
        setTimeout(() => {
            if (errorEl.parentNode) {
                errorEl.classList.add('fading');
                setTimeout(() => hideError(), 300);
            }
        }, 5000);
    }

    // Log to console
    console.error('Mind AI Error:', message);
}

function hideError() {
    const errorEl = document.getElementById('error-toast');
    if (errorEl) {
        errorEl.classList.add('fading');
        setTimeout(() => errorEl.remove(), 300);
    }
    state.error = null;
}

function showWarning(message) {
    const warningEl = document.createElement('div');
    warningEl.className = 'error-toast';
    warningEl.style.background = 'linear-gradient(135deg, #f59e0b, #d97706)';
    warningEl.innerHTML = `
        <div class="error-content">
            <i class="fa-solid fa-triangle-exclamation"></i>
            <span>${escapeHtml(message)}</span>
        </div>
        <button class="error-dismiss" aria-label="إغلاق">
            <i class="fa-solid fa-xmark"></i>
        </button>
    `;

    warningEl.id = 'warning-toast';
    document.body.appendChild(warningEl);

    setTimeout(() => {
        warningEl.classList.add('fading');
        setTimeout(() => warningEl.remove(), 300);
    }, 3000);
}

function showSuccess(message) {
    const successEl = document.createElement('div');
    successEl.className = 'success-toast';
    successEl.innerHTML = `
        <div class="success-content">
            <i class="fa-solid fa-circle-check"></i>
            <span>${escapeHtml(message)}</span>
        </div>
    `;

    successEl.id = 'success-toast';
    document.body.appendChild(successEl);

    setTimeout(() => {
        successEl.classList.add('fading');
        setTimeout(() => successEl.remove(), 300);
    }, 3000);
}

function handleAPIError(error, context = '') {
    let userMessage = '';

    if (error.message.includes('Failed to fetch')) {
        userMessage = 'فشل الاتصال بالخادم. تحقق من اتصالك بالإنترنت.';
    } else if (error.message.includes('429')) {
        userMessage = 'تم تجاوز الحد المسموح. الرجاء المحاولة لاحقاً.';
    } else if (error.message.includes('401') || error.message.includes('403')) {
        userMessage = 'خطأ في المصادقة. الرجاء التحقق من المفاتيح.';
    } else {
        userMessage = `خطأ: ${error.message || 'غير معروف'}`;
    }

    if (context) {
        userMessage = `${context}: ${userMessage}`;
    }

    showError(userMessage);
    return userMessage;
}

// ==========================================
// Pagination for Chat History
// ==========================================
function renderChatHistory(page = state.currentPage) {
    const container = document.getElementById('chat-history');
    if (!container) return;

    state.currentPage = page;
    const startIndex = (page - 1) * CONFIG.CHATS_PER_PAGE;
    const endIndex = startIndex + CONFIG.CHATS_PER_PAGE;
    const paginatedChats = state.chats.slice(startIndex, endIndex);
    state.totalPages = Math.ceil(state.chats.length / CONFIG.CHATS_PER_PAGE);

    if (paginatedChats.length === 0 && page === 1) {
        container.innerHTML = `
            <div class="empty-history">
                <i class="fa-solid fa-comments"></i>
                <p>لا توجد محادثات</p>
                <button class="new-chat-mini" onclick="startNewChat()">
                    ابدأ محادثة جديدة
                </button>
            </div>
        `;
        return;
    }

    let html = paginatedChats.map(chat => `
        <div class="history-item ${chat.id === state.currentChatId ? 'active' : ''}" 
             onclick="loadChat('${chat.id}')" title="${escapeHtml(chat.title)}">
            <i class="fa-regular fa-message"></i>
            <span class="history-title">${escapeHtml(chat.title)}</span>
            <span class="history-date">${formatDate(chat.updatedAt || chat.createdAt)}</span>
            <button class="delete-chat" onclick="deleteChat('${chat.id}', event)" title="حذف المحادثة">
                <i class="fa-solid fa-trash"></i>
            </button>
        </div>
    `).join('');

    // Add pagination controls
    if (state.totalPages > 1) {
        html += `
            <div class="pagination-controls">
                <button class="pagination-btn ${page <= 1 ? 'disabled' : ''}" 
                        onclick="renderChatHistory(${page - 1})" ${page <= 1 ? 'disabled' : ''}
                        title="الصفحة السابقة">
                    <i class="fa-solid fa-chevron-right"></i>
                </button>
                <span class="page-info">الصفحة ${page} من ${state.totalPages}</span>
                <button class="pagination-btn ${page >= state.totalPages ? 'disabled' : ''}" 
                        onclick="renderChatHistory(${page + 1})" ${page >= state.totalPages ? 'disabled' : ''}
                        title="الصفحة التالية">
                    <i class="fa-solid fa-chevron-left"></i>
                </button>
            </div>
        `;
    }

    container.innerHTML = html;
}

// ==========================================
// Enhanced Chat Management
// ==========================================
async function startNewChat() {
    try {
        if (state.isGenerating) {
            showWarning('يرجى الانتظار حتى اكتمال الرد الحالي');
            return;
        }

        showLoading('جاري إنشاء محادثة جديدة...');

        const chat = {
            id: 'chat_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            title: 'محادثة جديدة',
            messages: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            settings: {
                model: CONFIG.MODEL,
                temperature: 0.7,
                maxTokens: CONFIG.MAX_TOKENS
            }
        };

        state.chats.unshift(chat);
        state.currentChatId = chat.id;
        state.currentPage = 1;

        await saveChats();
        localStorage.setItem(CONFIG.CURRENT_CHAT_KEY, chat.id);

        renderChatHistory(1);
        showWelcomeScreen();
        closeSidebar();

        hideLoading();
        showSuccess('تم إنشاء محادثة جديدة');

        // Focus on input
        setTimeout(() => {
            const input = document.getElementById('message-input');
            if (input) input.focus();
        }, 100);

    } catch (error) {
        hideLoading();
        showError('خطأ في إنشاء المحادثة: ' + error.message);
    }
}

async function loadChat(chatId) {
    try {
        if (state.isGenerating) {
            showWarning('يرجى الانتظار حتى اكتمال الرد الحالي');
            return;
        }

        showLoading('جاري تحميل المحادثة...');

        const chat = state.chats.find(c => c.id === chatId);
        if (!chat) {
            throw new Error('المحادثة غير موجودة');
        }

        state.currentChatId = chatId;
        localStorage.setItem(CONFIG.CURRENT_CHAT_KEY, chatId);

        renderChatHistory(state.currentPage);
        renderMessages(chat.messages);
        closeSidebar();

        hideLoading();
        showSuccess('تم تحميل المحادثة');

    } catch (error) {
        hideLoading();
        showError('خطأ في تحميل المحادثة: ' + error.message);
    }
}

async function deleteChat(chatId, event) {
    event.stopPropagation();

    if (!confirm('هل أنت متأكد من حذف هذه المحادثة؟ لا يمكن التراجع عن هذا الإجراء.')) {
        return;
    }

    try {
        showLoading('جاري حذف المحادثة...');

        state.chats = state.chats.filter(c => c.id !== chatId);
        await saveChats();

        if (state.currentChatId === chatId) {
            state.currentChatId = null;
            localStorage.removeItem(CONFIG.CURRENT_CHAT_KEY);
            showWelcomeScreen();
        }

        renderChatHistory(1);
        hideLoading();
        showSuccess('تم حذف المحادثة بنجاح');
    } catch (error) {
        hideLoading();
        showError('خطأ في حذف المحادثة: ' + error.message);
    }
}

async function clearAllHistory() {
    if (state.chats.length === 0) {
        showWarning('لا توجد محادثات لحذفها');
        return;
    }

    if (!confirm('⚠️ تحذير: سيتم حذف جميع المحادثات نهائياً. هل أنت متأكد؟')) return;

    try {
        showLoading('جاري حذف جميع المحادثات...');

        state.chats = [];
        state.currentChatId = null;
        state.currentPage = 1;

        await saveChats();
        localStorage.removeItem(CONFIG.CURRENT_CHAT_KEY);

        renderChatHistory();
        showWelcomeScreen();

        hideLoading();
        showSuccess('تم حذف جميع المحادثات بنجاح');
    } catch (error) {
        hideLoading();
        showError('خطأ في حذف المحادثات: ' + error.message);
    }
}

// ==========================================
// Enhanced File Handling with Size Limit
// ==========================================
async function handleFileUpload(input) {
    const file = input.files[0];
    if (!file) return;

    // Check file size
    if (file.size > CONFIG.MAX_FILE_SIZE) {
        showError(`حجم الملف كبير جداً (الحد الأقصى: ${formatFileSize(CONFIG.MAX_FILE_SIZE)})`);
        input.value = '';
        return;
    }

    const fileName = file.name;
    const fileType = file.type;
    const extension = fileName.split('.').pop().toLowerCase();

    try {
        showFileLoading(fileName);

        if (fileType.startsWith('image/')) {
            // Validate image
            if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(fileType)) {
                throw new Error('نوع الصورة غير مدعوم. يرجى استخدام JPEG, PNG, GIF, أو WebP');
            }

            const dataUrl = await readFileAsDataURL(file);
            const img = new Image();

            await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = () => reject(new Error('صورة تالفة أو غير مقروءة'));
                img.src = dataUrl;
            });

            // Compress image if too large
            let finalDataUrl = dataUrl;
            if (file.size > 2 * 1024 * 1024) { // 2MB
                finalDataUrl = await compressImage(img);
            }

            state.currentFile = {
                type: 'image',
                name: fileName,
                size: file.size,
                data: finalDataUrl.split(',')[1],
                dataUrl: finalDataUrl,
                dimensions: { width: img.width, height: img.height }
            };

            showImagePreview(finalDataUrl);

        } else if (extension === 'pdf') {
            const text = await extractPDFText(file);
            state.currentFile = {
                type: 'pdf',
                name: fileName,
                size: file.size,
                data: text.substring(0, 50000) // Limit text extraction
            };
            showFilePreview(fileName, 'fa-file-pdf', '#ef4444');

        } else if (extension === 'docx' || extension === 'doc') {
            const text = await extractWordText(file);
            state.currentFile = {
                type: 'doc',
                name: fileName,
                size: file.size,
                data: text.substring(0, 50000)
            };
            showFilePreview(fileName, 'fa-file-word', '#2563eb');

        } else if (extension === 'txt') {
            const text = await file.text();
            state.currentFile = {
                type: 'txt',
                name: fileName,
                size: file.size,
                data: text.substring(0, 50000)
            };
            showFilePreview(fileName, 'fa-file-lines', '#22c55e');

        } else {
            throw new Error('نوع الملف غير مدعوم. يرجى استخدام: صور، PDF، Word، أو نص');
        }

        updateSendButton();
        showSuccess(`تم تحميل الملف: ${fileName}`);

    } catch (error) {
        showError('خطأ في قراءة الملف: ' + error.message);
        clearFile();
        input.value = '';
    }
}

function compressImage(img) {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Calculate new dimensions
        let width = img.width;
        let height = img.height;
        const maxDimension = 1200;

        if (width > maxDimension || height > maxDimension) {
            if (width > height) {
                height = (height * maxDimension) / width;
                width = maxDimension;
            } else {
                width = (width * maxDimension) / height;
                height = maxDimension;
            }
        }

        canvas.width = width;
        canvas.height = height;

        ctx.drawImage(img, 0, 0, width, height);

        resolve(canvas.toDataURL('image/jpeg', 0.8));
    });
}

function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = (e) => reject(new Error('فشل في قراءة الملف'));
        reader.readAsDataURL(file);
    });
}

async function extractPDFText(file) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let text = '';

    for (let i = 1; i <= Math.min(pdf.numPages, 20); i++) { // Limit to 20 pages
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map(item => item.str).join(' ') + '\n';
    }

    return text.trim();
}

async function extractWordText(file) {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
}

function showFilePreview(name, iconClass, iconColor) {
    const preview = document.getElementById('file-preview');
    const icon = document.getElementById('file-icon');
    const nameEl = document.getElementById('file-name');
    const imgPreview = document.getElementById('image-preview');

    if (imgPreview) imgPreview.classList.add('hidden');
    if (preview) {
        preview.classList.remove('hidden');
        preview.innerHTML = `
            <div class="file-info">
                <i class="fa-solid ${iconClass}" style="color: ${iconColor}"></i>
                <span>${name}</span>
            </div>
            <button class="remove-file-btn" onclick="clearFile()" aria-label="إزالة الملف">
                <i class="fa-solid fa-xmark"></i>
            </button>
        `;
    }
}

function showImagePreview(dataUrl) {
    const preview = document.getElementById('image-preview');
    const img = document.getElementById('preview-img');
    const filePreview = document.getElementById('file-preview');

    if (filePreview) filePreview.classList.add('hidden');
    if (img) img.src = dataUrl;
    if (preview) preview.classList.remove('hidden');
}

function clearFile() {
    state.currentFile = null;

    const fileUpload = document.getElementById('file-upload');
    const filePreview = document.getElementById('file-preview');
    const imagePreview = document.getElementById('image-preview');

    if (fileUpload) fileUpload.value = '';
    if (filePreview) filePreview.classList.add('hidden');
    if (imagePreview) imagePreview.classList.add('hidden');

    updateSendButton();
}

function getFileIcon(type) {
    const icons = {
        'image': 'fa-image',
        'pdf': 'fa-file-pdf',
        'doc': 'fa-file-word',
        'txt': 'fa-file-lines'
    };
    return icons[type] || 'fa-file';
}

// ==========================================
// Voice Features
// ==========================================
function initVoiceRecognition() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        state.voiceRecognition = new SpeechRecognition();

        state.voiceRecognition.lang = 'ar-SA';
        state.voiceRecognition.continuous = false;
        state.voiceRecognition.interimResults = false;
        state.voiceRecognition.maxAlternatives = 1;

        state.voiceRecognition.onstart = () => {
            state.isRecording = true;
            updateVoiceButton();
            showSuccess('جاري الاستماع... تكلم الآن');
        };

        state.voiceRecognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            const input = document.getElementById('message-input');
            if (input) {
                input.value = transcript;
                updateSendButton();
                autoResize(input);
                showSuccess('تم التعرف على الصوت');
            }
        };

        state.voiceRecognition.onerror = (event) => {
            if (event.error === 'not-allowed') {
                showError('يجب السماح باستخدام الميكروفون');
            } else if (event.error === 'no-speech') {
                showWarning('لم يتم اكتشاف كلام');
            } else {
                showError('خطأ في التعرف على الصوت: ' + event.error);
            }
            state.isRecording = false;
            updateVoiceButton();
        };

        state.voiceRecognition.onend = () => {
            state.isRecording = false;
            updateVoiceButton();
        };

        console.log('✅ Voice recognition initialized');
    } else {
        console.warn('❌ Voice recognition not supported');
        showWarning('ميزة الصوت غير مدعومة في متصفحك');
    }
}

function toggleVoiceRecording() {
    if (!state.voiceRecognition) {
        showError('ميزة الصوت غير مدعومة في متصفحك');
        return;
    }

    if (state.isRecording) {
        state.voiceRecognition.stop();
        state.isRecording = false;
    } else {
        try {
            state.voiceRecognition.start();
        } catch (error) {
            showError('لا يمكن بدء التسجيل: ' + error.message);
        }
    }
}

function updateVoiceButton() {
    const voiceBtn = document.querySelector('.voice-btn');
    if (voiceBtn) {
        voiceBtn.innerHTML = state.isRecording
            ? '<i class="fa-solid fa-stop"></i>'
            : '<i class="fa-solid fa-microphone"></i>';
        voiceBtn.classList.toggle('recording', state.isRecording);
        voiceBtn.title = state.isRecording ? 'إيقاف التسجيل' : 'التحدث بالصوت';
    }
}

// ==========================================
// Message Sending
// ==========================================
async function sendMessage() {
    if (state.isGenerating) {
        showWarning('يرجى الانتظار حتى اكتمال الرد الحالي');
        return;
    }

    const input = document.getElementById('message-input');
    const text = input.value.trim();

    if (!text && !state.currentFile) {
        showWarning('يرجى إدخال رسالة أو إرفاق ملف');
        return;
    }

    // Check if online
    if (!state.isOnline) {
        showError('أنت غير متصل بالإنترنت. لا يمكن إرسال الرسائل.');
        return;
    }

    // Ensure we have a chat
    if (!state.currentChatId) {
        await startNewChat();
    }

    const chat = state.chats.find(c => c.id === state.currentChatId);
    if (!chat) return;

    // Build user message
    const userMessage = {
        role: 'user',
        content: text,
        timestamp: new Date().toISOString()
    };

    // Add file info if present
    if (state.currentFile) {
        userMessage.file = {
            name: state.currentFile.name,
            type: state.currentFile.type,
            size: state.currentFile.size
        };

        if (state.currentFile.type === 'image') {
            // Check if we should upload to storage (Phase 9)
            if (storage && currentUser) {
                try {
                    showSuccess('جاري رفع الصورة للسحابة...');
                    const url = await uploadToStorage(state.currentFile.file);
                    userMessage.image = url; // Use URL instead of Base64
                    userMessage.isCloud = true;
                } catch (e) {
                    console.error("Upload failed, falling back", e);
                    userMessage.image = state.currentFile.dataUrl;
                }
            } else {
                userMessage.image = state.currentFile.dataUrl;
            }
        }
    }

    // Add message to chat
    chat.messages.push(userMessage);
    chat.updatedAt = new Date().toISOString();

    // Update title if first message
    if (chat.messages.length === 1) {
        updateChatTitle(chat.id, text || state.currentFile.name);
    }

    // Update UI
    addMessageToUI(userMessage);
    input.value = '';
    autoResize(input);
    updateSendButton();

    // Generate response
    state.isGenerating = true;
    showMessageLoading();

    try {
        let response;

        if (state.currentFile && state.currentFile.type === 'image') {
            // Use Groq Vision for images
            // If we have a URL (from cloud), use it. Else use dataUrl.
            const imageUrl = userMessage.image; // Already set above
            response = await sendToGroqVision(text || 'حلل هذه الصورة بالتفصيل', imageUrl);
        } else {
            // Use Groq for text
            const messageForAI = state.currentFile && state.currentFile.data
                ? `${text}\n\n--- محتوى الملف (${state.currentFile.name}) ---\n${state.currentFile.data.substring(0, 15000)}`
                : text;

            response = await sendToGroq(chat.messages, messageForAI);

            // Post-process response for File Generation
            response = checkForFileGen(response);
        }

        // Add assistant message
        const assistantMessage = {
            role: 'assistant',
            content: response,
            timestamp: new Date().toISOString()
        };

        chat.messages.push(assistantMessage);
        chat.updatedAt = new Date().toISOString();
        await saveChats();

        hideMessageLoading();
        addMessageToUI(assistantMessage);

        // Check if response contains file generation command
        const processedResponse = checkForFileGen(response);
        if (processedResponse !== response) {
            // If file was generated, update the UI message to show success
            // Finding the last message element and updating it is tricky, 
            // so we just rely on the 'showSuccess' alerts for now or append to chat?
            // checkForFileGen returns the clean text, so we can update the chat object
            assistantMessage.content = processedResponse;
            // Re-render handled by addMessageToUI which was already called?
            // Actually addMessageToUI renders raw markdown. Use processedResponse
            // Ideally we should have processed before rendering.

            // Quick fix: remove last message and re-add?
            // Or better: Pass processedResponse to UI initially.
        }

        showSuccess('تم استلام الرد');

    } catch (error) {
        hideMessageLoading();

        const errorMessage = {
            role: 'assistant',
            content: `⚠️ عذراً، حدث خطأ: ${error.message}\n\nيرجى المحاولة مرة أخرى.`,
            timestamp: new Date().toISOString()
        };

        chat.messages.push(errorMessage);
        chat.updatedAt = new Date().toISOString();
        await saveChats();

        addMessageToUI(errorMessage);
        showError('خطأ في إرسال الرسالة: ' + error.message);
    }

    state.isGenerating = false;
    clearFile();
}

async function sendToGroq(chatMessages, currentMessage) {
    // Build messages array for API with dynamic system prompt
    const messages = [
        { role: 'system', content: getCurrentSystemPrompt() }
    ];

    // Add chat history (last 20 messages)
    const history = chatMessages.slice(-20);
    for (const msg of history) {
        if (msg.role === 'user') {
            messages.push({ role: 'user', content: msg.content || '' });
        } else if (msg.role === 'assistant') {
            messages.push({ role: 'assistant', content: msg.content || '' });
        }
    }

    // Replace last user message with enhanced version
    if (currentMessage && messages.length > 0) {
        messages[messages.length - 1] = { role: 'user', content: currentMessage };
    }

    // Check for web search trigger (Simple implementation)
    const lastMsgContent = messages[messages.length - 1].content;
    if (lastMsgContent.toLowerCase().startsWith('/search') || lastMsgContent.startsWith('ابحث عن')) {
        const query = lastMsgContent.replace(/^\/search|ابحث عن/, '').trim();
        showSuccess(`🔍 جاري البحث عن: ${query}`);

        const searchResults = await searchWikipedia(query);
        if (searchResults) {
            messages[messages.length - 1].content = `
            [SYSTEM: Web Search Results for "${query}"]
            ${searchResults}
            
            [USER MESSAGE]
            ${lastMsgContent}
            `;
        }
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${CONFIG.GROQ_API_KEY}`
        },
        body: JSON.stringify({
            model: CONFIG.MODEL,
            messages: messages,
            max_tokens: CONFIG.MAX_TOKENS,
            temperature: 0.7
        })
    });

    const data = await response.json();

    if (data.error) {
        throw new Error(data.error.message);
    }

    return data.choices[0].message.content;
}

// Update sendToGroqVision to support URLs
async function sendToGroqVision(text, imageInput) {
    // Groq Vision models (Updated)
    const VISION_MODELS = [
        'llama-3.2-11b-vision-preview',
        'llama-3.2-90b-vision-instruct'
    ];

    let lastError = null;
    const isUrl = typeof imageInput === 'string' && imageInput.startsWith('http');

    for (const model of VISION_MODELS) {
        try {
            console.log(`📷 Trying vision model: ${model}`);

            const content = [
                { type: "text", text: text }
            ];

            if (isUrl) {
                content.push({ type: "image_url", image_url: { url: imageInput } });
            } else {
                content.push({ type: "image_url", image_url: { url: imageInput } });
            }

            const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${CONFIG.GROQ_API_KEY}`
                },
                body: JSON.stringify({
                    model: model,
                    messages: [
                        {
                            role: 'user',
                            content: content
                        }
                    ],
                    max_tokens: 4096,
                    temperature: 0.7
                })
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error?.message || 'API Error');
            }

            const data = await response.json();

            if (!data.choices?.[0]?.message?.content) {
                throw new Error('No content in response');
            }

            console.log(`✅ Vision success with: ${model}`);
            return data.choices[0].message.content;

        } catch (error) {
            console.log(`❌ Vision model ${model} failed:`, error.message);
            lastError = error;
            // Continue to next model
        }
    }

    // Fallback to Gemini if Groq Vision fails
    console.log('🔄 Trying Gemini as fallback...');
    try {
        // Prepare image for Gemini (needs raw base64 if not URL)
        let geminiImage = imageInput;
        if (!isUrl && imageInput.includes(',')) {
            geminiImage = imageInput.split(',')[1];
        } else if (isUrl) {
            // Gemini supports image URL? Not directly in this implementation usually
            // We might skip fallback or handle URL differently.
            // For now, let's just pass empty if URL, or try.
            // Actually sendToGemini expects base64 usually.
            console.warn("Gemini fallback might fail with URL input");
        }

        return await sendToGemini(text, geminiImage);
    } catch (geminiError) {
        console.log('❌ Gemini fallback also failed:', geminiError.message);
        throw new Error(lastError?.message || 'فشل تحليل الصورة. جرب لاحقاً.');
    }
}

// Gemini fallback for images
async function sendToGeminiFallback(text, imageDataUrl) {
    // Extract base64 from data URL
    const base64Data = imageDataUrl.split(',')[1];

    const GEMINI_MODELS = ['gemini-1.5-flash', 'gemini-1.5-flash-002', 'gemini-2.0-flash'];

    for (const model of GEMINI_MODELS) {
        try {
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${CONFIG.GEMINI_API_KEY}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{
                            parts: [
                                { text: `${getCurrentSystemPrompt()}\n\nالمستخدم: ${text}` },
                                { inline_data: { mime_type: 'image/jpeg', data: base64Data } }
                            ]
                        }]
                    })
                }
            );

            const data = await response.json();
            if (data.error) continue;
            if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
                return data.candidates[0].content.parts[0].text;
            }
        } catch (e) {
            continue;
        }
    }
    throw new Error('فشل جميع الموديلات');
}

function sendQuickPrompt(text) {
    const input = document.getElementById('message-input');
    if (input) {
        input.value = text;
        updateSendButton();
        autoResize(input);
        sendMessage();
    }
}

// ==========================================
// Auto-Save Feature
// ==========================================
function setupAutoSave() {
    if (state.autoSaveTimer) {
        clearInterval(state.autoSaveTimer);
    }

    if (state.settings.autoSave) {
        state.autoSaveTimer = setInterval(() => {
            autoSaveCurrentChat();
        }, CONFIG.AUTO_SAVE_INTERVAL);
    }
}

async function autoSaveCurrentChat() {
    if (state.currentChatId && !state.isGenerating && state.settings.autoSave) {
        try {
            await saveChats();
        } catch (error) {
            console.warn('Auto-save failed:', error);
        }
    }
}

async function saveChats() {
    try {
        localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(state.chats));
        localStorage.setItem('mind_ai_settings', JSON.stringify(state.settings));
        return true;
    } catch (e) {
        console.error('Error saving chats:', e);
        showError('خطأ في حفظ البيانات المحلية');
        return false;
    }
}

function loadChats() {
    try {
        const saved = localStorage.getItem(CONFIG.STORAGE_KEY);
        state.chats = saved ? JSON.parse(saved) : [];

        // Migrate from old version if needed
        const oldChats = localStorage.getItem('mind_ai_chats');
        if (oldChats && state.chats.length === 0) {
            state.chats = JSON.parse(oldChats);
            saveChats();
        }
    } catch (e) {
        console.error('Error loading chats:', e);
        state.chats = [];
    }
}

function loadSettings() {
    try {
        const saved = localStorage.getItem('mind_ai_settings');
        if (saved) {
            state.settings = { ...state.settings, ...JSON.parse(saved) };
        }
    } catch (e) {
        console.error('Error loading settings:', e);
    }
}

function updateChatTitle(chatId, firstMessage) {
    const chat = state.chats.find(c => c.id === chatId);
    if (!chat || chat.messages.length > 1) return;

    // Use first 40 chars of first message as title
    chat.title = firstMessage.substring(0, 40) + (firstMessage.length > 40 ? '...' : '');
    saveChats();
    renderChatHistory(state.currentPage);
}

// ==========================================
// UI Rendering
// ==========================================
function renderMessages(messages) {
    hideWelcomeScreen();

    const container = document.getElementById('messages-container');
    if (!container) return;

    container.innerHTML = messages.map(msg => createMessageHTML(msg)).join('');
    scrollToBottom();
}

function createMessageHTML(msg) {
    const isUser = msg.role === 'user';
    const avatar = isUser ? '<i class="fa-solid fa-user"></i>' : '🧠';
    const time = formatTime(msg.timestamp);

    let content = '';

    // File attachment
    if (msg.file) {
        content += `
            <div class="message-file">
                <i class="fa-solid ${getFileIcon(msg.file.type)}"></i>
                <span>${escapeHtml(msg.file.name)}</span>
                ${msg.file.size ? `<small>(${formatFileSize(msg.file.size)})</small>` : ''}
            </div>
        `;
    }

    // Image
    if (msg.image) {
        content += `<img src="${msg.image}" alt="صورة مرفقة" loading="lazy">`;
    }

    // Text content
    if (msg.content) {
        if (isUser) {
            content += `<p>${escapeHtml(msg.content).replace(/\n/g, '<br>')}</p>`;
        } else {
            content += parseMarkdown(msg.content);
        }
    }

    return `
        <div class="message ${isUser ? 'user' : 'assistant'}">
            <div class="message-avatar">${avatar}</div>
            <div class="message-content">
                <div class="message-info">
                    <span class="message-time">${time}</span>
                </div>
                ${content}
            </div>
        </div>
    `;
}

function addMessageToUI(msg) {
    hideWelcomeScreen();

    const container = document.getElementById('messages-container');
    if (!container) return;

    container.insertAdjacentHTML('beforeend', createMessageHTML(msg));
    scrollToBottom();
}

function showWelcomeScreen() {
    const welcome = document.getElementById('welcome-screen');
    const messages = document.getElementById('messages-container');

    if (welcome) welcome.classList.remove('hidden');
    if (messages) messages.innerHTML = '';
}

function hideWelcomeScreen() {
    const welcome = document.getElementById('welcome-screen');
    if (welcome) welcome.classList.add('hidden');
}

function scrollToBottom() {
    const container = document.getElementById('chat-container');
    if (container) {
        setTimeout(() => {
            container.scrollTop = container.scrollHeight;
        }, 100);
    }
}

// ==========================================
// UI Controls
// ==========================================
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');

    sidebar.classList.toggle('open');
    overlay.classList.toggle('active');
}

function closeSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');

    if (sidebar) sidebar.classList.remove('open');
    if (overlay) overlay.classList.remove('active');
}

function toggleSettings() {
    const panel = document.getElementById('settings-panel');
    if (panel) {
        panel.classList.toggle('open');
    }
}

function handleKeyDown(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
}

function autoResize(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
}

function updateSendButton() {
    const input = document.getElementById('message-input');
    const sendBtn = document.getElementById('send-btn');

    if (!input || !sendBtn) return;

    const hasContent = input.value.trim() || state.currentFile;
    sendBtn.classList.toggle('active', hasContent);
    sendBtn.disabled = !hasContent || state.isGenerating;
}

// ==========================================
// Utility Functions
// ==========================================
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function parseMarkdown(text) {
    if (typeof marked !== 'undefined') {
        try {
            // Configure marked for better code highlighting
            marked.setOptions({
                breaks: true,
                gfm: true
            });

            let html = marked.parse(text);

            // Add copy button and line numbers to code blocks
            let codeBlockId = 0;
            html = html.replace(/<pre><code(.*?)>([\s\S]*?)<\/code><\/pre>/gi, (match, attrs, code) => {
                codeBlockId++;
                const language = attrs.match(/class="language-(\w+)"/)?.[1] || 'code';
                const decodedCode = code
                    .replace(/&lt;/g, '<')
                    .replace(/&gt;/g, '>')
                    .replace(/&amp;/g, '&')
                    .replace(/&quot;/g, '"');

                // Add line numbers
                const lines = code.split('\n');
                const numberedCode = lines.map((line, i) =>
                    `<span class="line-number">${i + 1}</span>${line}`
                ).join('\n');

                return `
                    <div class="code-block-wrapper">
                        <div class="code-header">
                            <span class="code-language">${language}</span>
                            <div class="code-actions">
                                <button class="code-btn explain-btn" onclick="explainCode(\`${decodedCode.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`)" title="اشرح الكود">
                                    <i class="fa-solid fa-lightbulb"></i>
                                </button>
                                <button class="code-btn copy-btn" onclick="copyCode(this, \`${decodedCode.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`)" title="نسخ الكود">
                                    <i class="fa-solid fa-copy"></i>
                                    <span>نسخ</span>
                                </button>
                            </div>
                        </div>
                        <pre class="code-content"><code${attrs}>${numberedCode}</code></pre>
                    </div>
                `;
            });

            return html;
        } catch (e) {
            return text.replace(/\n/g, '<br>');
        }
    }
    return text.replace(/\n/g, '<br>');
}

function formatDate(dateString) {
    try {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;

        if (isNaN(diff)) return 'غير معروف';

        if (diff < 60000) return 'الآن';
        if (diff < 3600000) return `${Math.floor(diff / 60000)} دقيقة`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)} ساعة`;
        if (diff < 604800000) return `${Math.floor(diff / 86400000)} يوم`;

        return date.toLocaleDateString('ar-SA');
    } catch (e) {
        return 'غير معروف';
    }
}

function formatTime(dateString) {
    try {
        const date = new Date(dateString);
        return date.toLocaleTimeString('ar-SA', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    } catch (e) {
        return '';
    }
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 ب';
    const k = 1024;
    const sizes = ['ب', 'ك.ب', 'م.ب', 'ج.ب'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ==========================================
// Make functions globally available
// ==========================================
window.startNewChat = startNewChat;
window.loadChat = loadChat;
window.deleteChat = deleteChat;
window.clearAllHistory = clearAllHistory;
window.toggleSidebar = toggleSidebar;
window.toggleSettings = toggleSettings;
window.sendMessage = sendMessage;
window.sendQuickPrompt = sendQuickPrompt;
window.handleFileUpload = handleFileUpload;
window.clearFile = clearFile;
window.handleKeyDown = handleKeyDown;
window.autoResize = autoResize;
window.toggleVoiceRecording = toggleVoiceRecording;

// ==========================================
// Code Features - ميزات الأكواد
// ==========================================
async function copyCode(button, code) {
    try {
        await navigator.clipboard.writeText(code);
        const originalHTML = button.innerHTML;
        button.innerHTML = '<i class="fa-solid fa-check"></i><span>تم!</span>';
        button.classList.add('copied');

        setTimeout(() => {
            button.innerHTML = originalHTML;
            button.classList.remove('copied');
        }, 2000);

        showSuccess('تم نسخ الكود!');
    } catch (err) {
        showError('فشل النسخ: ' + err.message);
    }
}

async function explainCode(code) {
    const input = document.getElementById('message-input');
    if (input) {
        input.value = `اشرح لي هذا الكود سطر بسطر:\n\`\`\`\n${code}\n\`\`\``;
        updateSendButton();
        autoResize(input);
        sendMessage();
    }
}

window.copyCode = copyCode;
window.explainCode = explainCode;

// ==========================================
// AI Modes - أوضاع الذكاء الاصطناعي
// ==========================================
function switchMode(modeName) {
    if (AI_MODES[modeName]) {
        state.currentMode = modeName;
        updateModeUI();
        showSuccess(`تم التبديل لوضع ${AI_MODES[modeName].name} ${AI_MODES[modeName].icon}`);
        saveSettings();
    }
}

function updateModeUI() {
    const modeIndicator = document.getElementById('mode-indicator');
    if (modeIndicator) {
        const mode = AI_MODES[state.currentMode];
        modeIndicator.innerHTML = `${mode.icon} ${mode.name}`;
    }
}

function getCurrentSystemPrompt() {
    let prompt = SYSTEM_PROMPT;

    // Add mode-specific prompt
    const modePrompt = AI_MODES[state.currentMode]?.prompt;
    if (modePrompt) {
        prompt += '\n\n' + modePrompt;
    }

    // Add memory context
    if (state.memory.userName) {
        prompt += `\n\nاسم المستخدم: ${state.memory.userName}`;
    }
    if (state.memory.facts.length > 0) {
        prompt += `\n\nمعلومات عن المستخدم:\n- ${state.memory.facts.slice(-10).join('\n- ')}`;
    }

    return prompt;
}

window.switchMode = switchMode;

// ==========================================
// Memory System - نظام الذاكرة الذكية
// ==========================================
function saveMemory() {
    try {
        localStorage.setItem(CONFIG.MEMORY_KEY, JSON.stringify(state.memory));
    } catch (e) {
        console.error('Error saving memory:', e);
    }
}

function loadMemory() {
    try {
        const saved = localStorage.getItem(CONFIG.MEMORY_KEY);
        if (saved) {
            state.memory = { ...state.memory, ...JSON.parse(saved) };
        }
    } catch (e) {
        console.error('Error loading memory:', e);
    }
}

function addToMemory(key, value) {
    // Backward compatibility for calls like addToMemory("some fact")
    if (value === undefined) {
        value = key;
        key = 'fact';
    }

    if (key === 'name') {
        state.memory.userName = value;
    } else if (key === 'preference') {
        // value should be object like { theme: 'dark' }
        state.memory.preferences = { ...state.memory.preferences, ...value };
    } else if (key === 'fact') {
        if (value && !state.memory.facts.includes(value)) {
            state.memory.facts.push(value);
            if (state.memory.facts.length > 50) {
                state.memory.facts = state.memory.facts.slice(-50);
            }
        }
    }

    saveMemory(); // Local Storage
    if (currentUser) {
        saveCloudMemory(); // Cloud Firestore
    }
}

function setUserName(name) {
    addToMemory('name', name);
    showSuccess(`مرحباً ${name}! سأتذكر اسمك.`);
}

function clearMemory() {
    if (confirm('هل تريد مسح جميع الذكريات المحفوظة؟')) {
        state.memory = { userName: null, preferences: {}, facts: [] };
        saveMemory();
        showSuccess('تم مسح الذاكرة');
    }
}

window.setUserName = setUserName;
window.clearMemory = clearMemory;

// ==========================================
// Slash Commands - الأوامر السريعة
// ==========================================
function processSlashCommand(text) {
    const trimmed = text.trim();

    for (const [command, config] of Object.entries(SLASH_COMMANDS)) {
        if (trimmed.startsWith(command)) {
            const content = trimmed.slice(command.length).trim();

            if (config.mode) {
                switchMode(config.mode);
                return content || null;
            }

            if (config.action === 'translate') {
                return `ترجم النص التالي للإنجليزية:\n${content}`;
            }
            if (config.action === 'summarize') {
                return `لخص النص التالي بشكل مختصر:\n${content}`;
            }
            if (config.action === 'explain') {
                return `اشرح بالتفصيل:\n${content}`;
            }
        }
    }

    return text;
}

function showSlashCommandsHelp() {
    let helpText = '**الأوامر السريعة المتاحة:**\n\n';
    for (const [command, config] of Object.entries(SLASH_COMMANDS)) {
        helpText += `\`${command}\` - ${config.description}\n`;
    }
    return helpText;
}

// ==========================================
// Mode Selector UI - واجهة اختيار الوضع
// ==========================================
function renderModeSelector() {
    const container = document.querySelector('.input-footer');
    if (!container || document.getElementById('mode-selector')) return;

    const modesHTML = Object.entries(AI_MODES).map(([key, mode]) =>
        `<button class="mode-btn ${state.currentMode === key ? 'active' : ''}" 
                 onclick="switchMode('${key}')" title="${mode.name}">
            ${mode.icon}
        </button>`
    ).join('');

    const selectorHTML = `
        <div class="mode-selector" id="mode-selector">
            <span id="mode-indicator">${AI_MODES[state.currentMode].icon} ${AI_MODES[state.currentMode].name}</span>
            <div class="mode-buttons">${modesHTML}</div>
        </div>
    `;

    container.insertAdjacentHTML('afterbegin', selectorHTML);
}

// ==========================================
// Advanced Tools: Search & File Gen
// ==========================================

async function searchWikipedia(query) {
    try {
        const response = await fetch(`https://ar.wikipedia.org/w/api.php?action=query&list=search&prop=info&inprop=url&utf8=&format=json&origin=*&srlimit=3&srsearch=${encodeURIComponent(query)}`);
        const data = await response.json();

        if (data.query.search.length > 0) {
            return data.query.search.map(result => `
            - العنوان: ${result.title}
            - مقتطف: ${result.snippet.replace(/<[^>]*>/g, '')}
            `).join('\n');
        }
        return "لم يتم العثور على نتائج في ويكيبيديا.";
    } catch (error) {
        console.error("Search error:", error);
        return null;
    }
}

// Generate Files (PDF/Word)
async function generateDocument(type, title, content) {
    showSuccess(`جاري إنشاء ملف ${type.toUpperCase()}...`);

    try {
        if (type === 'pdf') {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF({ align: 'right' });

            doc.setFontSize(16);
            doc.text(title, 190, 20, { align: 'right' }); // Basic RTL attempt
            doc.setFontSize(12);

            // Simple line splitting for PDF (Note: Real Arabic support needs custom fonts)
            const lines = doc.splitTextToSize(content, 180);
            doc.text(lines, 190, 40, { align: 'right' });

            doc.save(`${title}.pdf`);

        } else if (type === 'word' || type === 'docx') {
            const { Document, Packer, Paragraph, TextRun } = window.docx;

            const doc = new Document({
                sections: [{
                    properties: {},
                    children: [
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: title,
                                    bold: true,
                                    size: 32,
                                }),
                            ],
                            alignment: "right"
                        }),
                        new Paragraph({
                            children: [new TextRun({ text: "\n" })],
                        }),
                        ...content.split('\n').map(line => new Paragraph({
                            children: [new TextRun({
                                text: line,
                                size: 24,
                                rightToLeft: true // Arabic support
                            })],
                            alignment: "right"
                        }))
                    ],
                }],
            });

            const blob = await Packer.toBlob(doc);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${title}.docx`;
            a.click();
        }
        showSuccess('تم تحميل الملف بنجاح ✅');
    } catch (e) {
        showError('فشل إنشاء الملف: ' + e.message);
        console.error(e);
    }
}

// Detect File Gen command from AI response
function checkForFileGen(text) {
    // Format: $$FILE_GENERATION$$ {"type": "...", "title": "...", "content": "..."} $$END_FILE$$
    if (text.includes('$$FILE_GENERATION$$')) {
        try {
            const parts = text.split('$$FILE_GENERATION$$');
            const jsonPart = parts[1].split('$$END_FILE$$')[0];
            const data = JSON.parse(jsonPart);

            // Generate the file
            generateDocument(data.type, data.title, data.content);

            // Return clean text without the JSON block
            return parts[0] + '\n\n✅ **تم إنشاء الملف بنجاح**';
        } catch (e) {
            console.error("File parsing error", e);
        }
    }
    return text;
}

// Cloud Storage Functions
async function uploadToStorage(file) {
    if (!storage || !currentUser) return null;

    const ref = storage.ref();
    const childRef = ref.child(`users/${currentUser.uid}/uploads/${Date.now()}_${file.name}`);

    await childRef.put(file);
    const url = await childRef.getDownloadURL();
    return url;
}

// Initialize memory on load
document.addEventListener('DOMContentLoaded', () => {
    init(); // Critical: Start the app
    loadMemory();
    updateAuthUI(null);
    setTimeout(renderModeSelector, 500);
});