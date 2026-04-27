/*
GEMINI USAGE OPTIMIZATION:
- Flash model (gemini-2.0-flash): copilot chat, symptoms, report scan
  ~$0.000075 per 1K input tokens = very cheap
- Pro model (gemini-1.5-pro): health insights, deep analysis
  ~$0.00125 per 1K input tokens = moderate
- Vision (gemini-2.0-flash): same Flash model handles images

With Rs.22,000 Gemini credits:
- ~1 million copilot responses (Flash)
- ~200,000 report scans
- Enough for a strong beta with thousands of users

MONITOR USAGE: console.cloud.google.com/apis/api/generativelanguage
*/

"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";

//  Clean AI response text before returning to client 
// Fixes mojibake (garbled Unicode) and strips markdown symbols.
function cleanAIResponse(text) {
  if (!text) return text;
  return text
    // Fix broken Unicode arrows and symbols (UTF-8 mojibake)
    .replace(/->/g, '\u2192')
    .replace(/'/g, '\u2019')
    .replace(/"/g, '\u201C')
    .replace(/"/g, '\u201D')
    .replace(/ - /g, '\u2014')
    .replace(/"/g, '\u2018')
    .replace(/WARNING/g, '\u26A0')
    // Remove markdown bold/italic (keep content)
    .replace(/\*{1,3}(.*?)\*{1,3}/g, '$1')
    .replace(/_{1,2}(.*?)_{1,2}/g, '$1')
    // Remove markdown headers
    .replace(/#{1,6}\s+/g, '')
    // Remove inline code and code blocks
    .replace(/`{1,3}([\s\S]*?)`{1,3}/g, '$1')
    // Remove markdown links [text](url)  text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Remove bullet/number list prefixes (voice doesn't need them)
    .replace(/^[-\u2022\u00B7]\s+/gm, '')
    .replace(/^\d+\.\s+/gm, '')
    // Clean multiple newlines
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// Plain-text formatting rule injected into all system prompts
const PLAIN_TEXT_RULE = `
FORMATTING RULES (MANDATORY):
Respond in plain text only. No markdown formatting.
No asterisks for bold (**word**), no hashtags for headers (#), no backticks for code.
Use plain numbered lists (1. 2. 3.) if needed.
Use plain dashes (-) for bullet points.
Never use ** for bold  write naturally.
Write as if speaking to a person in a conversation.
`;

// Language detection + voice-friendly output rules injected into copilot/doctor prompts
const LANGUAGE_AND_VOICE_RULES = `
SCRIPT ENFORCEMENT RULE (ABSOLUTELY MANDATORY):
You MUST write in the NATIVE SCRIPT of the user's language. Never romanize.

- If user writes in Hindi: respond ONLY in Devanagari script.
  CORRECT: "\u0906\u092A\u0915\u093E \u0930\u0915\u094D\u0924\u091A\u093E\u092A \u0920\u0940\u0915 \u0939\u0948\u0964"
  WRONG: "Aapka raktaap theek hai." (this is romanized  FORBIDDEN)

- If user writes in Kannada: respond ONLY in Kannada script.
  CORRECT: "\u0CA8\u0CBF\u0CAE\u0CCD\u0CAE \u0C86\u0CB0\u0CCB\u0C97\u0CCD\u0CAF \u0C9A\u0CC6\u0CA8\u0CCD\u0CA8\u0CBE\u0C97\u0CBF\u0CA6\u0CC6\u0CCD."
  WRONG: "Nimma arogya chennagide." (FORBIDDEN)

- If user writes in Tamil: respond ONLY in Tamil script.
  CORRECT: "\u0B89\u0B99\u0BCD\u0B95\u0BB3\u0BCD \u0B89\u0B9F\u0BB2\u0BCD\u0BA8\u0BB2\u0BAE\u0BCD \u0BA8\u0BB2\u0BCD\u0BB2\u0BA4\u0BC1."
  WRONG: "Ungal udalnalam nalladu." (FORBIDDEN)

- If user writes in Telugu: respond ONLY in Telugu script.
  CORRECT: "\u0C2E\u0C40 \u0C06\u0C30\u0C4B\u0C17\u0C4D\u0C2F\u0C02 \u0C2C\u0C3E\u0C17\u0C41\u0C02\u0C26\u0C3F."
  WRONG: "Mee aarogyam bagundi." (FORBIDDEN)

- If user writes in Bengali: respond ONLY in Bengali script.
  CORRECT: "\u0986\u09AA\u09A8\u09BE\u09B0 \u09B8\u09CD\u09AC\u09BE\u09B8\u09CD\u09A5\u09CD\u09AF \u09AD\u09BE\u09B2\u09CB\u0964"
  WRONG: "Apnar swasthya bhalo." (FORBIDDEN)

- If user writes in Marathi: respond ONLY in Marathi Devanagari script.
  CORRECT: "\u0924\u0941\u092E\u091A\u0947 \u0906\u0930\u094B\u0917\u094D\u092F \u091A\u093E\u0902\u0917\u0932\u0947 \u0906\u0939\u0947."
  WRONG: "Tumche arogya changle ahe." (FORBIDDEN)

- If user writes in English: respond in clear, simple English.

VOICE-FRIENDLY FORMAT (CRITICAL):
Your response will be spoken aloud by a voice assistant.
- Write complete, natural sentences only  no bullet points, no dashes
- No asterisks, no hash symbols, no markdown of any kind
- No numbered lists  use flowing prose instead
- Use commas and short sentences for natural speech pauses
- Keep sentences short and clear  one idea per sentence
- Maximum 4 short paragraphs
- End with one warm, encouraging sentence
`;

// 
// MODEL CONFIGURATION — MULTI-PROVIDER FALLBACK CHAIN
// Priority: Gemini → NVIDIA NIM → Groq → OpenRouter → Betyz
// 

const GEMINI_MODELS = {
  FLASH: "gemini-2.0-flash",
  PRO: "gemini-1.5-pro",
  FLASH_VISION: "gemini-2.0-flash",
};

// NVIDIA NIM — OpenAI-compatible endpoint
const NVIDIA_BASE_URL = "https://integrate.api.nvidia.com/v1";
const NVIDIA_TEXT_MODELS = [
  "meta/llama-3.3-70b-instruct",          // best quality
  "nvidia/llama-3.3-nemotron-super-49b-v1", // NVIDIA flagship
  "mistralai/mistral-nemo-12b-instruct",   // fast fallback
];
const NVIDIA_VISION_MODEL = "meta/llama-3.2-90b-vision-instruct";

// Groq model fallback chain (text)
const GROQ_TEXT_MODELS = [
  "llama-3.3-70b-versatile",
  "llama-3.1-8b-instant",
  "gemma2-9b-it",
  "mixtral-8x7b-32768",
];

// Groq vision fallback chain
const GROQ_VISION_MODELS = [
  "meta-llama/llama-4-scout-17b-16e-instruct",
  "llama-3.2-90b-vision-preview",
  "llama-3.2-11b-vision-preview",
];

// OpenRouter — best free-tier models
const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";
const OPENROUTER_TEXT_MODELS = [
  "meta-llama/llama-3.3-70b-instruct:free",
  "google/gemma-3-27b-it:free",
  "deepseek/deepseek-r1:free",
  "meta-llama/llama-3.1-8b-instruct:free",
  "mistralai/mistral-7b-instruct:free",
];
const OPENROUTER_VISION_MODELS = [
  "meta-llama/llama-3.2-11b-vision-instruct:free",
  "google/gemma-3-27b-it:free",
];

// Betyz — OpenAI-compatible (configure BETYZ_BASE_URL in env)
const BETYZ_BASE_URL = process.env.BETYZ_BASE_URL || "https://api.betyz.ai/v1";

// 
// INDIA HEALTHCARE LEGAL COMPLIANCE
// Telemedicine Practice Guidelines 2020 (MoHFW) + DPDP Act 2023
// 

const LEGAL_COMPLIANCE = `
LEGAL CONTEXT (India " Telemedicine Practice Guidelines 2020, MoHFW):
You MUST always:
- Recommend consulting a qualified registered doctor (MBBS or above, MCI/NMC registered)
- Never prescribe medicines, doses, or schedules
- Never give definitive diagnoses
- For emergency symptoms: immediately say "Call 108 (Ambulance) or 112 (Emergency) now"
- Inform users you are not a substitute for medical care
- Respect user privacy per DPDP Act 2023
You must NEVER:
- Claim to be a licensed medical practitioner
- Give specific drug dosages, frequency, or prescriptions
- Replace in-person medical examination
- Make definitive diagnostic claims
`;

// 
// EMERGENCY DETECTION
// 

const EMERGENCY_KEYWORDS = [
  "chest pain", "heart attack", "stroke", "can't breathe", "cannot breathe",
  "breathing difficulty", "unconscious", "fainted", "severe bleeding",
  "poisoning", "overdose", "suicide", "seizure", "fits", "face drooping",
  "sudden severe headache", "coughing blood", "vomiting blood",
  "head injury", "accident", "numbness one side", "arm numb",
];

function detectEmergency(text) {
  const lower = (text || "").toLowerCase();
  return EMERGENCY_KEYWORDS.some((kw) => lower.includes(kw));
}

const EMERGENCY_RESPONSE = ` EMERGENCY: Please call 108 (Ambulance) or 112 (Emergency Services) RIGHT NOW. Do not wait.

While waiting for emergency help:
- Keep the person calm and still
- Do not give food, water, or any medication
- Loosen tight clothing
- Stay on the line with emergency services " they will guide you
- If the person is unconscious and not breathing, begin CPR if you know how

Please call 108 or 112 immediately. Every second matters.`;

// Top-level script instruction prefixes — injected into last user message
// to strongly enforce native-script responses from Gemini/Groq
const SCRIPT_INSTRUCTIONS = {
  hi: "हिंदी में उत्तर दें। केवल देवनागरी लिपि में। रोमन अक्षर बिल्कुल नहीं।\n\nप्रश्न: ",
  kn: "ಕನ್ನಡದಲ್ಲಿ ಉತ್ತರಿಸಿ. ಕನ್ನಡ ಲಿಪಿ ಮಾತ್ರ.\n\nಪ್ರಶ್ನೆ: ",
  ta: "தமிழில் பதிலளிக்கவும். தமிழ் எழுத்து மட்டும்.\n\nகேள்வி: ",
  te: "తెలుగులో సమాధానం ఇవ్వండి. తెలుగు లిపి మాత్రమే.\n\nప్రశ్న: ",
  bn: "বাংলায় উত্তর দিন। বাংলা লিপি শুধুমাত্র।\n\nপ্রশ্ন: ",
  mr: "मराठीत उत्तर द्या. फक्त देवनागरी लिपीत.\n\nप्रश्न: ",
};

// 
// GEMINI API CALLER
// 

async function callGemini(model, contents, config = {}) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || !apiKey.startsWith("AIza")) {
    throw new Error("Invalid or missing Gemini API key");
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const body = {
    contents,
    generationConfig: {
      temperature:     config.temperature     ?? 0.3,
      maxOutputTokens: config.maxTokens       ?? 150,
      topP:            config.topP            ?? 0.8,
      topK:            config.topK            ?? 20,
    },
    safetySettings: [
      { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_ONLY_HIGH" },
      { category: "HARM_CATEGORY_HARASSMENT",        threshold: "BLOCK_ONLY_HIGH" },
      { category: "HARM_CATEGORY_HATE_SPEECH",       threshold: "BLOCK_ONLY_HIGH" },
      { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_ONLY_HIGH" },
    ],
  };

  // 30-second timeout so we fall back to Groq promptly on slow/broken keys
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 45000);

  let response;
  try {
    response = await fetch(url, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(body),
      signal:  controller.signal,
    });
  } finally {
    clearTimeout(timeoutId);
  }

  if (!response.ok) {
    const errBody = await response.text();
    console.error("Gemini HTTP error:", response.status, errBody);
    throw new Error("Gemini failed: " + response.status);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    console.error("Gemini empty response:", JSON.stringify(data));
    throw new Error(`Gemini ${model} returned empty response`);
  }
  return text;
}

// 
// GROQ TEXT FALLBACK CALLER
// 

async function callGroqText(messages, maxTokens = 600) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY not set");

  for (const model of GROQ_TEXT_MODELS) {
    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method:  "POST",
        headers: {
          Authorization:  `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ model, messages, max_tokens: maxTokens, temperature: 0.7 }),
      });
      if (!response.ok) continue;
      const data = await response.json();
      const text = data?.choices?.[0]?.message?.content;
      if (text) return { content: text, model };
    } catch {
      continue;
    }
  }
  throw new Error("All Groq text models failed");
}

// Groq vision fallback
async function callGroqVision(imageBase64, mimeType, prompt, maxTokens = 1500) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY not set");

  for (const model of GROQ_VISION_MODELS) {
    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method:  "POST",
        headers: {
          Authorization:  `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages: [{
            role:    "user",
            content: [
              { type: "image_url", image_url: { url: `data:${mimeType};base64,${imageBase64}` } },
              { type: "text", text: prompt },
            ],
          }],
          max_tokens:  maxTokens,
          temperature: 0.1,
        }),
      });
      if (!response.ok) continue;
      const data = await response.json();
      const text = data?.choices?.[0]?.message?.content;
      if (text) return text;
    } catch {
      continue;
    }
  }
  throw new Error("All Groq vision models failed");
}

