/**
 * Mind AI Study Helper - v7.0 (Clean Rewrite)
 * Powered by OpenRouter (Gemini 2.0 Flash)
 */

// ==========================================
// ⚙️ Configuration
// ==========================================
const CONFIG = {
    API_KEY: "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", // User's OpenRouter Key
    API_URL: "https://openrouter.ai/api/v1/chat/completions",
    MODEL: "google/gemini-2.0-flash-exp:free", // The requested powerhouse
    SITE_URL: "https://mind-ai.local",
    APP_NAME: "Mind AI Study Helper"
};

// ==========================================
// 🧠 System Intelligence (The Brain)
// ==========================================
const SYSTEM_PROMPT = `أنت (المساعد الدراسي الذكي)، خبير شامل في حل الامتحانات، البرمجة، وتحليل الملفات.

💎 هويتك ومهمتك:
1. **حل الامتحانات:** عند رؤية سؤال (نص أو صورة)، أعطِ **الإجابة النهائية الصحيحة فوراً** (مثلاً: "الجواب: ج) 45 نيوتن"). ثم اشرح باختصار.
2. **البرمجة:** أنت مهندس برمجيات محترف (Senior Developer). اكتب أكواداً نظيفة، كاملة، وقابلة للنسخ والتشغيل فوراً.
3. **إنشاء الملفات:** إذا طلب المستخدم ملخصاً أو كوداً في ملف، استخدم صيغة التوليد أدناه.
4. **الأسلوب:** مباشر، دقيق، بدون مقدمات طويلة "أهلاً بك...". ادخل في صلب الموضوع.

📄 صيغة إنشاء الملفات (File Generation Protocol):
لإنشاء ملف، اكتب في نهاية ردك بلوك كود JSON بهذا الشكل تماماً:
$$FILE_GENERATION$$
{
  "type": "txt",  // أو "html", "py", "js", "md"
  "title": "اسم_الملف",
  "content": "محتوى الملف بالكامل هنا..."
}
$$END_FILE$$
`;

// ==========================================
// 📦 State Management
// ==========================================
let state = {
    messages: [], // Chat history
    currentFile: null, // Uploaded file/image
    isGenerating: false
};

// ==========================================
// 🚀 Core Functions
// ==========================================

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadHistory();
    setupEventListeners();
    console.log('🚀 Mind AI v7.0 Ready - System Unified on OpenRouter');
});

function setupEventListeners() {
    // Enter key to send
    document.getElementById('message-input')?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    // File upload
    document.getElementById('file-upload')?.addEventListener('change', handleFileUpload);
}

// 📨 Main Send Function (Unified Text & Vision)
async function sendMessage() {
    if (state.isGenerating) return;

    const input = document.getElementById('message-input');
    const text = input.value.trim();
    const file = state.currentFile;

    if (!text && !file) return;

    // UI Updates
    input.value = '';
    state.isGenerating = true;
    updateSendButtonState();

    // Add User Message to UI
    appendMessage(text, 'user', file);

    // Add partial Loading Message
    const loadingId = appendLoadingMessage();

    try {
        // Prepare Request
        const requestBody = buildRequestBody(text, file);

        console.log('📡 Sending request to OpenRouter...', requestBody);

        const response = await fetch(CONFIG.API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${CONFIG.API_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': CONFIG.SITE_URL,
                'X-Title': CONFIG.APP_NAME
            },
            body: JSON.stringify(requestBody)
        });

        const data = await response.json();

        // Error Handling
        if (data.error) {
            throw new Error(data.error.message || 'OpenRouter API Error');
        }

        if (!data.choices || data.choices.length === 0) {
            throw new Error('No response from AI');
        }

        const aiText = data.choices[0].message.content;

        // Success: Update UI
        removeMessage(loadingId);
        appendMessage(aiText, 'assistant');

        // Handle File Generation if present
        checkForFileGeneration(aiText);

        // Save History
        saveHistory();

    } catch (error) {
        console.error('❌ Error:', error);
        removeMessage(loadingId);
        appendMessage(`⚠️ عذراً، حدث خطأ: ${error.message}`, 'error');
    } finally {
        state.isGenerating = false;
        clearFile(); // Reset file after sending
        updateSendButtonState();
    }
}

// 🏗️ Build Request Body (The Smart Part)
function buildRequestBody(text, file) {
    const messages = [
        { role: "system", content: SYSTEM_PROMPT },
        ...state.messages.slice(-10) // Context window (last 10 messages)
    ];

    const newMessageContent = [];

    // 1. Add Text
    if (text) {
        newMessageContent.push({ type: "text", text: text });
    } else {
        // If image only, add default prompt
        newMessageContent.push({ type: "text", text: "حلل هذه الصورة أو الملف بالتفصيل." });
    }

    // 2. Add Image (Vision)
    if (file && file.type.startsWith('image/')) {
        newMessageContent.push({
            type: "image_url",
            image_url: {
                url: file.dataUrl // OpenRouter supports data URLs directly
            }
        });
    }
    // 3. Add Text File Content (PDF/DOC parsed text)
    else if (file && file.content) {
        newMessageContent.push({
            type: "text",
            text: `\n[مرفق ملف: ${file.name}]\nمحتوى الملف:\n${file.content}\n`
        });
    }

    // Add current message to history object (for next time) but send formatted version now
    messages.push({ role: "user", content: newMessageContent });

    return {
        model: CONFIG.MODEL,
        messages: messages,
        temperature: 0.3, // Low temp for accurate exam answers
        max_tokens: 4000
    };
}

