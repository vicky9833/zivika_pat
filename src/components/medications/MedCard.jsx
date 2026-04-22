"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import MedCheckbox from "./MedCheckbox";

const H = "var(--font-outfit, 'Outfit', sans-serif)";
const B = "var(--font-dm-sans, 'DM Sans', sans-serif)";

/**
 * MedCard — a single medication row with checkbox, info, and time indicator.
 *
 * Props:
 *   med       medication object
 *   onToggle  () => void
 */
export default function MedCard({ med, onToggle }) {
  const [flash, setFlash] = useState(false);

  function handleToggle() {
    if (!med.taken) {
      // Green flash on checking
      setFlash(true);
      setTimeout(() => setFlash(false), 500);
    }
    onToggle();
  }

  return (
    <motion.div
      layout
      animate={{
        backgroundColor: flash ? "rgba(39,174,96,0.07)" : "#fff",
      }}
      transition={{ duration: 0.3 }}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "14px 16px",
        borderRadius: 14,
        border: med.taken ? "1px solid #DCE8E2" : "1px solid #B8D4C5",
        marginBottom: 0,
      }}
    >
      <MedCheckbox checked={med.taken} onToggle={handleToggle} disabled={!med.isToday} />

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            fontFamily: B,
            fontWeight: 600,
            fontSize: "0.9rem",
            color: med.taken ? "#8EBAA3" : "#0B1F18",
            margin: 0,
            textDecoration: med.taken ? "line-through" : "none",
            transition: "color 0.2s",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {med.name}
        </p>
        <p style={{ fontFamily: B, fontSize: "0.75rem", color: "#8EBAA3", margin: "2px 0 0" }}>
          {med.schedule}
        </p>
        {med.instructions && (
          <p
            style={{
              fontFamily: B,
              fontSize: "0.68rem",
              color: "#B8D4C5",
              fontStyle: "italic",
              margin: "2px 0 0",
            }}
          >
            {med.instructions}
          </p>
        )}
      </div>

      {/* Time/status */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2, flexShrink: 0 }}>
        <span style={{ fontSize: 16, lineHeight: 1 }}>💊</span>
        <AnimatePresence mode="wait">
          <motion.span
            key={med.taken ? "taken" : "pending"}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.18 }}
            style={{
              fontFamily: B,
              fontSize: "0.7rem",
              fontWeight: 700,
              color: med.taken ? "#27AE60" : med.isToday ? "#0D6E4F" : "#B8D4C5",
            }}
          >
            {med.taken ? "✓ Taken" : med.timeLabel || "Today"}
          </motion.span>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
