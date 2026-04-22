export const BRAND = {
  name: "Zivika Labs",
  tagline: "India's intelligent health OS",
};

export const RECORD_TYPES = {
  prescription: { label: "Prescription",    iconName: "Pill",        iconColor: "#9333EA", color: "text-purple-600" },
  lab:          { label: "Lab Report",       iconName: "TestTube2",   iconColor: "#2563EB", color: "text-blue-600" },
  consultation: { label: "Consultation",     iconName: "Stethoscope", iconColor: "#16A34A", color: "text-green-600" },
  vitals:       { label: "Vitals Summary",   iconName: "Activity",    iconColor: "#DC2626", color: "text-red-500" },
  imaging:      { label: "Imaging / Scan",   iconName: "ScanLine",    iconColor: "#4F46E5", color: "text-indigo-600" },
  discharge:    { label: "Discharge Summary",iconName: "Building2",   iconColor: "#EA580C", color: "text-orange-600" },
  vaccination:  { label: "Vaccination Record",iconName: "Syringe",    iconColor: "#0D9488", color: "text-teal-600" },
};

export const SPECIALTIES = [
  "General Medicine",
  "Cardiology",
  "Endocrinology",
  "Orthopedics",
  "Neurology",
  "Dermatology",
  "Ophthalmology",
  "ENT",
  "Gynecology",
  "Pediatrics",
  "Psychiatry",
  "Pulmonology",
  "Gastroenterology",
  "Nephrology",
  "Urology",
  "Oncology",
  "Hematology",
  "Radiology",
  "Pathology",
];

export const LANGUAGES = [
  { code: "en", label: "English", native: "En" },
  { code: "hi", label: "Hindi", native: "हि" },
  { code: "kn", label: "Kannada", native: "ಕ" },
  { code: "ta", label: "Tamil", native: "த" },
  { code: "te", label: "Telugu", native: "తె" },
  { code: "bn", label: "Bengali", native: "বা" },
  { code: "mr", label: "Marathi", native: "म" },
];

export const VITAL_TYPES = {
  heartRate: {
    label: "Heart Rate",
    unit: "bpm",
    iconName: "Heart",
    iconColor: "#E74C3C",
    normal: { min: 60, max: 100, label: "Normal" },
  },
  spo2: {
    label: "SpO\u2082",
    unit: "%",
    iconName: "Wind",
    iconColor: "#2980B9",
    normal: { min: 95, max: 100, label: "Excellent" },
  },
  bpSystolic: {
    label: "Systolic BP",
    unit: "mmHg",
    iconName: "Activity",
    iconColor: "#9333EA",
    normal: { min: 90, max: 120, label: "Normal" },
  },
  bpDiastolic: {
    label: "Diastolic BP",
    unit: "mmHg",
    iconName: "Activity",
    iconColor: "#9333EA",
    normal: { min: 60, max: 80, label: "Normal" },
  },
  temperature: {
    label: "Temperature",
    unit: "\u00b0F",
    iconName: "Thermometer",
    iconColor: "#EA580C",
    normal: { min: 97, max: 99, label: "Normal" },
  },
  weight: {
    label: "Weight",
    unit: "kg",
    iconName: "Scale",
    iconColor: "#5A9A7E",
    normal: null,
  },
  glucose: {
    label: "Blood Sugar",
    unit: "mg/dL",
    iconName: "Droplet",
    iconColor: "#E74C3C",
    normal: { min: 70, max: 100, label: "Normal" },
  },
  steps: {
    label: "Steps",
    unit: "steps",
    iconName: "Footprints",
    iconColor: "#0D9488",
    normal: { min: 0, max: 10000, label: "Good" },
  },
  sleep: {
    label: "Sleep",
    unit: "hrs",
    iconName: "Moon",
    iconColor: "#4F46E5",
    normal: { min: 7, max: 9, label: "Good" },
  },
};
