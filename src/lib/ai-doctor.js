/**
 * Zivika Labs — AI Doctor Library
 * General health information assistant (NOT personal health copilot)
 * No personal patient data is used here.
 *
 * Models (fallback chain):
 *   1. llama-3.3-70b-versatile   (primary – best quality)
 *   2. llama-3.1-8b-instant      (fallback 1 – fast)
 *   3. mixtral-8x7b-32768        (fallback 2 – broad knowledge)
 *   4. gemma2-9b-it               (fallback 3 – lightweight)
 *   5. llama3-8b-8192             (fallback 4 – last resort)
 *
 * Caching:
 *   TODO: implement Redis / Supabase edge-cache
 *   Key: SHA256(systemPrompt + userMessage + language)
 *   TTL: 24 hours for general queries, 1 hour for seasonal/trending
 */

// ── Categories ───────────────────────────────────────────────────────────────

const CATEGORIES = {
  FEVER_COLD:      { label: "Fever & Cold",     maxTokens: 300 },
  PAIN:            { label: "Pain & Aches",      maxTokens: 300 },
  DIABETES:        { label: "Diabetes",          maxTokens: 500 },
  HEART:           { label: "Heart Health",      maxTokens: 500 },
  NUTRITION:       { label: "Nutrition & Diet",  maxTokens: 400 },
  MENTAL_HEALTH:   { label: "Mental Health",     maxTokens: 500 },
  FITNESS:         { label: "Fitness",           maxTokens: 350 },
  SLEEP:           { label: "Sleep",             maxTokens: 300 },
  SKIN:            { label: "Skin & Hair",       maxTokens: 300 },
  MEDICATIONS:     { label: "Medications",       maxTokens: 400 },
  GENERAL:         { label: "General Health",    maxTokens: 350 },
  OUT_OF_SCOPE:    { label: "Out of Scope",      maxTokens: 150 },
};

// ── Classification ───────────────────────────────────────────────────────────

function classifyQuestion(message) {
  const msg = message.toLowerCase();

  if (/fever|cold|flu|cough|runny nose|sore throat|nasal|congestion|headache.*fever/i.test(msg))
    return { category: "FEVER_COLD", complexity: "simple" };

  if (/pain|ache|headache|backache|knee pain|joint|cramp/i.test(msg))
    return { category: "PAIN", complexity: "simple" };

  if (/diabetes|blood sugar|insulin|metformin|hba1c|glucose|diabetic/i.test(msg))
    return { category: "DIABETES", complexity: "moderate" };

  if (/heart|bp|blood pressure|cholesterol|cardiac|hypertension|ecg|echo/i.test(msg))
    return { category: "HEART", complexity: "moderate" };

  if (/diet|nutrition|food|eat|vitamin|protein|calorie|weight loss|obesity|iron deficiency/i.test(msg))
    return { category: "NUTRITION", complexity: "moderate" };

  if (/stress|anxiety|depression|mental health|mood|sleep disorder|panic|therapy/i.test(msg))
    return { category: "MENTAL_HEALTH", complexity: "moderate" };

  if (/exercise|workout|yoga|fitness|gym|running|walk|steps/i.test(msg))
    return { category: "FITNESS", complexity: "simple" };

  if (/sleep|insomnia|snoring|tired|fatigue|rest|nap/i.test(msg))
    return { category: "SLEEP", complexity: "simple" };

  if (/skin|acne|rash|itch|hair|dandruff|sunburn|eczema/i.test(msg))
    return { category: "SKIN", complexity: "simple" };

  if (/medicine|tablet|capsule|dose|dosage|side effect|drug|paracetamol|ibuprofen/i.test(msg))
    return { category: "MEDICATIONS", complexity: "moderate" };

  if (/my reports|my lab|my scan|my patient|my prescription|my doctor said|diagnose me/i.test(msg))
    return { category: "OUT_OF_SCOPE", complexity: "simple" };

  return { category: "GENERAL", complexity: "simple" };
}

// ── System prompt builder ────────────────────────────────────────────────────

const LANG_INSTRUCTIONS = {
  en:  "Respond in clear, simple English.",
  hi:  "हिंदी में सरल भाषा में उत्तर दें।",
  kn:  "ಕನ್ನಡದಲ್ಲಿ ಸರಳ ಭಾಷೆಯಲ್ಲಿ ಉತ್ತರಿಸಿ.",
  ta:  "தமிழில் எளிய மொழியில் பதிலளிக்கவும்.",
  te:  "తెలుగులో సరళమైన భాషలో సమాధానం ఇవ్వండి.",
  bn:  "বাংলায় সহজ ভাষায় উত্তর দিন।",
  mr:  "मराठीत सोप्या भाषेत उत्तर द्या.",
};

