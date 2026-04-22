// ─── Mock User ──────────────────────────────────────────────────────────────
export const MOCK_USER = {
  id: "mock-user-001",
  name: "Priya Sharma",
  firstName: "Priya",
  initials: "PS",
  gender: "male",
  bloodGroup: "O+",
  age: 38,
  preferredLanguage: "en",
  phone: "+91 98765 43210",
  email: "priya.s@example.com",
};

// ─── Mock Vitals (for the 3x2 home grid) ────────────────────────────────────
export const MOCK_VITALS = [
  {
    key: "heartRate",
    value: 72,
    unit: "bpm",
    iconName: "Heart",
    iconColor: "#E74C3C",
    label: "Heart Rate",
    status: "Normal",
    statusColor: "#27AE60",
  },
  {
    key: "spo2",
    value: 98,
    unit: "%",
    iconName: "Wind",
    iconColor: "#2980B9",
    label: "SpO\u2082",
    status: "Excellent",
    statusColor: "#27AE60",
  },
  {
    key: "bp",
    value: "120/80",
    unit: "mmHg",
    iconName: "Activity",
    iconColor: "#9333EA",
    label: "Blood Pressure",
    status: "Normal",
    statusColor: "#27AE60",
  },
  {
    key: "temperature",
    value: 98.6,
    unit: "\u00b0F",
    iconName: "Thermometer",
    iconColor: "#EA580C",
    label: "Temperature",
    status: "Normal",
    statusColor: "#27AE60",
  },
  {
    key: "steps",
    value: "8,549",
    unit: "steps",
    iconName: "Footprints",
    iconColor: "#0D9488",
    label: "Today's Steps",
    status: "Good",
    statusColor: "#2980B9",
  },
  {
    key: "sleep",
    value: 7.5,
    unit: "hrs",
    iconName: "Moon",
    iconColor: "#4F46E5",
    label: "Last Night",
    status: "Good",
    statusColor: "#2980B9",
  },
];

// ─── Mock Health Records ─────────────────────────────────────────────────────
export const MOCK_RECORDS = [
  {
    id: "r1",
    type: "lab",
    title: "Complete Blood Count + HbA1c",
    doctor: "Dr. Priya Nair",
    hospital: "Manipal Hospital, Bangalore",
    date: "12 Jul 2025",
    isUrgent: true,
    summary:
      "HbA1c: 7.2% — slightly elevated. Vitamin D: 18 ng/mL — deficient. CBC values within normal range.",
  },
  {
    id: "r2",
    type: "prescription",
    title: "Diabetes Management — Metformin",
    doctor: "Dr. Ramesh Gupta",
    hospital: "Apollo Clinic, Koramangala",
    date: "10 Jul 2025",
    isUrgent: false,
    summary:
      "Metformin 500mg BD, Amlodipine 5mg OD. 30-day supply. Review in 1 month.",
  },
  {
    id: "r3",
    type: "consultation",
    title: "Endocrinology Follow-up",
    doctor: "Dr. Ramesh Gupta",
    hospital: "Apollo Clinic, Koramangala",
    date: "10 Jul 2025",
    isUrgent: false,
    summary:
      "HbA1c trending down from 8.1% to 7.2%. Continue current medications. Lifestyle modifications advised.",
  },
  {
    id: "r4",
    type: "imaging",
    title: "Chest X-Ray (PA View)",
    doctor: "Dr. Harish Shetty",
    hospital: "Manipal Hospital, Bangalore",
    date: "28 Jun 2025",
    isUrgent: false,
    summary: "No active lung disease. Cardiac silhouette within normal limits.",
  },
  {
    id: "r5",
    type: "vitals",
    title: "Monthly Vitals Summary — June 2025",
    doctor: "Dr. Kavitha Reddy",
    hospital: "Manipal Hospital, Bangalore",
    date: "30 Jun 2025",
    isUrgent: false,
    summary:
      "BP stable at 118–124/76–82 mmHg. HR 68–75 bpm at rest. Weight steady at 74 kg.",
  },
  {
    id: "r6",
    type: "prescription",
    title: "Vitamin D3 Supplementation",
    doctor: "Dr. Priya Nair",
    hospital: "Manipal Hospital, Bangalore",
    date: "12 Jul 2025",
    isUrgent: false,
    summary:
      "Vitamin D3 60K IU once weekly for 8 weeks. Recheck levels after course completion.",
  },
];

