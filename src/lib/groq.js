/*
 * ─── GROQ API INTEGRATION — READY TO CONNECT ─────────────────────────────────
 *
 * When connecting the real Groq API, replace simulateGroqResponse with:
 *
 *   import Groq from "groq-sdk";
 *
 *   const groq = new Groq({ apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY });
 *
 *   const buildSystemPrompt = (healthContext) => `
 *     You are Zivika Labs Health Copilot, a warm and intelligent AI health assistant
 *     for ${healthContext.user.name}, age ${healthContext.user.age}.
 *     You have access to their complete medical history.
 *     Always give personalized, context-aware advice in simple language.
 *     Never replace professional medical advice — always recommend consulting a doctor
 *     for serious concerns. Keep responses to 3–5 sentences.
 *     Patient data: ${JSON.stringify(healthContext)}
 *   `;
 *
 *   export async function getCopilotResponse(userMessage, healthContext) {
 *     const completion = await groq.chat.completions.create({
 *       model: "llama-3.3-70b-versatile", // or "mixtral-8x7b-32768"
 *       temperature: 0.7,
 *       max_tokens: 512,
 *       messages: [
 *         { role: "system", content: buildSystemPrompt(healthContext) },
 *         { role: "user", content: userMessage },
 *       ],
 *     });
 *     return completion.choices[0]?.message?.content
 *       ?? "I couldn't generate a response. Please try again.";
 *   }
 *
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ── Token length map ─────────────────────────────────────────────────────────
// Keeps API costs predictable by capping response length per query complexity.
const RESPONSE_LENGTHS = {
  simple:   150,   // greetings, single-fact answers
  moderate: 300,   // medication, diet, lab-reading questions
  complex:  500,   // multi-part, multi-condition analysis
  summary:  800,   // full health overviews, appointment prep
};

// ── Question classifier ───────────────────────────────────────────────────────
// Identifies intent so we can build a minimal, targeted context payload.
export function classifyQuestion(message) {
  const m = message.toLowerCase();
  if (/hello|hi|namaste|good morning|how are you/.test(m))
    return { category: "greeting",     complexity: "simple",   contextType: "none" };
  if (/report|lab|blood|hba1c|cbc|scan|result/.test(m))
    return { category: "lab",          complexity: "moderate", contextType: "records" };
  if (/medicine|medication|tablet|pill|metformin|amlodipine|vitamin/.test(m))
    return { category: "medication",   complexity: "moderate", contextType: "medications" };
  if (/diet|food|eat|meal|nutrition|carb/.test(m))
    return { category: "diet",         complexity: "moderate", contextType: "medications+vitals" };
  if (/doctor|appointment|visit|schedule|book/.test(m))
    return { category: "appointment",  complexity: "moderate", contextType: "appointments" };
  if (/summary|overall|health status|overview|everything|how am i/.test(m))
    return { category: "summary",      complexity: "summary",  contextType: "all" };
  if (/sugar|glucose|diabetes|insulin|a1c/.test(m))
    return { category: "diabetes",     complexity: "moderate", contextType: "records+vitals" };
  if (/vitamin|d3|deficiency|supplement/.test(m))
    return { category: "vitamin",      complexity: "moderate", contextType: "records+medications" };
  if (/blood.?pressure|bp|heart|cardio|pulse/.test(m))
    return { category: "cardio",       complexity: "moderate", contextType: "vitals" };
  return      { category: "generic",   complexity: "moderate", contextType: "all" };
}

// ── Context builder ───────────────────────────────────────────────────────────
// Only include health data relevant to the question — avoids wasting tokens.
export function buildContext(classification, healthContext) {
  if (!healthContext) return null;
  const { contextType } = classification;
  if (contextType === "none") return null;

  const ctx = {};
  if (contextType === "all" || contextType.includes("records"))
    ctx.records = healthContext.records?.slice(0, 3) ?? [];
  if (contextType === "all" || contextType.includes("medications"))
    ctx.medications = healthContext.medications ?? [];
  if (contextType === "all" || contextType.includes("vitals"))
    ctx.vitals = healthContext.vitals?.slice(0, 5) ?? [];
  if (contextType === "all" || contextType.includes("appointments"))
    ctx.appointments = healthContext.appointments ?? [];
  if (healthContext.user) ctx.user = healthContext.user;

  return JSON.stringify(ctx);
}

// ── Model fallback chain ──────────────────────────────────────────────────────
// Try models in order; skip to next on rate-limit or error.
const COPILOT_MODELS = [
  "llama-3.3-70b-versatile",   // primary — best reasoning
  "llama-3.1-8b-instant",      // fallback 1 — fast & cheap
  "mixtral-8x7b-32768",        // fallback 2 — broad knowledge
  "gemma2-9b-it",              // fallback 3 — lightweight
  "llama3-8b-8192",            // fallback 4 — last resort
];

// ── Caching (TODO) ────────────────────────────────────────────────────────────
// Cache key: SHA256(userId + systemPrompt + userMessage)
// TTL: 5 minutes for personal queries (health data can change)
// Implementation: Redis via Vercel KV or Supabase edge functions
// Example:
//   const cacheKey = await sha256(`${userId}:${prompt}:${msg}`);
//   const hit = await kv.get(cacheKey);
//   if (hit) return hit;
//   ... generate response ...
//   await kv.set(cacheKey, response, { ex: 300 });

/** Adds realistic "thinking" latency between 2.0–2.8 seconds */
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Pattern-matched simulated responses grounded in the user's actual health data.
 * Each branch references real values from MOCK_RECORDS, MOCK_MEDICATIONS, etc.
 */
