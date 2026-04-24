"use client";

import { motion } from "framer-motion";
import { Stethoscope, Volume2, VolumeX } from "lucide-react";
import { useTextToSpeech } from "@/lib/hooks/useTextToSpeech";

const B = "var(--font-dm-sans, 'DM Sans', sans-serif)";
const NOTO_STACK = "'Noto Sans', 'Noto Sans Devanagari', 'Noto Sans Kannada', 'Noto Sans Tamil', 'Noto Sans Telugu', 'Noto Sans Bengali', var(--font-noto), var(--font-devanagari), var(--font-dm-sans), sans-serif";

function formatTime(date) {
  if (!date) return "";
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
}

/**
 * Minimal markdown â†’ plain-text renderer.
 * Since AI responses are now plain-text (PLAIN_TEXT_RULE), this is mostly
 * passthrough but still handles any residual **bold** or bullet lines.
 */
function renderText(text, isUser) {
  const lines = (text || "").split("\n");
  return lines.map((line, li) => {
    const parts = line.split(/\*\*(.*?)\*\*/g);
    const rendered = parts.map((part, pi) =>
      pi % 2 === 1 ? (
        <strong key={pi} style={{ fontWeight: 700 }}>{part}</strong>
      ) : (
        <span key={pi}>{part}</span>
      )
    );
    const isBullet = line.trim().startsWith("â€¢") || line.trim().startsWith("-");
    const isEmpty = line.trim() === "";
    return (
      <span
        key={li}
        style={{
          display: "block",
          marginTop: li === 0 ? 0 : isEmpty ? 6 : isBullet ? 3 : 5,
          paddingLeft: isBullet ? 2 : 0,
          color: isUser ? "#fff" : "#0B1F18",
        }}
      >
        {rendered}
      </span>
    );
  });
}

/**
 * ChatBubble â€” renders a single chat message.
 *
 * Props:
 *  role        "user" | "assistant"
 *  text        message string
 *  timestamp   Date object or number
 *  showAvatar  bool â€” show AI avatar for first in a sequence
 *  language    string â€” language code for TTS (default "en")
 *  onSpeak     optional override function(text) â€” if provided, called instead of internal TTS
 */
export default function ChatBubble({ role, text, timestamp, showAvatar, language = "en", onSpeak }) {
  const isUser = role === "user";
  const { isSpeaking, speak, stopSpeaking, currentText } = useTextToSpeech();
  // Only show as active if THIS bubble's text is currently being spoken
  const isThisBubbleSpeaking = isSpeaking && currentText === text;

  function handleSpeak() {
    if (isThisBubbleSpeaking) {
      stopSpeaking();
    } else if (onSpeak) {
      onSpeak(text);
    } else {
      speak(text, language);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: isUser ? 18 : -18, y: 4 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: isUser ? "flex-end" : "flex-start",
        marginBottom: 4,
      }}
    >
      {/* â”€â”€ Message row (avatar + bubble) â”€â”€ */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          gap: 8,
          flexDirection: isUser ? "row-reverse" : "row",
          maxWidth: isUser ? "80%" : "85%",
        }}
      >
        {/* Assistant avatar */}
        {!isUser && (
          <div
            style={{
              width: 28, height: 28, borderRadius: "50%",
              background: showAvatar
                ? "linear-gradient(135deg, #0D6E4F, #00C9A7)"
                : "transparent",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
              alignSelf: "flex-end",
              opacity: showAvatar ? 1 : 0,
            }}
          >
            {showAvatar && <Stethoscope size={12} color="#fff" />}
          </div>
        )}

        {/* Bubble */}
        <div
          className="chat-text-content chat-bubble-text"
          style={{
            background: isUser
              ? "linear-gradient(135deg, #0D6E4F, #065F46)"
              : "#fff",
            borderRadius: isUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
            padding: "12px 16px",
            border: isUser ? "none" : "1px solid #DCE8E2",
            boxShadow: isUser ? "none" : "0 2px 8px rgba(0,0,0,0.04)",
            fontFamily: NOTO_STACK,
            fontSize: "0.875rem",
            lineHeight: 1.7,
            wordBreak: "break-word",
            overflowWrap: "anywhere",
            minWidth: 60,
          }}
        >
          {renderText(text, isUser)}
        </div>
      </div>

      {/* â”€â”€ Bottom row: timestamp + speaker (assistant only) â”€â”€ */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginTop: 4,
          paddingLeft: !isUser ? 36 : 0,
          paddingRight: isUser ? 0 : 0,
          flexDirection: isUser ? "row-reverse" : "row",
        }}
      >
        <span
          style={{
            fontFamily: B,
            fontSize: "0.63rem",
            color: "#B8D4C5",
          }}
        >
          {formatTime(timestamp)}
        </span>

        {/* Speaker button â€” only for assistant messages */}
        {!isUser && (
          <button
            onClick={handleSpeak}
            style={{
              width: 24, height: 24, borderRadius: "50%",
              background: isThisBubbleSpeaking ? "rgba(13,110,79,0.18)" : "rgba(13,110,79,0.08)",
              border: isThisBubbleSpeaking ? "1.5px solid #0D6E4F" : "none",
              cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              padding: 0, flexShrink: 0,
              transition: "all 0.15s",
            }}
            title={isThisBubbleSpeaking ? "Stop audio" : "Play audio"}
            aria-label={isThisBubbleSpeaking ? "Stop speaking" : "Read aloud"}
          >
            {isThisBubbleSpeaking
              ? <VolumeX size={12} color="#0D6E4F" />
              : <Volume2 size={12} color="#8EBAA3" />}
          </button>
        )}
      </div>
    </motion.div>
  );
}
