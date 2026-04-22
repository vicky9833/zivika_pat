// ─── Zivika Labs Symptom Checker Engine ──────────────────────────────────────
// TODO: Replace with AI-powered analysis via Groq/Anthropic:
//   POST /api/symptom-analysis with { regions, symptoms, duration, severity }
//   Returns: { conditions, urgency, specialist, disclaimer }

export const BODY_REGIONS = [
  { id: "head",    label: "Head & Neck",  x: 44, y: 8,  w: 12, h: 12 },
  { id: "chest",   label: "Chest",        x: 38, y: 22, w: 24, h: 14 },
  { id: "abdomen", label: "Abdomen",      x: 38, y: 37, w: 24, h: 12 },
  { id: "arms",    label: "Arms",         x: 18, y: 22, w: 16, h: 22 },
  { id: "legs",    label: "Legs",         x: 36, y: 50, w: 28, h: 22 },
  { id: "back",    label: "Back",         x: 38, y: 22, w: 24, h: 28 },
  { id: "general", label: "General / Whole Body", x: 0, y: 0, w: 0, h: 0 },
];

export const SYMPTOM_MAP = {
  head:    ["Headache", "Dizziness", "Blurred vision", "Ear pain", "Sore throat", "Nasal congestion", "Memory issues"],
  chest:   ["Chest pain", "Shortness of breath", "Dry cough", "Wet cough", "Palpitations", "Heartburn", "Chest tightness"],
  abdomen: ["Stomach pain", "Nausea", "Vomiting", "Diarrhea", "Constipation", "Bloating", "Loss of appetite"],
  arms:    ["Arm pain", "Numbness / tingling", "Swelling", "Weakness", "Joint pain", "Rash"],
  legs:    ["Leg pain", "Swelling", "Cramping", "Numbness", "Weakness", "Varicose veins"],
  back:    ["Lower back pain", "Upper back pain", "Stiffness", "Radiating pain", "Muscle spasm"],
  general: ["Fever", "Fatigue", "Unexplained weight loss", "Weight gain", "Body ache", "Night sweats", "Chills"],
};

export const DURATION_OPTIONS = [
  { id: "today",   label: "Today" },
  { id: "1-3d",    label: "1–3 days" },
  { id: "4-7d",    label: "4–7 days" },
  { id: "1-2w",    label: "1–2 weeks" },
  { id: ">2w",     label: "More than 2 weeks" },
  { id: "recur",   label: "Recurring" },
];

export const SEVERITY_OPTIONS = [
  { id: "mild",     label: "Mild",     color: "#27AE60", description: "Manageable, not disrupting daily life" },
  { id: "moderate", label: "Moderate", color: "#F39C12", description: "Noticeable, affecting some daily activities" },
  { id: "severe",   label: "Severe",   color: "#E74C3C", description: "Significant, affecting most daily activities" },
];

