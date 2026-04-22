"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  ChevronRight, Pill, Sparkles, Check, Lightbulb,
  Heart, Wind, Activity, Thermometer, Footprints, Moon,
  Brain, Leaf, Droplets,
  Camera, MessageCircle, Rss, ClipboardList,
  ArrowUpRight, CalendarDays,
} from "lucide-react";
import EmptyState from "@/components/shared/EmptyState";
import MedCheckbox from "@/components/medications/MedCheckbox";
import { useUserStore } from "@/lib/stores/user-store";
import { useVitalsStore } from "@/lib/stores/vitals-store";
import { useMedicationsStore } from "@/lib/stores/medications-store";
import { useRecordsStore } from "@/lib/stores/records-store";
import { computeTwinScores } from "@/lib/twin-engine";

/* ─── Utilities ──────────────────────────────────────────────────────────── */
function getHumanGreeting(firstName, meds) {
  const hour = new Date().getHours();
  const greet = (base) => firstName ? `${base}, ${firstName}` : base;
  const pendingMeds = (meds || []).filter((m) => m.isToday && !m.taken).length;

  function morningContext() {
    if (pendingMeds > 0) return `${pendingMeds} medication${pendingMeds > 1 ? "s" : ""} to take today`;
    return "All medications taken. Great start!";
  }
  function afternoonContext() {
    if (pendingMeds > 0) return `Don't forget — ${pendingMeds} med${pendingMeds > 1 ? "s" : ""} still pending`;
    return "You're on track with your health today";
  }
  function eveningContext() {
    if (pendingMeds > 0) return `${pendingMeds} medication${pendingMeds > 1 ? "s" : ""} left for today`;
    return "You did great today. Rest well tonight.";
  }

  if (hour < 6)  return { greeting: greet("Rest well"), subtitle: "Your health is in good hands" };
  if (hour < 12) return { greeting: greet("Good morning"), subtitle: morningContext() };
  if (hour < 17) return { greeting: greet("Good afternoon"), subtitle: afternoonContext() };
  if (hour < 21) return { greeting: greet("Good evening"), subtitle: eveningContext() };
  return { greeting: greet("Good night"), subtitle: "Track your sleep tomorrow morning" };
}

const H = "var(--font-outfit, 'Outfit', sans-serif)";
const B = "var(--font-dm-sans, 'DM Sans', sans-serif)";

const VITAL_ICON_MAP = { Heart, Wind, Activity, Thermometer, Footprints, Moon };

const VITAL_DISPLAY_CONFIG = {
  heartRate:   { iconName: "Heart",       iconColor: "#E74C3C", label: "Heart Rate" },
  bp:          { iconName: "Activity",    iconColor: "#9333EA", label: "Blood Pressure" },
  spo2:        { iconName: "Wind",        iconColor: "#2980B9", label: "SpO\u2082" },
  temperature: { iconName: "Thermometer", iconColor: "#EA580C", label: "Temperature" },
  steps:       { iconName: "Footprints",  iconColor: "#0D9488", label: "Today's Steps" },
  sleep:       { iconName: "Moon",        iconColor: "#4F46E5", label: "Sleep" },
};

const HOME_VITAL_ORDER = ["heartRate", "bp", "spo2", "temperature", "steps", "sleep"];

