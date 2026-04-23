// ─── INDIA-SPECIFIC HEALTH CALCULATIONS ──────────────────────────────────────
// Uses WHO Asian/Indian thresholds (Consensus Statement for Diagnosis of
// Obesity, Abdominal Obesity and the Metabolic Syndrome for Asian Indians,
// JAPI 2009) — differ from Western standards.

// ─── India BMI categories ────────────────────────────────────────────────────
// Note: India uses 23 as overweight threshold (not 25) and 27.5 for obese (not 30)
export const INDIA_BMI_CATEGORIES = [
  {
    max: 18.5,
    label: "Underweight",
    color: "#2563EB",
    risk: "medium",
    advice: "You may be undernourished. Consider consulting a nutritionist.",
  },
  {
    max: 23.0,
    label: "Normal Weight",
    color: "#27AE60",
    risk: "low",
    advice: "Your weight is healthy for your height. Keep it up!",
  },
  {
    max: 27.5,
    label: "Overweight",
    color: "#F39C12",
    risk: "medium",
    advice: "You are in the overweight range for Asian/Indian body types.",
  },
  {
    max: Infinity,
    label: "Obese",
    color: "#E74C3C",
    risk: "high",
    advice:
      "Obesity increases risk of diabetes and heart disease. Consult a doctor.",
  },
];

/**
 * Calculate BMI with India-specific categorisation.
 * @param {number} weightKg
 * @param {number} heightCm
 * @returns {{ value, category, color, risk, advice, isHealthy, scalePosition } | null}
 */
export function calculateBMI(weightKg, heightCm) {
  if (!weightKg || !heightCm) return null;
  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);
  const rounded = Math.round(bmi * 10) / 10;

  const category = INDIA_BMI_CATEGORIES.find((c) => rounded < c.max);

  return {
    value: rounded,
    category: category.label,
    color: category.color,
    risk: category.risk,
    advice: category.advice,
    isHealthy: category.label === "Normal Weight",
    // Position on a 15–40 scale for the indicator bar
    scalePosition: Math.min(Math.max(((rounded - 15) / 25) * 100, 0), 100),
  };
}

// ─── BMR — Mifflin-St Jeor (more accurate than Harris-Benedict) ──────────────
/**
 * Calculates Basal Metabolic Rate (calories burned at complete rest).
 * @param {number} weightKg
 * @param {number} heightCm
 * @param {number} ageYears
 * @param {"male"|"female"} gender
 * @returns {number | null}
 */
export function calculateBMR(weightKg, heightCm, ageYears, gender) {
  if (!weightKg || !heightCm || !ageYears) return null;
  const bmr =
    10 * weightKg +
    6.25 * heightCm -
    5 * ageYears +
    (gender === "male" ? 5 : -161);
  return Math.round(bmr);
}

// ─── TDEE — Total Daily Energy Expenditure ───────────────────────────────────
export const ACTIVITY_LEVELS = [
  { id: "sedentary", label: "Sedentary",         desc: "Little/no exercise, desk job",             multiplier: 1.2 },
  { id: "light",     label: "Lightly Active",     desc: "Light exercise 1–3 days/week",             multiplier: 1.375 },
  { id: "moderate",  label: "Moderately Active",  desc: "Moderate exercise 3–5 days/week",          multiplier: 1.55 },
  { id: "active",    label: "Very Active",         desc: "Hard exercise 6–7 days/week",              multiplier: 1.725 },
  { id: "extra",     label: "Extra Active",        desc: "Physical job + hard exercise",             multiplier: 1.9 },
];

/**
 * @param {number} bmr
 * @param {string} activityLevel - one of ACTIVITY_LEVELS ids
 * @returns {{ maintain, loseWeight, loseWeightFast, gainWeight } | null}
 */
export function calculateTDEE(bmr, activityLevel = "sedentary") {
  if (!bmr) return null;
  const level = ACTIVITY_LEVELS.find((l) => l.id === activityLevel);
  const tdee = Math.round(bmr * (level?.multiplier || 1.2));
  return {
    maintain:       tdee,
    loseWeight:     tdee - 500,    // ~0.5 kg/week deficit
    loseWeightFast: tdee - 750,    // ~0.75 kg/week
    gainWeight:     tdee + 300,
  };
}

// ─── Body Fat % — Deurenberg formula (validated for Asian populations) ────────
/**
 * @param {number} bmi
 * @param {number} ageYears
 * @param {"male"|"female"} gender
 * @returns {{ value, category, color } | null}
 */
export function calculateBodyFat(bmi, ageYears, gender) {
  if (!bmi || !ageYears) return null;
  const genderFactor = gender === "male" ? 1 : 0;
  const bodyFat = 1.2 * bmi + 0.23 * ageYears - 10.8 * genderFactor - 5.4;
  const rounded = Math.round(bodyFat * 10) / 10;

  const RANGES = {
    male: [
      { max: 8,        label: "Essential Fat", color: "#2563EB" },
      { max: 19,       label: "Athletic",      color: "#27AE60" },
      { max: 25,       label: "Healthy",       color: "#27AE60" },
      { max: 30,       label: "Overweight",    color: "#F39C12" },
      { max: Infinity, label: "Obese",         color: "#E74C3C" },
    ],
    female: [
      { max: 13,       label: "Essential Fat", color: "#2563EB" },
      { max: 24,       label: "Athletic",      color: "#27AE60" },
      { max: 32,       label: "Healthy",       color: "#27AE60" },
      { max: 38,       label: "Overweight",    color: "#F39C12" },
      { max: Infinity, label: "Obese",         color: "#E74C3C" },
    ],
  };

  const ranges = RANGES[gender] || RANGES.male;
  const category = ranges.find((r) => rounded < r.max);

  return {
    value:    rounded,
    category: category.label,
    color:    category.color,
  };
}

// ─── Ideal weight range (India BMI thresholds 18.5–23) ───────────────────────
/**
 * @param {number} heightCm
 * @returns {{ min, max } | null}
 */
export function calculateIdealWeight(heightCm) {
  if (!heightCm) return null;
  const h = heightCm / 100;
  return {
    min: Math.round(18.5 * h * h * 10) / 10,
    max: Math.round(23.0 * h * h * 10) / 10,
  };
}