// ─── Mock AI condition analysis ───────────────────────────────────────────────
const CONDITION_DB = {
  headache: {
    conditions: [
      { name: "Tension Headache",      likelihood: 68, icd: "G44.2" },
      { name: "Migraine",              likelihood: 22, icd: "G43.9" },
      { name: "Sinusitis",             likelihood: 10, icd: "J32.9" },
    ],
    specialist: "Neurologist",
    urgency: "routine",
  },
  chest_pain: {
    conditions: [
      { name: "Musculoskeletal Pain",  likelihood: 45, icd: "M79.3" },
      { name: "Acid Reflux (GERD)",    likelihood: 30, icd: "K21.0" },
      { name: "Angina Pectoris",       likelihood: 25, icd: "I20.9" },
    ],
    specialist: "Cardiologist",
    urgency: "urgent",
  },
  shortness_of_breath: {
    conditions: [
      { name: "Asthma / Bronchospasm", likelihood: 40, icd: "J45.9" },
      { name: "Anxiety / Panic",       likelihood: 35, icd: "F41.0" },
      { name: "Anemia",                likelihood: 25, icd: "D64.9" },
    ],
    specialist: "Pulmonologist",
    urgency: "urgent",
  },
  stomach_pain: {
    conditions: [
      { name: "Gastritis",             likelihood: 42, icd: "K29.7" },
      { name: "Irritable Bowel Syndrome", likelihood: 33, icd: "K58.9" },
      { name: "Appendicitis (rule out)", likelihood: 25, icd: "K37" },
    ],
    specialist: "Gastroenterologist",
    urgency: "moderate",
  },
  fever: {
    conditions: [
      { name: "Viral Fever / URTI",    likelihood: 55, icd: "J06.9" },
      { name: "Dengue Fever",          likelihood: 25, icd: "A97.9" },
      { name: "Typhoid Fever",         likelihood: 20, icd: "A01.0" },
    ],
    specialist: "General Physician",
    urgency: "moderate",
  },
  fatigue: {
    conditions: [
      { name: "Anemia",                likelihood: 38, icd: "D64.9" },
      { name: "Hypothyroidism",        likelihood: 32, icd: "E03.9" },
      { name: "Vitamin B12 Deficiency",likelihood: 30, icd: "E53.8" },
    ],
    specialist: "General Physician",
    urgency: "routine",
  },
  back_pain: {
    conditions: [
      { name: "Lumbar Muscle Strain",  likelihood: 52, icd: "M54.5" },
      { name: "Lumbar Disc Herniation",likelihood: 30, icd: "M51.1" },
      { name: "Sacroiliitis",          likelihood: 18, icd: "M46.1" },
    ],
    specialist: "Orthopedist",
    urgency: "routine",
  },
  default: {
    conditions: [
      { name: "Non-specific Complaint", likelihood: 50, icd: "R68.89" },
      { name: "Viral Illness",           likelihood: 30, icd: "B34.9" },
      { name: "Nutritional Deficiency",  likelihood: 20, icd: "E63.9" },
    ],
    specialist: "General Physician",
    urgency: "routine",
  },
};

const URGENCY_META = {
  routine:  { label: "Can wait for doctor visit",  color: "#27AE60", bg: "rgba(39,174,96,0.08)" },
  moderate: { label: "See a doctor within 24–48 hours", color: "#F39C12", bg: "rgba(243,156,18,0.08)" },
  urgent:   { label: "Seek medical attention promptly",  color: "#E74C3C", bg: "rgba(231,76,60,0.08)" },
};

function matchConditionKey(symptoms) {
  const s = symptoms.map((x) => x.toLowerCase());
  if (s.some((x) => x.includes("chest pain")))          return "chest_pain";
  if (s.some((x) => x.includes("shortness")))           return "shortness_of_breath";
  if (s.some((x) => x.includes("headache")))            return "headache";
  if (s.some((x) => x.includes("stomach") || x.includes("abdom") || x.includes("nausea"))) return "stomach_pain";
  if (s.some((x) => x.includes("fever")))               return "fever";
  if (s.some((x) => x.includes("fatigue") || x.includes("tired"))) return "fatigue";
  if (s.some((x) => x.includes("back")))                return "back_pain";
  return "default";
}

/**
 * analyzeSymptoms — mock AI analysis.
 *
 * @param {{ regions: string[], symptoms: string[], duration: string, severity: string }} input
 * @returns {{ conditions, urgency, urgencyMeta, specialist, disclaimer }}
 */
export function analyzeSymptoms({ regions, symptoms, duration, severity }) {
  const key = matchConditionKey(symptoms);
  const base = CONDITION_DB[key] || CONDITION_DB.default;

  // Elevate urgency if severe + duration > 1 week
  let urgency = base.urgency;
  if (severity === "severe" && ["1-2w", ">2w"].includes(duration)) {
    urgency = "urgent";
  }
  if (severity === "severe" && urgency === "routine") {
    urgency = "moderate";
  }

  return {
    conditions: base.conditions,
    urgency,
    urgencyMeta: URGENCY_META[urgency],
    specialist: base.specialist,
    disclaimer:
      "This is not a medical diagnosis. The information provided is for educational purposes only. Always consult a qualified healthcare professional for proper evaluation and treatment.",
  };
}
