const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// تحميل مفاتيح واجهات برمجة التطبيقات من ملف .env
const API_KEYS = {
  deepseek: process.env.DEEPSEEK_API_KEY,
  gemini: process.env.GEMINI_API_KEY,
  claude: process.env.CLAUDE_API_KEY,
  chatgpt: process.env.CHATGPT_API_KEY
};

// نقاط نهاية واجهات برمجة التطبيقات
const API_ENDPOINTS = {
  deepseek: 'https://api.deepseek.com/v1/chat/completions',
  gemini: `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEYS.gemini}`,
  claude: 'https://api.anthropic.com/v1/messages',
  chatgpt: 'https://api.openai.com/v1/chat/completions'
};

// دالة لتوجيه الاستعلام إلى النموذج المحدد
async function queryModel(model, prompt) {
  switch (model) {
    case 'deepseek':
      return await queryDeepSeek(prompt);
    case 'gemini':
      return await queryGemini(prompt);
    case 'claude':
      return await queryClaude(prompt);
    case 'chatgpt':
      return await queryChatGPT(prompt);
    default:
      throw new Error(`النموذج ${model} غير مدعوم`);
  }
}

// دوال الاستعلام لكل نموذج
async function queryDeepSeek(prompt) {
  const response = await axios.post(API_ENDPOINTS.deepseek, {
    model: 'deepseek-chat',
    messages: [{ role: 'user', content: prompt }]
  }, {
    headers: {
      'Authorization': `Bearer ${API_KEYS.deepseek}`,
      'Content-Type': 'application/json'
    }
  });
  return response.data.choices[0].message.content;
}

async function queryGemini(prompt) {
  const response = await axios.post(API_ENDPOINTS.gemini, {
    contents: [{
      parts: [{
        text: prompt
      }]
    }]
  });
  return response.data.candidates[0].content.parts[0].text;
}

async function queryClaude(prompt) {
  const response = await axios.post(API_ENDPOINTS.claude, {
    model: 'claude-3-opus-20240229',
    max_tokens: 1000,
    messages: [{ role: 'user', content: prompt }]
  }, {
    headers: {
      'x-api-key': API_KEYS.claude,
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01'
    }
  });
  return response.data.content[0].text;
}

async function queryChatGPT(prompt) {
  const response = await axios.post(API_ENDPOINTS.chatgpt, {
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }]
  }, {
    headers: {
      'Authorization': `Bearer ${API_KEYS.chatgpt}`,
      'Content-Type': 'application/json'
    }
  });
  return response.data.choices[0].message.content;
}

// نقطة النهاية لتوجيه الاستعلام
app.post('/api/query', async (req, res) => {
  const { prompt, model } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'الاستعلام مطلوب' });
  }

  if (!model) {
    return res.status(400).json({ error: 'النموذج مطلوب' });
  }

  try {
    const response = await queryModel(model, prompt);
    res.json({ response });
  } catch (error) {
    console.error(`خطأ في النموذج ${model}:`, error.message);
    res.status(500).json({ error: `خطأ في النموذج: ${error.message}` });
  }
});

// نقطة النهاية للتوجيه التلقائي (اختيار النموذج بناءً على طبيعة الاستعلام)
app.post('/api/auto-route', async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'الاستعلام مطلوب' });
  }

  // خوارزمية بسيطة لتحديد النموذج المناسب
  let model = 'chatgpt'; // افتراضي

  // إذا كان الاستعلام متعلقًا بالبرمجة، استخدم ديب سيك
  if (prompt.toLowerCase().includes('كود') || prompt.toLowerCase().includes('برمجة') || prompt.toLowerCase().includes('برمج')) {
    model = 'deepseek';
  }
  // إذا كان استعلامًا إبداعيًا، استخدم كلاود
  else if (prompt.toLowerCase().includes('إبداع') || prompt.toLowerCase().includes('قصه') || prompt.toLowerCase().includes('قصة')) {
    model = 'claude';
  }
  // إذا كان استعلامًا عامًا، استخدم جمناي
  else if (prompt.length < 100) {
    model = 'gemini';
  }
  // وإلا شات جي بي تي

  try {
    const response = await queryModel(model, prompt);
    res.json({ response, model });
  } catch (error) {
    console.error(`خطأ في التوجيه التلقائي:`, error.message);
    res.status(500).json({ error: `خطأ: ${error.message}` });
  }
});

app.listen(PORT, () => {
  console.log(`الخادم يعمل على المنفذ ${PORT}`);
});