// ==========================================
// 📎 File Handling
// ==========================================
function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    // Image Handling
    if (file.type.startsWith('image/')) {
        reader.onload = (e) => {
            state.currentFile = {
                type: file.type,
                name: file.name,
                dataUrl: e.target.result // Base64 for API
            };
            showFilePreview(file.name, e.target.result);
        };
        reader.readAsDataURL(file);
    }
    // Text/Code Handling
    else {
        // For PDF/Doc - In a real app we need pdf.js. 
        // For v7.0 simplified, we treat everything as text or show error for huge binaries.
        reader.onload = (e) => {
            state.currentFile = {
                type: 'text',
                name: file.name,
                content: e.target.result // Text content
            };
            showFilePreview(file.name, null); // No image preview for text
        };
        reader.readAsText(file);
    }
}

function clearFile() {
    state.currentFile = null;
    document.getElementById('file-preview').classList.add('hidden');
    document.getElementById('image-preview').classList.add('hidden');
    document.getElementById('file-upload').value = '';
}

function showFilePreview(name, imgUrl) {
    if (imgUrl) {
        const preview = document.getElementById('image-preview');
        const img = document.getElementById('preview-img');
        img.src = imgUrl;
        preview.classList.remove('hidden');
    } else {
        const preview = document.getElementById('file-preview');
        document.getElementById('file-name').textContent = name;
        preview.classList.remove('hidden');
    }
}

// ==========================================
// 🖥️ UI Rendering
// ==========================================
function appendMessage(content, role, attachment = null) {
    const container = document.getElementById('messages-container');
    const div = document.createElement('div');
    div.className = `message ${role}`;

    // Header (Avatar + Name)
    const header = document.createElement('div');
    header.className = 'message-header';
    header.innerHTML = role === 'user'
        ? `<i class="fa-solid fa-user"></i> <span>أنت</span>`
        : `<i class="fa-solid fa-brain"></i> <span>المساعد الدراسي</span>`;

    // Content
    const body = document.createElement('div');
    body.className = 'message-content';

    // Show Attachment if user sent one
    if (attachment && attachment.dataUrl) {
        body.innerHTML += `<img src="${attachment.dataUrl}" style="max-width: 200px; border-radius: 10px; margin-bottom: 10px;">`;
    }

    // Parse Markdown (Basic)
    body.innerHTML += parseMarkdown(content);

    div.appendChild(header);
    div.appendChild(body);
    container.appendChild(div);

    // Auto Scroll
    container.scrollTop = container.scrollHeight;

    // Update History State
    if (role !== 'error') {
        state.messages.push({ role, content });
    }

    return div.id = 'msg-' + Date.now();
}

function appendLoadingMessage() {
    const container = document.getElementById('messages-container');
    const div = document.createElement('div');
    div.className = 'message assistant loading';
    div.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i> جاري التحليل والحل...`;
    div.id = 'loading-' + Date.now();
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
    return div.id;
}

function removeMessage(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
}

function updateSendButtonState() {
    const btn = document.getElementById('send-btn');
    if (btn) btn.disabled = state.isGenerating;
}

// ==========================================
// 🛠️ Utilities (Markdown, History, Files)
// ==========================================
function parseMarkdown(text) {
    if (!text) return '';
    // Clean File Blocks first to simple buttons
    text = text.replace(/\$\$FILE_GENERATION\$\$[\s\S]*?\$\$END_FILE\$\$/g, (match) => {
        try {
            const jsonStr = match.replace('$$FILE_GENERATION$$', '').replace('$$END_FILE$$', '');
            const fileData = JSON.parse(jsonStr);
            return `<button onclick="downloadGeneratedFile('${encodeURIComponent(JSON.stringify(fileData))}')" class="download-btn">
                <i class="fa-solid fa-download"></i> تنزيل ملف: ${fileData.title}.${fileData.type}
            </button>`;
        } catch (e) { return ''; }
    });

    // Basic formatting
    return text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
        .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>') // Code blocks
        .replace(/`([^`]+)`/g, '<code>$1</code>') // Inline code
        .replace(/\n/g, '<br>'); // Newlines
}

function downloadGeneratedFile(jsonStr) {
    const data = JSON.parse(decodeURIComponent(jsonStr));
    const blob = new Blob([data.content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${data.title}.${data.type}`;
    a.click();
    window.URL.revokeObjectURL(url);
}

function saveHistory() {
    localStorage.setItem(CONFIG.APP_NAME + '_history', JSON.stringify(state.messages));
}

function loadHistory() {
    const saved = localStorage.getItem(CONFIG.APP_NAME + '_history');
    if (saved) {
        state.messages = JSON.parse(saved);
        // Re-render handled by just having them in state? 
        // For simplicity in v7.0, we clear UI on reload or loop re-render.
        // Let's re-render last 50.
        state.messages.slice(-50).forEach(msg => appendMessage(msg.content, msg.role));
    }
}