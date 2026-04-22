"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText } from "lucide-react";
import { PROCESSING_STEPS } from "@/lib/sarvam";

const H = "var(--font-outfit, 'Outfit', sans-serif)";
const B = "var(--font-dm-sans, 'DM Sans', sans-serif)";

export default function ProcessingAnimation({ imageUrl }) {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStepIndex((i) => {
        if (i < PROCESSING_STEPS.length - 1) return i + 1;
        clearInterval(interval);
        return i;
      });
    }, 720);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      style={{
        minHeight: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 24px",
        position: "relative",
        overflow: "hidden",
        background: "#0B1F18",
      }}
    >
      {/* Blurred background from the report image */}
      {imageUrl && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url(${imageUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "blur(28px) brightness(0.25) saturate(0.6)",
            transform: "scale(1.15)",
            zIndex: 0,
          }}
        />
      )}

      {/* Dark gradient overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(11,31,24,0.8) 0%, rgba(13,110,79,0.25) 60%, rgba(11,31,24,0.9) 100%)",
          zIndex: 1,
        }}
      />

      {/* Content layer */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 36,
        }}
      >
        {/* ── Animated scan visualizer ──────────────────────────── */}
        <div style={{ position: "relative", width: 180, height: 180 }}>
          {/* Pulsing concentric rings */}
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{
                scale: [1, 1.6 + i * 0.3, 2.2 + i * 0.3],
                opacity: [0.55, 0.2, 0],
              }}
              transition={{
                duration: 2.2,
                repeat: Infinity,
                delay: i * 0.75,
                ease: "easeOut",
              }}
              style={{
                position: "absolute",
                inset: 0,
                margin: "auto",
                width: 90,
                height: 90,
                borderRadius: "50%",
                border: "2px solid #00C9A7",
              }}
            />
          ))}

          {/* Thumbnail frame with scanning line */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 104,
              height: 104,
              borderRadius: 14,
              border: "2px solid rgba(0,201,167,0.45)",
              overflow: "hidden",
              background: "rgba(13,110,79,0.45)",
              zIndex: 2,
            }}
          >
            {imageUrl ? (
              <img
                src={imageUrl}
                alt="Report being analyzed"
                style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.8 }}
              />
            ) : (
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "rgba(0,201,167,0.15)",
                }}
              >
                <FileText size={36} color="#00C9A7" />
              </div>
            )}
          </div>

          {/* Scanning line — moves top→bottom over the thumbnail */}
          <motion.div
            animate={{ top: [38, 142, 38] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "linear" }}
            style={{
              position: "absolute",
              left: 38, // aligns with thumbnail left edge (center - 52px)
              width: 104,
              height: 2.5,
              background:
                "linear-gradient(90deg, transparent 0%, #00C9A7 30%, #00FFD1 50%, #00C9A7 70%, transparent 100%)",
              boxShadow: "0 0 10px 2px rgba(0,201,167,0.6)",
              borderRadius: 2,
              zIndex: 4,
            }}
          />

          {/* Corner accent marks on the thumbnail */}
          {[
            { top: 32, left: 32 },
            { top: 32, right: 32 },
            { bottom: 32, left: 32 },
            { bottom: 32, right: 32 },
          ].map((pos, i) => {
            const isRight = "right" in pos;
            const isBottom = "bottom" in pos;
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  width: 14,
                  height: 14,
                  borderTop: isBottom ? "none" : "2px solid #00C9A7",
                  borderBottom: isBottom ? "2px solid #00C9A7" : "none",
                  borderLeft: isRight ? "none" : "2px solid #00C9A7",
                  borderRight: isRight ? "2px solid #00C9A7" : "none",
                  borderRadius: isBottom
                    ? isRight ? "0 0 3px 0" : "0 0 0 3px"
                    : isRight ? "0 3px 0 0" : "3px 0 0 0",
                  zIndex: 5,
                  ...pos,
                }}
              />
            );
          })}
        </div>

        {/* ── Status text ────────────────────────────────────────── */}
        <div style={{ textAlign: "center", maxWidth: 260 }}>
          <p
            style={{
              fontFamily: H,
              fontWeight: 700,
              fontSize: "1.3rem",
              color: "#fff",
              margin: "0 0 10px",
              letterSpacing: "-0.01em",
            }}
          >
            AI is reading your report
          </p>

          <AnimatePresence mode="wait">
            <motion.p
              key={stepIndex}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.28 }}
              style={{
                fontFamily: B,
                fontSize: "0.9rem",
                color: "#00C9A7",
                margin: 0,
                letterSpacing: "0.01em",
              }}
            >
              {PROCESSING_STEPS[stepIndex]}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* ── Progress dots ──────────────────────────────────────── */}
        <div style={{ display: "flex", gap: 7, alignItems: "center" }}>
          {PROCESSING_STEPS.map((_, i) => (
            <motion.div
              key={i}
              animate={{
                background: i <= stepIndex ? "#00C9A7" : "rgba(255,255,255,0.18)",
                scale: i === stepIndex ? 1.4 : 1,
              }}
              transition={{ duration: 0.2 }}
              style={{ width: 6, height: 6, borderRadius: "50%" }}
            />
          ))}
        </div>

        {/* ── Branding watermark ─────────────────────────────────── */}
        <motion.p
          animate={{ opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 3, repeat: Infinity }}
          style={{
            fontFamily: H,
            fontSize: "0.7rem",
            color: "rgba(255,255,255,0.3)",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            margin: 0,
          }}
        >
          Zivika Labs AI · Medical Analysis
        </motion.p>
      </div>
    </motion.div>
  );
}
