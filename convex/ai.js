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
// GEMINI MODEL CONFIGURATION
// Primary AI: Google Gemini 2.0 Flash / 1.5 Pro
// 

const GEMINI_MODELS = {
  FLASH: "gemini-2.0-flash",
  PRO: "gemini-1.5-pro",
  FLASH_VISION: "gemini-2.0-flash",
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
  console.log("Gemini key prefix:", apiKey?.substring(0, 6));
  if (!apiKey || !apiKey.startsWith("AIza")) {
    throw new Error("Invalid Gemini API key: " + (apiKey?.substring(0, 6) || "missing"));
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
// WORLD-CLASS SYSTEM PROMPTS
// 

function languageInstruction(lang) {
  return {
    hi: "MANDATORY: Respond ONLY in Hindi using Devanagari script. NEVER use Roman letters for Hindi words. Use respectful \u0022\u0906\u092A\u0022 form. Example correct: \u0022\u0906\u092A\u0915\u093E \u0938\u094D\u0935\u093E\u0938\u094D\u0925\u094D\u092F \u0905\u091A\u094D\u091B\u093E \u0939\u0948\u0964\u0022 Example WRONG: \u0022Aapka swasthya accha hai.\u0022",
    kn: "MANDATORY: Respond ONLY in Kannada script. NEVER romanize. Use respectful \u0022\u0CA8\u0CBF\u0CAE\u0CCD\u0CAE\u0022 form. Example correct: \u0022\u0CA8\u0CBF\u0CAE\u0CCD\u0CAE \u0C86\u0CB0\u0CCB\u0C97\u0CCD\u0CAF \u0C9A\u0CC6\u0CA8\u0CCD\u0CA8\u0CBE\u0C97\u0CBF\u0CA6\u0CC6\u0CCD.\u0022 Example WRONG: \u0022Nimma arogya chennagide.\u0022",
    ta: "MANDATORY: Respond ONLY in Tamil script. NEVER romanize. Use \u0022\u0BA8\u0BC0\u0B99\u0BCD\u0B95\u0BB3\u0BCD\u0022 form. Example correct: \u0022\u0B89\u0B99\u0BCD\u0B95\u0BB3\u0BCD \u0B89\u0B9F\u0BB2\u0BCD\u0BA8\u0BB2\u0BAE\u0BCD \u0BA8\u0BB2\u0BCD\u0BB2\u0BA4\u0BC1.\u0022 Example WRONG: \u0022Ungal udalnalam nalladu.\u0022",
    te: "MANDATORY: Respond ONLY in Telugu script. NEVER romanize. Use \u0022\u0C2E\u0C40\u0C30\u0C41\u0022 form. Example correct: \u0022\u0C2E\u0C40 \u0C06\u0C30\u0C4B\u0C17\u0C4D\u0C2F\u0C02 \u0C2C\u0C3E\u0C17\u0C41\u0C02\u0C26\u0C3F.\u0022 Example WRONG: \u0022Mee aarogyam bagundi.\u0022",
    bn: "MANDATORY: Respond ONLY in Bengali script. NEVER romanize. Use \u0022\u0986\u09AA\u09A8\u09BF\u0022 form. Example correct: \u0022\u0986\u09AA\u09A8\u09BE\u09B0 \u09B8\u09CD\u09AC\u09BE\u09B8\u09CD\u09A5\u09CD\u09AF \u09AD\u09BE\u09B2\u09CB.\u0022 Example WRONG: \u0022Apnar swasthya bhalo.\u0022",
    mr: "MANDATORY: Respond ONLY in Marathi using Devanagari script. NEVER romanize. Use \u0022\u0924\u0941\u092E\u094D\u0939\u0940\u0022 or \u0022\u0906\u092A\u0923\u0022 form. Example correct: \u0022\u0924\u0941\u092E\u091A\u0947 \u0906\u0930\u094B\u0917\u094D\u092F \u091A\u093E\u0902\u0917\u0932\u0947 \u0906\u0939\u0947.\u0022 Example WRONG: \u0022Tumche arogya changle ahe.\u0022",
    en: "Respond in clear, simple English suitable for an educated Indian user. Avoid medical jargon.",
  }[lang] || "Respond in clear, simple English.";
}

function buildCopilotSystemPrompt(patientContext, language) {
  const LANG_RULES = {
    hi: `तुम एक भारतीय स्वास्थ्य सहायक हो।
हमेशा हिंदी में देवनागरी लिपि में जवाब दो।
कभी भी रोमन अक्षरों में हिंदी मत लिखो।
सही: "आपको पानी पीना चाहिए।"
गलत: "Aapko paani peena chahiye."
अधिकतम 3 छोटे वाक्य। अगर जरूरी हो तो एक सवाल पूछो।`,

    kn: `ನೀವು ಭಾರತೀಯ ಆರೋಗ್ಯ ಸಹಾಯಕ.
ಯಾವಾಗಲೂ ಕನ್ನಡ ಲಿಪಿಯಲ್ಲಿ ಉತ್ತರಿಸಿ.
ರೋಮನ್ ಅಕ್ಷರಗಳಲ್ಲಿ ಕನ್ನಡ ಬರೆಯಬೇಡಿ.
ಸರಿ: "ನೀವು ನೀರು ಕುಡಿಯಬೇಕು."
ತಪ್ಪು: "Neevu neeru kudiyabeku."
ಗರಿಷ್ಠ 3 ಚಿಕ್ಕ ವಾಕ್ಯಗಳು.`,

    ta: `நீங்கள் ஒரு இந்திய சுகாதார உதவியாளர்.
எப்போதும் தமிழ் எழுத்தில் பதிலளிக்கவும்.
ஆங்கில எழுத்தில் தமிழ் எழுதாதீர்கள்.
சரி: "நீங்கள் தண்ணீர் குடிக்க வேண்டும்."
தவறு: "Neengal thanneer kudikka vendum."
அதிகபட்சம் 3 சிறிய வாக்கியங்கள்.`,

    te: `మీరు భారతీయ ఆరోగ్య సహాయకుడు.
ఎల్లప్పుడూ తెలుగు లిపిలో సమాధానం ఇవ్వండి.
రోమన్ అక్షరాలలో తెలుగు రాయకండి.
సరైనది: "మీరు నీరు తాగాలి."
తప్పు: "Meeru neeru taagaali."
గరిష్టం 3 చిన్న వాక్యాలు.`,

    bn: `আপনি একজন ভারতীয় স্বাস্থ্য সহায়ক।
সর্বদা বাংলা লিপিতে উত্তর দিন।
রোমান অক্ষরে বাংলা লিখবেন না।
সঠিক: "আপনার জল পান করা উচিত।"
ভুল: "Aapnar jal pan kora uchit."
সর্বোচ্চ ৩টি ছোট বাক্য।`,

    mr: `तुम्ही एक भारतीय आरोग्य सहाय्यक आहात.
नेहमी मराठीत देवनागरी लिपीत उत्तर द्या.
रोमन अक्षरात मराठी लिहू नका.
बरोबर: "तुम्ही पाणी प्यायला हवे."
चुकीचे: "Tumhi paani piyala have."
जास्तीत जास्त 3 लहान वाक्ये.`,

    en: `You are a caring Indian health assistant.
Reply in simple clear English.
Maximum 3 short sentences.
Ask one follow-up question if needed.`,
  };

  return `${LANG_RULES[language] || LANG_RULES.en}

PATIENT DATA: ${patientContext || "New user."}

RULES FOR ALL LANGUAGES:
1. Maximum 3 sentences. Never more.
2. No markdown. No asterisks. No bullet points.
3. If question is unclear, ask ONE question only.
4. Never prescribe medicines.
5. Always recommend doctor for serious issues.
6. For emergency symptoms: say call 108 immediately.

HOW TO RESPOND:
Simple symptom like headache or fever:
- Ask: when did it start, how severe, any other symptoms
- Do NOT give long explanations first

After they answer:
- Give short practical advice
- Say when to see a doctor`;
}
function buildDoctorSystemPrompt(language) {
  const LANG_RULES = {
    hi: `हिंदी में देवनागरी लिपि में जवाब दो। रोमन नहीं।`,
    kn: `ಕನ್ನಡ ಲಿಪಿಯಲ್ಲಿ ಉತ್ತರಿಸಿ. ರೋಮನ್ ಅಕ್ಷರ ಬೇಡ.`,
    ta: `தமிழ் எழுத்தில் பதிலளிக்கவும்.`,
    te: `తెలుగు లిపిలో సమాధానం ఇవ్వండి.`,
    bn: `বাংলা লিপিতে উত্তর দিন।`,
    mr: `मराठीत देवनागरी लिपीत उत्तर द्या.`,
    en: `Reply in simple clear English.`,
  };

  return `${LANG_RULES[language] || LANG_RULES.en}

You are Zivika — a knowledgeable Indian health guide.
Not a doctor. A trusted health companion.

RESPONSE RULES:
1. Maximum 3 short sentences always
2. No markdown, no symbols, no bullet points
3. Natural conversational language for voice
4. Ask follow-up before giving long advice
5. Never prescribe medicines or dosages
6. Always say: consult your doctor for serious issues
7. Emergency symptoms: call 108 immediately

DETECT USER LANGUAGE:
If user writes in Hindi script respond in Hindi script
If user writes in Kannada respond in Kannada
Match whatever script the user uses.`;
}
function buildReportAnalysisPrompt() {
  return `You are a medical document AI for Zivika Labs, an Indian health management platform.

Analyze the medical document image. Extract all information accurately.

RULES:
- Extract all test names, values, units, and reference ranges shown
- Identify abnormal values (outside reference range): mark status as "high", "low", or "critical"
- Use Indian lab reference ranges where applicable (they differ from Western standards)
- Write a 2-sentence summary any patient can understand " avoid jargon
- Mark urgent=true only for critically abnormal or dangerous values
- For prescriptions: extract medicine name and strength ONLY " never include dose schedule

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
1. Based ONLY on the data provided " no fabrication
2. Actionable and specific to the data
3. Written in simple language (not medical jargon)
4. Constructive and encouraging in tone " never alarming
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

    // FALLBACK: Groq
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

