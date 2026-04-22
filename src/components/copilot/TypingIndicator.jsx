"use client";

import { motion } from "framer-motion";
import { Stethoscope } from "lucide-react";

export default function TypingIndicator() {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 8, padding: "4px 16px" }}>
      {/* AI avatar */}
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #0D6E4F, #00C9A7)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          marginBottom: 4,
        }}
      >
        <Stethoscope size={12} color="#fff" />
      </div>

      {/* Bubble with three bouncing dots */}
      <div
        style={{
          background: "#fff",
          border: "1px solid #DCE8E2",
          borderRadius: "18px 18px 18px 4px",
          padding: "12px 18px",
          display: "flex",
          gap: 5,
          alignItems: "center",
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        }}
      >
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "#0D6E4F",
              display: "block",
              flexShrink: 0,
            }}
          />
        ))}
      </div>
    </div>
  );
}
