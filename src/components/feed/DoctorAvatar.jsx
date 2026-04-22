"use client";

import { motion } from "framer-motion";

/**
 * DoctorAvatar — gradient circle with doctor initials.
 * Props: initials (string), gradient ([from, to] hex pair), size (number, default 40)
 */
export default function DoctorAvatar({ initials, gradient, size = 40 }) {
  const [from, to] = gradient || ["#0D6E4F", "#00C9A7"];
  const fontSize = Math.round(size * 0.33);

  return (
    <motion.div
      whileTap={{ scale: 0.92 }}
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: `linear-gradient(135deg, ${from}, ${to})`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        boxShadow: `0 2px 8px ${from}40`,
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-outfit, 'Outfit', sans-serif)",
          fontWeight: 800,
          fontSize,
          color: "#fff",
          letterSpacing: "0.03em",
          userSelect: "none",
        }}
      >
        {initials}
      </span>
    </motion.div>
  );
}