// ─── Mock Medications ────────────────────────────────────────────────────────
export const MOCK_MEDICATIONS = [
  {
    id: "m1",
    name: "Metformin 500mg",
    schedule: "Before meals, twice daily",
    time: "After Lunch",
    taken: false,
    timeLabel: "~2 hrs",
    isToday: true,
  },
  {
    id: "m2",
    name: "Amlodipine 5mg",
    schedule: "Once daily, morning",
    time: "8:00 AM",
    taken: true,
    timeLabel: "Taken",
    isToday: true,
  },
  {
    id: "m3",
    name: "Vitamin D3 60K IU",
    schedule: "Once weekly — Sunday",
    time: "Sunday",
    taken: false,
    timeLabel: "3 days",
    isToday: false,
  },
];

// ─── Mock AI Insights ────────────────────────────────────────────────────────
export const MOCK_INSIGHTS = [
  {
    id: "i1",
    type: "positive",
    iconName: "Heart",
    iconColor: "#27AE60",
    title: "Heart Health Improving",
    description:
      "Your resting heart rate is down 4 BPM over 3 weeks — a clear sign of improving cardiovascular fitness.",
    borderColor: "#27AE60",
    bgColor: "rgba(39,174,96,0.05)",
  },
  {
    id: "i2",
    type: "warning",
    iconName: "AlertTriangle",
    iconColor: "#F39C12",
    title: "Low Vitamin D Detected",
    description:
      "Your CBC shows Vitamin D at 18 ng/mL (optimal: 40–60). Continue weekly supplementation and get morning sunlight.",
    borderColor: "#F39C12",
    bgColor: "rgba(243,156,18,0.05)",
  },
  {
    id: "i3",
    type: "info",
    iconName: "Calendar",
    iconColor: "#2980B9",
    title: "Follow-up Due — Aug 10",
    description:
      "Dr. Ramesh Gupta recommended a 1-month check on your HbA1c progress. Book your appointment soon.",
    borderColor: "#2980B9",
    bgColor: "rgba(41,128,185,0.05)",
  },
  {
    id: "i4",
    type: "positive",
    iconName: "Moon",
    iconColor: "#4F46E5",
    title: "Sleep Quality Improving",
    description:
      "Averaging 7.4 hrs this week vs 6.1 hrs last week. Deep sleep proportion also increased by 12%.",
    borderColor: "#27AE60",
    bgColor: "rgba(39,174,96,0.05)",
  },
];

// ─── Mock Appointments ────────────────────────────────────────────────────────
export const MOCK_APPOINTMENTS = [
  {
    id: "a1",
    doctor: "Dr. Ramesh Gupta",
    specialty: "Endocrinology",
    date: "Aug 10, 2025",
    time: "10:30 AM",
    hospital: "Apollo Clinic, Koramangala",
    type: "Follow-up",
  },
  {
    id: "a2",
    doctor: "Dr. Harish Shetty",
    specialty: "General Medicine",
    date: "Aug 24, 2025",
    time: "9:00 AM",
    hospital: "Manipal Hospital, Bangalore",
    type: "Annual Checkup",
  },
  {
    id: "a3",
    doctor: "Dr. Kavitha Reddy",
    specialty: "Ophthalmology",
    date: "Sep 5, 2025",
    time: "11:00 AM",
    hospital: "Sankara Eye Hospital, Bangalore",
    type: "Annual Eye Exam",
  },
];