function matchResponse(msg) {
  const m = msg.toLowerCase();

  /* ── Lab / report ──────────────────────────────────────────────────────── */
  if (/report|lab|test|blood|cbc|hba1c|result|scan|x.?ray|imaging/.test(m)) {
    return (
      "Your latest Complete Blood Count + HbA1c from Manipal Hospital (12 Jul 2025, Dr. Priya Nair) " +
      "shows your HbA1c at **7.2%** — slightly above the target of <7%, which means your diabetes is " +
      "partially controlled but improving (it was 8.1% six months ago 🎉). Your Vitamin D came in at " +
      "**18 ng/mL** (deficient; optimal is 40–60 ng/mL). The good news: your CBC — red cells, white " +
      "cells, platelets — is entirely within the normal range. No anemia or infection signs. Stay " +
      "consistent with your Metformin and weekly Vitamin D3 dose, and you should see both numbers " +
      "improve at your August follow-up. 💊"
    );
  }

  /* ── Medication ────────────────────────────────────────────────────────── */
  if (/medicine|medication|tablet|pill|drug|side.?effect|metformin|amlodipine|vitamin.?d3?/.test(m)) {
    return (
      "You're on three medications right now:\n" +
      "• **Metformin 500mg** — twice daily before meals (for diabetes)\n" +
      "• **Amlodipine 5mg** — once daily every morning (for blood pressure)\n" +
      "• **Vitamin D3 60,000 IU** — once every Sunday for 8 weeks (for deficiency)\n\n" +
      "Metformin occasionally causes mild stomach upset — taking it with breakfast instead of before " +
      "a meal can help. It won't cause low blood sugar on its own. Amlodipine may cause slight ankle " +
      "swelling in some people; let Dr. Gupta know if you notice that. Your Vitamin D3 dose is safe " +
      "and standard — just don't skip Sundays! 🌿"
    );
  }

  /* ── Diet / food ───────────────────────────────────────────────────────── */
  if (/diet|food|eat|eating|meal|nutrition|carb|sugar.?free|avoid|recipe/.test(m)) {
    return (
      "For your profile — Type 2 Diabetes + Vitamin D deficiency — here's what works best: " +
      "Aim for complex carbs (brown rice, ragi, oats) over refined ones (white rice, maida). " +
      "Structure your plate as 50% vegetables, 25% protein, 25% carbs. " +
      "For Vitamin D, include eggs, fatty fish (salmon, sardines), and fortified milk daily. " +
      "Limit sugary drinks, packaged snacks, and late-night eating. " +
      "Your last consultation (Dr. Gupta, Jul 10) specifically emphasized lifestyle modifications — " +
      "consistent meal timing is just as important as what you eat when you're on Metformin. 🥗"
    );
  }

  /* ── Doctor / appointment ──────────────────────────────────────────────── */
  if (/doctor|appointment|checkup|visit|clinic|book|schedule|follow.?up/.test(m)) {
    return (
      "Your upcoming appointments:\n" +
      "• **Dr. Ramesh Gupta** (Endocrinology) — Aug 10, 2025 at 10:30 AM, Apollo Clinic, Koramangala\n" +
      "• **Dr. Harish Shetty** (General Medicine) — Aug 24, Annual Checkup, Manipal Hospital\n" +
      "• **Dr. Kavitha Reddy** (Ophthalmology) — Sep 5, Eye Exam, Sankara Eye Hospital\n\n" +
      "For your Aug 10 visit with Dr. Gupta, good questions to ask: " +
      "\"Is my HbA1c on track?\", \"Should I adjust my Metformin dose?\", and " +
      "\"How long until I can stop the Vitamin D course?\" " +
      "The eye exam on Sep 5 is especially important — diabetes can affect vision, so don't skip it. 📅"
    );
  }

  /* ── Diabetes / sugar / glucose ────────────────────────────────────────── */
  if (/sugar|glucose|diabetes|diabetic|insulin|a1c|hba1c/.test(m)) {
    return (
      "Your HbA1c is **7.2%** — this reflects your average blood sugar over the past 3 months. " +
      "The target for Type 2 Diabetes is below 7%, so you're very close! " +
      "Compare that to 8.1% six months ago — you've made real progress. " +
      "The key levers: stay consistent with Metformin, swap high-GI foods (white rice, sugary drinks) " +
      "for complex carbs, walk 30 minutes a day, and avoid skipping meals (which causes fluctuations). " +
      "Your next HbA1c recheck is due around Aug–Sep 2025. Keep going — the trend is in your favor. 📈"
    );
  }

  /* ── Vitamin D ──────────────────────────────────────────────────────────── */
  if (/vitamin|d3|deficiency|supplement|sunlight/.test(m)) {
    return (
      "Your Vitamin D level is **18 ng/mL** — that's in the deficient range (optimal: 40–60 ng/mL). " +
      "Dr. Priya Nair prescribed Vitamin D3 60,000 IU once weekly for 8 weeks starting Jul 12, 2025, " +
      "so your course ends around early September — after which your levels will be rechecked. " +
      "In the meantime: get 20–30 minutes of morning sunlight (before 10 AM), add eggs and fortified " +
      "dairy to your diet, and absolutely do not skip your Sunday dose. " +
      "Low Vitamin D is extremely common in urban India — your current plan will fix it. ☀️"
    );
  }

  /* ── Blood pressure / heart / cardio ───────────────────────────────────── */
  if (/blood.?pressure|bp|heart|cardio|amlodipine|pulse|bpm/.test(m)) {
    return (
      "Your cardiovascular health looks solid. Your BP is consistently stable at around " +
      "**118–124 / 76–82 mmHg** (June 2025 vitals summary, Dr. Kavitha Reddy) — well within the " +
      "healthy range. Your resting heart rate is **72 bpm**, and your chest X-ray from Jun 28 showed " +
      "a clear cardiac silhouette with no lung disease. You're on Amlodipine 5mg daily to help keep " +
      "BP in check. Just watch for ankle swelling (a rare side effect) and keep up your daily walking. " +
      "Heart health is trending positively — your resting heart rate is 4 BPM lower than 3 weeks ago. 💚"
    );
  }

  /* ── Summary / overall health ──────────────────────────────────────────── */
  if (/summary|overall|how am i|health status|general|overview|everything/.test(m)) {
    return (
      "Here's your health snapshot:\n" +
      "• **Cardiovascular** — BP stable at ~120/80 mmHg, HR 72 bpm, chest X-ray clear ✅\n" +
      "• **Metabolic** — HbA1c 7.2% (improving from 8.1%, target <7%) ⬆️\n" +
      "• **Nutrition** — Vitamin D 18 ng/mL (deficient; treatment ongoing) ⚠️\n" +
      "• **Lifestyle** — Sleep averaging 7.4 hrs, 8,549 daily steps — excellent 🌙\n\n" +
      "Overall you're doing well for 38. Two things to focus on: get that HbA1c under 7%, " +
      "and complete the Vitamin D course without skipping. " +
      "Your Aug 10 appointment with Dr. Gupta will be the next key checkpoint. 💚"
    );
  }

  /* ── Fallback ────────────────────────────────────────────────────────────── */
  return (
    "That's a great question! Based on your health profile, I can give you personalized answers on:\n" +
    "• **Lab reports** — HbA1c 7.2%, Vitamin D 18 ng/mL\n" +
    "• **Medications** — Metformin, Amlodipine, Vitamin D3\n" +
    "• **Upcoming appointments** — Dr. Gupta on Aug 10\n" +
    "• **Diet & lifestyle** — diabetes-friendly eating, Vitamin D foods\n\n" +
    "Try asking: \"What does my blood report say?\" or \"What should I ask my doctor?\" — " +
    "and I'll give you a detailed, personalized answer. 🌿"
  );
}

