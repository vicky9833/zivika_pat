"use client";

import { motion } from "framer-motion";
import {
  Heart, Activity, Wind, Thermometer, Scale,
  Droplet, Footprints, Moon,
} from "lucide-react";

const H = "var(--font-outfit, 'Outfit', sans-serif)";
const B = "var(--font-dm-sans, 'DM Sans', sans-serif)";

const VITAL_ICON_MAP = {
  Heart, Activity, Wind, Thermometer, Scale, Droplet, Footprints, Moon,
};

// Type-specific icon background + color
const TYPE_COLORS = {
  heartRate:   { bg: "rgba(220,38,38,0.10)",   color: "#DC2626" },
  systolic:    { bg: "rgba(234,88,12,0.10)",   color: "#EA580C" },
  diastolic:   { bg: "rgba(234,88,12,0.10)",   color: "#EA580C" },
  spo2:        { bg: "rgba(37,99,235,0.10)",   color: "#2563EB" },
  temperature: { bg: "rgba(202,138,4,0.10)",   color: "#CA8A04" },
  weight:      { bg: "rgba(124,58,237,0.10)",  color: "#7C3AED" },
  glucose:     { bg: "rgba(234,179,8,0.10)",   color: "#CA8A04" },
  steps:       { bg: "rgba(13,110,79,0.10)",   color: "#0D6E4F" },
  sleep:       { bg: "rgba(79,70,229,0.10)",   color: "#4F46E5" },
};

const VITAL_META = {
  heartRate:   { label: "Heart Rate",     iconName: "Heart",       iconColor: "#E74C3C", unit: "bpm",   formatVal: (v) => v },
  systolic:    { label: "Systolic BP",    iconName: "Activity",    iconColor: "#9333EA", unit: "mmHg",  formatVal: (v) => v },
  diastolic:   { label: "Diastolic BP",   iconName: "Activity",    iconColor: "#9333EA", unit: "mmHg",  formatVal: (v) => v },
  spo2:        { label: "SpO₂",           iconName: "Wind",        iconColor: "#2980B9", unit: "%",     formatVal: (v) => v },
  temperature: { label: "Temperature",    iconName: "Thermometer", iconColor: "#EA580C", unit: "°F",    formatVal: (v) => v },
  weight:      { label: "Weight",         iconName: "Scale",       iconColor: "#5A9A7E", unit: "kg",    formatVal: (v) => v },
  glucose:     { label: "Blood Glucose",  iconName: "Droplet",     iconColor: "#E74C3C", unit: "mg/dL", formatVal: (v) => v },
  steps:       { label: "Today's Steps",  iconName: "Footprints",  iconColor: "#0D9488", unit: "steps", formatVal: (v) => v.toLocaleString("en-IN") },
  sleep:       { label: "Sleep",          iconName: "Moon",        iconColor: "#4F46E5", unit: "hrs",   formatVal: (v) => v },
};

const TREND_ICON = { up: "↑", down: "↓", stable: "→" };
const TREND_COLOR = { up: "#E67E22", down: "#2980B9", stable: "#27AE60" };

export { VITAL_META };
export default function VitalCard({ type, value, statusLabel, statusColor, trend, onClick, active }) {
  const meta = VITAL_META[type] || { label: type, iconName: "Activity", iconColor: "#0D6E4F", unit: "", formatVal: (v) => v };
  const VIcon = VITAL_ICON_MAP[meta.iconName] || Activity;
  const tc = TYPE_COLORS[type] || { bg: "rgba(13,110,79,0.10)", color: "#0D6E4F" };

  return (
    <motion.div
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      style={{
        background: active ? "rgba(13,110,79,0.03)" : "#fff",
        border: active ? "2px solid #0D6E4F" : "1px solid #DCE8E2",
        borderRadius: 16,
        padding: "14px 12px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        cursor: "pointer",
        textAlign: "center",
        transition: "background 0.2s, border-color 0.2s",
        boxShadow: active ? "0 4px 16px rgba(13,110,79,0.12)" : "none",
      }}
    >
      <div style={{
        width: 40, height: 40, borderRadius: 12,
        background: tc.bg,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <VIcon size={18} color={tc.color} />
      </div>

      <div style={{ marginTop: 8 }}>
        <span style={{ fontFamily: H, fontWeight: 700, fontSize: "1.125rem", color: "#0B1F18", letterSpacing: "-0.01em" }}>
          {meta.formatVal(value)}
        </span>
        {meta.unit && (
          <span style={{ fontFamily: B, fontSize: "0.625rem", color: "#8EBAA3", marginLeft: 2 }}>{meta.unit}</span>
        )}
      </div>

      <span style={{ fontFamily: B, fontSize: "0.6875rem", color: "#5A7A6E", marginTop: 4, lineHeight: 1.3 }}>
        {meta.label}
      </span>

      {/* Status dot */}
      <div style={{
        width: 6, height: 6, borderRadius: 3,
        background: statusColor || "#8EBAA3",
        marginTop: 4,
      }} />
    </motion.div>
  );
}
