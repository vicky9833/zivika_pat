"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Droplets, Wind, Activity, Brain, Leaf, ChevronDown } from "lucide-react";

const H = "var(--font-outfit, 'Outfit', sans-serif)";
const B = "var(--font-dm-sans, 'DM Sans', sans-serif)";

const CATEGORY_LABELS = {
  cardiovascular: "Cardiovascular",
  metabolic: "Metabolic",
  respiratory: "Respiratory",
  musculoskeletal: "Musculoskeletal",
  mentalWellness: "Mental Wellness",
  nutrition: "Nutrition",
};

// Lucide icon + color per category (Task 1C spec)
const CATEGORY_ICON_MAP = {
  cardiovascular:  { icon: Heart,    color: "#E74C3C" },
  metabolic:       { icon: Droplets, color: "#F39C12" },
  respiratory:     { icon: Wind,     color: "#2563EB" },
  musculoskeletal: { icon: Activity, color: "#7C3AED" },
  mentalWellness:  { icon: Brain,    color: "#0D9488" },
  nutrition:       { icon: Leaf,     color: "#27AE60" },
};

function scoreColor(score) {
  if (score >= 80) return "#27AE60";
  if (score >= 60) return "#E67E22";
  return "#E74C3C";
}

function scoreGradient(score) {
  if (score >= 80) return "linear-gradient(90deg, #27AE60, #2ECC71)";
  if (score >= 60) return "linear-gradient(90deg, #E67E22, #F39C12)";
  return "linear-gradient(90deg, #E74C3C, #C0392B)";
}

function TrendBadge({ trend }) {
  const map = {
    improving: { label: "↑ Improving", color: "#27AE60", bg: "rgba(39,174,96,0.10)" },
    stable:    { label: "→ Stable",    color: "#5A9A7E", bg: "rgba(90,154,126,0.10)" },
    declining: { label: "↓ Declining", color: "#E74C3C", bg: "rgba(231,76,60,0.10)"  },
  };
  const t = map[trend] || map.stable;
  return (
    <span
      style={{
        padding: "2px 8px",
        borderRadius: 6,
        background: t.bg,
        fontFamily: B,
        fontWeight: 700,
        fontSize: "0.65rem",
        color: t.color,
        letterSpacing: "0.01em",
      }}
    >
      {t.label}
    </span>
  );
}

function AnimatedBar({ score, delay = 0 }) {
  return (
    <div
      style={{
        height: 6,
        borderRadius: 3,
        background: "#DCE8E2",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${score}%` }}
        transition={{ duration: 1, ease: "easeOut", delay }}
        style={{
          height: "100%",
          borderRadius: 3,
          background: scoreGradient(score),
        }}
      />
    </div>
  );
}

function CategoryRow({ name, data, index }) {
  const [open, setOpen] = useState(false);
  const label = CATEGORY_LABELS[name] || name;
  const catConfig = CATEGORY_ICON_MAP[name] || { icon: Activity, color: "#8EBAA3" };
  const CatIcon = catConfig.icon;
  const iconColor = catConfig.color;
  const color = scoreColor(data.score);

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 16,
        border: "1px solid #DCE8E2",
        overflow: "hidden",
      }}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          width: "100%",
          background: "transparent",
          border: "none",
          padding: "14px 16px",
          cursor: "pointer",
          textAlign: "left",
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        {/* Top row: icon container + name / score + chevron */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* 40×40 icon container */}
          <div
            style={{
              width: 40, height: 40, borderRadius: 10,
              background: `${iconColor}14`,
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <CatIcon size={18} color={iconColor} />
          </div>
          <span
            style={{
              fontFamily: H, fontWeight: 600, fontSize: "0.92rem",
              color: "#0B1F18", flex: 1,
            }}
          >
            {label}
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              style={{
                fontFamily: H, fontWeight: 800, fontSize: "1.15rem",
                color, lineHeight: 1,
              }}
            >
              {data.score}
            </span>
            <ChevronDown
              size={15}
              color="#8EBAA3"
              style={{
                transition: "transform 0.2s",
                transform: open ? "rotate(180deg)" : "rotate(0deg)",
                flexShrink: 0,
              }}
            />
          </div>
        </div>

        {/* Progress bar */}
        <AnimatedBar score={data.score} delay={index * 0.08} />

        {/* Trend badge */}
        <TrendBadge trend={data.trend} />
      </button>

      {/* Expandable factors */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="factors"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}
          >
            <div
              style={{
                borderTop: "1px solid #F0F7F4",
                padding: "10px 16px 14px 16px",
                display: "flex",
                flexDirection: "column",
                gap: 7,
              }}
            >
              {data.factors.map((f, fi) => (
                <div
                  key={fi}
                  style={{ display: "flex", gap: 8, alignItems: "flex-start" }}
                >
                  <span
                    style={{
                      width: 5,
                      height: 5,
                      borderRadius: "50%",
                      background: color,
                      marginTop: 6,
                      flexShrink: 0,
                    }}
                  />
                  <p
                    style={{
                      fontFamily: B,
                      fontSize: "0.78rem",
                      color: "#5A7A6E",
                      margin: 0,
                      lineHeight: 1.55,
                    }}
                  >
                    {f}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * ScoreBreakdown — expandable list of 6 health category scores.
 *
 * Props:
 *   categories  — categories object from computeTwinScores()
 */
export default function ScoreBreakdown({ categories }) {
  const entries = Object.entries(categories);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {entries.map(([name, data], i) => (
        <CategoryRow key={name} name={name} data={data} index={i} />
      ))}
    </div>
  );
}
