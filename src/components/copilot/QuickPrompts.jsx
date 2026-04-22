"use client";

import { motion } from "framer-motion";

const B = "var(--font-dm-sans, 'DM Sans', sans-serif)";

const DEFAULT_PROMPTS = [
  "What's going on with my sugar levels?",
  "Should I worry about this vitamin D thing?",
  "Any food tips for my diabetes?",
  "Break down my last blood test for me",
  "Am I taking too many tablets?",
  "Summarize how I'm doing overall",
];

/**
 * QuickPrompts — horizontally scrollable pill suggestions.
 *
 * Props:
 *  prompts    string[] (optional, defaults to DEFAULT_PROMPTS)
 *  onSelect   (prompt: string) => void
 */
export default function QuickPrompts({ prompts = DEFAULT_PROMPTS, onSelect }) {
  return (
    <div
      style={{
        display: "flex",
        gap: 8,
        overflowX: "auto",
        padding: "0 20px 12px",
        scrollbarWidth: "none",
        WebkitOverflowScrolling: "touch",
        msOverflowStyle: "none",
      }}
    >
      {prompts.map((prompt, i) => (
        <motion.button
          key={i}
          whileTap={{ scale: 0.92 }}
          onClick={() => onSelect(prompt)}
          style={{
            flexShrink: 0,
            padding: "8px 14px",
            borderRadius: 20,
            border: "none",
            background: "#F0F7F4",
            fontFamily: B,
            fontWeight: 500,
            fontSize: "0.8125rem",
            color: "#5A7A6E",
            cursor: "pointer",
            whiteSpace: "nowrap",
            lineHeight: 1.4,
          }}
        >
          {prompt}
        </motion.button>
      ))}
    </div>
  );
}