/* ─── Section header ─────────────────────────────────────────────────────── */
function SectionHeader({ title, actionLabel, onAction }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 12,
      }}
    >
      <h2
        style={{
          fontFamily: H,
          fontWeight: 700,
          fontSize: "0.9375rem",
          color: "#0B1F18",
          margin: 0,
        }}
      >
        {title}
      </h2>
      {actionLabel && (
        <button
          onClick={onAction}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontFamily: B,
            fontSize: "0.8125rem",
            fontWeight: 500,
            color: "#0D6E4F",
            padding: 0,
          }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

/* ─── Single vital card ──────────────────────────────────────────────────── */
function VitalCard({ iconName, iconColor, value, unit, label, status, statusColor }) {
  const VIcon = VITAL_ICON_MAP[iconName] || Activity;
  return (
    <div
      style={{
        backgroundColor: "#fff",
        border: "1px solid #DCE8E2",
        borderRadius: 14,
        padding: "10px 8px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        minWidth: 0,
        overflow: "hidden",
      }}
    >
      {/* Icon */}
      <div style={{
        width: 32, height: 32, borderRadius: 10,
        background: `${statusColor}1E`,
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
      }}>
        <VIcon size={16} color={statusColor} />
      </div>
      {/* Value + unit */}
      <div style={{ marginTop: 6 }}>
        <span style={{ fontFamily: H, fontWeight: 700, fontSize: "0.9375rem", color: "#0B1F18" }}>
          {value}
        </span>
        {unit && (
          <span style={{ fontFamily: B, fontSize: "0.625rem", color: "#8EBAA3", marginLeft: 2 }}>
            {unit}
          </span>
        )}
      </div>
      {/* Label */}
      <span style={{ fontFamily: B, fontSize: "0.625rem", color: "#5A7A6E", marginTop: 4, lineHeight: 1.3 }}>
        {label}
      </span>
      {/* Status badge */}
      <span style={{
        fontFamily: B,
        fontSize: "0.625rem",
        fontWeight: 600,
        color: statusColor,
        background: `${statusColor}1A`,
        padding: "2px 6px",
        borderRadius: 10,
        marginTop: 4,
      }}>
        {status}
      </span>
    </div>
  );
}



/* ─── Medication row ─────────────────────────────────────────────────────── */
function MedRow({ med, onToggle }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        backgroundColor: "#fff",
        border: "1px solid #DCE8E2",
        borderRadius: 14,
        padding: "14px 16px",
        marginBottom: 8,
        opacity: med.taken ? 0.6 : 1,
        transition: "opacity 0.2s",
      }}
    >
      {/* Pill icon */}
      <div style={{
        width: 40, height: 40, borderRadius: 10,
        background: "rgba(13,110,79,0.08)",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
      }}>
        <Pill size={18} color="#0D6E4F" />
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontFamily: H,
          fontWeight: 600,
          fontSize: "0.875rem",
          color: "#0B1F18",
          margin: 0,
          textDecoration: med.taken ? "line-through" : "none",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}>
          {med.name}
        </p>
        <p style={{ fontFamily: B, fontSize: "0.75rem", color: "#8EBAA3", margin: "2px 0 0" }}>
          {med.dosage ? `${med.dosage} · ${med.schedule}` : med.schedule}
        </p>
      </div>

      {/* Checkbox */}
      <MedCheckbox
        checked={!!med.taken}
        onToggle={onToggle}
        disabled={!med.isToday}
      />
    </div>
  );
}

