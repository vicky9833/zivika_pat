// ─── Sarvam AI — Medical Report Analyzer ─────────────────────────────────────
//
// ╔══════════════════════════════════════════════════════════════════════════╗
// ║  HOW TO CONNECT REAL SARVAM AI (when ready)                            ║
// ║                                                                          ║
// ║  1. Sign up at https://www.sarvam.ai and get an API key                 ║
// ║  2. Add to .env.local:  SARVAM_AI_API_KEY=your_key_here                 ║
// ║  3. Create a Next.js API route at src/app/api/analyze-report/route.js   ║
// ║     — Accepts: POST { imageBase64: string }                              ║
// ║     — Calls:   POST https://api.sarvam.ai/v1/parse-medical-document     ║
// ║     — Headers: Authorization: Bearer $SARVAM_AI_API_KEY                 ║
// ║     — Body:    { model: "sarvam-m", image_base64: imageBase64,          ║
// ║                  language: "auto", output_format: "structured_medical" } ║
// ║  4. Replace the SIMULATED SECTION below with:                            ║
// ║     const res = await fetch("/api/analyze-report", {                     ║
// ║       method: "POST",                                                     ║
// ║       headers: { "Content-Type": "application/json" },                   ║
// ║       body: JSON.stringify({ imageBase64 }),                              ║
// ║     });                                                                   ║
// ║     return await res.json();                                              ║
// ╚══════════════════════════════════════════════════════════════════════════╝

const SIMULATED_DELAY_MS = 4500;

// ─── Mock Report Generators ──────────────────────────────────────────────────

function mockLabReport() {
  return {
    type: "lab",
    title: "Complete Blood Count + Metabolic Panel",
    doctor: "Dr. Priya Nair",
    facility: "Manipal Hospital, Bangalore",
    date: "07 Apr 2026",
    specialty: "Pathology",
    confidence: 97,
    urgent: true,
    summary:
      "Vitamin D severely deficient at 14 ng/mL. HbA1c borderline elevated at 7.1%. Fasting glucose raised. CBC within normal limits. TSH normal.",
    extractedData: {
      tests: [
        { name: "Hemoglobin",       value: "14.2",   unit: "g/dL",      refRange: "13.0–17.0",  status: "normal"   },
        { name: "WBC Count",        value: "7,200",  unit: "cells/µL",  refRange: "4,000–11,000", status: "normal"  },
        { name: "Platelet Count",   value: "2.4",    unit: "Lakh/µL",   refRange: "1.5–4.0",    status: "normal"   },
        { name: "Fasting Glucose",  value: "118",    unit: "mg/dL",     refRange: "70–100",     status: "abnormal" },
        { name: "HbA1c",            value: "7.1",    unit: "%",         refRange: "< 5.7",      status: "abnormal" },
        { name: "TSH",              value: "2.8",    unit: "µIU/mL",    refRange: "0.5–5.0",    status: "normal"   },
        { name: "Vitamin D",        value: "14",     unit: "ng/mL",     refRange: "30–100",     status: "abnormal" },
        { name: "Vitamin B12",      value: "312",    unit: "pg/mL",     refRange: "200–900",    status: "normal"   },
        { name: "Total Cholesterol",value: "198",    unit: "mg/dL",     refRange: "< 200",      status: "normal"   },
      ],
    },
    keyFindings: [
      {
        text: "Vitamin D is 14 ng/mL — severely deficient (normal: 30–100 ng/mL). Supplementation strongly recommended.",
        severity: "abnormal",
      },
      {
        text: "HbA1c is 7.1% — above normal threshold of 5.7%. Indicates early diabetic or pre-diabetic range.",
        severity: "abnormal",
      },
      {
        text: "Fasting Glucose is 118 mg/dL — borderline elevated (normal < 100). Monitor closely.",
        severity: "warning",
      },
      {
        text: "CBC values including Hemoglobin, WBC, and Platelets are all within normal limits.",
        severity: "normal",
      },
    ],
  };
}

function mockPrescription() {
  return {
    type: "prescription",
    title: "Diabetes & Hypertension Management",
    doctor: "Dr. Ramesh Gupta",
    facility: "Apollo Clinic, Koramangala",
    date: "07 Apr 2026",
    specialty: "Endocrinology",
    confidence: 93,
    urgent: false,
    summary:
      "30-day prescription for diabetes and hypertension management. 5 medications including weekly Vitamin D3. Review in 4 weeks.",
    extractedData: {
      medications: [
        { name: "Metformin",    dosage: "500 mg",       frequency: "Twice daily",          duration: "30 days", instructions: "Take with meals" },
        { name: "Amlodipine",   dosage: "5 mg",         frequency: "Once daily",           duration: "30 days", instructions: "Take in the morning" },
        { name: "Atorvastatin", dosage: "10 mg",        frequency: "Once daily at night",  duration: "30 days", instructions: "Take after dinner" },
        { name: "Pantoprazole", dosage: "40 mg",        frequency: "Once daily",           duration: "30 days", instructions: "Take 30 min before breakfast" },
        { name: "Vitamin D3",   dosage: "60,000 IU",   frequency: "Once weekly",           duration: "8 weeks", instructions: "Take with milk or fatty food" },
      ],
    },
    keyFindings: [
      {
        text: "Metformin 500mg twice daily — standard first-line therapy for Type 2 Diabetes.",
        severity: "normal",
      },
      {
        text: "Amlodipine 5mg for blood pressure control. Ensure regular BP monitoring at home.",
        severity: "warning",
      },
      {
        text: "Vitamin D3 60,000 IU weekly for 8 weeks to correct severe deficiency.",
        severity: "normal",
      },
      {
        text: "Review appointment required after 4 weeks to assess medication response.",
        severity: "normal",
      },
    ],
  };
}

