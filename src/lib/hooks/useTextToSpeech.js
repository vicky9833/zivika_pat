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

    window.speechSynthesis.cancel();

    const langCode = VOICE_LANGUAGE_CODES[language] || "en-IN";

    // Strip all markdown symbols + limit to 800 chars for natural TTS pacing
    const cleanText = text
      .replace(/[*#`]/g, "")
      .replace(/\n+/g, ". ")
      .substring(0, 800);

    if (!cleanText.trim()) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utteranceRef.current = utterance;
    utterance.lang = langCode;
    utterance.rate = 0.85;   // Slightly slower for clarity
    utterance.pitch = 1.1;   // Slightly higher for a warmer female-sounding default
    utterance.volume = 1.0;

    // Prefer a female Indian voice (Raveena / Aditi / Priya or any non-male)
    const setFemaleVoice = () => {
      const voices = window.speechSynthesis.getVoices();

      const femaleVoice =
        // 1. Exact lang + explicitly female label
        voices.find(v => v.lang === langCode && v.name.toLowerCase().includes("female")) ||
        // 2. Exact lang + NOT explicitly male (default female voice)
        voices.find(v => v.lang === langCode && !v.name.toLowerCase().includes("male")) ||
        // 3. Named Indian female voices in any en-* lang
        voices.find(v => v.lang.startsWith("en") && (
          v.name.includes("Raveena") ||
          v.name.includes("Aditi") ||
          v.name.includes("Priya") ||
          v.name.toLowerCase().includes("female")
        )) ||
        // 4. Any voice starting with same primary language
        voices.find(v => v.lang.startsWith(langCode.split("-")[0])) ||
        null;

      if (femaleVoice) utterance.voice = femaleVoice;
    };

    if (window.speechSynthesis.getVoices().length > 0) {
      setFemaleVoice();
    } else {
      window.speechSynthesis.onvoiceschanged = setFemaleVoice;
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