/* ─── Quick action card ──────────────────────────────────────────────────── */
function QuickActionCard({ icon: Icon, iconColor, label, subtitle, href, router }) {
  return (
    <motion.div
      whileTap={{ scale: 0.97 }}
      onClick={() => router.push(href)}
      style={{
        backgroundColor: "#fff",
        border: "1px solid #DCE8E2",
        borderRadius: 16,
        padding: 16,
        display: "flex",
        flexDirection: "column",
        cursor: "pointer",
        position: "relative",
        minWidth: 0,
        overflow: "hidden",
      }}
    >
      {/* Top-right arrow */}
      <ArrowUpRight size={14} color="#8EBAA3" style={{ position: "absolute", top: 12, right: 12 }} />
      {/* Background icon */}
      <div style={{ position: "absolute", bottom: -8, right: -8, pointerEvents: "none", overflow: "hidden" }}>
        <Icon size={64} color={iconColor} style={{ opacity: 0.08 }} />
      </div>
      {/* Icon */}
      <div style={{
        width: 44, height: 44, borderRadius: 14,
        background: `${iconColor}1F`,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <Icon size={22} color={iconColor} />
      </div>
      {/* Title */}
      <span style={{ fontFamily: H, fontWeight: 600, fontSize: "0.8125rem", color: "#0B1F18", marginTop: 10, lineHeight: 1.3 }}>
        {label}
      </span>
      {/* Subtitle */}
      <span style={{ fontFamily: B, fontSize: "0.6875rem", color: "#8EBAA3", marginTop: 2, lineHeight: 1.3 }}>
        {subtitle}
      </span>
    </motion.div>
  );
}

/* ─── Static data ────────────────────────────────────────────────────────── */

const DAILY_TIPS = [
  "Drink 8 glasses of water today to stay hydrated and energized.",
  "A 20-minute walk can boost your mood and strengthen your heart.",
  "Getting 7–9 hours of sleep tonight helps your immune system recover.",
  "Deep breathing for 5 minutes lowers your stress hormones significantly.",
  "Including fiber-rich foods today supports a healthier gut microbiome.",
  "10 minutes of morning sunlight boosts vitamin D and lifts your mood.",
  "Regular hand-washing prevents over 80% of common infectious illnesses.",
];

const HEALTH_FACTS = [
  { icon: Heart,       color: "#E74C3C", text: "Normal resting heart rate: 60–100 bpm" },
  { icon: Droplets,    color: "#2980B9", text: "Ideal blood pressure: below 120/80 mmHg" },
  { icon: Wind,        color: "#0891B2", text: "Healthy blood oxygen (SpO₂): 95–100%" },
  { icon: Thermometer, color: "#EA580C", text: "Normal body temperature: 97–99.5°F" },
  { icon: Footprints,  color: "#0D9488", text: "Target 7,000–10,000 steps every day" },
  { icon: Moon,        color: "#4F46E5", text: "Adults need 7–9 hours of quality sleep" },
  { icon: Brain,       color: "#7C3AED", text: "Mental activity daily reduces cognitive decline" },
  { icon: Leaf,        color: "#16A34A", text: "Eat 5 servings of vegetables & fruits daily" },
];

const REFERENCE_RANGES = [
  { label: "Heart Rate",     range: "60–100 bpm",      color: "#E74C3C", icon: Heart },
  { label: "Blood Pressure", range: "< 120/80 mmHg",   color: "#9333EA", icon: Activity },
  { label: "Blood Oxygen",   range: "95–100%",          color: "#2980B9", icon: Wind },
  { label: "Temperature",    range: "97–99.5°F",        color: "#EA580C", icon: Thermometer },
  { label: "Daily Steps",    range: "7,000–10,000",     color: "#0D9488", icon: Footprints },
  { label: "Sleep",          range: "7–9 hours/night",  color: "#4F46E5", icon: Moon },
];

function getGreetingGradient() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "linear-gradient(135deg, #0D6E4F 0%, #065F46 100%)";
  if (hour >= 12 && hour < 17) return "linear-gradient(135deg, #065F46 0%, #0D9488 100%)";
  if (hour >= 17 && hour < 21) return "linear-gradient(135deg, #0D6E4F 0%, #0D3D6E 100%)";
  return "linear-gradient(135deg, #0B1F18 0%, #0F172A 100%)";
}

const BREATH_PHASES = ["inhale", "hold", "exhale", "hold"];
const PHASE_LABELS = {
  idle:   "Ready when you are",
  inhale: "Breathe in…",
  hold:   "Hold steady…",
  exhale: "Breathe out…",
};

/* ─── HealthTicker ───────────────────────────────────────────────────────── */
function HealthTicker() {
  const doubled = [...HEALTH_FACTS, ...HEALTH_FACTS];
  return (
    <div style={{ overflow: "hidden", position: "relative", marginBottom: 20 }}>
      <div style={{
        position: "absolute", left: 0, top: 0, bottom: 0, width: 32,
        background: "linear-gradient(to right, #F0F7F4, transparent)",
        zIndex: 1, pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", right: 0, top: 0, bottom: 0, width: 32,
        background: "linear-gradient(to left, #F0F7F4, transparent)",
        zIndex: 1, pointerEvents: "none",
      }} />
      <motion.div
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
        style={{ display: "flex", gap: 8, width: "max-content" }}
      >
        {doubled.map((fact, i) => {
          const Icon = fact.icon;
          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                backgroundColor: "#fff",
                border: "1px solid #DCE8E2",
                borderRadius: 40,
                padding: "7px 14px",
                flexShrink: 0,
                boxShadow: "0 1px 4px rgba(13,110,79,0.06)",
              }}
            >
              <Icon size={13} color={fact.color} />
              <span style={{ fontFamily: B, fontSize: "0.6875rem", color: "#5A7A6E", whiteSpace: "nowrap" }}>
                {fact.text}
              </span>
            </div>
          );
        })}
      </motion.div>
    </div>
  );
}

