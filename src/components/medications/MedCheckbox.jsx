"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";

const PULSE_KEYFRAMES = `
@keyframes zivikaCheckPulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(18,151,82,0.0); }
  50%       { box-shadow: 0 0 0 6px rgba(18,151,82,0.18); }
}
`;

/**
 * MedCheckbox — large, satisfying animated pill checkbox.
 *
 * Props:
 *   checked   bool
 *   onToggle  () => void
 *   disabled  bool
 */
export default function MedCheckbox({ checked, onToggle, disabled }) {
  return (
    <>
      <style>{PULSE_KEYFRAMES}</style>
      <motion.button
        onClick={() => !disabled && onToggle()}
        whileTap={{ scale: 0.82 }}
        animate={checked ? { scale: [1, 1.18, 1] } : {}}
        transition={{ type: "spring", stiffness: 440, damping: 18 }}
        aria-label={checked ? "Mark as not taken" : "Mark as taken"}
        style={{
          width: 44,
          height: 44,
          borderRadius: "50%",
          border: checked ? "none" : "2px dashed #B8D4C5",
          background: checked ? "linear-gradient(135deg, #27AE60, #2ECC71)" : "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: disabled ? "default" : "pointer",
          flexShrink: 0,
          boxShadow: checked
            ? "0 3px 12px rgba(39,174,96,0.35)"
            : "none",
          animation: !checked && !disabled ? "zivikaCheckPulse 2.8s ease-in-out infinite" : "none",
          transition: "background 0.2s, border 0.2s, box-shadow 0.2s",
        }}
      >
        {checked && (
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 22 }}
          >
            <Check size={20} color="#fff" strokeWidth={3} />
          </motion.div>
        )}
      </motion.button>
    </>
  );
}
