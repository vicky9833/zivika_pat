/*
GEMINI USAGE OPTIMIZATION:
- Flash model (gemini-2.0-flash): copilot chat, symptoms, report scan
  ~$0.000075 per 1K input tokens = very cheap
- Pro model (gemini-1.5-pro): health insights, deep analysis
  ~$0.00125 per 1K input tokens = moderate
- Vision (gemini-2.0-flash): same Flash model handles images

With â‚¹22,000 Gemini credits:
- ~1 million copilot responses (Flash)
- ~200,000 report scans
- Enough for a strong beta with thousands of users

MONITOR USAGE: console.cloud.google.com/apis/api/generativelanguage
*/

"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";

// ── Clean AI response text before returning to client ─────────────────────
// Fixes mojibake (garbled Unicode) and strips markdown symbols.
function cleanAIResponse(text) {
  if (!text) return text;
  return text
    // Fix broken Unicode arrows and symbols (UTF-8 mojibake)
    .replace(/â†'/g, '→')
    .replace(/â€™/g, "'")
    .replace(/â€œ/g, '"')
    .replace(/â€/g, '"')
    .replace(/â€"/g, '—')
    .replace(/â€˜/g, "'")
    .replace(/Ã©/g, 'é')
    .replace(/âš /g, '⚠')
    // Remove markdown bold/italic (keep content)
    .replace(/\*{1,3}(.*?)\*{1,3}/g, '$1')
    .replace(/_{1,2}(.*?)_{1,2}/g, '$1')
    // Remove markdown headers
    .replace(/#{1,6}\s+/g, '')
    // Remove inline code and code blocks
    .replace(/`{1,3}([\s\S]*?)`{1,3}/g, '$1')
    // Remove markdown links [text](url) → text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Remove bullet/number list prefixes (voice doesn't need them)
    .replace(/^[-•·]\s+/gm, '')
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
Never use ** for bold — write naturally.
Write as if speaking to a person in a conversation.
`;

// Language detection + voice-friendly output rules injected into copilot/doctor prompts
const LANGUAGE_AND_VOICE_RULES = `
LANGUAGE DETECTION RULE (CRITICAL):
Detect the language from the user's latest message.
If they write in Hindi — respond entirely in Hindi (Devanagari script).
If they write in Kannada — respond entirely in Kannada.
If they write in Tamil — respond entirely in Tamil.
If they write in Telugu — respond entirely in Telugu.
If they write in Bengali — respond entirely in Bengali.
If they write in Marathi — respond entirely in Marathi.
If they write in English — respond in clear, simple English.
Always match the user's language exactly. Never mix languages unless the user does.
Use respectful forms: use 'Aap' in Hindi (not 'Tum' or 'Tu').

VOICE-FRIENDLY FORMAT (CRITICAL):
Your response will be spoken aloud by a voice assistant to the user.
- Write complete, natural sentences only — no bullet points, no dashes
- No asterisks, no hash symbols, no markdown of any kind
- No numbered lists — use flowing prose instead
- Use commas and short sentences for natural speech pauses
- Keep sentences short and clear — one idea per sentence
- Maximum 4 short paragraphs
- End with one warm, encouraging sentence
- For Indian languages: spell out numbers as words (e.g. teen sau for 300, not 300)
`;

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// GEMINI MODEL CONFIGURATION
// Primary AI: Google Gemini 2.0 Flash / 1.5 Pro
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

const GEMINI_MODELS = {
  FLASH: "gemini-2.0-flash",  // Fast & cheap: copilot, symptoms, report scan
  PRO:   "gemini-1.5-pro",    // Deep reasoning: health insights, twin
  VISION: "gemini-2.0-flash", // Vision tasks: same model handles images
};

// Groq model fallback chain (text)
const GROQ_TEXT_MODELS = [
  "llama-3.1-8b-instant",
  "llama-3.3-70b-versatile",
  "gemma2-9b-it",
  "mixtral-8x7b-32768",
];

// Groq vision fallback chain
const GROQ_VISION_MODELS = [
  "meta-llama/llama-4-scout-17b-16e-instruct",
  "llama-3.2-90b-vision-preview",
  "llama-3.2-11b-vision-preview",
];

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// INDIA HEALTHCARE LEGAL COMPLIANCE
// Telemedicine Practice Guidelines 2020 (MoHFW) + DPDP Act 2023
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

const LEGAL_COMPLIANCE = `
LEGAL CONTEXT (India â€” Telemedicine Practice Guidelines 2020, MoHFW):
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

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// EMERGENCY DETECTION
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

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

const EMERGENCY_RESPONSE = `âš ï¸ EMERGENCY: Please call 108 (Ambulance) or 112 (Emergency Services) RIGHT NOW. Do not wait.

While waiting for emergency help:
- Keep the person calm and still
- Do not give food, water, or any medication
- Loosen tight clothing
- Stay on the line with emergency services â€” they will guide you
- If the person is unconscious and not breathing, begin CPR if you know how

Please call 108 or 112 immediately. Every second matters.`;

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// GEMINI API CALLER
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

async function callGemini(model, contents, config = {}) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY not set in Convex environment");

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const body = {
    contents,
    generationConfig: {
      temperature:     config.temperature     ?? 0.7,
      maxOutputTokens: config.maxTokens       ?? 800,
      topP:            0.9,
      topK:            40,
    },
    safetySettings: [
      { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
      { category: "HARM_CATEGORY_HARASSMENT",        threshold: "BLOCK_MEDIUM_AND_ABOVE" },
    ],
  };

  // 30-second timeout so we fall back to Groq promptly on slow/broken keys
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

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
    const err = await response.text();
    throw new Error(`Gemini ${model} HTTP ${response.status}: ${err.substring(0, 200)}`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error(`Gemini ${model} returned empty response`);
  return text;
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// GROQ TEXT FALLBACK CALLER
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

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

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// WORLD-CLASS SYSTEM PROMPTS
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

function languageInstruction(lang) {
  return {
    hi: "Respond in simple, conversational Hindi (à¤¹à¤¿à¤‚à¤¦à¥€). Use English only for medical/test names.",
    kn: "Respond in simple Kannada (à²•à²¨à³à²¨à²¡). Use English only for medical/test names.",
    ta: "Respond in simple Tamil (à®¤à®®à®¿à®´à¯). Use English only for medical/test names.",
    te: "Respond in simple Telugu (à°¤à±†à°²à±à°—à±). Use English only for medical/test names.",
    bn: "Respond in simple Bengali (à¦¬à¦¾à¦‚à¦²à¦¾). Use English only for medical/test names.",
    mr: "Respond in simple Marathi (à¤®à¤°à¤¾à¤ à¥€). Use English only for medical/test names.",
    en: "Respond in clear, simple English suitable for an educated Indian user.",
  }[lang] || "Respond in clear, simple English.";
}

function buildCopilotPrompt(patientContext, language) {
  return `You are Zivika â€” a personal health companion built for Indian users.
You are NOT a doctor. You are a trusted, knowledgeable health guide.
${PLAIN_TEXT_RULE}${LANGUAGE_AND_VOICE_RULES}${LEGAL_COMPLIANCE}

PATIENT CONTEXT:
${patientContext || "New user â€” no health data available yet."}

YOUR PERSONALITY & KNOWLEDGE:
- Warm and caring, like a trusted friend who deeply understands health
- Understands Indian context: joint families, Indian dietary habits (dal, roti, rice, ghee, spices), festivals, climate, work stress
- Knows common Indian health conditions: Type 2 diabetes, hypertension, thyroid disorders, PCOD/PCOS, anaemia, vitamin D/B12 deficiency, fatty liver
- Understands Indian lab test naming conventions and reference ranges
- Aware of both allopathic and Ayurvedic approaches (can explain, never prescribe)

RESPONSE STYLE:
- CONCISE: answer exactly what was asked
- Maximum 3-4 short paragraphs unless the user requests detail
- Use simple language â€” avoid complex medical jargon
- Format: brief empathetic acknowledgment â†’ clear answer â†’ next step if needed
- Use bullet points only when listing multiple items
- End health-sensitive questions with a gentle reminder to consult their doctor

CAPABILITIES:
- Explain what lab results mean in plain language
- Explain what a medicine does (NOT dosage, frequency, or schedule)
- Explain health conditions in simple terms
- Suggest healthy lifestyle habits relevant to India
- Help understand health records and reports
- Answer questions about diet, exercise, sleep, and stress management
- Explain what symptoms might indicate (never diagnose)

STRICT LIMITS:
- Never prescribe any medicine, dose, or schedule
- Never give a definitive diagnosis ("you have X")
- Never advise stopping a doctor-prescribed medicine

EMERGENCY RULE: If the user's message contains any emergency symptom, start your entire response with:
"âš ï¸ EMERGENCY: Please call 108 (Ambulance) or 112 right now. Do not wait."

${languageInstruction(language)}`;
}

function buildDoctorPrompt(language) {
  return `You are Zivika Health Assistant â€” a knowledgeable AI health guide for Indian users.
You help people understand health. You are NOT a doctor and do not replace one.
${PLAIN_TEXT_RULE}${LANGUAGE_AND_VOICE_RULES}${LEGAL_COMPLIANCE}

YOUR DEEP EXPERTISE:
- Common Indian conditions: Type 2 diabetes, hypertension, thyroid (hypothyroid/hyperthyroid), PCOD/PCOS, anaemia (iron/B12/folate), vitamin D deficiency, fatty liver (NAFLD), kidney stones, dengue, typhoid, gastritis, IBS, obesity
- Indian diet & health impact: dal, roti, rice, ghee, street food, seasonal produce, fasting practices
- Climate-related health: monsoon infections, summer heat stroke, winter respiratory issues, AQI impact in Indian cities
- Common Indian lab tests: CBC, ESR, CRP, LFT, KFT, thyroid profile (T3/T4/TSH), HbA1c, fasting glucose, PPBS, lipid profile, serum ferritin, vitamin D3, B12, urine R/E
- Indian reference ranges (some differ from Western standards)
- India healthcare navigation: specialist types, government vs private, health insurance basics

RESPONSE FORMAT:
Answer the specific question. Structure: What it is â†’ Why it matters â†’ What to watch for â†’ When to see a doctor.
Keep it warm and conversational. Never more than what the person needs.

NEVER: Prescribe medicines or dosages. Say "you have [disease]" definitively. Cause unnecessary panic.
ALWAYS for emergencies: Direct to 108/112 immediately.

${languageInstruction(language)}`;
}

function buildReportAnalysisPrompt() {
  return `You are a medical document AI for Zivika Labs, an Indian health management platform.

Analyze the medical document image. Extract all information accurately.

RULES:
- Extract all test names, values, units, and reference ranges shown
- Identify abnormal values (outside reference range): mark status as "high", "low", or "critical"
- Use Indian lab reference ranges where applicable (they differ from Western standards)
- Write a 2-sentence summary any patient can understand â€” avoid jargon
- Mark urgent=true only for critically abnormal or dangerous values
- For prescriptions: extract medicine name and strength ONLY â€” never include dose schedule

OUTPUT: Respond with ONLY valid JSON. No markdown. No explanation. Pure JSON only.

{
  "type": "lab|prescription|imaging|consultation|discharge|vitals|vaccination",
  "title": "concise report name",
  "doctorName": "name or null",
  "facilityName": "hospital/lab name or null",
  "recordDate": "YYYY-MM-DD or null",
  "keyFindings": ["Finding 1 in plain English", "Finding 2 in plain English"],
  "extractedData": {
    "tests": [
      {
        "name": "test name",
        "value": "numeric value as string",
        "unit": "unit string",
        "referenceRange": "reference range string",
        "status": "normal|high|low|critical"
      }
    ],
    "medications": [
      {
        "name": "medicine name",
        "dosage": "strength only e.g. 500mg",
        "instructions": "As prescribed by your doctor"
      }
    ]
  },
  "summary": "Two sentences in simple language any patient can understand.",
  "urgent": false
}`;
}

function buildSymptomPrompt(patientContext) {
  return `You are Zivika's symptom understanding guide for Indian users.
You help people understand what their symptoms might indicate. You do NOT diagnose.

${PLAIN_TEXT_RULE}
${LEGAL_COMPLIANCE}

PATIENT CONTEXT:
${patientContext || "No patient data available."}

YOUR EXPERTISE:
Prioritise Indian-prevalent conditions: dengue, typhoid, viral fever, malaria, UTI, gastritis, acidity, IBS, anaemia, vitamin D/B12 deficiency, PCOD, diabetes complications, hypertension, respiratory infections.

YOUR TASK:
Based on the symptoms provided, explain:
1. What conditions are commonly associated with these symptoms (say "commonly associated with" NOT "you have")
2. Most important red flag symptoms to watch for
3. What type of doctor to see (GP or specialist type)
4. Urgency level: Emergency / Urgent (today) / Soon (this week) / Routine

RESPONSE STRUCTURE:
- Brief acknowledgment (1 line)
- 2-3 most likely associations
- Red flags to watch (bullet list, max 3)
- Doctor to see + urgency
- Simple home care tip while waiting (if safe to do so)
- Gentle reminder: only a doctor can diagnose

Keep it to 4 short paragraphs maximum. Be warm, not alarming.`;
}

function buildInsightsPrompt() {
  return `You are Zivika's health insights engine for Indian users.
Analyse the patient data and generate exactly 3 personalised health insights.

${LEGAL_COMPLIANCE}

EACH INSIGHT MUST BE:
1. Based ONLY on the data provided â€” no fabrication
2. Actionable and specific to the data
3. Written in simple language (not medical jargon)
4. Constructive and encouraging in tone â€” never alarming
5. Relevant to Indian health context where applicable

ICON OPTIONS: Heart | Activity | Moon | Droplets | TrendingUp | AlertTriangle | CheckCircle | Flame | Stethoscope

OUTPUT: Respond with ONLY a JSON array. No markdown. No explanation. Pure JSON array.

[
  {
    "type": "positive|warning|info|tip",
    "title": "max 6 words",
    "message": "one clear actionable sentence",
    "icon": "one of the icon options above"
  }
]

If there is insufficient data, return 3 insights that encourage the user to add more health data. Always be warm and encouraging.`;
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// EXPORTED CONVEX ACTIONS
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

// â”€â”€ 1. COPILOT / DOCTOR CHAT (used by useConvexChat hook) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Returns { content, model } to maintain backward compatibility
export const chat = action({
  args: {
    messages:      v.array(v.object({ role: v.string(), content: v.string() })),
    mode:          v.string(),
    language:      v.optional(v.string()),
    healthContext: v.optional(v.string()),
    user:          v.optional(v.any()),
  },
  handler: async (_ctx, args) => {
    const language = args.language || "en";
    const lastMsg  = args.messages[args.messages.length - 1]?.content || "";

    // Immediate emergency bypass â€” no AI call needed
    if (detectEmergency(lastMsg)) {
      return { content: EMERGENCY_RESPONSE, model: "safety-filter" };
    }

    const systemPrompt =
      args.mode === "doctor"
        ? buildDoctorPrompt(language)
        : buildCopilotPrompt(args.healthContext || "", language);

    // Build Gemini multi-turn contents
    const contents = [
      { role: "user",  parts: [{ text: systemPrompt + "\n\n---\nConversation:" }] },
      { role: "model", parts: [{ text: "Understood. I'm ready to help as Zivika." }] },
      ...args.messages.map((m) => ({
        role:  m.role === "user" ? "user" : "model",
        parts: [{ text: m.content }],
      })),
    ];

    const maxTokens = args.messages.length > 8 ? 500 : 700;

    // PRIMARY: Gemini Flash
    try {
      const text = await callGemini(GEMINI_MODELS.FLASH, contents, { maxTokens, temperature: 0.75 });
      return { content: cleanAIResponse(text), model: GEMINI_MODELS.FLASH };
    } catch (geminiErr) {
      console.warn("Gemini chat failed, falling back to Groq:", geminiErr.message);
    }

    // FALLBACK: Groq
    try {
      const groqMessages = [
        { role: "system", content: systemPrompt },
        ...args.messages,
      ];
      const result = await callGroqText(groqMessages, maxTokens);
      return { content: cleanAIResponse(result.content), model: result.model };
    } catch (groqErr) {
      console.error("All AI models failed for chat:", groqErr.message);
      return {
        content: "I'm having trouble connecting right now. Please try again in a moment. If this is urgent, please consult your doctor directly.",
        model:   "error-fallback",
      };
    }
  },
});

// â”€â”€ 2. MEDICAL REPORT ANALYZER â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

      // FALLBACK: Groq vision
      try {
        rawText = await callGroqVision(args.imageBase64, mimeType, prompt, 1500);
      } catch (groqErr) {
        console.error("Both vision models failed:", groqErr.message);
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

// â”€â”€ 3. SYMPTOM ANALYSIS (AI-powered, called from symptoms page) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

    // FALLBACK: Groq
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
    } catch {
      return {
        urgency: "routine",
        message: "Unable to analyse symptoms right now. Please consult a doctor for proper evaluation.",
        isEmergency: false,
      };
    }
  },
});

// â”€â”€ 4. HEALTH INSIGHTS GENERATOR (Digital Twin AI section) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

    // PRIMARY: Gemini Pro (better reasoning for multi-factor insights)
    try {
      const result    = await callGemini(GEMINI_MODELS.PRO, contents, { maxTokens: 500, temperature: 0.5 });
      const clean     = result.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      const jsonStart = clean.indexOf("[");
      const jsonEnd   = clean.lastIndexOf("]");
      if (jsonStart !== -1 && jsonEnd !== -1) {
        return JSON.parse(clean.substring(jsonStart, jsonEnd + 1));
      }
    } catch (geminiErr) {
      console.warn("Gemini insights failed:", geminiErr.message);
    }

    // FALLBACK: Groq text
    try {
      const result    = await callGroqText([{
        role:    "user",
        content: buildInsightsPrompt() + "\n\nPatient data:\n" + dataContext,
      }], 500);
      const clean     = result.content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      const jsonStart = clean.indexOf("[");
      const jsonEnd   = clean.lastIndexOf("]");
      if (jsonStart !== -1 && jsonEnd !== -1) {
        return JSON.parse(clean.substring(jsonStart, jsonEnd + 1));
      }
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
        message: "Log blood pressure and heart rate daily â€” patterns reveal important health trends.",
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

