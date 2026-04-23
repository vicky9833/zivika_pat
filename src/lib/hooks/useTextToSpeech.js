"use client";
import { useState, useRef, useCallback } from "react";

const VOICE_LANGUAGE_CODES = {
  en: "en-IN",
  hi: "hi-IN",
  kn: "kn-IN",
  ta: "ta-IN",
  te: "te-IN",
  bn: "bn-IN",
  mr: "mr-IN",
};

export function useTextToSpeech() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const utteranceRef = useRef(null);

  const isSupported =
    typeof window !== "undefined" && "speechSynthesis" in window;

  const speak = useCallback((text, language = "en") => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    // Cancel any current speech
    window.speechSynthesis.cancel();

    const langCode = VOICE_LANGUAGE_CODES[language] || "en-IN";

    // Clean text: strip markdown and limit length for TTS
    const cleanText = text
      .replace(/[*#`]/g, "")
      .replace(/\n+/g, ". ")
      .substring(0, 1000);

    if (!cleanText.trim()) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utteranceRef.current = utterance;
    utterance.lang = langCode;
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    // Pick a voice matching the language if available
    const trySetVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      const preferred = voices.find(
        (v) =>
          v.lang === langCode ||
          v.lang.startsWith(langCode.split("-")[0])
      );
      if (preferred) utterance.voice = preferred;
    };

    // Voices may load asynchronously
    if (window.speechSynthesis.getVoices().length > 0) {
      trySetVoice();
    } else {
      window.speechSynthesis.onvoiceschanged = trySetVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  }, []);

  const stopSpeaking = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  }, []);

  return {
    isSpeaking,
    speak,
    stopSpeaking,
    isSupported,
  };
}