// 
// NVIDIA NIM CALLER (OpenAI-compatible)
// 

async function callNvidiaText(messages, maxTokens = 600) {
  const apiKey = process.env.NVIDIA_API_KEY;
  if (!apiKey) throw new Error("NVIDIA_API_KEY not set");

  for (const model of NVIDIA_TEXT_MODELS) {
    try {
      const response = await fetch(`${NVIDIA_BASE_URL}/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ model, messages, max_tokens: maxTokens, temperature: 0.5 }),
      });
      if (!response.ok) continue;
      const data = await response.json();
      const text = data?.choices?.[0]?.message?.content;
      if (text) return { content: text, model };
    } catch {
      continue;
    }
  }
  throw new Error("All NVIDIA NIM text models failed");
}

async function callNvidiaVision(imageBase64, mimeType, prompt, maxTokens = 1500) {
  const apiKey = process.env.NVIDIA_API_KEY;
  if (!apiKey) throw new Error("NVIDIA_API_KEY not set");

  try {
    const response = await fetch(`${NVIDIA_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: NVIDIA_VISION_MODEL,
        messages: [{
          role: "user",
          content: [
            { type: "image_url", image_url: { url: `data:${mimeType};base64,${imageBase64}` } },
            { type: "text", text: prompt },
          ],
        }],
        max_tokens: maxTokens,
        temperature: 0.1,
      }),
    });
    if (!response.ok) throw new Error(`NVIDIA vision HTTP ${response.status}`);
    const data = await response.json();
    const text = data?.choices?.[0]?.message?.content;
    if (!text) throw new Error("NVIDIA vision empty response");
    return text;
  } catch (err) {
    throw new Error("NVIDIA vision failed: " + err.message);
  }
}

