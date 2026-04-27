"use client";

import { useState, useEffect, useRef, useCallback, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Stethoscope, Globe, MoreVertical, ChevronLeft, Mic, MicOff, Send, Volume2, VolumeX } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "@/components/ui/Toast";
import { useRecordsStore } from "@/lib/stores/records-store";
import { useUserStore } from "@/lib/stores/user-store";
import { useVitalsStore } from "@/lib/stores/vitals-store";
import { useMedicationsStore } from "@/lib/stores/medications-store";
import { useConvexUser } from "@/lib/hooks/useConvexUser";
import { useConvexChat } from "@/lib/hooks/useConvexChat";
import { useSpeechRecognition } from "@/lib/hooks/useSpeechRecognition";
import { useTextToSpeech } from "@/lib/hooks/useTextToSpeech";
import ChatBubble from "@/components/copilot/ChatBubble";
import TypingIndicator from "@/components/copilot/TypingIndicator";
import QuickPrompts from "@/components/copilot/QuickPrompts";

const H = "var(--font-outfit, 'Outfit', sans-serif)";
const B = "var(--font-dm-sans, 'DM Sans', sans-serif)";

const COPILOT_QUICK_PROMPTS = [
  "What's going on with my sugar levels?",
  "Should I worry about this vitamin D thing?",
  "Any food tips for my diabetes?",
  "Break down my last blood test for me",
  "Am I taking too many tablets?",
  "Summarize how I'm doing overall",
];

const DOCTOR_QUICK_PROMPTS = [
  "I've had a headache for 3 days",
  "Is it normal to feel tired all the time?",
  "What can I eat to lower cholesterol?",
  "My kid has a fever — what should I do?",
  "How much water should I really drink?",
];

const LANGUAGES = [
  { code: "en", label: "EN" },
  { code: "hi", label: "हिंदी" },
  { code: "kn", label: "ಕನ್ನಡ" },
  { code: "ta", label: "தமிழ்" },
  { code: "te", label: "తెలుగు" },
  { code: "bn", label: "বাংলা" },
  { code: "mr", label: "मराठी" },
];

let docMsgId = 1;
function newDocId() { return `doc-${Date.now()}-${docMsgId++}`; }

// ── Real voice input uses Web Speech API (useSpeechRecognition hook) ──────────
// Sarvam AI STT integration point (for higher accuracy on Indian languages):
// POST https://api.sarvam.ai/speech-to-text
// Headers: { "api-subscription-key": process.env.NEXT_PUBLIC_SARVAM_API_KEY }
// Body: FormData { "file": audioBlob, "language_code": "hi-IN"|"kn-IN"|"en-IN", "model": "saarika:v2" }

