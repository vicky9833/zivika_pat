"use client";

import { useState, useRef } from "react";
import { Mic } from "lucide-react";

// ── SARVAM AI STT INTEGRATION POINT ──────────────────────────────────────────
// When integrating Sarvam AI Speech-to-Text:
//
// 1. Capture audio with the MediaRecorder API:
//      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//      const recorder = new MediaRecorder(stream);
//      recorder.ondataavailable = (e) => audioChunks.push(e.data);
//      recorder.start();
//
// 2. On stopRecording(), collect chunks into a Blob and send to Sarvam:
//      POST https://api.sarvam.ai/speech-to-text
//      Headers: { "api-subscription-key": process.env.NEXT_PUBLIC_SARVAM_API_KEY }
//      Body: FormData with:
//        - "file": audioBlob (WAV or MP3)
//        - "language_code": "hi-IN" | "kn-IN" | "en-IN" (based on selected language)
//        - "model": "saarika:v2"
//
// 3. Parse the response and call onResult(data.transcript)
// ─────────────────────────────────────────────────────────────────────────────

const SIMULATED_QUESTIONS = [
  "What does my latest blood report say?",
  "Should I be worried about my vitamin D levels?",
  "How is my diabetes being managed?",
  "What side effects should I watch for with Metformin?",
  "Summarize my current health status",
];

const PULSE_KEYFRAMES = `
@keyframes zivikaVoicePulse {
  0%   { transform: scale(1);    opacity: 0.55; }
  60%  { transform: scale(1.65); opacity: 0;    }
  100% { transform: scale(1.65); opacity: 0;    }
}
`;

/**
 * VoiceButton — mic button with recording animation and simulated STT.
 *
 * Props:
 *  onResult   (transcript: string) => void — called with the recognized text
 *  disabled   bool
 */
export default function VoiceButton({ onResult, disabled }) {
  const [recording, setRecording] = useState(false);
  const [label, setLabel] = useState(null); // "Listening..." | "Processing..." | null
  const timerRef = useRef(null);

  function startRecording() {
    setRecording(true);
    setLabel("Listening...");

    // Auto-stop after 3 seconds (replace with MediaRecorder stop in production)
    timerRef.current = setTimeout(() => {
      finishRecording();
    }, 3000);
  }

  function finishRecording() {
    clearTimeout(timerRef.current);
    setRecording(false);
    setLabel("Processing...");

    // Simulate ~800ms STT processing delay, then deliver mock transcript
    setTimeout(() => {
      setLabel(null);
      const q = SIMULATED_QUESTIONS[Math.floor(Math.random() * SIMULATED_QUESTIONS.length)];
      onResult(q);
    }, 800);
  }

  function handleClick() {
    if (disabled) return;
    if (recording) {
      finishRecording();
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