function buildSystemPrompt(classification, language = "en") {
  const { category } = classification;
  const langInstruction = LANG_INSTRUCTIONS[language] || LANG_INSTRUCTIONS.en;

  const BASE = `You are Zivika Labs AI Doctor — a friendly, knowledgeable medical information assistant for Indian patients. ${langInstruction}

RULES:
- Provide general health education only. Never diagnose or prescribe.
- Always end your response with a clear disclaimer on a new line.
- Keep language simple, warm, and culturally appropriate for Indian context.
- If the question is about personal medical records/reports, gently redirect to the Zivika Health Copilot feature.
- Use Indian food examples (roti, dal, sabzi) when relevant.`;

  const CATEGORY_HINTS = {
    FEVER_COLD:    "Focus on home remedies, when to see a doctor, OTC care tips relevant to Indian climate.",
    PAIN:          "Explain common causes, home care, red flag symptoms requiring urgent care.",
    DIABETES:      "Discuss Indian diet adaptations, lifestyle tips, importance of HbA1c monitoring.",
    HEART:         "Explain risk factors, Indian diet impact, lifestyle changes, when to seek emergency care.",
    NUTRITION:     "Give practical Indian dietary advice considering regional foods and affordability.",
    MENTAL_HEALTH: "Be empathetic and warm. Reduce stigma. Suggest professional help when appropriate.",
    FITNESS:       "Give practical, beginner-friendly advice suitable for urban Indian lifestyles.",
    SLEEP:         "Explain sleep hygiene, Ayurvedic and modern tips for better rest.",
    SKIN:          "Address Indian skin tones, climate considerations, common issues like hyperpigmentation.",
    MEDICATIONS:   "Explain general medication concepts only. Never recommend specific doses or replace a doctor.",
    GENERAL:       "Provide balanced, evidence-based general health information.",
    OUT_OF_SCOPE:  "Politely explain that you provide general health information only, and direct the user to use the Zivika Health Copilot (My Health tab) for personal health queries.",
  };

  return `${BASE}\n\nFocus area: ${CATEGORY_HINTS[category] || CATEGORY_HINTS.GENERAL}`;
}

// ── Token length map ─────────────────────────────────────────────────────────

function getMaxTokens(classification) {
  return CATEGORIES[classification.category]?.maxTokens ?? 350;
}

// ── Model fallback chain ─────────────────────────────────────────────────────

const MODELS = [
  "llama-3.3-70b-versatile",
  "llama-3.1-8b-instant",
  "mixtral-8x7b-32768",
  "gemma2-9b-it",
  "llama3-8b-8192",
];

// ── Mock responses ───────────────────────────────────────────────────────────