// â”€â”€â”€ Inner page â€” uses useSearchParams so must be wrapped in Suspense â”€â”€â”€â”€â”€â”€â”€â”€â”€
function cleanTextForSpeech(text) {
  return text
    .replace(/[*#`]/g, "")
    .replace(/\n+/g, ". ")
    .substring(0, 300);
}

function CopilotPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const modeParam = searchParams.get("mode");
  const titleParam = searchParams.get("title");

  const records = useRecordsStore((s) => s.records);
  const user = useUserStore((s) => s.user);
  const vitalsReadings = useVitalsStore((s) => s.readings);
  const getLatestVitals = useVitalsStore((s) => s.getLatestVitals);
  const latestVitals = useMemo(() => getLatestVitals(), [vitalsReadings]);
  const { medications } = useMedicationsStore();

  const { convexUser } = useConvexUser();
  const copilotChat = useConvexChat(convexUser, "copilot");
  const doctorChat  = useConvexChat(convexUser, "doctor");

  const firstName = user.firstName || user.name?.split(" ")[0] || "there";

  const [mode, setMode] = useState(modeParam === "doctor" ? "doctor" : "copilot");
  // Always default to "en" — the language pill the user taps must ALWAYS override any profile language
  const [language, setLanguage] = useState("en");
  const [isTyping, setIsTyping] = useState(false);
  const [inputText, setInputText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showLangBar, setShowLangBar] = useState(false);
  const [muteAutoSpeak, setMuteAutoSpeak] = useState(false);

  // Real voice: Web Speech API
  const {
    isListening, transcript, error: speechError,
    startListening, stopListening, clearTranscript, isSupported: speechSupported,
  } = useSpeechRecognition(language);
  const { isSpeaking, speak, stopSpeaking } = useTextToSpeech();

  // Track wasTyping to auto-speak when AI finishes responding
  const wasTypingRef = useRef(false);
  const hasMountedRef = useRef(false);
  const textareaRef = useRef(null);
  const endRef = useRef(null);

  // Auto-fill input with speech transcript when done listening
  useEffect(() => {
    if (!isListening && transcript.trim().length > 0) {
      setInputText(transcript);
      const timer = setTimeout(() => {
        const text = transcript.trim();
        if (text) {
          clearTranscript();
          setInputText("");
          if (mode === "copilot") sendCopilotMessage(text);
          else sendDoctorMessage(text);
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isListening, transcript]);

  // Auto-speak AI response when typing indicator goes away
  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      wasTypingRef.current = isTyping;
      return;
    }
    if (wasTypingRef.current && !isTyping) {
      const msgs = mode === "copilot" ? copilotChat.messages : doctorChat.messages;
      const lastMsg = msgs[msgs.length - 1];
      if (lastMsg?.role === "assistant" && lastMsg.content && !muteAutoSpeak) {
        speak(cleanTextForSpeech(lastMsg.content), language);
      }
    }
    wasTypingRef.current = isTyping;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTyping]);

  // Build a plain-language health context string for Groq
  const healthContextString = useMemo(() => {
    const u = convexUser || user;
    const contextParts = [
      (u?.name || user?.name)           && `Patient: ${u?.name || user?.name}`,
      (u?.bloodGroup || user?.bloodGroup) && `Blood group: ${u?.bloodGroup || user?.bloodGroup}`,
      (u?.conditions?.length > 0)       && `Conditions: ${u.conditions.join(", ")}`,
      (!u?.conditions?.length && user?.conditions?.length > 0) && `Conditions: ${user.conditions.join(", ")}`,
      (u?.bmi || user?.bmi)             && `BMI: ${u?.bmi || user?.bmi}`,
      (u?.healthGoal || user?.healthGoal) && `Health goal: ${u?.healthGoal || user?.healthGoal}`,
      (u?.nativeLanguage || user?.nativeLanguage) && `Preferred language: ${u?.nativeLanguage || user?.nativeLanguage}`,
      records?.length > 0               && `Has ${records.length} health records on file`,
      medications?.length > 0           && `Current medications: ${medications.map((m) => m.name).join(", ")}`,
    ].filter(Boolean);
    return contextParts.join(". ");
  }, [convexUser, user, medications, records]);

  // Inject context message when navigating from a record page
  useEffect(() => {
    if (titleParam && copilotChat.messages.length === 0) {
      copilotChat.sendMessage(
        `Tell me about my ${decodeURIComponent(titleParam)} record`,
        language,
        healthContextString,
        convexUser
      ).catch(console.error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 100);
  }, []);

  // Auto-scroll on new messages
  useEffect(() => {
    scrollToBottom();
  }, [copilotChat.messages, doctorChat.messages, isTyping, scrollToBottom]);

  // Auto-grow textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 100) + "px";
  }, [inputText]);

  const sendCopilotMessage = useCallback(
    async (text) => {
      if (!text.trim() || isTyping) return;
      setIsTyping(true);
      try {
        await copilotChat.sendMessage(text, language, healthContextString, convexUser);
      } catch {
        // sendMessage already saves error message to Convex
      } finally {
        setIsTyping(false);
      }
    },
    [isTyping, language, healthContextString, convexUser, copilotChat]
  );

  const sendDoctorMessage = useCallback(
    async (text) => {
      if (!text.trim() || isTyping) return;
      setIsTyping(true);
      try {
        await doctorChat.sendMessage(text, language, healthContextString, convexUser);
      } catch {
        // handled inside hook
      } finally {
        setIsTyping(false);
      }
    },
    [isTyping, language, healthContextString, convexUser]
  );

  function handleSend() {
    const text = inputText.trim();
    if (!text || isTyping) return;
    if (mode === "copilot") sendCopilotMessage(text);
    else sendDoctorMessage(text);
    setInputText("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleMicPress() {
    if (isTyping) return;
    if (isListening) {
      // Stop recording — transcript auto-fills inputText via useEffect
      stopListening();
    } else {
      // Stop TTS if playing, then start STT
      stopSpeaking();
      clearTranscript();
      setInputText("");
      if (speechSupported) {
        startListening();
      } else {
        // Fallback: open keyboard
        textareaRef.current?.focus();
      }
    }
  }

  const hasMessages = mode === "copilot" ? copilotChat.messages.length > 0 : doctorChat.messages.length > 0;
  const displayMessages = mode === "copilot" ? copilotChat.messages : doctorChat.messages;
  const canSend = inputText.trim().length > 0 && !isTyping;
  // Show language bar when: no messages yet (onboarding), doctor mode, or user toggled it
  const showLang = !hasMessages || mode === "doctor" || showLangBar;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100dvh - 64px)", overflow: "hidden", position: "relative", background: "#fff" }}>

      {/* â”€â”€ SECTION 1: Minimal sticky header â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div
        style={{
          flexShrink: 0,
          zIndex: 20,
          height: 56,
          background: "#fff",
          borderBottom: "1px solid #F0F7F4",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 16px",
          boxSizing: "border-box",
        }}
      >
        <button
          onClick={() => router.back()}
          style={{
            width: 36, height: 36, borderRadius: "50%",
            background: "#F0F7F4", border: "none",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", flexShrink: 0,
          }}
          aria-label="Go back"
        >
          <ChevronLeft size={20} color="#0B1F18" />
        </button>

        <span style={{ fontFamily: H, fontWeight: 600, fontSize: 16, color: "#0B1F18" }}>
          {mode === "copilot" ? "AI Copilot" : "AI Doctor"}
        </span>

        <div style={{ display: "flex", gap: 8 }}>
          {/* Mute auto-speak toggle */}
          <button
            onClick={() => { setMuteAutoSpeak((v) => !v); if (!muteAutoSpeak) stopSpeaking(); }}
            style={{
              width: 36, height: 36, borderRadius: "50%",
              background: muteAutoSpeak ? "#FEE2E2" : "#F0F7F4",
              border: "none",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer",
            }}
            aria-label={muteAutoSpeak ? "Unmute auto-speak" : "Mute auto-speak"}
            title={muteAutoSpeak ? "Auto-speak muted" : "Auto-speak on"}
          >
            {muteAutoSpeak
              ? <VolumeX size={18} color="#DC2626" />
              : <Volume2 size={18} color="#0D6E4F" />}
          </button>
          <button
            onClick={() => setShowLangBar((v) => !v)}
            style={{
              width: 36, height: 36, borderRadius: "50%",
              background: showLangBar ? "#DCE8E2" : "#F0F7F4",
              border: "none",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer",
            }}
            aria-label="Language selector"
          >
            <Globe size={18} color="#0B1F18" />
          </button>
          <button
            onClick={() => toast("Options coming soon", "info")}
            style={{
              width: 36, height: 36, borderRadius: "50%",
              background: "#F0F7F4", border: "none",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer",
            }}
            aria-label="More options"
          >
            <MoreVertical size={18} color="#0B1F18" />
          </button>
        </div>
      </div>

      {/* Scrollable content area */}
      <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden", WebkitOverflowScrolling: "touch" }}>

      {/* â”€â”€ SECTION 2: Mode toggle (only when no messages) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <AnimatePresence>
        {!hasMessages && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            style={{ display: "flex", justifyContent: "center", padding: "12px 0 0" }}
          >
            <div
              style={{
                display: "inline-flex",
                background: "#F0F7F4",
                borderRadius: 50,
                padding: 4,
              }}
            >
              {[
                { key: "copilot", label: "Personal" },
                { key: "doctor", label: "Doctor" },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => { setMode(key); setIsTyping(false); }}
                  style={{
                    padding: "8px 20px",
                    borderRadius: 50,
                    border: "none",
                    cursor: "pointer",
                    fontFamily: H,
                    fontSize: 13,
                    background: mode === key ? "#fff" : "transparent",
                    color: mode === key ? "#0D6E4F" : "#8EBAA3",
                    fontWeight: mode === key ? 600 : 400,
                    boxShadow: mode === key ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
                    transition: "all 0.2s",
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* â”€â”€ SECTION 3: Chat area â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {!hasMessages ? (
        /* Empty state */
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "40px 20px 24px",
          }}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            style={{
              width: 64, height: 64, borderRadius: "50%",
              background: "linear-gradient(135deg, #0D6E4F, #00C9A7)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <Stethoscope size={28} color="#fff" />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.22 }}
            style={{
              fontFamily: H, fontWeight: 700, fontSize: 20,
              color: "#0B1F18", margin: "16px 0 0", textAlign: "center",
            }}
          >
            {mode === "copilot" ? `Hi ${firstName}!` : "Namaste!"}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.22 }}
            style={{
              fontFamily: B, fontSize: 14, color: "#8EBAA3",
              margin: "6px 0 0", textAlign: "center", padding: "0 40px",
            }}
          >
            {mode === "copilot"
              ? "I know your health history. Ask me anything."
              : "Ask any health question. I speak your language."}
          </motion.p>

          {/* Language picker — prominent in empty state */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18, duration: 0.22 }}
            style={{ marginTop: 20, textAlign: "center", width: "100%" }}
          >
            <p style={{ fontFamily: B, fontSize: 11, color: "#8EBAA3", margin: "0 0 10px", letterSpacing: "0.04em", textTransform: "uppercase" }}>
              Choose your language
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 8, padding: "0 16px" }}>
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  style={{
                    borderRadius: 20,
                    padding: "7px 16px",
                    fontSize: 13,
                    border: language === lang.code ? "none" : "1.5px solid #DCE8E2",
                    background: language === lang.code ? "#0D6E4F" : "#F0F7F4",
                    color: language === lang.code ? "#fff" : "#5A7A6E",
                    fontFamily: B,
                    fontWeight: language === lang.code ? 600 : 400,
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.28 }}
            style={{ marginTop: 28, width: "100%" }}
          >
            <QuickPrompts
              prompts={mode === "copilot" ? COPILOT_QUICK_PROMPTS : DOCTOR_QUICK_PROMPTS}
              onSelect={(p) => {
                if (isTyping) return;
                if (mode === "copilot") sendCopilotMessage(p);
                else sendDoctorMessage(p);
              }}
            />
          </motion.div>
        </div>
      ) : (
        /* Chat messages */
        <div
          style={{
            padding: "12px 16px 24px",
            display: "flex",
            flexDirection: "column",
            gap: 10,
            overflowX: "hidden",
            width: "100%",
          }}
        >
          {displayMessages.map((msg, i) => {
            const prev = displayMessages[i - 1];
            const showAvatar = msg.role === "assistant" && (!prev || prev.role !== "assistant");
            // Convex messages use 'content' and 'createdAt'; normalize for ChatBubble
            const text = msg.content ?? msg.text ?? "";
            const timestamp = msg.createdAt ? new Date(msg.createdAt) : msg.timestamp;
            return (
              <ChatBubble
                key={msg._id ?? msg.id}
                role={msg.role}
                text={text}
                timestamp={timestamp}
                showAvatar={showAvatar}
                language={language}
              />
            );
          })}
          {isTyping && <TypingIndicator />}
          <div ref={endRef} style={{ height: "20px" }} />
        </div>
      )}
      </div>

      {/* ── SECTIONS 4+5: Bottom bar (in-flow, not fixed) ───────────────── */}
      <div
        style={{
          flexShrink: 0,
          width: "100%",
          zIndex: 30,
          background: "#fff",
          borderTop: "1px solid #F0F7F4",
          boxSizing: "border-box",
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
        }}
      >
        {/* Language bar */}
        <AnimatePresence>
          {showLang && (
            <motion.div
              key="langbar"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 44, opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{
                background: "#F8FFFE",
                borderTop: "1px solid #DCE8E2",
                overflowX: "auto",
                overflowY: "hidden",
                scrollbarWidth: "none",
                msOverflowStyle: "none",
                WebkitOverflowScrolling: "touch",
                display: "flex",
                alignItems: "center",
                padding: "0 16px",
                gap: "8px",
                boxSizing: "border-box",
                height: "44px",
              }}
            >
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  style={{
                    flexShrink: 0,
                    borderRadius: "20px",
                    padding: "6px 14px",
                    fontSize: "12px",
                    whiteSpace: "nowrap",
                    border: language === lang.code ? "none" : "1px solid #DCE8E2",
                    background: language === lang.code ? "#0D6E4F" : "#F0F7F4",
                    color: language === lang.code ? "white" : "#5A7A6E",
                    fontFamily: B,
                    cursor: "pointer",
                  }}
                >
                  {lang.label}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input row */}
        <div
          style={{
            padding: "10px 16px",
            display: "flex",
            alignItems: "flex-end",
            gap: 8,
            background: "#fff",
            boxSizing: "border-box",
          }}
        >
          <button
            onClick={handleMicPress}
            style={{
              width: 40, height: 40, borderRadius: "50%",
              background: isListening ? "rgba(220,38,38,0.10)" : "#F0F7F4",
              border: "none",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", flexShrink: 0,
              transition: "background 0.2s",
            }}
            aria-label={isListening ? "Stop recording" : "Start voice input"}
          >
            {isListening
              ? <MicOff size={16} color="#DC2626" />
              : <Mic size={16} color="#0D6E4F" />}
          </button>

          {/* Listening badge — always visible when mic is active */}
          {isListening && (
            <div style={{
              position: "absolute",
              bottom: "100%",
              left: "50%",
              transform: "translateX(-50%)",
              background: "#DC2626",
              color: "white",
              borderRadius: 20,
              padding: "4px 12px",
              fontSize: 12,
              marginBottom: 8,
              whiteSpace: "nowrap",
              fontFamily: B,
              fontWeight: 500,
              boxShadow: "0 2px 8px rgba(220,38,38,0.3)",
            }}>
              {transcript ? `🎤 ${transcript}` : "Listening... speak now"}
            </div>
          )}

          <textarea
            ref={textareaRef}
            value={inputText}
            onChange={(e) => { if (isSpeaking) stopSpeaking(); setInputText(e.target.value); }}
            onKeyDown={handleKeyDown}
            placeholder={
              isListening ? "Listening…"
              : isProcessing ? "Processing…"
              : mode === "copilot" ? "Ask about your health..."
              : "Ask any health question..."
            }
            rows={1}
            disabled={isTyping || isListening || isProcessing}
            style={{
              flex: 1,
              resize: "none",
              border: "none",
              borderRadius: 24,
              padding: "10px 14px",
              fontFamily: B,
              fontSize: 14,
              color: "#0B1F18",
              background: "#F0F7F4",
              outline: "none",
              lineHeight: 1.5,
              minHeight: 40,
              maxHeight: 100,
              overflowY: "auto",
              display: "block",
              boxSizing: "border-box",
            }}
          />

          <button
            onClick={handleSend}
            disabled={!canSend}
            aria-label="Send message"
            style={{
              width: 40, height: 40, borderRadius: "50%",
              border: "none",
              background: canSend ? "#0D6E4F" : "#F0F7F4",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: canSend ? "pointer" : "default",
              flexShrink: 0,
              transition: "background 0.18s",
            }}
          >
            <Send size={16} color={canSend ? "#fff" : "#8EBAA3"} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Page export — Suspense boundary required for useSearchParams ─────────────
export default function CopilotPage() {
  return (
    <Suspense fallback={null}>
      <CopilotPageInner />
    </Suspense>
  );
}