/**
 * getCopilotResponse
 *
 * Simulated AI health response engine with token-optimized architecture.
 * Architecture is ready for Groq API — see comment block at top of this file.
 *
 * @param {string} userMessage
 * @param {object} healthContext — { user, records, medications, vitals, recentInsights, appointments }
 * @returns {Promise<string>}
 */
export async function getCopilotResponse(userMessage, healthContext) {
  const classification = classifyQuestion(userMessage);
  const _context = buildContext(classification, healthContext); // eslint-disable-line no-unused-vars
  const _maxTokens = RESPONSE_LENGTHS[classification.complexity] ?? RESPONSE_LENGTHS.moderate; // eslint-disable-line no-unused-vars

  // TODO: Check cache first
  // const apiKey = process.env.GROQ_API_KEY || process.env.NEXT_PUBLIC_GROQ_API_KEY;
  // if (apiKey) {
  //   for (const model of COPILOT_MODELS) {
  //     try {
  //       const res = await fetch("https://api.groq.com/openai/v1/chat/completions", { ... });
  //       if (res.ok) { const data = await res.json(); return data.choices[0].message.content; }
  //     } catch { continue; }
  //   }
  // }

  // Mock response with realistic delay
  await delay(2000 + Math.random() * 600);
  return matchResponse(userMessage, healthContext);
}
