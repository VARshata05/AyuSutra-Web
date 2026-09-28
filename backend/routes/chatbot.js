// routes/chatbot.js
// POST /api/chatbot
// Body: { message, history: [{role, content}], fileBase64?, fileType?, lang? }
const express = require('express');
const router  = express.Router();
const { User } = require('../models');
const { decrypt } = require('../utils/encryption');

const SYSTEM_PROMPT = `You are AyuSutra health assistant. Ayu (आयु) means lifespan in Sanskrit.

You help Indian users — including rural and semi-literate users — with:
- Understanding symptoms and finding appropriate specialists
- Summarizing medical reports/prescriptions (PDFs, images)
- Finding hospitals, diagnostic centres, blood banks in India
- General health guidance and wellness tips
- Translating health information into the user's preferred language

STRICT RULES:
❌ Never provide a definitive medical diagnosis
❌ Never recommend specific medications or dosages
❌ Never make statements like "you have [disease]"
✅ For reports/images: extract key values, highlight anything outside normal range, summarize clearly
✅ Always suggest consulting a licensed doctor for diagnosis
✅ For emergencies: immediately direct to 112 or 108
✅ Keep responses concise, compassionate, in simple language
✅ Use bullet points for readability when listing multiple items

LANGUAGE RULES:
- If the user writes in Hindi, reply in Hindi (Devanagari script)
- If the user writes in Kannada, reply in Kannada script
- If the "lang" parameter is "hi", respond in Hindi
- If the "lang" parameter is "kn", respond in Kannada
- Default to simple English
- Use everyday words — avoid complex medical jargon
- For rural users: use relatable examples (e.g., "drink water like you water your crops — regularly")`;

// Optional Auth Middleware
const optionalAuth = (req, res, next) => {
  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) {
    try {
      const token = header.split(' ')[1];
      req.user = require('jsonwebtoken').verify(token, process.env.JWT_SECRET);
    } catch (e) { }
  }
  next();
};

router.post('/', optionalAuth, async (req, res) => {
  try {
    const { message, history = [], fileBase64, fileType, lang = 'en' } = req.body;

    let patientContext = "";
    if (req.user?.id) {
      const user = await User.findById(req.user.id);
      if (user) {
        const age = user.dateOfBirth ? Math.floor((new Date() - new Date(user.dateOfBirth)) / (1000 * 60 * 60 * 24 * 365.25)) : "N/A";
        patientContext = `[PATIENT CONTEXT: Age: ${age}, Allergies: ${decrypt(user.allergies) || 'None'}, History: ${decrypt(user.medicalNotes) || 'None'}]`;
      }
    }
    if (!message && !fileBase64)
      return res.status(400).json({ message: 'message or fileBase64 required' });

    // Build message content — support text + file
    const content = [];
    if (fileBase64) {
      if (fileType === 'application/pdf') {
        content.push({ type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: fileBase64 } });
      } else {
        content.push({ type: 'image', source: { type: 'base64', media_type: fileType || 'image/jpeg', data: fileBase64 } });
      }
    }

    // Append language instruction to user message
    let userText = message || 'Please analyze and summarize this medical document.';
    if (lang === 'hi') userText += '\n\n[Respond in Hindi / हिंदी में जवाब दें]';
    else if (lang === 'kn') userText += '\n\n[Respond in Kannada / ಕನ್ನಡದಲ್ಲಿ ಉತ್ತರಿಸಿ]';

    content.push({ type: 'text', text: userText });

    const messages = [...history, { role: 'user', content }];

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20240620',
        max_tokens: 800,
        system: `${SYSTEM_PROMPT}\n\n${patientContext}\n\nIMPORTANT: Always include a medical disclaimer in your response.`,
        messages
      })
    });

    const data = await response.json();
    if (data.error) return res.status(500).json({ message: data.error.message });

    let reply = data.content?.find(b => b.type === 'text')?.text;
    
    if (!reply) {
      if (data.error?.message?.includes('api_key')) {
        reply = "⚠️ **AI Engine Offline**: I'm currently running in 'Local Mode' because the Anthropic API key is missing or invalid. I can still help with hospitals, blood banks, and general health info — just ask me about those! For detailed AI analysis, please check the server configuration.";
      } else {
        reply = "I'm having trouble processing that right now. Please try again or consult a medical professional for urgent queries.";
      }
    }

    res.json({
      reply,
      history: [...history, { role: 'user', content }, { role: 'assistant', content: reply }]
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
