/**
 * ─── ZIVIKA LABS — Digital Twin Computation Engine ───────────────────────────
 *
 * computeTwinScores(records, vitals, medications, medicationLogs)
 *
 * Currently populated with Phase-1 scored values derived from MOCK_DATA.
 * When real Supabase data is available, each scoring block maps 1-to-1 to a
 * real data source:
 *
 *   records        → supabase table: health_records (lab, imaging, consultation…)
 *   vitals         → supabase table: vitals_readings (daily device or manual sync)
 *   medications    → supabase table: medications (current prescriptions)
 *   medicationLogs → supabase table: medication_logs (taken / skipped per dose)
 *
 * Each scorer is isolated in its own function so real logic can replace mock
 * values incrementally without touching the rest of the engine.
 */

// ─── Individual scorers ────────────────────────────────────────────────────────

/**
 * Cardiovascular scorer
 * Real data sources: BP readings, resting heart rate series, cardiac imaging,
 *   medications like Amlodipine, chest X-ray impressions.
 */
function scoreCardiovascular(records, vitals) {
  // MOCK: BP 120/80 normal, HR 72 bpm (down from 76), chest X-ray clear
  return {
    score: 88,
    trend: "improving",
    factors: [
      "BP consistently 120/80 mmHg — optimal range",
      "Resting HR decreased from 76 to 72 BPM over 30 days",
      "Amlodipine 5mg maintaining stable blood pressure control",
    ],
  };
}

/**
 * Metabolic scorer
 * Real data sources: HbA1c series, fasting glucose readings, BMI/weight,
 *   diabetes medications, lipid panel if available.
 */
function scoreMetabolic(records, medications) {
  // MOCK: HbA1c 7.2% (target <7%), improving from 8.1% 6 months ago; Metformin adherence ~85%
  return {
    score: 68,
    trend: "improving",
    factors: [
      "HbA1c 7.2% — slightly above target of 7.0%",
      "HbA1c improved from 8.1% six months ago (+1.2% reduction)",
      "Metformin adherence estimated at 85% — good consistency",
    ],
  };
}

/**
 * Respiratory scorer
 * Real data sources: SpO2 daily readings, chest X-ray / CT reports, pulmonology notes.
 */
function scoreRespiratory(records, vitals) {
  // MOCK: SpO2 98% excellent, chest X-ray Jun 28 clear, no respiratory diagnoses
  return {
    score: 95,
    trend: "stable",
    factors: [
      "SpO₂ stable at 98% — excellent oxygen saturation",
      "Chest X-Ray (Jun 28): No active lung disease, clear fields",
      "No respiratory diagnoses or concerns on record",
    ],
  };
}

/**
 * Musculoskeletal scorer
 * Real data sources: orthopedic consultation notes, fracture/injury records,
 *   physiotherapy progress, activity/step data.
 */
function scoreMusculoskeletal(records, vitals) {
  // MOCK: No MSK complaints; daily steps 8,549 (slightly below 10k target)
  return {
    score: 82,
    trend: "stable",
    factors: [
      "No musculoskeletal complaints or diagnoses on record",
      "Daily step count 8,549 — moderate activity level",
      "No imaging of joints or spine — no known structural issues",
    ],
  };
}

/**
 * Mental wellness scorer
 * Real data sources: sleep tracker data, psychiatry/therapy notes, stress assessments,
 *   mood logs if implemented.
 */
function scoreMentalWellness(records, vitals) {
  // MOCK: Sleep 7.5 hrs (up from 6.1 hrs last week, deep sleep +12%)
  return {
    score: 78,
    trend: "improving",
    factors: [
      "Sleep averaging 7.4 hrs this week — up from 6.1 hrs last week",
      "Deep sleep proportion increased by 12% this week",
      "No psychiatric concerns or mental health records flagged",
    ],
  };
}

/**
 * Nutrition scorer
 * Real data sources: dietary logs, lab micro-nutrient panel, BMI/weight series,
 *   supplementation prescriptions.
 */
function scoreNutrition(records, medications) {
  // MOCK: Vitamin D 18 ng/mL (deficient; optimal 40–60), treatment started
  return {
    score: 62,
    trend: "stable",
    factors: [
      "Vitamin D 18 ng/mL — deficient (optimal: 40–60 ng/mL)",
      "Weekly Vitamin D3 60K IU prescribed — treatment in progress",
      "No dietary log data yet — manual tracking not started",
    ],
  };
}