/* ─── BreathingCard ──────────────────────────────────────────────────────── */
function BreathingCard() {
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState("idle");
  const [seconds, setSeconds] = useState(4);
  const [circleTarget, setCircleTarget] = useState(56);
  const intervalRef = useRef(null);
  const stateRef = useRef({ cycle: 0, phaseIdx: 0, secs: 4 });

  function startBreathing() {
    stateRef.current = { cycle: 0, phaseIdx: 0, secs: 4 };
    setPhase("inhale");
    setCircleTarget(88);
    setSeconds(4);
    setIsActive(true);
  }

  function stopBreathing() {
    clearInterval(intervalRef.current);
    setIsActive(false);
    setPhase("idle");
    setSeconds(4);
    setCircleTarget(56);
    stateRef.current = { cycle: 0, phaseIdx: 0, secs: 4 };
  }

  useEffect(() => {
    if (!isActive) return;
    intervalRef.current = setInterval(() => {
      stateRef.current.secs -= 1;
      if (stateRef.current.secs <= 0) {
        stateRef.current.phaseIdx = (stateRef.current.phaseIdx + 1) % 4;
        if (stateRef.current.phaseIdx === 0) {
          stateRef.current.cycle += 1;
          if (stateRef.current.cycle >= 4) {
            clearInterval(intervalRef.current);
            setIsActive(false);
            setPhase("idle");
            setSeconds(4);
            setCircleTarget(56);
            stateRef.current = { cycle: 0, phaseIdx: 0, secs: 4 };
            return;
          }
        }
        stateRef.current.secs = 4;
        const next = BREATH_PHASES[stateRef.current.phaseIdx];
        setPhase(next);
        if (stateRef.current.phaseIdx === 0) setCircleTarget(88);
        if (stateRef.current.phaseIdx === 2) setCircleTarget(56);
        setSeconds(4);
      } else {
        setSeconds(stateRef.current.secs);
      }
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [isActive]);

  return (
    <div style={{
      backgroundColor: "#fff",
      border: "1px solid #DCE8E2",
      borderRadius: 20,
      padding: "20px 20px 24px",
      textAlign: "center",
      boxShadow: "0 4px 16px rgba(13,110,79,0.08)",
    }}>
      <h3 style={{ fontFamily: H, fontWeight: 600, fontSize: "0.875rem", color: "#0B1F18", margin: "0 0 2px" }}>
        Breathing Exercise
      </h3>
      <p style={{ fontFamily: B, fontSize: "0.75rem", color: "#8EBAA3", margin: "0 0 20px" }}>
        4 cycles · Box breathing technique
      </p>
      <div style={{
        width: 100, height: 100, borderRadius: "50%",
        border: isActive ? "2px solid rgba(13,110,79,0.20)" : "2px solid #F0F7F4",
        display: "flex", alignItems: "center", justifyContent: "center",
        margin: "20px auto 8px",
      }}>
        <motion.div
          animate={{ width: circleTarget, height: circleTarget }}
          transition={{ duration: 4, ease: "easeInOut" }}
          style={{
            borderRadius: "50%",
            background: isActive
              ? "linear-gradient(135deg, #0D6E4F, #00C9A7)"
              : "rgba(13,110,79,0.12)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: isActive ? "0 0 24px rgba(0,201,167,0.30)" : "none",
            flexShrink: 0,
          }}
        >
          {isActive && (
            <>
              <span style={{ fontFamily: H, fontWeight: 600, fontSize: "0.75rem", color: "#fff", lineHeight: 1 }}>
                {phase === "inhale" ? "Breathe in" : phase === "hold" ? "Hold" : "Breathe out"}
              </span>
              <span style={{ fontFamily: B, fontSize: "0.625rem", color: "rgba(255,255,255,0.8)", marginTop: 2 }}>
                {seconds}s
              </span>
            </>
          )}
        </motion.div>
      </div>
      <p style={{ fontFamily: B, fontSize: "0.8125rem", color: "#5A7A6E", margin: "0 0 18px", minHeight: 20 }}>
        {PHASE_LABELS[phase] ?? PHASE_LABELS.idle}
      </p>
      <button
        onClick={isActive ? stopBreathing : startBreathing}
        style={{
          background: isActive ? "transparent" : "linear-gradient(135deg, #0D6E4F, #00C9A7)",
          color: isActive ? "#0D6E4F" : "#fff",
          border: isActive ? "1.5px solid #0D6E4F" : "none",
          borderRadius: 40,
          padding: "10px 32px",
          fontFamily: B,
          fontWeight: 600,
          fontSize: "0.875rem",
          cursor: "pointer",
        }}
      >
        {isActive ? "Stop" : "Begin"}
      </button>
    </div>
  );
}

/* ─── HOME PAGE ──────────────────────────────────────────────────────────── */
export default function DashboardHome() {
  const router = useRouter();
  const user = useUserStore((s) => s.user);
  const vitalsReadings = useVitalsStore((s) => s.readings);
  const getLatestVitals = useVitalsStore((s) => s.getLatestVitals);
  const latestVitals = useMemo(() => getLatestVitals(), [vitalsReadings]);
  const { medications, toggleTaken, getTodayAdherence } = useMedicationsStore();
  const records = useRecordsStore((s) => s.records);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(t);
  }, []);

  const firstName = user?.firstName || user?.name?.split(" ")[0] || '';
  const greeting = getHumanGreeting(firstName, medications);
  const { taken: takenCount, total: totalMeds } = getTodayAdherence();

  const homeVitals = useMemo(() => {
    if (Object.keys(latestVitals).length === 0) return [];
    const result = [];
    HOME_VITAL_ORDER.forEach((key) => {
      if (key === "bp") {
        const sys = latestVitals["systolic"];
        const dia = latestVitals["diastolic"];
        if (sys && dia) {
          result.push({
            key: "bp",
            ...VITAL_DISPLAY_CONFIG.bp,
            value: `${sys.value}/${dia.value}`,
            unit: "mmHg",
            status: sys.statusLabel,
            statusColor: sys.statusColor,
          });
        }
      } else if (latestVitals[key]) {
        const v = latestVitals[key];
        result.push({
          key,
          ...VITAL_DISPLAY_CONFIG[key],
          value: v.value,
          unit: v.unit,
          status: v.statusLabel,
          statusColor: v.statusColor,
        });
      }
    });
    return result.slice(0, 6);
  }, [latestVitals]);

  const hasData = homeVitals.length > 0 || medications.length > 0 || records.length > 0;
  const isNewUser = !hasData;
  const twinScores = useMemo(
    () => (hasData ? computeTwinScores(records, latestVitals, medications) : null),
    [records, latestVitals, medications, hasData]
  );

  const greetingGradient = getGreetingGradient();
  const dailyTip = DAILY_TIPS[new Date().getDay()];
  const checklistDoneCount = (records.length > 0 ? 1 : 0) + (homeVitals.length > 0 ? 1 : 0) + (medications.length > 0 ? 1 : 0);
  const userInitials = user?.initials || user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';
  const currentDate = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' });

  if (loading) {
    return (
      <div style={{ padding: "20px 20px 32px", display: "flex", flexDirection: "column", gap: 16 }}>
        <div className="animate-pulse" style={{ background: "#DCE8E2", borderRadius: 20, height: 140 }} />
        <div className="animate-pulse" style={{ background: "#DCE8E2", borderRadius: 16, height: 44 }} />
        <div className="animate-pulse" style={{ background: "#DCE8E2", borderRadius: 16, height: 100 }} />
        <div className="animate-pulse" style={{ background: "#DCE8E2", borderRadius: 16, height: 80 }} />
      </div>
    );
  }

  return (
    <div className="dashboard-page" style={{ padding: "20px 20px 32px" }}>
      {/* ════════════════════════════════════════════════════════ */}
      {/* SECTION 1: Greeting Card                               */}
      {/* ════════════════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut", delay: 0 }}
        style={{
          borderRadius: 20,
          background: greetingGradient,
          padding: 20,
          marginBottom: 20,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Dot-grid texture overlay */}
        <div style={{
          position: "absolute",
          inset: 0,
          opacity: 0.04,
          backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
          backgroundSize: "24px 24px",
          pointerEvents: "none",
        }} />

        {/* User avatar - absolute */}
        <div style={{
          position: "absolute", top: 16, right: 16,
          width: 44, height: 44, borderRadius: "50%",
          background: "rgba(255,255,255,0.20)",
          border: "2px solid rgba(255,255,255,0.30)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 1,
        }}>
          <span style={{ fontFamily: H, fontWeight: 700, fontSize: "1rem", color: "#fff" }}>
            {userInitials}
          </span>
        </div>

        {/* Top row: text */}
        <div style={{ display: "flex", alignItems: "flex-start", position: "relative" }}>
          <div style={{ flex: 1, paddingRight: 56 }}>
            <h1 style={{ fontFamily: H, fontWeight: 700, fontSize: "1.375rem", color: "#fff", margin: 0, lineHeight: 1.2 }}>
              {greeting.greeting}
            </h1>
            <p style={{ fontFamily: B, fontSize: "0.8125rem", color: "rgba(255,255,255,0.75)", margin: "6px 0 0", lineHeight: 1.4 }}>
              {greeting.subtitle}
            </p>
          </div>
        </div>

        {/* Daily tip */}
        <div style={{
          display: "flex", alignItems: "flex-start", gap: 8,
          marginTop: 14, paddingTop: 14,
          borderTop: "1px solid rgba(255,255,255,0.12)",
          position: "relative",
        }}>
          <Lightbulb size={13} color="rgba(255,255,255,0.55)" style={{ marginTop: 1, flexShrink: 0 }} />
          <p style={{ fontFamily: B, fontSize: "0.6875rem", color: "rgba(255,255,255,0.6)", margin: 0, lineHeight: 1.5 }}>
            {dailyTip}
          </p>
        </div>
        {/* Date row */}
        <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 8 }}>
          <CalendarDays size={11} color="rgba(255,255,255,0.55)" />
          <span style={{ fontFamily: B, fontSize: "0.6875rem", color: "rgba(255,255,255,0.55)" }}>
            {currentDate}
          </span>
        </div>
      </motion.div>

      {/* ════════════════════════════════════════════════════════ */}
      {/* SECTION 2: Health Facts Ticker                        */}
      {/* ════════════════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut", delay: 0.08 }}
      >
        <HealthTicker />
      </motion.div>

      {/* ════════════════════════════════════════════════════════ */}
      {/* WELCOME BANNER — new users only                        */}
      {/* ════════════════════════════════════════════════════════ */}
      {isNewUser && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut", delay: 0.16 }}
          style={{
            background: "linear-gradient(135deg, #EFF6FF, #F0FDF4)",
            border: "1px solid #DCE8E2",
            borderRadius: 16,
            padding: 16,
            marginBottom: 24,
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: "rgba(37,99,235,0.08)",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}>
            <Sparkles size={20} color="#2563EB" />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontFamily: H, fontWeight: 600, fontSize: "0.875rem", color: "#0B1F18", margin: 0 }}>
              Welcome to Zivika Labs!
            </p>
            <p style={{ fontFamily: B, fontSize: "0.75rem", color: "#5A7A6E", margin: "3px 0 0", lineHeight: 1.4 }}>
              Start by scanning your first medical report. Your AI health journey begins now.
            </p>
          </div>
          <button
            onClick={() => router.push("/dashboard/scan")}
            style={{
              background: "linear-gradient(135deg, #0D6E4F, #00C9A7)",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "8px 12px",
              fontFamily: B,
              fontWeight: 600,
              fontSize: "0.8125rem",
              cursor: "pointer",
              flexShrink: 0,
              whiteSpace: "nowrap",
            }}
          >
            Start →
          </button>
        </motion.div>
      )}

      {/* ════════════════════════════════════════════════════════ */}
      {/* SECTION 4: Your Vitals                                */}
      {/* ════════════════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut", delay: 0.24 }}
        style={{ marginBottom: 24 }}
      >
        <SectionHeader
          title="Your Vitals"
          actionLabel="See All"
          onAction={() => router.push("/dashboard/vitals")}
        />
        {homeVitals.length === 0 ? (
          <div>
            <p style={{ fontFamily: B, fontSize: "0.75rem", color: "#8EBAA3", margin: "0 0 12px" }}>
              Know your healthy ranges — log your first reading to get started.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
              {REFERENCE_RANGES.map(({ label, range, color, icon: RIcon }) => (
                <div key={label} style={{
                  backgroundColor: "#fff",
                  border: "1px solid #DCE8E2",
                  borderLeft: `3px solid ${color}`,
                  borderRadius: 12,
                  padding: "14px 10px",
                  display: "flex", alignItems: "center", gap: 10,
                }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 8,
                    background: `${color}1E`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                  }}>
                    <RIcon size={16} color={color} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontFamily: B, fontSize: "0.6875rem", color: "#5A7A6E", margin: 0 }}>
                      {label}
                    </p>
                    <p style={{ fontFamily: H, fontWeight: 700, fontSize: "0.9375rem", color: "#0B1F18", margin: "2px 0 0", lineHeight: 1.2 }}>
                      {range}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => router.push("/dashboard/vitals")}
              style={{
                width: "100%",
                background: "none",
                border: "1.5px dashed #8EBAA3",
                borderRadius: 12,
                padding: "12px 0",
                fontFamily: B, fontWeight: 600, fontSize: "0.8125rem",
                color: "#0D6E4F", cursor: "pointer",
              }}
            >
              Log Your First Reading →
            </button>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
            {homeVitals.map(({ key, ...rest }) => (
              <VitalCard key={key} {...rest} />
            ))}
          </div>
        )}
      </motion.div>

      {/* ════════════════════════════════════════════════════════ */}
      {/* SECTION 5: Health Score Preview                       */}
      {/* ════════════════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut", delay: 0.32 }}
        style={{ marginBottom: 24 }}
      >
        {hasData && twinScores !== null ? (
          <div
            onClick={() => router.push("/dashboard/twin")}
            style={{
              background: "linear-gradient(135deg, rgba(13,110,79,0.06), rgba(0,201,167,0.08))",
              border: "1px solid rgba(13,110,79,0.18)",
              borderRadius: 16,
              padding: "14px 16px",
              display: "flex",
              alignItems: "center",
              gap: 12,
              cursor: "pointer",
            }}
          >
            <div style={{
              width: 44, height: 44, borderRadius: "50%",
              background: "linear-gradient(135deg, #0D6E4F, #00C9A7)",
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              <span style={{ fontFamily: H, fontWeight: 700, fontSize: "0.9375rem", color: "#fff", lineHeight: 1 }}>
                {twinScores.overall}
              </span>
              <span style={{ fontFamily: B, fontSize: "0.625rem", color: "rgba(255,255,255,0.8)" }}>score</span>
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontFamily: H, fontWeight: 600, fontSize: "0.875rem", color: "#0B1F18", margin: 0 }}>
                Your Health Score
              </p>
              <p style={{ fontFamily: B, fontSize: "0.75rem", color: "#0D6E4F", margin: "2px 0 0" }}>
                View your Digital Twin →
              </p>
            </div>
            <ChevronRight size={16} color="#8EBAA3" />
          </div>
        ) : (
          <div style={{
            backgroundColor: "#fff",
            border: "1px solid #DCE8E2",
            borderRadius: 16,
            padding: 16,
            boxShadow: "0 2px 8px rgba(13,110,79,0.06)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: "rgba(13,110,79,0.08)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Sparkles size={18} color="#0D6E4F" />
              </div>
              <div>
                <p style={{ fontFamily: H, fontWeight: 600, fontSize: "0.875rem", color: "#0B1F18", margin: 0 }}>
                  Build Your Health Score
                </p>
                <p style={{ fontFamily: B, fontSize: "0.6875rem", color: "#8EBAA3", margin: "1px 0 0" }}>
                  3 steps to unlock your digital twin
                </p>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              {[
                { label: "Scan a medical report", done: records.length > 0 },
                { label: "Log a vital reading", done: homeVitals.length > 0 },
                { label: "Add a medication", done: medications.length > 0 },
              ].map((step, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "10px 0",
                  borderBottom: i < 2 ? "1px solid #F0F7F4" : "none",
                }}>
                  <motion.div
                    key={`step-${i}-${step.done}`}
                    initial={{ scale: step.done ? 1.2 : 1 }}
                    animate={{ scale: 1 }}
                    style={{
                      width: 16, height: 16, borderRadius: "50%",
                      background: step.done ? "#0D6E4F" : "#F0F7F4",
                      border: step.done ? "none" : "2px solid #DCE8E2",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {step.done && <Check size={10} color="#fff" />}
                  </motion.div>
                  <span style={{
                    fontFamily: B, fontSize: "0.8125rem",
                    color: step.done ? "#0D6E4F" : "#8EBAA3",
                    textDecoration: step.done ? "line-through" : "none",
                  }}>
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
            {/* Progress bar */}
            <div style={{ marginTop: 12 }}>
              <div style={{ width: "100%", height: 4, borderRadius: 2, background: "#F0F7F4", overflow: "hidden" }}>
                <div style={{
                  width: `${(checklistDoneCount / 3) * 100}%`,
                  height: "100%",
                  background: "linear-gradient(90deg, #0D6E4F, #00C9A7)",
                  borderRadius: 2,
                  transition: "width 0.4s ease",
                }} />
              </div>
              <p style={{ fontFamily: B, fontSize: "0.6875rem", color: "#8EBAA3", margin: "4px 0 0" }}>
                {checklistDoneCount} of 3 steps complete
              </p>
            </div>
          </div>
        )}
      </motion.div>

      {/* ════════════════════════════════════════════════════════ */}
      {/* SECTION 6: Today's Medications                        */}
      {/* ════════════════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut", delay: 0.40 }}
        style={{ marginBottom: 24 }}
      >
        <SectionHeader
          title="Today's Medications"
          actionLabel="See All"
          onAction={() => router.push("/dashboard/medications")}
        />
        {medications.length === 0 ? (
          <div style={{ backgroundColor: "#fff", border: "1px solid #DCE8E2", borderRadius: 16, padding: 24 }}>
            <EmptyState
              icon={Pill}
              iconColor="#0D6E4F"
              title="No medications added"
              description="Add your daily medications to get smart reminders and track your adherence streak."
              ctaLabel="Add Medication"
              onCta={() => router.push("/dashboard/medications")}
            />
          </div>
        ) : (
          <div>
            {medications.map((med) => (
              <MedRow key={med.id} med={med} onToggle={() => toggleTaken(med.id)} />
            ))}
          </div>
        )}
      </motion.div>

      {/* ════════════════════════════════════════════════════════ */}
      {/* SECTION 7: Quick Actions (2×2)                        */}
      {/* ════════════════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut", delay: 0.48 }}
        style={{ marginBottom: 24 }}
      >
        <SectionHeader title="Quick Actions" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <QuickActionCard icon={Camera}        iconColor="#0D6E4F" label="Scan Report"    subtitle="Digitize any report"   href="/dashboard/scan"     router={router} />
          <QuickActionCard icon={MessageCircle} iconColor="#2563EB" label="Ask Copilot"    subtitle="AI health assistant"   href="/dashboard/copilot"  router={router} />
          <QuickActionCard icon={ClipboardList} iconColor="#F39C12" label="Check Symptoms" subtitle="Understand your body"  href="/dashboard/symptoms" router={router} />
          <QuickActionCard icon={Rss}           iconColor="#7C3AED" label="Health Feed"    subtitle="Tips from doctors"     href="/dashboard/feed"     router={router} />
        </div>
      </motion.div>

      {/* ════════════════════════════════════════════════════════ */}
      {/* SECTION 8: Breathing Exercise                         */}
      {/* ════════════════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut", delay: 0.56 }}
      >
        <SectionHeader title="Breathing Exercise" />
        <BreathingCard />
      </motion.div>
    </div>
  );
}
