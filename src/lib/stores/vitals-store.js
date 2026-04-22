import { create } from "zustand";

// ─── BACKEND INTEGRATION NOTES ───────────────────────────────────────────────
// TODO: Replace seedVitals() with:
//   const { data } = await convex.query(api.vitals.listByUser, { userId })
// TODO: addReading → convex.mutation(api.vitals.add, { ...reading, userId })
// TODO: getVitalHistory → convex.query(api.vitals.historyByType, { userId, type, daysAgo: days })
// ─────────────────────────────────────────────────────────────────────────────

// ─── Helpers ─────────────────────────────────────────────────────────────────

export const NORMAL_RANGES = {
  heartRate:   { min: 60,  max: 100,  label: "Normal" },
  systolic:    { min: 90,  max: 120,  label: "Normal" },
  diastolic:   { min: 60,  max: 80,   label: "Normal" },
  spo2:        { min: 95,  max: 100,  label: "Excellent" },
  temperature: { min: 97,  max: 99.5, label: "Normal" },
  weight:      { min: 60,  max: 90,   label: "Healthy" },
  glucose:     { min: 70,  max: 140,  label: "Normal" },
  steps:       { min: 7000, max: 15000, label: "Active" },
  sleep:       { min: 7,   max: 9,    label: "Good" },
};

function statusForValue(type, value) {
  const range = NORMAL_RANGES[type];
  if (!range) return { label: "Unknown", color: "#8EBAA3" };
  if (value < range.min) return { label: "Low", color: "#2980B9" };
  if (value > range.max) return { label: "Elevated", color: "#E67E22" };
  return { label: range.label, color: "#27AE60" };
}

function computeTrend(values) {
  if (values.length < 3) return "stable";
  const first = values.slice(0, 3).reduce((a, b) => a + b, 0) / 3;
  const last = values.slice(-3).reduce((a, b) => a + b, 0) / 3;
  const diff = last - first;
  if (Math.abs(diff) < first * 0.03) return "stable";
  return diff > 0 ? "up" : "down";
}

// ─── Store ───────────────────────────────────────────────────────────────────

export const useVitalsStore = create((set, get) => ({
  readings: [],

  addVital: (type, value, timestamp = new Date().toISOString()) => {
    set((state) => ({
      readings: [
        ...state.readings,
        { id: `v-${Date.now()}`, type, value: parseFloat(value), unit: NORMAL_RANGES[type] ? undefined : undefined, timestamp },
      ],
    }));
  },

  // Returns a keyed object { heartRate: {...}, systolic: {...}, ... } or {} when empty
  getLatestVitals: () => {
    const { readings } = get();
    const types = ["heartRate", "systolic", "diastolic", "spo2", "temperature", "weight", "glucose", "steps", "sleep"];
    const result = {};
    types.forEach((type) => {
      const typeReadings = readings
        .filter((r) => r.type === type)
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      if (!typeReadings.length) return;
      const latest = typeReadings[0];
      const sevenDay = typeReadings.slice(0, 7).map((r) => r.value);
      const trend = computeTrend([...sevenDay].reverse());
      const { label: statusLabel, color: statusColor } = statusForValue(type, latest.value);
      result[type] = { type, value: latest.value, unit: latest.unit, statusLabel, statusColor, trend, timestamp: latest.timestamp };
    });
    return result;
  },

  getVitalHistory: (type, days = 7) => {
    const { readings } = get();
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    return readings
      .filter((r) => r.type === type && new Date(r.timestamp) >= cutoff)
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  },

  getVitalTrend: (type, days = 7) => {
    const history = get().getVitalHistory(type, days);
    const values = history.map((r) => r.value);
    return computeTrend(values);
  },

  getNormalRange: (type) => NORMAL_RANGES[type] || null,

  // Returns an array of actionable alerts for out-of-range vitals
  getHealthAlerts: () => {
    const latest = get().getLatestVitals();
    const ALERT_MESSAGES = {
      heartRate: {
        high: "Heart rate above normal. Consider resting and monitoring.",
        low:  "Heart rate below normal. Check if you're dehydrated or fatigued.",
      },
      systolic: {
        high: "Systolic BP elevated. Reduce salt intake and stress.",
        low:  "Systolic BP low. Stay hydrated and move slowly when standing.",
      },
      diastolic: {
        high: "Diastolic BP elevated. Monitor regularly and consult your doctor.",
        low:  "Diastolic BP low. Ensure adequate fluid intake.",
      },
      spo2: {
        low:  "Blood oxygen low. Take slow deep breaths and seek medical advice.",
      },
      temperature: {
        high: "Temperature above normal — possible fever. Rest and stay hydrated.",
        low:  "Temperature below normal. Warm up and monitor closely.",
      },
      glucose: {
        high: "Blood glucose elevated. Avoid sugary foods and increase activity.",
        low:  "Blood glucose low — eat something soon to raise levels.",
      },
      steps: {
        low:  "Daily steps below target. A short 15-min walk can make a difference.",
      },
      sleep: {
        low:  "Sleep duration low. Aim for 7–9 hours for optimal recovery.",
        high: "Sleeping more than usual. Check if you're feeling unwell.",
      },
    };
    const alerts = [];
    Object.entries(latest).forEach(([type, v]) => {
      const range = NORMAL_RANGES[type];
      if (!range) return;
      const msgs = ALERT_MESSAGES[type];
      if (!msgs) return;
      if (v.value > range.max && msgs.high) {
        alerts.push({ type, value: v.value, unit: v.unit, status: "high", statusColor: "#E67E22", message: msgs.high });
      } else if (v.value < range.min && msgs.low) {
        alerts.push({ type, value: v.value, unit: v.unit, status: "low", statusColor: "#2980B9", message: msgs.low });
      }
    });
    return alerts;
  },
}));

export { NORMAL_RANGES };
