"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import Groq from "groq-sdk";

// ── Model fallback chain ──────────────────────────────────────────────────
const GROQ_MODELS = [
  "llama-3.1-8b-instant",
  "llama-3.1-70b-versatile",
  "llama-3.3-70b-versatile",
  "llama3-8b-8192",
  "llama3-70b-8192",
  "mixtral-8x7b-32768",
  "gemma2-9b-it",
  "gemma-7b-it",
];

const VISION_MODELS = [
  "llama-3.2-11b-vision-preview",
  "llama-3.2-90b-vision-preview",
];

function buildDoctorSystemPrompt(user, language, mode) {
  const lang = language || "en";
  const langNames = {
    en: "English", hi: "Hindi", ta: "Tamil", te: "Telugu",
    kn: "Kannada", ml: "Malayalam", bn: "Bengali",
  };
  const langName = langNames[lang] || "English";

  const conditions = user?.conditions?.length
    ? user.conditions.join(", ")
    : "None disclosed";
  const age = user?.dob
    ? Math.floor((Date.now() - new Date(user.dob).getTime()) / 31557600000)
    : "Unknown";

  if (mode === "doctor") {
    return `You are Dr. Zivika, a compassionate and knowledgeable Indian doctor assistant.
Speak ONLY in ${langName}. Never mention "AI" — you are a doctor assistant.
Address the patient with warmth. Use Indian context (ayurveda references where apt, Indian food examples, etc.).
Patient profile: ${age} years old, conditions: ${conditions}.
Keep responses concise (2-4 sentences). End with a caring note. Never give prescriptions — only guidance.`;
  }

  return `You are Zivika, a personal health copilot for an Indian user.
Speak ONLY in ${langName}. Never mention "AI". Be friendly, concise, and helpful.
Patient profile: ${age} years old, conditions: ${conditions}.
Focus on health insights, trends, and practical advice for an Indian lifestyle.
Keep responses under 100 words unless the user asks for detailed information.`;
}

// ── Chat (text) ──────────────────────────────────────────────────────────
export const chat = action({
  args: {
    messages:      v.array(v.object({ role: v.string(), content: v.string() })),
    mode:          v.string(),
    language:      v.optional(v.string()),
    healthContext: v.optional(v.string()),
    user:          v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) throw new Error("GROQ_API_KEY not set");
    const groq = new Groq({ apiKey });

    const systemPrompt = buildDoctorSystemPrompt(args.user, args.language, args.mode);
    const contextNote = args.healthContext
      ? `\n\nPatient health context:\n${args.healthContext}`
      : "";

    const messages = [
      { role: "system", content: systemPrompt + contextNote },
      ...args.messages.map((m) => ({ role: m.role, content: m.content })),
    ];

    for (const model of GROQ_MODELS) {
      try {
        const res = await groq.chat.completions.create({
          model,
          messages,
          max_tokens: 600,
          temperature: 0.7,
        });
        return {
          content: res.choices[0].message.content,
          model,
        };
      } catch (err) {
        const msg = err?.message || "";
        if (msg.includes("model") || msg.includes("not found") || msg.includes("deactivated")) {
          continue; // try next model
        }
        throw err;
      }
    }
    throw new Error("All Groq models unavailable");
  },
});

// ── Analyze a medical report image ──────────────────────────────────────
export const analyzeReport = action({
  args: {
    imageBase64: v.string(),
    mimeType:    v.optional(v.string()),
    language:    v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) throw new Error("GROQ_API_KEY not set");
    const groq = new Groq({ apiKey });

    const lang = args.language || "en";
    const mime = args.mimeType || "image/jpeg";

    const systemPrompt = `You are a medical report analysis assistant for Indian patients.
Extract and summarize the report clearly. Output ONLY valid JSON with no markdown fences.
Response format:
{
  "title": "Brief report title",
  "type": "Lab Report|Prescription|Imaging|Discharge|Other",
  "summary": "2-3 sentence plain-language summary",
  "keyFindings": ["finding 1", "finding 2"],
  "abnormalValues": [{"test": "...", "value": "...", "reference": "...", "status": "high|low|normal"}],
  "recommendations": ["rec 1", "rec 2"],
  "date": "YYYY-MM-DD or null",
  "language": "${lang}"
}`;

    const userMessage = {
      role: "user",
      content: [
        {
          type: "image_url",
          image_url: { url: `data:${mime};base64,${args.imageBase64}` },
        },
        {
          type: "text",
          text: "Please analyze this medical report and return the JSON response.",
        },
      ],
    };

    for (const model of VISION_MODELS) {
      try {
        const res = await groq.chat.completions.create({
          model,
          messages: [
            { role: "system", content: systemPrompt },
            userMessage,
          ],
          max_tokens: 1200,
          temperature: 0.1,
        });

        const raw = res.choices[0].message.content.trim();
        // Strip any accidental markdown code fences
        const cleaned = raw.replace(/^```(?:json)?\n?/i, "").replace(/\n?```$/, "");
        try {
          return JSON.parse(cleaned);
        } catch {
          return {
            title: "Medical Report",
            type: "Other",
            summary: cleaned,
            keyFindings: [],
            abnormalValues: [],
            recommendations: [],
            date: null,
            language: lang,
          };
        }
      } catch (err) {
        const msg = err?.message || "";
        if (msg.includes("model") || msg.includes("not found") || msg.includes("deactivated")) {
          continue;
        }
        throw err;
      }
    }

    // Fallback: use text model with instruction to describe the image
    for (const model of GROQ_MODELS) {
      try {
        const res = await groq.chat.completions.create({
          model,
          messages: [
            { role: "system", content: "You are a medical report analysis assistant." },
            {
              role: "user",
              content: "I have a medical report image but cannot display it in this context. Please provide a generic analysis template in JSON format with all required fields set to null or empty arrays.",
            },
          ],
          max_tokens: 400,
          temperature: 0,
        });
        return {
          title: "Medical Report",
          type: "Other",
          summary: "Image analysis unavailable. Please add details manually.",
          keyFindings: [],
          abnormalValues: [],
          recommendations: ["Consult your doctor for interpretation."],
          date: null,
          language: lang,
        };
      } catch {
        continue;
      }
    }

    throw new Error("Report analysis failed — all models unavailable");
  },
});
