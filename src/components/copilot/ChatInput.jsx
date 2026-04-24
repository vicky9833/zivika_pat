"use client";

import { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";
import VoiceButton from "./VoiceButton";

const B = "var(--font-dm-sans, 'DM Sans', sans-serif)";

const PLACEHOLDERS = {
  en: "Ask anything about your health...",
  hi: "अपना सवाल पूछें...",
  kn: "ನಿಮ್ಮ ಆರೋಗ್ಯ ಬಗ್ಗೆ ಕೇಳಿ...",
};

/**
 * ChatInput — fixed bottom input bar with voice button, textarea, and send button.
 *
 * Props:
 *  onSend     (text: string) => void
 *  language   "en" | "hi" | "kn"
 *  disabled   bool — disables input while AI is typing
 */
export default function ChatInput({ onSend, language = "en", disabled }) {
  const [text, setText] = useState("");
  const textareaRef = useRef(null);

  // Auto-grow textarea up to ~5 lines (120px)
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  }, [text]);

  function handleSend() {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setText("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleVoiceResult(transcript) {
    setText(transcript);
    setTimeout(() => textareaRef.current?.focus(), 50);
  }

  function handleVoiceInterim(interim) {
    setText(interim);
  }

  const canSend = text.trim().length > 0 && !disabled;

  return (
    <div
      style={{
        position: "fixed",
        bottom: "calc(72px + env(safe-area-inset-bottom, 0px))",
        left: "50%",
        transform: "translateX(-50%)",
        width: "100%",
        maxWidth: 390,
        background: "#fff",
        borderTop: "1px solid #DCE8E2",
        padding: "10px 16px 12px",
        display: "flex",
        alignItems: "flex-end",
        gap: 8,
        zIndex: 30,
        boxSizing: "border-box",
      }}
    >
      <VoiceButton
        onResult={handleVoiceResult}
        onInterim={handleVoiceInterim}
        language={language}
        disabled={disabled}
      />

      <textarea
        ref={textareaRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={PLACEHOLDERS[language] || PLACEHOLDERS.en}
        rows={1}
        disabled={disabled}
        style={{
          flex: 1,
          resize: "none",
          border: "1px solid #DCE8E2",
          borderRadius: 24,
          padding: "10px 16px",
          fontFamily: B,
          fontSize: "0.875rem",
          color: "#0B1F18",
          background: disabled ? "#F0F7F4" : "#F0F7F4",
          outline: "none",
          lineHeight: 1.5,
          minHeight: 40,
          maxHeight: 120,
          overflowY: "auto",
          display: "block",
          transition: "border-color 0.15s",
          boxSizing: "border-box",
        }}
        onFocus={(e) => (e.target.style.borderColor = "#0D6E4F")}
        onBlur={(e) => (e.target.style.borderColor = "#DCE8E2")}
      />

      <button
        onClick={handleSend}
        disabled={!canSend}
        aria-label="Send message"
        style={{
          width: 40,
          height: 40,
          borderRadius: "50%",
          border: "none",
          background: canSend
            ? "#0D6E4F"
            : "#DCE8E2",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: canSend ? "pointer" : "default",
          flexShrink: 0,
          transition: "background 0.18s",
        }}
      >
        <Send size={16} color={canSend ? "#fff" : "#8EBAA3"} />
      </button>
    </div>
  );
}
