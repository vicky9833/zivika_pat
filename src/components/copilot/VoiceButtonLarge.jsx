"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Mic } from "lucide-react";

const CSS = `
@keyframes zivikaVoicePulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(0,201,167,0.45), 0 8px 28px rgba(0,201,167,0.35); }
  50%       { box-shadow: 0 0 0 14px rgba(0,201,167,0), 0 8px 28px rgba(0,201,167,0.35); }
}
@keyframes zivikaRing {
  0%   { transform: scale(1); opacity: 0.55; }
  100% { transform: scale(2.4); opacity: 0; }
}
@keyframes zivikaSpinner {
  to { transform: rotate(360deg); }
}
`;

/**
 * VoiceButtonLarge — big 64px / 80px mic button for the Ask Doctor voice UI.
 *
 * Props:
 *   isRecording       bool
 *   isProcessing      bool
 *   onStartRecording  () => void
 *   onStopRecording   () => void
 */
export default function VoiceButtonLarge({
  isRecording,
  isProcessing,
  onStartRecording,
  onStopRecording,
}) {
  const size = isRecording ? 80 : 64;

  const bg = isRecording
    ? "linear-gradient(135deg, #DC2626 0%, #EF4444 100%)"
    : "linear-gradient(135deg, #0D6E4F 0%, #00C9A7 100%)";

  function handleClick() {
    if (isProcessing) return;
    if (isRecording) onStopRecording();
    else onStartRecording();
  }

  return (
    <>
      <style>{CSS}</style>
      <div
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 96,
          height: 96,
        }}
      >
        {/* Expanding concentric rings — recording state only */}
        <AnimatePresence>
          {isRecording &&
            [0, 1, 2].map((i) => (
              <div
                key={i}
                style={{
                  position: "absolute",
                  width: size,
                  height: size,
                  borderRadius: "50%",
                  border: "2px solid rgba(220,38,38,0.45)",
                  animation: `zivikaRing 1.6s ease-out ${i * 0.52}s infinite`,
                  pointerEvents: "none",
                }}
              />
            ))}
        </AnimatePresence>

        {/* Main button */}
        <motion.button
          animate={{ width: size, height: size }}
          transition={{ type: "spring", stiffness: 280, damping: 22 }}
          onClick={handleClick}
          disabled={isProcessing}
          style={{
            borderRadius: "50%",
            border: "none",
            background: bg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: isProcessing ? "default" : "pointer",
            flexShrink: 0,
            padding: 0,
            position: "relative",
            animation:
              !isRecording && !isProcessing
                ? "zivikaVoicePulse 2s ease-in-out infinite"
                : "none",
          }}
          aria-label={isRecording ? "Stop recording" : "Start recording"}
        >
          {isProcessing ? (
            // Spinner
            <div
              style={{
                width: 26,
                height: 26,
                borderRadius: "50%",
                border: "3px solid rgba(255,255,255,0.35)",
                borderTopColor: "#fff",
                animation: "zivikaSpinner 0.75s linear infinite",
              }}
            />
          ) : (
            <Mic size={isRecording ? 34 : 28} color="#fff" strokeWidth={2} />
          )}
        </motion.button>
      </div>
    </>
  );
}