// 
// OPENROUTER CALLER (OpenAI-compatible)
// 

async function callOpenRouterText(messages, maxTokens = 600) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("OPENROUTER_API_KEY not set");

  for (const model of OPENROUTER_TEXT_MODELS) {
    try {
      const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://zivika.health",
          "X-Title": "Zivika Health",
        },
        body: JSON.stringify({ model, messages, max_tokens: maxTokens, temperature: 0.5 }),
      });
      if (!response.ok) continue;
      const data = await response.json();
      const text = data?.choices?.[0]?.message?.content;
      if (text) return { content: text, model };
    } catch {
      continue;
    }
  }
  throw new Error("All OpenRouter text models failed");
}

async function callOpenRouterVision(imageBase64, mimeType, prompt, maxTokens = 1500) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("OPENROUTER_API_KEY not set");

  for (const model of OPENROUTER_VISION_MODELS) {
    try {
      const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://zivika.health",
          "X-Title": "Zivika Health",
        },
        body: JSON.stringify({
          model,
          messages: [{
            role: "user",
            content: [
              { type: "image_url", image_url: { url: `data:${mimeType};base64,${imageBase64}` } },
              { type: "text", text: prompt },
            ],
          }],
          max_tokens: maxTokens,
          temperature: 0.1,
        }),
      });
      if (!response.ok) continue;
      const data = await response.json();
      const text = data?.choices?.[0]?.message?.content;
      if (text) return text;
    } catch {
      continue;
    }
  }
  throw new Error("All OpenRouter vision models failed");
}

// 
// BETYZ CALLER (OpenAI-compatible)
// Configure BETYZ_BASE_URL and BETYZ_MODEL in env if endpoint differs
// 