function mockConsultation() {
  return {
    type: "consultation",
    title: "Endocrinology OPD — Follow-up",
    doctor: "Dr. Ramesh Gupta",
    facility: "Apollo Clinic, Koramangala",
    date: "07 Apr 2026",
    specialty: "Endocrinology",
    confidence: 91,
    urgent: false,
    summary:
      "Follow-up for Type 2 Diabetes. HbA1c improved from 8.1% to 7.1%. Lifestyle modifications reinforced. Medication continued.",
    extractedData: {
      diagnosis: "Type 2 Diabetes Mellitus (ICD-10: E11)",
      symptoms: [
        "Mild fatigue",
        "Occasional thirst",
        "No complaints of hypoglycaemia",
      ],
      vitalsAtVisit: {
        bp: "128/84 mmHg",
        weight: "82 kg",
        bmi: "27.4",
        pulse: "76 bpm",
      },
      advice: [
        "Continue current medications as prescribed",
        "Low glycemic index diet — avoid refined carbohydrates and sugary drinks",
        "30 minutes of moderate exercise, 5 days per week",
        "Fasting blood glucose monitoring every morning",
        "Return in 4 weeks or earlier if symptoms worsen",
      ],
    },
    keyFindings: [
      {
        text: "HbA1c improved from 8.1% to 7.1% — medications are working effectively. Continue current regimen.",
        severity: "normal",
      },
      {
        text: "BP is 128/84 mmHg — slightly above target of 120/80. Monitor and review if persistent.",
        severity: "warning",
      },
      {
        text: "BMI is 27.4 — overweight range. Weight loss of 5–7% can significantly improve blood sugar control.",
        severity: "warning",
      },
      {
        text: "No hypoglycaemic episodes reported. Current medication dose is well tolerated.",
        severity: "normal",
      },
    ],
  };
}

function mockImaging() {
  return {
    type: "imaging",
    title: "Chest X-Ray — PA & Lateral View",
    doctor: "Dr. Harish Shetty",
    facility: "Manipal Hospital Radiology, Bangalore",
    date: "07 Apr 2026",
    specialty: "Radiology",
    confidence: 95,
    urgent: false,
    summary:
      "Normal chest X-ray. No active cardiopulmonary disease. Mild age-related degenerative changes at thoracic spine.",
    extractedData: {
      modality: "X-Ray",
      region: "Chest (PA & Lateral)",
      technicalQuality: "Good",
      findings: [
        "Lung fields clear bilaterally — no consolidation, pleural effusion, or pneumothorax",
        "Cardiac silhouette within normal limits (CTR < 0.5)",
        "Mediastinum is central and of normal width",
        "Bony thorax intact. Mild osteophytes at D6-D7 thoracic vertebrae",
        "Both diaphragm domes at normal level",
        "No hilar lymphadenopathy seen",
      ],
      impression:
        "Normal chest X-ray. No acute cardiopulmonary disease. Mild age-related degenerative changes at D6-D7 vertebral bodies.",
    },
    keyFindings: [
      {
        text: "Chest X-ray is normal — no lung infection, fluid collection, or cardiac enlargement detected.",
        severity: "normal",
      },
      {
        text: "Mild osteophytes at D6-D7 thoracic vertebrae — age-related, no immediate intervention required.",
        severity: "warning",
      },
      {
        text: "Heart size and mediastinal structures are within normal limits.",
        severity: "normal",
      },
    ],
  };
}

const MOCK_REPORT_GENERATORS = [
  mockLabReport,
  mockPrescription,
  mockConsultation,
  mockImaging,
];

// ─── Processing step labels (exported for use in ProcessingAnimation) ─────────
export const PROCESSING_STEPS = [
  "Reading document...",
  "Detecting report type...",
  "Extracting medical data...",
  "Identifying key findings...",
  "Categorizing report...",
  "Almost done...",
];

// ─── Public API ───────────────────────────────────────────────────────────────
/**
 * Analyze a medical report image and extract structured data.
 *
 * @param {string} imageBase64 - Base64 data URL (data:image/jpeg;base64,...) of the scanned report
 * @returns {Promise<object>} Structured report data including type, extracted fields, key findings
 */
export async function analyzeReport(imageBase64) {
  // ── SIMULATED SECTION — Replace with real Sarvam AI call (see instructions above) ──
  await new Promise((resolve) => setTimeout(resolve, SIMULATED_DELAY_MS));
  const randomGenerator =
    MOCK_REPORT_GENERATORS[Math.floor(Math.random() * MOCK_REPORT_GENERATORS.length)];
  return randomGenerator();
  // ── END SIMULATED SECTION ─────────────────────────────────────────────────────────
}
