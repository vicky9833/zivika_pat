"use client";

import { useState, useRef, useEffect } from "react";
import { Mic } from "lucide-react";

const LANG_CODES = {
  en: "en-IN",
  hi: "hi-IN",
  kn: "kn-IN",
  ta: "ta-IN",
  te: "te-IN",
  bn: "bn-IN",
  mr: "mr-IN",
};

const PULSE_KEYFRAMES = `
@keyframes zivikaVoicePulse {
  0%   { transform: scale(1);    opacity: 0.55; }
  60%  { transform: scale(1.65); opacity: 0;    }
  100% { transform: scale(1.65); opacity: 0;    }
}
`;

/**
 * VoiceButton — mic button with Web Speech API real-time transcription.
 *
 * Props:
 *  onResult   (finalTranscript: string) => void — called with the final text
 *  onInterim  (liveTranscript: string) => void — live text as user speaks (optional)
 *  language   "en" | "hi" | "kn" | "ta" | "te" | "bn" | "mr"
 *  disabled   bool
 */
export default function VoiceButton({ onResult, onInterim, language = "en", disabled }) {
  const [recording, setRecording] = useState(false);
  const [label, setLabel] = useState(null);
  const recognitionRef = useRef(null);
  const finalRef = useRef("");

  // Clean up on unmount
  useEffect(() => {
    return () => { recognitionRef.current?.abort(); };
  }, []);

  function startRecording() {
    const SpeechRecognition =
      typeof window !== "undefined" &&
      (window.SpeechRecognition || window.webkitSpeechRecognition);

    if (!SpeechRecognition) {
      setLabel("Not supported");
      setTimeout(() => setLabel(null), 2500);
      return;
    }

    finalRef.current = "";
    const recognition = new SpeechRecognition();
    recognition.lang = LANG_CODES[language] || "en-IN";
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.continuous = false;

    recognition.onstart = () => {
      setRecording(true);
      setLabel("Listening...");
    };

    recognition.onresult = (event) => {
      let interim = "";
      let final = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += t;
        } else {
          interim += t;
        }
      }
      if (final) finalRef.current += final;
      // Push live text into the input as user speaks
      if (onInterim) onInterim(finalRef.current + interim);
    };

    recognition.onend = () => {
      setRecording(false);
      setLabel(null);
      const result = finalRef.current.trim();
      if (result) {
        onResult(result);
      } else if (onInterim) {
        onInterim(""); // clear any interim text if nothing final
      }
      recognitionRef.current = null;
    };

    recognition.onerror = (e) => {
      setRecording(false);
      if (e.error === "not-allowed") {
        setLabel("Mic blocked");
      } else if (e.error === "no-speech") {
        setLabel("No speech");
      } else {
        setLabel("Try again");
      }
      setTimeout(() => setLabel(null), 2500);
      recognitionRef.current = null;
    };

    recognitionRef.current = recognition;
    recognition.start();
  }

  function stopRecording() {
    recognitionRef.current?.stop();
  }

  function handleClick() {
    if (disabled && !recording) return;
    if (recording) {
      stopRecording();
    } else {
      startRecording();
    }
  }

  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        flexShrink: 0,
      }}
    >
      <style>{PULSE_KEYFRAMES}</style>

      {/* Pulsing ring — only visible during recording */}
      {recording && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: 40,
            height: 40,
            borderRadius: "50%",
            background: "rgba(231,76,60,0.4)",
            animation: "zivikaVoicePulse 1.1s ease-out infinite",
            pointerEvents: "none",
          }}
        />
      )}

      <button
        onClick={handleClick}
        disabled={disabled && !recording}
        aria-label={recording ? "Stop recording" : "Start voice input"}
        style={{
          width: 40,
          height: 40,
          borderRadius: "50%",
          border: recording ? "none" : "1.5px solid #DCE8E2",
          background: recording ? "#E74C3C" : "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: disabled && !recording ? "default" : "pointer",
          flexShrink: 0,
          position: "relative",
          zIndex: 1,
          transition: "background 0.2s, border-color 0.2s",
        }}
      >
        <Mic size={16} color={recording ? "#fff" : "#8EBAA3"} />
      </button>

      {/* Status label below button */}
      {label && (
        <p
          style={{
            position: "absolute",
            top: "calc(100% + 3px)",
            left: "50%",
            transform: "translateX(-50%)",
            fontFamily: "var(--font-dm-sans, 'DM Sans', sans-serif)",
            fontSize: "0.6rem",
            color: recording ? "#E74C3C" : "#8EBAA3",
            margin: 0,
            whiteSpace: "nowrap",
            pointerEvents: "none",
          }}
        >
          {label}
        </p>
      )}
    </div>
  );
}