const MOCK_RESPONSES = {
  FEVER_COLD: "Fever and colds are very common, especially during seasonal changes in India. For mild fever (below 38.5°C), rest well, drink plenty of fluids like coconut water, nimbu pani, or warm kadha. Paracetamol can help reduce fever — follow the recommended dose on the packaging. Using a damp cloth on the forehead can provide comfort. If fever exceeds 39°C, persists beyond 3 days, is accompanied by breathlessness, or affects children under 2 years, please see a doctor promptly.",
  PAIN: "Common pains like backache, knee pain, or general body aches often respond well to rest, gentle stretching, and warm compresses. Over-the-counter pain relievers can provide short-term relief but are not a long-term solution. Maintain good posture, especially if you work at a desk. Yoga and light walking have strong evidence for chronic pain management. Seek medical care if pain is sudden and severe, follows an injury, or doesn't improve within a week.",
  DIABETES: "Diabetes management in India benefits greatly from our traditional diet — replace white rice with millet (jowar, bajra, ragi), choose whole wheat roti, and add plenty of non-starchy vegetables. Avoid fruit juices — whole fruits with fiber are better. Walk 30 minutes daily; even a 10-minute post-meal walk significantly improves blood sugar control. Monitor your HbA1c every 3 months. Stress raises blood sugar too, so relaxation practices help. Never stop or adjust medications without your doctor's guidance.",
  HEART: "Heart health in India is increasingly important as lifestyle diseases rise. Reduce refined oil consumption — switch to cold-pressed oils and use less quantity. Cut down on salt, maida, and sugary drinks. Eat more fish, nuts (especially walnuts), flaxseeds, and leafy greens. Aim for 150 minutes of moderate activity per week. Manage stress through yoga or meditation. Know the warning signs of a heart attack: chest discomfort, pain radiating to left arm or jaw, cold sweat, breathlessness — call emergency services immediately.",
  NUTRITION: "A balanced Indian diet is naturally nutrient-rich! Ensure every meal has protein (dal, paneer, eggs, pulses), complex carbs (whole grains), and vegetables. Many Indians are deficient in Vitamin D, B12 (especially vegetarians), and iron. Getting 15–20 minutes of morning sunlight helps with Vitamin D. Seasonal fruits and vegetables are most nutritious and affordable. Stay hydrated — at least 2–3 litres of water daily, more in summer.",
  MENTAL_HEALTH: "Mental health deserves the same attention as physical health. In India, stress, work pressure, and family responsibilities can be overwhelming — you are not alone. Simple daily practices help: consistent sleep schedule, limiting news/social media, talking to trusted friends or family. Breathing exercises (pranayama) and even a 10-minute daily walk have clinical evidence for reducing anxiety and depression. If you feel persistently sad, hopeless, or overwhelmed for more than 2 weeks, please speak to a mental health professional — this is a medical need, not a weakness.",
  FITNESS: "You don't need a gym membership to stay fit. Brisk walking for 30–45 minutes daily is one of the most effective exercises. Yoga is excellent for flexibility, strength, and mental wellness — even 20 minutes daily makes a difference. Bodyweight exercises (squats, push-ups, planks) can be done at home. If you're a beginner, start slowly and increase intensity over weeks. Consistency matters more than intensity. Stay hydrated, especially in India's heat.",
  SLEEP: "Good sleep is fundamentally important for immunity, metabolism, and mental health. Adults need 7–9 hours. Set a consistent sleep and wake time — even on weekends. Avoid screens for 1 hour before bed; blue light suppresses melatonin. Keep your bedroom cool and dark. Limit chai/coffee after 4 PM. Warm milk, ashwagandha, or chamomile tea before bed can help. If you struggle with sleep despite good habits, consult a doctor as conditions like sleep apnea may need treatment.",
  SKIN: "Indian skin is beautifully diverse and responds well to gentle, consistent care. Always wear SPF 30+ sunscreen — UV exposure is intense in India and causes premature aging and hyperpigmentation. Moisturise daily even if your skin feels oily. Drink enough water. A diet rich in antioxidants (tomatoes, carrots, amla) supports skin health from inside. For acne, avoid harsh scrubbing — gentle cleansing twice daily is enough. See a dermatologist for persistent or severe skin issues.",
  MEDICATIONS: "Medicines work best when taken as directed. Always complete a prescribed antibiotic course even if you feel better. Take most medicines with a full glass of water unless directed otherwise. Some medicines are best taken with food to avoid stomach upset. Never share prescription medications or take leftover prescriptions without consulting a doctor. Store medicines in a cool, dry place away from sunlight. Expired medicines should be safely disposed — don't flush or throw in regular bins.",
  GENERAL: "Maintaining good health in India is achievable with consistent habits: eat a balanced diet rich in seasonal fruits and vegetables, exercise for at least 30 minutes most days, sleep 7–8 hours, manage stress, and stay hydrated. Avoid tobacco in all forms and limit alcohol. Get regular health checkups — especially blood pressure, blood sugar, and cholesterol after age 30. Vaccinations are important at every age, not just childhood. Preventive care is always more effective than treatment.",
  OUT_OF_SCOPE: "I'm Zivika Labs AI Doctor, here to help with general health questions and education. For questions about your personal health records, lab reports, or prescriptions, please use the 'My Health Copilot' feature in Zivika — it has access to your personal health data and can give you personalised insights. How can I help you with a general health question today?",
};

const DISCLAIMER = "\n\n⚠️ Disclaimer: This is AI-generated general health information for educational purposes only. It is not a substitute for professional medical advice, diagnosis, or treatment. Always consult a qualified doctor for your specific health concerns.";

// ── Main export ──────────────────────────────────────────────────────────────

/**
 * @param {string} userMessage
 * @param {string} [language="en"]
 * @returns {Promise<string>}
 */
export async function getAIDoctorResponse(userMessage, language = "en") {
  const classification = classifyQuestion(userMessage);
  const systemPrompt = buildSystemPrompt(classification, language);
  const maxTokens = getMaxTokens(classification);

  // TODO: Check cache before API call
  // const cacheKey = await sha256(systemPrompt + userMessage + language);
  // const cached = await redis.get(cacheKey);
  // if (cached) return cached;

  // Real API with 5-model fallback chain
  if (process.env.NEXT_PUBLIC_GROQ_API_KEY || process.env.GROQ_API_KEY) {
    const apiKey = process.env.GROQ_API_KEY || process.env.NEXT_PUBLIC_GROQ_API_KEY;

    for (const model of MODELS) {
      try {
        const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model,
            max_tokens: maxTokens,
            temperature: 0.6,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userMessage },
            ],
          }),
        });

        if (!res.ok) {
          console.warn(`[AI Doctor] Model ${model} failed (${res.status}), trying next…`);
          continue;
        }

        const data = await res.json();
        const text = data.choices?.[0]?.message?.content || "";
        if (!text) continue;


        const response = text + DISCLAIMER;

        // TODO: Store in cache
        // await redis.set(cacheKey, response, { ex: 86400 });

        return response;
      } catch (err) {
        console.warn(`[AI Doctor] Model ${model} threw error:`, err.message);
      }
    }

    console.error("[AI Doctor] All models failed, falling back to mock response.");
  }

  // Mock mode (no API key or all models failed)
  await delay(900 + Math.random() * 600);
  const mockText = MOCK_RESPONSES[classification.category] || MOCK_RESPONSES.GENERAL;
  return mockText + DISCLAIMER;
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