// ─── Weighted overall score ───────────────────────────────────────────────────

const WEIGHTS = {
  cardiovascular: 0.25,
  metabolic: 0.25,
  respiratory: 0.15,
  musculoskeletal: 0.10,
  mentalWellness: 0.12,
  nutrition: 0.13,
};

function computeOverall(categories) {
  let total = 0;
  for (const [key, w] of Object.entries(WEIGHTS)) {
    total += categories[key].score * w;
  }
  return Math.round(total);
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * computeTwinScores
 *
 * @param {object[]} records       — health records array from zustand store
 * @param {object[]} vitals        — vitals array (MOCK_VITALS or real readings)
 * @param {object[]} medications   — current medications list
 * @param {object[]} medicationLogs — dose history (MOCK or real)
 * @returns TwinScores object
 */
export function computeTwinScores(records, vitals, medications, medicationLogs = []) {
  const hasRecords = records.length > 0;
  const hasVitals = vitals && Object.keys(vitals).length > 0;
  const hasMeds = medications.length > 0;
  const hasData = hasRecords || hasVitals || hasMeds;

  // Return zero-state when no data has been entered yet
  if (!hasData) {
    return {
      overall: 0,
      hasData: false,
      dataCompleteness: 0,
      categories: {},
      riskFactors: [],
      recommendations: [],
      message: "Add health data to see your score",
      lastUpdated: new Date().toISOString(),
    };
  }

  const dataCompleteness = Math.round(
    ((hasRecords ? 1 : 0) + (hasVitals ? 1 : 0) + (hasMeds ? 1 : 0)) / 3 * 100
  );

  const categories = {
    cardiovascular: scoreCardiovascular(records, vitals),
    metabolic: scoreMetabolic(records, medications),
    respiratory: scoreRespiratory(records, vitals),
    musculoskeletal: scoreMusculoskeletal(records, vitals),
    mentalWellness: scoreMentalWellness(records, vitals),
    nutrition: scoreNutrition(records, medications),
  };

  return {
    overall: computeOverall(categories),
    hasData: true,
    dataCompleteness,
    categories,
    riskFactors: [
      "Vitamin D deficiency (18 ng/mL) — supplement and morning sunlight needed",
      "HbA1c borderline at 7.2% — monitor closely; target is <7.0%",
      "Daily step count below 10,000 average — cardiovascular efficiency at risk",
    ],
    recommendations: [
      "Morning sunlight 15–20 min daily to boost Vitamin D naturally",
      "Monitor fasting blood glucose weekly — log before breakfast",
      "Target 10,000 steps daily — adds major cardiovascular benefit",
      "Schedule HbA1c retest in 3 months (around Oct 2025)",
      "Consider adding B12 and Iron panel at next blood draw",
    ],
    lastUpdated: new Date().toISOString(),
  };
}

// ─── Timeline events (derived from mock records) ─────────────────────────────
// Real version: query health_records ordered by date DESC, enrich with record type

export const TWIN_TIMELINE = [
  {
    date: "Jul 12",
    title: "Blood Test: CBC + HbA1c",
    description: "HbA1c 7.2%, Vitamin D 18 ng/mL — two actionable findings",
    type: "warning",
    doctor: "Dr. Priya Nair",
  },
  {
    date: "Jul 10",
    title: "Diabetes Management Updated",
    description: "Metformin 500mg BD + Vitamin D3 60K IU weekly prescribed",
    type: "prescription",
    doctor: "Dr. Ramesh Gupta",
  },
  {
    date: "Jul 10",
    title: "Endocrinology Follow-up",
    description: "HbA1c trending down from 8.1% to 7.2% — positive trajectory",
    type: "visit",
    doctor: "Dr. Ramesh Gupta",
  },
  {
    date: "Jun 30",
    title: "Monthly Vitals Summary",
    description: "BP 120/80 stable, HR 72 bpm — all readings within range",
    type: "positive",
    doctor: "Dr. Kavitha Reddy",
  },
  {
    date: "Jun 28",
    title: "Chest X-Ray (PA View)",
    description: "No active lung disease. Cardiac silhouette normal.",
    type: "positive",
    doctor: "Dr. Harish Shetty",
  },
];
