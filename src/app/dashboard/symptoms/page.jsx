"use client";
export const dynamic = "force-dynamic";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft, ChevronRight, AlertTriangle, Stethoscope,
  CheckCircle, MessageCircle, Calendar, Info, Loader,
} from "lucide-react";
import {
  BODY_REGIONS, SYMPTOM_MAP, DURATION_OPTIONS,
  SEVERITY_OPTIONS, analyzeSymptoms,
} from "@/lib/symptom-checker";
import { useAction } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useConvexUser } from "@/lib/hooks/useConvexUser";
import { toast } from "@/components/ui/Toast";

const H = "var(--font-outfit, 'Outfit', sans-serif)";
const B = "var(--font-dm-sans, 'DM Sans', sans-serif)";

const STEPS = ["Where it bothers you", "What you're feeling", "How long it's been", "How bad it is", "What this could mean"];

export default function SymptomsPage() {
  const router = useRouter();
  const { convexUser } = useConvexUser();
  const analyzeWithAI = useAction(api.ai.analyzeSymptoms);

  const [step, setStep] = useState(0);
  const [selectedRegions, setSelectedRegions] = useState([]);
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [otherSymptom, setOtherSymptom] = useState("");
  const [duration, setDuration] = useState(null);
  const [severity, setSeverity] = useState(null);
  const [result, setResult] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  // ── Derived symptom list from selected regions ──────────────────────────
  const availableSymptoms = [
    ...new Set(
      selectedRegions.length === 0
        ? Object.values(SYMPTOM_MAP).flat()
        : selectedRegions.flatMap((r) => SYMPTOM_MAP[r] || [])
    ),
  ];

  // ── Navigation ────────────────────────────────────────────────────────────
  function canNext() {
    if (step === 0) return selectedRegions.length > 0;
    if (step === 1) return selectedSymptoms.length > 0 || otherSymptom.trim() !== "";
    if (step === 2) return !!duration;
    if (step === 3) return !!severity;
    return false;
  }

  async function handleNext() {
    if (step === 3) {
      const allSymptoms = [...selectedSymptoms, ...(otherSymptom.trim() ? [otherSymptom.trim()] : [])];
      setAnalyzing(true);
      try {
        const age = convexUser?.dob
          ? new Date().getFullYear() - new Date(convexUser.dob).getFullYear()
          : undefined;
        const aiResult = await analyzeWithAI({
          symptoms: allSymptoms,
          duration,
          severity,
          age,
          gender: convexUser?.gender,
          existingConditions: convexUser?.conditions || [],
          language: convexUser?.nativeLanguage || "en",
        });
        setResult(aiResult);
        setStep(4);
      } catch {
        // fallback to rule-based
        const analysis = analyzeSymptoms({ regions: selectedRegions, symptoms: allSymptoms, duration, severity });
        setResult({ urgency: analysis.urgency, message: analysis.urgencyMeta?.label || "Please consult a doctor.", isEmergency: false, _legacy: analysis });
        setStep(4);
      } finally {
        setAnalyzing(false);
      }
    } else {
      setStep((s) => s + 1);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      style={{ minHeight: "100vh", background: "#F0F7F4", paddingBottom: 100 }}
    >
      {/* Top Nav */}
      <div
        style={{
          position: "sticky", top: 0, zIndex: 40,
          background: "rgba(240,247,244,0.92)",
          backdropFilter: "blur(12px)",
          padding: "16px 20px 12px",
          display: "flex", alignItems: "center", gap: 12,
          borderBottom: "1px solid rgba(220,232,226,0.6)",
        }}
      >
        <button
          onClick={() => step > 0 ? setStep((s) => s - 1) : router.back()}
          style={{
            width: 36, height: 36, borderRadius: 10,
            border: "1.5px solid #DCE8E2", background: "#fff",
            cursor: "pointer", display: "flex", alignItems: "center",
            justifyContent: "center", padding: 0,
          }}
        >
          <ChevronLeft size={18} color="#0B1F18" />
        </button>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontFamily: H, fontWeight: 700, fontSize: "1.1rem", color: "#0B1F18", margin: 0 }}>
            Symptom Checker
          </h1>
          <p style={{ fontFamily: B, fontSize: "0.72rem", color: "#8EBAA3", margin: 0 }}>
            Step {step + 1} of {STEPS.length}: {STEPS[step]}
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height: 4, background: "#F0F7F4" }}>
        <motion.div
          animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          style={{ height: "100%", background: "linear-gradient(90deg, #0D6E4F, #00C9A7)" }}
          transition={{ duration: 0.3 }}
        />
      </div>

      <div style={{ padding: "20px 20px 0" }}>
        <AnimatePresence mode="wait">
          {/* ── Step 0: Body Region ─────────────────────────────── */}
          {step === 0 && (
            <motion.div key="s0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
              <h2 style={{ fontFamily: H, fontWeight: 800, fontSize: "1.25rem", color: "#0B1F18", margin: "0 0 6px" }}>
                Where does it bother you?
              </h2>
              <p style={{ fontFamily: B, fontSize: "0.82rem", color: "#8EBAA3", margin: "0 0 20px" }}>
                Select all areas that apply
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {BODY_REGIONS.map((region) => {
                  const selected = selectedRegions.includes(region.id);
                  return (
                    <motion.button
                      key={region.id}
                      whileTap={{ scale: 0.96 }}
                      onClick={() =>
                        setSelectedRegions((prev) =>
                          selected ? prev.filter((r) => r !== region.id) : [...prev, region.id]
                        )
                      }
                      style={{
                        padding: "16px 14px",
                        borderRadius: 14,
                        border: selected ? "2px solid #0D6E4F" : "1px solid #DCE8E2",
                        background: selected ? "rgba(13,110,79,0.07)" : "#fff",
                        fontFamily: B, fontWeight: selected ? 700 : 500,
                        fontSize: "0.9rem",
                        color: selected ? "#0D6E4F" : "#0B1F18",
                        cursor: "pointer",
                        textAlign: "left",
                        transition: "all 0.15s ease",
                      }}
                    >
                      {region.label}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* ── Step 1: Symptoms ────────────────────────────────── */}
          {step === 1 && (
            <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
              <h2 style={{ fontFamily: H, fontWeight: 800, fontSize: "1.25rem", color: "#0B1F18", margin: "0 0 6px" }}>
                Tell me more about what you're feeling
              </h2>
              <p style={{ fontFamily: B, fontSize: "0.82rem", color: "#8EBAA3", margin: "0 0 20px" }}>
                Select everything that applies
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 16 }}>
                {availableSymptoms.map((symptom) => {
                  const sel = selectedSymptoms.includes(symptom);
                  return (
                    <motion.button
                      key={symptom}
                      whileTap={{ scale: 0.94 }}
                      onClick={() =>
                        setSelectedSymptoms((prev) =>
                          sel ? prev.filter((s) => s !== symptom) : [...prev, symptom]
                        )
                      }
                      style={{
                        padding: "9px 16px",
                        borderRadius: 20,
                        border: sel ? "2px solid #0D6E4F" : "1.5px solid #DCE8E2",
                        background: sel ? "rgba(13,110,79,0.07)" : "#fff",
                        fontFamily: B, fontWeight: sel ? 700 : 500,
                        fontSize: "0.83rem",
                        color: sel ? "#0D6E4F" : "#0B1F18",
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                      }}
                    >
                      {sel && <CheckCircle size={13} style={{ marginRight: 5, verticalAlign: "text-bottom" }} />}
                      {symptom}
                    </motion.button>
                  );
                })}
              </div>
              <input
                type="text"
                placeholder="Other symptoms (type here)..."
                value={otherSymptom}
                onChange={(e) => setOtherSymptom(e.target.value)}
                style={{
                  width: "100%", padding: "12px 14px",
                  borderRadius: 12, border: "1.5px solid #DCE8E2",
                  background: "#fff", fontFamily: B, fontSize: "0.88rem",
                  color: "#0B1F18", outline: "none", boxSizing: "border-box",
                }}
              />
            </motion.div>
          )}

          {/* ── Step 2: Duration ────────────────────────────────── */}
          {step === 2 && (
            <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
              <h2 style={{ fontFamily: H, fontWeight: 800, fontSize: "1.25rem", color: "#0B1F18", margin: "0 0 6px" }}>
                How long has this been going on?
              </h2>
              <p style={{ fontFamily: B, fontSize: "0.82rem", color: "#8EBAA3", margin: "0 0 20px" }}>
                Pick the closest estimate
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {DURATION_OPTIONS.map((opt) => {
                  const sel = duration === opt.id;
                  return (
                    <motion.button
                      key={opt.id}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setDuration(opt.id)}
                      style={{
                        padding: "16px 18px",
                        borderRadius: 14,
                        border: sel ? "2px solid #0D6E4F" : "1.5px solid #DCE8E2",
                        background: sel ? "rgba(13,110,79,0.07)" : "#fff",
                        fontFamily: B, fontWeight: sel ? 700 : 500,
                        fontSize: "0.9rem",
                        color: sel ? "#0D6E4F" : "#0B1F18",
                        cursor: "pointer", textAlign: "left",
                        display: "flex", alignItems: "center",
                        gap: 10,
                        transition: "all 0.15s ease",
                      }}
                    >
                      {sel && <CheckCircle size={16} color="#0D6E4F" />}
                      {opt.label}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* ── Step 3: Severity ────────────────────────────────── */}
          {step === 3 && (
            <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
              <h2 style={{ fontFamily: H, fontWeight: 800, fontSize: "1.25rem", color: "#0B1F18", margin: "0 0 6px" }}>
                How bad is it right now?
              </h2>
              <p style={{ fontFamily: B, fontSize: "0.82rem", color: "#8EBAA3", margin: "0 0 20px" }}>
                Be honest — it helps get you a better answer
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {SEVERITY_OPTIONS.map((opt) => {
                  const sel = severity === opt.id;
                  return (
                    <motion.button
                      key={opt.id}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSeverity(opt.id)}
                      style={{
                        padding: "18px 18px",
                        borderRadius: 14,
                        border: sel ? `2px solid ${opt.color}` : "1.5px solid #DCE8E2",
                        background: sel ? `${opt.color}10` : "#fff",
                        cursor: "pointer", textAlign: "left",
                        transition: "all 0.15s ease",
                      }}
                    >
                      <p style={{ fontFamily: H, fontWeight: 700, fontSize: "1rem", color: opt.color, margin: "0 0 3px" }}>
                        {opt.label}
                      </p>
                      <p style={{ fontFamily: B, fontSize: "0.8rem", color: "#8EBAA3", margin: 0 }}>
                        {opt.description}
                      </p>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* ── Step 4: AI Assessment ───────────────────────────── */}
          {step === 4 && result && (
            <motion.div key="s4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
              <h2 style={{ fontFamily: H, fontWeight: 800, fontSize: "1.25rem", color: "#0B1F18", margin: "0 0 6px" }}>
                Here's what this could mean
              </h2>
              <p style={{ fontFamily: B, fontSize: "0.82rem", color: "#8EBAA3", margin: "0 0 20px" }}>
                Based on what you've told me
              </p>

              {/* Symptom summary */}
              <div style={{ background: "#fff", border: "1px solid #DCE8E2", borderRadius: 14, padding: "16px", marginBottom: 14 }}>
                <p style={{ fontFamily: H, fontWeight: 700, fontSize: "0.88rem", color: "#0B1F18", margin: "0 0 10px" }}>
                  Symptoms reported:
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {[...selectedSymptoms, ...(otherSymptom.trim() ? [otherSymptom.trim()] : [])].map((s) => (
                    <span key={s} style={{
                      fontFamily: B, fontSize: "0.75rem", fontWeight: 600,
                      padding: "4px 10px", borderRadius: 20,
                      background: "rgba(13,110,79,0.08)", color: "#0D6E4F",
                    }}>{s}</span>
                  ))}
                </div>
              </div>

              {/* Urgency badge */}
              {(() => {
                const urgencyMap = {
                  emergency: { bg: "rgba(231,76,60,0.08)", color: "#E74C3C", label: "Seek emergency care immediately" },
                  urgent:    { bg: "rgba(243,156,18,0.08)", color: "#F39C12", label: "See a doctor within 24 hours" },
                  routine:   { bg: "rgba(13,110,79,0.06)",  color: "#0D6E4F", label: "Schedule a routine consultation" },
                };
                const meta = urgencyMap[result.urgency] || urgencyMap.routine;
                return (
                  <div style={{
                    background: meta.bg, border: `1.5px solid ${meta.color}30`,
                    borderRadius: 14, padding: "14px 16px", marginBottom: 14,
                    display: "flex", alignItems: "center", gap: 10,
                  }}>
                    <AlertTriangle size={20} color={meta.color} />
                    <div>
                      <p style={{ fontFamily: H, fontWeight: 700, fontSize: "0.88rem", color: meta.color, margin: "0 0 2px" }}>Urgency</p>
                      <p style={{ fontFamily: B, fontSize: "0.82rem", color: "#0B1F18", margin: 0 }}>{meta.label}</p>
                    </div>
                  </div>
                );
              })()}

              {/* AI Analysis */}
              <div style={{ background: "#fff", border: "1px solid #DCE8E2", borderRadius: 14, padding: "16px", marginBottom: 16 }}>
                <p style={{ fontFamily: H, fontWeight: 700, fontSize: "0.88rem", color: "#0B1F18", margin: "0 0 10px" }}>AI Assessment</p>
                {result.message.split("\n").filter(Boolean).map((line, i) => (
                  <p key={i} style={{ fontFamily: B, fontSize: "0.84rem", color: "#2C3E50", margin: "0 0 8px", lineHeight: 1.65 }}>{line}</p>
                ))}
              </div>

              {/* Action buttons */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    const sympStr = [...selectedSymptoms, ...(otherSymptom.trim() ? [otherSymptom.trim()] : [])].join(", ");
                    router.push(`/dashboard/copilot?title=${encodeURIComponent(`Symptom check: ${sympStr}`)}`);
                  }}
                  style={{
                    padding: "14px", borderRadius: 12, border: "none",
                    background: "linear-gradient(135deg, #0D6E4F, #00C9A7)",
                    color: "#fff", fontFamily: H, fontWeight: 700,
                    fontSize: "0.9rem", cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  }}
                >
                  <MessageCircle size={16} />
                  Discuss with AI Copilot
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => toast("Appointment booking coming soon", "info")}
                  style={{
                    padding: "14px", borderRadius: 12,
                    border: "1.5px solid #DCE8E2", background: "#fff",
                    color: "#0B1F18", fontFamily: B, fontWeight: 600,
                    fontSize: "0.9rem", cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  }}
                >
                  <Calendar size={16} />
                  Book Appointment
                </motion.button>
              </div>

              {/* Disclaimer */}
              <div
                style={{
                  background: "rgba(41,128,185,0.06)",
                  border: "1px solid rgba(41,128,185,0.2)",
                  borderRadius: 12, padding: "12px 14px",
                  display: "flex", gap: 10, alignItems: "flex-start",
                }}
              >
                <Info size={15} color="#2980B9" style={{ flexShrink: 0, marginTop: 1 }} />
                <p style={{ fontFamily: B, fontSize: "0.72rem", color: "#2980B9", margin: 0, lineHeight: 1.55 }}>
                  I'm an AI assistant, not your doctor. Please see a healthcare professional for proper diagnosis and treatment.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom action (Next) */}
      {step < 4 && (
        <div
          style={{
            position: "sticky",
            bottom: 0,
            padding: "14px 20px",
            paddingBottom: "calc(14px + env(safe-area-inset-bottom, 0px))",
            background: "linear-gradient(180deg, transparent 0%, rgba(240,247,244,0.98) 20%, #F0F7F4 100%)",
          }}
        >
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleNext}
            disabled={!canNext() || analyzing}
            style={{
              width: "100%",
              padding: "15px",
              borderRadius: 14,
              border: "none",
              background: canNext() && !analyzing
                ? "linear-gradient(135deg, #0D6E4F, #00C9A7)"
                : "#DCE8E2",
              color: canNext() && !analyzing ? "#fff" : "#B8D4C5",
              fontFamily: H,
              fontWeight: 700,
              fontSize: "0.95rem",
              cursor: canNext() ? "pointer" : "default",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              transition: "background 0.2s",
            }}
          >
            {analyzing ? (
              <><Loader size={16} style={{ animation: "spin 1s linear infinite" }} /> Analyzing...</>
            ) : step === 3 ? "Analyze Symptoms" : "Continue"}
            {!analyzing && <ChevronRight size={16} />}
          </motion.button>
        </div>
      )}
    </motion.div>
  );
}
