"use client";
import { useState, useRef, useCallback } from "react";

export function useTextToSpeech() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const utteranceRef = useRef(null);

  const isSupported =
    typeof window !== "undefined" && "speechSynthesis" in window;

  const speak = useCallback((text, language = "en") => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    window.speechSynthesis.cancel();

    const LANG_CODES = {
      en: "en-IN",
      hi: "hi-IN",
      kn: "kn-IN",
      ta: "ta-IN",
      te: "te-IN",
      bn: "bn-IN",
      mr: "mr-IN",
    };

    const cleanText = text
      .replace(/[*#`\[\]]/g, "")
      .replace(/\n+/g, ". ")
      .substring(0, 400)
      .trim();

    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utteranceRef.current = utterance;

    utterance.lang = LANG_CODES[language] || "en-IN";
    utterance.rate = 0.85;
    utterance.pitch = 1.05;
    utterance.volume = 1.0;

    const selectVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      const targetLang = LANG_CODES[language] || "en-IN";

      const voice =
        // 1. Exact language match + female name
        voices.find(v =>
          v.lang === targetLang &&
          /female|woman|girl/i.test(v.name)) ||
        // 2. Exact language match any
        voices.find(v => v.lang === targetLang) ||
        // 3. Named Indian female voices (Raveena, Aditi, Priya etc)
        voices.find(v =>
          v.lang === "en-IN" &&
          /raveena|aditi|priya|neerja|heera/i.test(v.name)) ||
        // 4. Any Indian English voice
        voices.find(v => v.lang === "en-IN") ||
        // 5. Language family match
        voices.find(v =>
          v.lang.startsWith(language === "en" ? "en" : language)) ||
        // 6. Any English female
        voices.find(v =>
          v.lang.startsWith("en") &&
          /female|woman/i.test(v.name)) ||
        // 7. First available
        voices[0] ||
        null;

      if (voice) {
        utterance.voice = voice;
        // Slow down slightly when using English voice for non-English script
        if (language !== "en" && voice.lang.startsWith("en")) {
          utterance.rate = 0.8;
        }
      }
    };

    if (window.speechSynthesis.getVoices().length > 0) {
      selectVoice();
    } else {
      window.speechSynthesis.addEventListener("voiceschanged", selectVoice, { once: true });
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = (e) => {
      console.warn("TTS error:", e.error);
      setIsSpeaking(false);
    };

    // Small delay for reliability on Android Chrome
    setTimeout(() => {
      window.speechSynthesis.speak(utterance);
    }, 50);
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