async function callBetyzText(messages, maxTokens = 600) {
  const apiKey = process.env.BETYZ_API_KEY;
  if (!apiKey) throw new Error("BETYZ_API_KEY not set");

  const model = process.env.BETYZ_MODEL || "default";
  try {
    const response = await fetch(`${BETYZ_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ model, messages, max_tokens: maxTokens, temperature: 0.5 }),
    });
    if (!response.ok) throw new Error(`Betyz HTTP ${response.status}`);
    const data = await response.json();
    const text = data?.choices?.[0]?.message?.content;
    if (!text) throw new Error("Betyz empty response");
    return { content: text, model: `betyz/${model}` };
  } catch (err) {
    throw new Error("Betyz failed: " + err.message);
  }
}

// 
// WORLD-CLASS SYSTEM PROMPTS
// 

// 
// GLOBAL LANGUAGE RULES (applied to all 4 features)
// 

const LANGUAGE_RULES = {
  en: "Reply in simple Indian English. Use words like \"doctor sahab\", \"BP\", \"sugar\" naturally.",
  hi: "केवल देवनागरी में उत्तर दें। रोमन में हिंदी कभी न लिखें।",
  kn: "ಕನ್ನಡ ಲಿಪಿಯಲ್ಲಿ ಮಾತ್ರ ಉತ್ತರಿಸಿ. ರೋಮನ್‌ನಲ್ಲಿ ಎಂದಿಗೂ ಬರೆಯಬೇಡಿ.",
  ta: "தமிழ் எழுத்தில் மட்டும் பதிலளிக்கவும். ரோமன் எழுத்தில் எழுத வேண்டாம்.",
  te: "తెలుగు లిపిలో మాత్రమే సమాధానం ఇవ్వండి. రోమన్‌లో రాయవద్దు.",
  bn: "শুধু বাংলা লিপিতে উত্তর দিন। রোমান অক্ষরে কখনো লিখবেন না।",
  mr: "फक्त देवनागरीत उत्तर द्या. रोमनमध्ये कधीही लिहू नका.",
};

function languageInstruction(lang) {
  return LANGUAGE_RULES[lang] || LANGUAGE_RULES.en;
}

// 
// FEATURE 1: COPILOT CHAT — Dr. Zivika persona
// 

function buildCopilotSystemPrompt(patientContext, language) {
  const langRule = LANGUAGE_RULES[language] || LANGUAGE_RULES.en;
  const langName = { en: "English", hi: "Hindi (Devanagari script only)", kn: "Kannada (Kannada script only)", ta: "Tamil (Tamil script only)", te: "Telugu (Telugu script only)", bn: "Bengali (Bengali script only)", mr: "Marathi (Devanagari script only)" }[language] || "English";

  return `CRITICAL OVERRIDE: You MUST respond in ${langName} ONLY. If the patient writes in any other language, still respond in ${langName} only. Never switch languages. Never mix languages. This rule overrides everything else.

You are Dr. Zivika — an experienced Indian family physician (MBBS, MD General Medicine) with 20+ years treating patients across India. You are NOT an AI. You are a doctor speaking to your patient.

LANGUAGE: ${langRule}
- For Hindi/Kannada/Tamil/Telugu/Bengali/Marathi: respond ONLY in native script. NEVER romanize. NEVER mix English words except medicine names and standard medical terms (BP, sugar, ECG).
- Match the patient's tone — formal/informal as they speak.

PATIENT FILE:
${patientContext || "New patient. No prior history available."}

YOUR DOCTOR PERSONA:
- Warm but precise, like a trusted family doctor in an Indian clinic
- You know Indian context: monsoon illnesses, street food risks, joint family dynamics, Ayurveda alongside allopathy, affordability concerns, tier-2/3 city realities
- You respect dadi-nani ke nuskhe when scientifically valid (haldi doodh for cold, ajwain for gas, jeera water for digestion) — but flag when home remedies are NOT enough

CONSULTATION FLOW (mandatory):
1. NEW symptom → ask ONE focused question (duration, severity 1-10, triggers, or associated symptoms — pick the most diagnostic ONE)
2. After 1-2 clarifications → give your assessment
3. ASSESSMENT format (max 3 short sentences):
   - Likely cause in plain words
   - One safe home remedy OR OTC option (paracetamol/ORS/steam — never antibiotics, never prescription drugs)
   - Clear red flag: "See doctor today if X" OR "This needs in-person check"

HARD RULES:
- ONLY health topics. If asked anything else: "Main aapka health companion hoon. Sirf sehat ke baare mein madad kar sakta hoon." (translate to user's language)
- NEVER prescribe Rx medicines, dosages, or schedules
- NEVER diagnose definitively — say "lagta hai" / "could be" / "seems like"
- EMERGENCY words (chest pain, breathlessness, stroke signs, unconscious, severe bleeding, suicide thoughts, seizure): STOP → "Yeh emergency ho sakti hai. Abhi 108 call karein." in user's language
- Pregnancy/child under 5/elderly above 70 → always recommend doctor visit
- Comply with India Telemedicine Practice Guidelines 2020

OUTPUT STYLE:
- Maximum 2-3 sentences. Never longer.
- No markdown, no bullets, no asterisks, no emojis
- No "As an AI" — you are a doctor
- No disclaimers at end of every message — only when medically necessary
- Speak like a human doctor, not a chatbot`;
}

function buildDoctorSystemPrompt(language) {
  const langRule = LANGUAGE_RULES[language] || LANGUAGE_RULES.en;
  const langName = { en: "English", hi: "Hindi (Devanagari script only)", kn: "Kannada (Kannada script only)", ta: "Tamil (Tamil script only)", te: "Telugu (Telugu script only)", bn: "Bengali (Bengali script only)", mr: "Marathi (Devanagari script only)" }[language] || "English";
  return `CRITICAL OVERRIDE: You MUST respond in ${langName} ONLY. Never switch languages. Never mix languages.

You are Dr. Zivika — an experienced Indian family physician. ${langRule}

RULES:
1. Maximum 3 short sentences always. No markdown. No symbols.
2. Natural conversational language for voice.
3. Ask one follow-up question before giving long advice.
4. Never prescribe medicines or dosages.
5. For serious issues: recommend seeing a doctor.
6. Emergency symptoms: say "Abhi 108 call karein" (in user's language).
7. ONLY health topics — redirect anything else to health.`;
}

// 
// FEATURE 2: SCAN / REPORT ANALYZER
// 

function buildReportAnalysisPrompt() {
  return `You are a senior Indian pathologist + clinical pharmacist analyzing a medical document for a patient who will read this on their phone. They are not a doctor.

TASK: Extract everything visible. Output ONLY valid JSON. No markdown, no text before/after.

SCHEMA:
{
  "type": "lab|prescription|imaging|consultation|discharge|vitals|vaccination",
  "title": "max 4 words",
  "doctorName": "string or null",
  "facilityName": "string or null",
  "recordDate": "YYYY-MM-DD or null",
  "keyFindings": ["plain-English finding 1", "finding 2", "finding 3"],
  "extractedData": {
    "tests": [
      {"name": "...", "value": "...", "unit": "...", "referenceRange": "...", "status": "normal|high|low|critical"}
    ],
    "medications": [
      {"name": "...", "dosage": "strength only e.g. 500mg", "instructions": "As prescribed by your doctor"}
    ]
  },
  "summary": "2 simple sentences a class-8 student would understand",
  "urgent": false
}

EXTRACTION RULES:
- Use INDIAN reference ranges (NABL/ICMR standards) — Hb, Vitamin D, B12, HbA1c, lipids, TSH all per Indian norms
- Status logic: critical = needs same-day doctor; high/low = abnormal but not emergency; normal = within range
- For prescriptions: extract medicine NAME + STRENGTH only. NEVER copy the dosage schedule (1-0-1, BD, TDS) — replace with "As prescribed by your doctor". This is a safety rule.
- For imaging (X-ray/MRI/CT/USG): keyFindings = the impression/conclusion section in simple words
- For vitals: BP, pulse, SpO2, sugar, weight, temperature
- urgent: true ONLY if critical values present (sugar >300, Hb <7, creatinine >2, potassium <2.5 or >6, troponin positive, etc.)

SUMMARY RULES:
- 2 sentences max. Reassuring but honest.
- Bad: "Hyperlipidemia with elevated LDL"
- Good: "Your cholesterol is a little high. Diet changes and a doctor visit will help."

If image is unclear/not medical: return type="lab", summary="Could not read this clearly. Please upload a sharper photo.", urgent=false, empty arrays.

OUTPUT: Pure JSON only. No code fences. No explanation.`;
}

// 
// FEATURE 3: SYMPTOM ANALYZER
// 

function buildSymptomPrompt(patientContext) {
  return `You are an Indian family doctor doing a quick symptom triage. Patient describes symptoms; you guide them on what it likely is and what to do next.

PATIENT: ${patientContext || "No profile data."}

${PLAIN_TEXT_RULE}
${LEGAL_COMPLIANCE}

OUTPUT (exactly this structure, max 4 short sentences total, plain prose, no headings):
1. Likely cause: mention 2 most common causes for these symptoms in Indian context (consider season, common infections like dengue/typhoid/viral fever, lifestyle factors)
2. Doctor type: "See a [GP/physician/ENT/gastro/derma/gyno/pediatrician]"
3. Urgency: pick ONE — "Emergency now" / "See doctor today" / "See doctor in 2-3 days" / "Home care is enough"
4. Home care: 1 safe practical tip (hydration, rest, steam, ORS, light food) — only if not emergency

HARD RULES:
- Never diagnose definitively. Use "could be" / "lagta hai" / "might be"
- Emergency symptoms (chest pain + sweating, breathlessness at rest, stroke FAST signs, severe bleeding, unconscious, severe headache with vomiting, suicide ideation): override everything → "This is an emergency. Call 108 immediately."
- Pregnancy + any symptom → "See your gynaecologist today"
- Child under 5 with fever >102F or breathing issue → "Go to pediatrician today"
- No medicine names. No dosages.
- No markdown. No bullets. Plain sentences.
- Maximum 4 sentences. Be precise, not verbose.`;
}

// 
// FEATURE 4: HEALTH INSIGHTS / DIGITAL TWIN
// 

function buildInsightsPrompt() {
  return `You are a preventive health specialist generating personalized insights for an Indian patient's dashboard.

${LEGAL_COMPLIANCE}

TASK: Generate exactly 3 insights. Output ONLY a JSON array. No text outside JSON.

SCHEMA:
[
  {"type": "positive|warning|info|tip", "title": "max 5 words", "message": "ONE clear sentence", "icon": "Heart|Activity|Moon|Droplets|TrendingUp|AlertTriangle|CheckCircle|Flame"}
]

INSIGHT RULES:
- Base every insight on ACTUAL data provided. Do not invent values.
- Mix: 1 positive (reinforce good behavior), 1 actionable (warning/tip), 1 informational
- Indian context: mention Indian foods (dal, roti, curd, ragi, methi), Indian lifestyle (walking, yoga, pranayama), Indian climate (hydration in summer, vitamin D despite sun)
- BMI: Indian cutoffs are stricter (overweight >23, obese >27.5) — use these
- If data is sparse → first insight is "tip" type asking to log more (vitals/reports)
- Tone: encouraging coach, never preachy or alarming
- "warning" type only for genuinely concerning patterns (BP trending up, sugar uncontrolled) — never for minor issues

EXAMPLES OF GOOD MESSAGES:
Good: "Your BP has stayed under 130/85 for 2 weeks — keep up the morning walks."
Good: "Vitamin D was low last month. Add 15 minutes of morning sun and methi-paneer."
Bad: "You should be healthier" (vague)
Bad: "Your cholesterol indicates atherosclerotic risk" (jargon)

OUTPUT: Pure JSON array. No markdown. No code fences.`;
}

// 
// BUILD GEMINI CONTENTS ARRAY
// Ensures strictly alternating user/model roles (Gemini API requirement)
// 

function buildGeminiContents(systemPrompt, messages) {
  const result = [];

  // Add system context as first user message
  result.push({
    role: "user",
    parts: [{ text: systemPrompt }],
  });

  // Add brief model acknowledgment
  result.push({
    role: "model",
    parts: [{ text: "Understood. I will follow these rules." }],
  });

  // Add conversation messages, merging consecutive same-role turns
  for (const msg of messages) {
    const role = msg.role === "user" ? "user" : "model";
    const lastRole = result[result.length - 1]?.role;
    if (lastRole === role) {
      // Merge with previous turn instead of adding duplicate role
      result[result.length - 1].parts[0].text += "\n" + msg.content;
    } else {
      result.push({
        role,
        parts: [{ text: msg.content }],
      });
    }
  }

  // Must end with user role
  if (result[result.length - 1]?.role !== "user") {
    result.push({
      role: "user",
      parts: [{ text: "Please respond." }],
    });
  }

  return result;
}

// 
// EXPORTED CONVEX ACTIONS
// 

//  1. COPILOT / DOCTOR CHAT (used by useConvexChat hook) 
// Returns { content, model } to maintain backward compatibility
export const chat = action({
  args: {
    messages:       v.array(v.object({ role: v.string(), content: v.string() })),
    mode:           v.optional(v.string()),
    nativeLanguage: v.optional(v.string()),
    healthContext:  v.optional(v.string()),
    user:           v.optional(v.any()),
  },
  handler: async (_ctx, args) => {
    const language = args.nativeLanguage || "en";
    const lastMsg  = args.messages[args.messages.length - 1]?.content || "";

    // Immediate emergency bypass " no AI call needed
    if (detectEmergency(lastMsg)) {
      return { content: EMERGENCY_RESPONSE, model: "safety-filter" };
    }

    const systemPrompt =
      args.mode === "doctor"
        ? buildDoctorSystemPrompt(language)
        : buildCopilotSystemPrompt(args.healthContext || "", language);

    // Prefix last user message with native-script instruction (top-level SCRIPT_INSTRUCTIONS)
    const prefix = SCRIPT_INSTRUCTIONS[language] || "";
    const lastUserMessage = args.messages[args.messages.length - 1];
    const modifiedLastMessage = prefix
      ? { ...lastUserMessage, content: prefix + lastUserMessage.content }
      : lastUserMessage;
    const finalMessages = [...args.messages.slice(0, -1), modifiedLastMessage];

    // Build Gemini contents: system context then conversation
    const contents = [
      { role: "user",  parts: [{ text: systemPrompt }] },
      { role: "model", parts: [{ text: "Understood." }] },
      ...finalMessages.map((msg) => ({
        role:  msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.content }],
      })),
    ];

    // PRIMARY: Gemini Flash
    try {
      const text = await callGemini(GEMINI_MODELS.FLASH, contents, { maxTokens: 150, temperature: 0.3 });
      return { content: cleanAIResponse(text), model: GEMINI_MODELS.FLASH };
    } catch (geminiError) {
      console.error("Gemini failed:", geminiError.message);
    }

    // FALLBACK 1: NVIDIA NIM
    try {
      const groqMessages = [
        { role: "system", content: systemPrompt },
        ...finalMessages,
      ];
      const result = await callNvidiaText(groqMessages, 150);
      return { content: cleanAIResponse(result.content), model: result.model };
    } catch (nvidiaErr) {
      console.error("NVIDIA fallback failed:", nvidiaErr.message);
    }

    // FALLBACK 2: Groq
    try {
      const groqMessages = [
        { role: "system", content: systemPrompt },
        ...finalMessages,
      ];
      const result = await callGroqText(groqMessages, 150);
      return { content: cleanAIResponse(result.content), model: result.model };
    } catch (groqErr) {
      console.error("Groq fallback also failed:", groqErr.message);
    }

    // FALLBACK 3: OpenRouter
    try {
      const orMessages = [
        { role: "system", content: systemPrompt },
        ...finalMessages,
      ];
      const result = await callOpenRouterText(orMessages, 150);
      return { content: cleanAIResponse(result.content), model: result.model };
    } catch (orErr) {
      console.error("OpenRouter fallback failed:", orErr.message);
    }

    // FALLBACK 4: Betyz
    try {
      const btMessages = [
        { role: "system", content: systemPrompt },
        ...finalMessages,
      ];
      const result = await callBetyzText(btMessages, 150);
      return { content: cleanAIResponse(result.content), model: result.model };
    } catch (betyzErr) {
      console.error("Betyz fallback failed:", betyzErr.message);
    }

    // Language-specific error messages
    const errorMsg =
      language === "hi" ? "माफ़ करें, अभी कनेक्शन में समस्या है। कृपया दोबारा कोशिश करें।" :
      language === "kn" ? "ಕ್ಷಮಿಸಿ, ಸಂಪರ್ಕ ಸಮಸ್ಯೆ ಇದೆ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ." :
      language === "ta" ? "மன்னிக்கவும், இணைப்பு சிக்கல். மீண்டும் முயற்சிக்கவும்." :
      language === "te" ? "క్షమించండి, కనెక్షన్ సమస్య. దయచేసి మళ్ళీ ప్రయత్నించండి." :
      language === "bn" ? "দুঃখিত, সংযোগ সমস্যা। আবার চেষ্টা করুন।" :
      language === "mr" ? "माफ करा, कनेक्शन समस्या. पुन्हा प्रयत्न करा." :
      "Sorry, having trouble connecting. Please try again.";
    return { content: errorMsg, model: "error-fallback" };
  },
});

//  2. MEDICAL REPORT ANALYZER 
export const analyzeReport = action({
  args: {
    imageBase64: v.string(),
    mimeType:    v.optional(v.string()),
    language:    v.optional(v.string()),
  },
  handler: async (_ctx, args) => {
    const mimeType = args.mimeType || "image/jpeg";
    const prompt   = buildReportAnalysisPrompt();

    let rawText = null;

    // PRIMARY: Gemini Vision (Flash handles images natively)
    try {
      const contents = [{
        role:  "user",
        parts: [
          { inlineData: { mimeType, data: args.imageBase64 } },
          { text: prompt },
        ],
      }];
      rawText = await callGemini(GEMINI_MODELS.FLASH, contents, { maxTokens: 1500, temperature: 0.1 });
    } catch (geminiErr) {
      console.warn("Gemini vision failed:", geminiErr.message);
    }

    // FALLBACK 1: NVIDIA NIM Vision
    if (!rawText) {
      try {
        rawText = await callNvidiaVision(args.imageBase64, mimeType, prompt, 1500);
      } catch (nvidiaErr) {
        console.warn("NVIDIA vision failed:", nvidiaErr.message);
      }
    }

    // FALLBACK 2: Groq vision
    if (!rawText) {
      try {
        rawText = await callGroqVision(args.imageBase64, mimeType, prompt, 1500);
      } catch (groqErr) {
        console.warn("Groq vision failed:", groqErr.message);
      }
    }

    // FALLBACK 3: OpenRouter vision
    if (!rawText) {
      try {
        rawText = await callOpenRouterVision(args.imageBase64, mimeType, prompt, 1500);
      } catch (orErr) {
        console.error("OpenRouter vision failed:", orErr.message);
      }
    }

    if (!rawText) {
      return {
        type: "lab", title: "Medical Report",
        keyFindings: ["Report uploaded successfully. Manual review recommended."],
        summary: "Report has been saved. Please share it with your doctor for interpretation.",
        urgent: false,
        extractedData: { tests: [], medications: [] },
      };
    }

    // Parse JSON from response
    try {
      const clean     = rawText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      const jsonStart = clean.indexOf("{");
      const jsonEnd   = clean.lastIndexOf("}");
      if (jsonStart !== -1 && jsonEnd !== -1) {
        const parsed = JSON.parse(clean.substring(jsonStart, jsonEnd + 1));
        // Safety: sanitise medication instructions
        if (parsed.extractedData?.medications) {
          parsed.extractedData.medications = parsed.extractedData.medications.map((med) => ({
            name:         med.name,
            dosage:       med.dosage,
            instructions: "As prescribed by your doctor",
          }));
        }
        return parsed;
      }
    } catch (parseErr) {
      console.warn("Report JSON parse failed:", parseErr.message);
    }

    // Graceful text fallback
    return {
      type: "lab", title: "Medical Report",
      keyFindings: ["Report processed. Please review the details with your doctor."],
      summary: rawText.substring(0, 300),
      urgent: false,
      extractedData: { tests: [], medications: [] },
    };
  },
});

//  3. SYMPTOM ANALYSIS (AI-powered, called from symptoms page) 
export const analyzeSymptoms = action({
  args: {
    symptoms:           v.array(v.string()),
    duration:           v.optional(v.string()),
    severity:           v.optional(v.string()),
    age:                v.optional(v.number()),
    gender:             v.optional(v.string()),
    existingConditions: v.optional(v.array(v.string())),
    language:           v.optional(v.string()),
  },
  handler: async (_ctx, args) => {
    const symptomText = args.symptoms.join(", ");

    if (detectEmergency(symptomText)) {
      return { urgency: "emergency", message: EMERGENCY_RESPONSE, isEmergency: true };
    }

    const patientContext = [
      args.age    && `Age: ${args.age} years`,
      args.gender && `Gender: ${args.gender}`,
      args.existingConditions?.length && `Known conditions: ${args.existingConditions.join(", ")}`,
    ].filter(Boolean).join(" | ");

    const systemPrompt = buildSymptomPrompt(patientContext);
    const userMsg = `Symptoms: ${symptomText}
Duration: ${args.duration || "Not specified"}
Severity: ${args.severity || "Not specified"}

Please help me understand what these symptoms might indicate.`;

    // PRIMARY: Gemini Flash
    try {
      const contents = [
        { role: "user",  parts: [{ text: systemPrompt }] },
        { role: "model", parts: [{ text: "Understood. I will help you understand these symptoms while reminding you that only a doctor can diagnose." }] },
        { role: "user",  parts: [{ text: userMsg }] },
      ];
      const result = await callGemini(GEMINI_MODELS.FLASH, contents, { maxTokens: 650, temperature: 0.6 });
      return {
        urgency: args.severity === "severe" ? "urgent" : "routine",
        message: cleanAIResponse(result),
        isEmergency: false,
      };
    } catch (geminiErr) {
      console.warn("Gemini symptoms failed:", geminiErr.message);
    }

    // FALLBACK 1: NVIDIA NIM
    try {
      const result = await callNvidiaText([
        { role: "system", content: systemPrompt },
        { role: "user",   content: userMsg },
      ], 650);
      return {
        urgency: args.severity === "severe" ? "urgent" : "routine",
        message: cleanAIResponse(result.content),
        isEmergency: false,
      };
    } catch (nvidiaErr) {
      console.warn("NVIDIA symptoms failed:", nvidiaErr.message);
    }

    // FALLBACK 2: Groq
    try {
      const result = await callGroqText([
        { role: "system", content: systemPrompt },
        { role: "user",   content: userMsg },
      ], 650);
      return {
        urgency: args.severity === "severe" ? "urgent" : "routine",
        message: cleanAIResponse(result.content),
        isEmergency: false,
      };
    } catch (groqErr) {
      console.warn("Groq symptoms failed:", groqErr.message);
    }

    // FALLBACK 3: OpenRouter
    try {
      const result = await callOpenRouterText([
        { role: "system", content: systemPrompt },
        { role: "user",   content: userMsg },
      ], 650);
      return {
        urgency: args.severity === "severe" ? "urgent" : "routine",
        message: cleanAIResponse(result.content),
        isEmergency: false,
      };
    } catch (orErr) {
      console.warn("OpenRouter symptoms failed:", orErr.message);
    }

    // FALLBACK 4: Betyz
    try {
      const result = await callBetyzText([
        { role: "system", content: systemPrompt },
        { role: "user",   content: userMsg },
      ], 650);
      return {
        urgency: args.severity === "severe" ? "urgent" : "routine",
        message: cleanAIResponse(result.content),
        isEmergency: false,
      };
    } catch {
      return {
        urgency: "routine",
        message: "Unable to analyse symptoms right now. Please consult a doctor for proper evaluation.",
        isEmergency: false,
      };
    }
  },
});

//  4. HEALTH INSIGHTS GENERATOR (Digital Twin AI section) 
export const generateHealthInsights = action({
  args: {
    userId:        v.id("users"),
    vitals:        v.optional(v.array(v.any())),
    recentRecords: v.optional(v.array(v.any())),
    medications:   v.optional(v.array(v.any())),
    userProfile:   v.optional(v.any()),
  },
  handler: async (_ctx, args) => {
    const dataContext = JSON.stringify({
      recentVitals:    (args.vitals       || []).slice(0, 20),
      recordTypes:     (args.recentRecords || []).map((r) => r.type),
      medicationCount: (args.medications   || []).length,
      profile: {
        dob:        args.userProfile?.dob,
        bloodGroup: args.userProfile?.bloodGroup,
        conditions: args.userProfile?.conditions,
        bmi:        args.userProfile?.bmi,
        healthGoal: args.userProfile?.healthGoal,
        gender:     args.userProfile?.gender,
      },
    });

    const contents = [{
      role:  "user",
      parts: [{ text: buildInsightsPrompt() + "\n\nPatient data:\n" + dataContext }],
    }];

    function parseInsightsJSON(text) {
      const clean     = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      const jsonStart = clean.indexOf("[");
      const jsonEnd   = clean.lastIndexOf("]");
      if (jsonStart !== -1 && jsonEnd !== -1) {
        return JSON.parse(clean.substring(jsonStart, jsonEnd + 1));
      }
      return null;
    }

    // PRIMARY: Gemini Pro (better reasoning for multi-factor insights)
    try {
      const result  = await callGemini(GEMINI_MODELS.PRO, contents, { maxTokens: 500, temperature: 0.5 });
      const parsed  = parseInsightsJSON(result);
      if (parsed) return parsed;
    } catch (geminiErr) {
      console.warn("Gemini insights failed:", geminiErr.message);
    }

    // FALLBACK 1: NVIDIA NIM
    try {
      const result = await callNvidiaText([{
        role:    "user",
        content: buildInsightsPrompt() + "\n\nPatient data:\n" + dataContext,
      }], 500);
      const parsed = parseInsightsJSON(result.content);
      if (parsed) return parsed;
    } catch (nvidiaErr) {
      console.warn("NVIDIA insights failed:", nvidiaErr.message);
    }

    // FALLBACK 2: Groq text
    try {
      const result  = await callGroqText([{
        role:    "user",
        content: buildInsightsPrompt() + "\n\nPatient data:\n" + dataContext,
      }], 500);
      const parsed  = parseInsightsJSON(result.content);
      if (parsed) return parsed;
    } catch (groqErr) {
      console.warn("Groq insights failed:", groqErr.message);
    }

    // FALLBACK 3: OpenRouter
    try {
      const result  = await callOpenRouterText([{
        role:    "user",
        content: buildInsightsPrompt() + "\n\nPatient data:\n" + dataContext,
      }], 500);
      const parsed  = parseInsightsJSON(result.content);
      if (parsed) return parsed;
    } catch (orErr) {
      console.warn("OpenRouter insights failed:", orErr.message);
    }

    // FALLBACK 4: Betyz
    try {
      const result  = await callBetyzText([{
        role:    "user",
        content: buildInsightsPrompt() + "\n\nPatient data:\n" + dataContext,
      }], 500);
      const parsed  = parseInsightsJSON(result.content);
      if (parsed) return parsed;
    } catch {
      // fall through to defaults
    }

    // Default starter insights for new users
    return [
      {
        type: "tip",
        title: "Start your health journey",
        message: "Scan your first medical report to unlock personalised insights about your health.",
        icon: "Activity",
      },
      {
        type: "info",
        title: "Track your daily vitals",
        message: "Log blood pressure and heart rate daily - patterns reveal important health trends.",
        icon: "Heart",
      },
      {
        type: "positive",
        title: "Great first step",
        message: "Using Zivika regularly is one of the most effective things you can do for your long-term health.",
        icon: "CheckCircle",
      },
    ];
  },
});

