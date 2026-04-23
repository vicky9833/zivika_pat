"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft, ChevronRight, CalendarHeart, Droplets,
  Flower2, Heart, Zap, AlertCircle, Check, Plus, X, Info,
} from "lucide-react";
import { api } from "../../../../convex/_generated/api";

const H = "var(--font-outfit, 'Outfit', sans-serif)";
const B = "var(--font-dm-sans, 'DM Sans', sans-serif)";

const FLOW_LEVELS = [
  { id: "spotting", label: "Spotting", color: "#FBBF24", dot: "🟡" },
  { id: "light",    label: "Light",    color: "#FB923C", dot: "🟠" },
  { id: "medium",   label: "Medium",   color: "#F87171", dot: "🔴" },
  { id: "heavy",    label: "Heavy",    color: "#DC2626", dot: "🔴" },
];

const SYMPTOMS = [
  "Cramps", "Bloating", "Headache", "Fatigue", "Back pain",
  "Breast tenderness", "Mood swings", "Nausea", "Acne",
];

const MOODS = [
  { id: "great",   emoji: "😊", label: "Great" },
  { id: "good",    emoji: "🙂", label: "Good" },
  { id: "meh",     emoji: "😐", label: "Meh" },
  { id: "sad",     emoji: "😔", label: "Low" },
  { id: "anxious", emoji: "😰", label: "Anxious" },
];

const DAY_MS = 24 * 60 * 60 * 1000;

function fmt(date) {
  return date instanceof Date
    ? date.toISOString().slice(0, 10)
    : date;
}

function parseDate(str) {
  if (!str) return null;
  const [y, m, d] = str.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

function daysBetween(a, b) {
  return Math.round((parseDate(b) - parseDate(a)) / DAY_MS);
}

const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const DAY_NAMES   = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

export default function PeriodTrackerPage() {
  const router = useRouter();
  const { user: clerkUser } = useUser();
  const clerkId = clerkUser?.id;

  const logs = useQuery(api.periods.getPeriodLogs, clerkId ? { clerkId } : "skip") || [];
  const prediction = useQuery(api.periods.getPeriodPrediction, clerkId ? { clerkId } : "skip");

  const logPeriod = useMutation(api.periods.logPeriod);
  const endPeriod = useMutation(api.periods.endPeriod);
  const updateCycle = useMutation(api.periods.updateCycleSettings);

  // Calendar navigation
  const today = new Date();
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());

  // Log panel
  const [showLogPanel, setShowLogPanel] = useState(false);
  const [logDate, setLogDate] = useState(fmt(today));
  const [logFlow, setLogFlow] = useState("medium");
  const [logSymptoms, setLogSymptoms] = useState([]);
  const [logMood, setLogMood] = useState("");
  const [logNotes, setLogNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Settings panel
  const [showSettings, setShowSettings] = useState(false);
  const [settingsCycle, setSettingsCycle] = useState(28);
  const [settingsPeriod, setSettingsPeriod] = useState(5);

  // Build a lookup set of period days for calendar coloring
  const periodDaySet = useMemo(() => {
    const set = new Set();
    for (const log of logs) {
      const start = parseDate(log.startDate);
      const end = log.endDate ? parseDate(log.endDate) : addDays(start, (prediction?.periodLength || 5) - 1);
      let d = new Date(start);
      while (d <= end) {
        set.add(fmt(d));
        d = addDays(d, 1);
      }
    }
    return set;
  }, [logs, prediction]);

  // Build predicted period days
  const predictedDaySet = useMemo(() => {
    const set = new Set();
    if (!prediction) return set;
    const start = parseDate(prediction.nextPeriodStart);
    const end   = parseDate(prediction.nextPeriodEnd);
    let d = new Date(start);
    while (d <= end) {
      set.add(fmt(d));
      d = addDays(d, 1);
    }
    return set;
  }, [prediction]);

  // Build fertile window days
  const fertileSet = useMemo(() => {
    const set = new Set();
    if (!prediction) return set;
    const start = parseDate(prediction.fertileWindowStart);
    const end   = parseDate(prediction.fertileWindowEnd);
    let d = new Date(start);
    while (d <= end) {
      set.add(fmt(d));
      d = addDays(d, 1);
    }
    return set;
  }, [prediction]);

  // Calendar grid
  const firstDay = new Date(calYear, calMonth, 1).getDay();
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  function getDayStyle(dayNum) {
    if (!dayNum) return {};
    const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
    const isToday = dateStr === fmt(today);
    if (periodDaySet.has(dateStr)) return { bg: "#FECDD3", border: "#F43F5E", dot: "#F43F5E" };
    if (predictedDaySet.has(dateStr)) return { bg: "#FEE2E2", border: "#FCA5A5", dot: "#FCA5A5", dashed: true };
    if (dateStr === prediction?.ovulationDate) return { bg: "#D1FAE5", border: "#10B981", dot: "#10B981" };
    if (fertileSet.has(dateStr)) return { bg: "#ECFDF5", border: "#6EE7B7", dot: "#6EE7B7" };
    if (isToday) return { bg: "#E0F2FE", border: "#38BDF8", dot: "#38BDF8" };
    return {};
  }

  async function handleSaveLog() {
    if (!clerkId) return;
    setIsSaving(true);
    try {
      await logPeriod({
        clerkId,
        startDate: logDate,
        flowLevel: logFlow,
        symptoms: logSymptoms.length ? logSymptoms : undefined,
        mood: logMood || undefined,
        notes: logNotes || undefined,
      });
      setSaved(true);
      setTimeout(() => {
        setSaved(false);
        setShowLogPanel(false);
        setLogSymptoms([]);
        setLogMood("");
        setLogNotes("");
      }, 1200);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSaveSettings() {
    if (!clerkId) return;
    await updateCycle({
      clerkId,
      avgCycleLength: settingsCycle,
      avgPeriodLength: settingsPeriod,
    });
    setShowSettings(false);
  }

  const cycleLength = prediction?.cycleLength || 28;
  const daysUntilNext = prediction?.nextPeriodStart
    ? daysBetween(fmt(today), prediction.nextPeriodStart)
    : null;

  return (
    <div style={{ minHeight: "100%", background: "#fff", paddingBottom: 100 }}>
      {/* Header */}
      <div style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "#fff", borderBottom: "1px solid #F0F4F8",
        padding: "12px 16px",
        display: "flex", alignItems: "center", gap: 12,
      }}>
        <button
          onClick={() => router.back()}
          style={{ background: "none", border: "none", cursor: "pointer", padding: 4, borderRadius: 8, display: "flex", alignItems: "center" }}
        >
          <ChevronLeft size={22} color="#0B1F18" />
        </button>
        <CalendarHeart size={20} color="#E91E8C" />
        <h1 style={{ fontFamily: H, fontWeight: 700, fontSize: "1rem", color: "#0B1F18", margin: 0 }}>
          Period Tracker
        </h1>
        <button
          onClick={() => setShowSettings(true)}
          style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", fontFamily: B, fontSize: "0.75rem", color: "#0D6E4F", fontWeight: 600 }}
        >
          Settings
        </button>
      </div>

      <div style={{ padding: "16px 16px 0" }}>
        {/* Status Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: "linear-gradient(135deg, #FDF2F8 0%, #FCE7F3 100%)",
            borderRadius: 20, padding: 20,
            border: "1px solid #FBCFE8",
            marginBottom: 20,
          }}
        >
          {daysUntilNext !== null && daysUntilNext >= 0 ? (
            <>
              <p style={{ fontFamily: B, fontSize: "0.75rem", color: "#BE185D", margin: 0 }}>NEXT PERIOD IN</p>
              <p style={{ fontFamily: H, fontWeight: 800, fontSize: "2.5rem", color: "#9D174D", margin: "4px 0 0", lineHeight: 1 }}>
                {daysUntilNext} <span style={{ fontFamily: B, fontWeight: 500, fontSize: "1rem", color: "#BE185D" }}>days</span>
              </p>
              <p style={{ fontFamily: B, fontSize: "0.8rem", color: "#BE185D", margin: "6px 0 0" }}>
                {prediction.nextPeriodStart} — {prediction.nextPeriodEnd}
              </p>
              <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
                <div style={{ flex: 1, background: "rgba(255,255,255,0.6)", borderRadius: 12, padding: "8px 10px" }}>
                  <p style={{ fontFamily: B, fontSize: "0.6rem", color: "#BE185D", margin: 0 }}>CYCLE LENGTH</p>
                  <p style={{ fontFamily: H, fontWeight: 700, fontSize: "1.1rem", color: "#9D174D", margin: "2px 0 0" }}>{cycleLength}d</p>
                </div>
                <div style={{ flex: 1, background: "rgba(255,255,255,0.6)", borderRadius: 12, padding: "8px 10px" }}>
                  <p style={{ fontFamily: B, fontSize: "0.6rem", color: "#BE185D", margin: 0 }}>PERIOD LENGTH</p>
                  <p style={{ fontFamily: H, fontWeight: 700, fontSize: "1.1rem", color: "#9D174D", margin: "2px 0 0" }}>{prediction?.periodLength || 5}d</p>
                </div>
                {prediction?.ovulationDate && (
                  <div style={{ flex: 1, background: "rgba(255,255,255,0.6)", borderRadius: 12, padding: "8px 10px" }}>
                    <p style={{ fontFamily: B, fontSize: "0.6rem", color: "#059669", margin: 0 }}>OVULATION</p>
                    <p style={{ fontFamily: H, fontWeight: 700, fontSize: "0.85rem", color: "#065F46", margin: "2px 0 0" }}>{prediction.ovulationDate?.slice(5)}</p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Info size={24} color="#BE185D" />
              <div>
                <p style={{ fontFamily: H, fontWeight: 600, fontSize: "0.9rem", color: "#9D174D", margin: 0 }}>Log your first period</p>
                <p style={{ fontFamily: B, fontSize: "0.75rem", color: "#BE185D", margin: "2px 0 0" }}>Tap the button below to get started</p>
              </div>
            </div>
          )}
        </motion.div>

        {/* Log Period Button */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => setShowLogPanel(true)}
          style={{
            width: "100%", padding: "14px 0",
            background: "#E91E8C",
            border: "none", borderRadius: 16, cursor: "pointer",
            fontFamily: H, fontWeight: 700, fontSize: "0.95rem", color: "#fff",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            marginBottom: 24,
          }}
        >
          <Plus size={18} /> Log Period Day
        </motion.button>

        {/* Calendar */}
        <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #DCE8E2", padding: 16, marginBottom: 20 }}>
          {/* Month nav */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <button
              onClick={() => {
                if (calMonth === 0) { setCalMonth(11); setCalYear((y) => y - 1); }
                else setCalMonth((m) => m - 1);
              }}
              style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}
            >
              <ChevronLeft size={18} color="#0B1F18" />
            </button>
            <p style={{ fontFamily: H, fontWeight: 700, fontSize: "0.95rem", color: "#0B1F18", margin: 0 }}>
              {MONTH_NAMES[calMonth]} {calYear}
            </p>
            <button
              onClick={() => {
                if (calMonth === 11) { setCalMonth(0); setCalYear((y) => y + 1); }
                else setCalMonth((m) => m + 1);
              }}
              style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}
            >
              <ChevronRight size={18} color="#0B1F18" />
            </button>
          </div>

          {/* Day names */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2, marginBottom: 6 }}>
            {DAY_NAMES.map((d) => (
              <div key={d} style={{ textAlign: "center", fontFamily: B, fontSize: "0.6rem", color: "#8EBAA3", fontWeight: 600 }}>{d}</div>
            ))}
          </div>

          {/* Cells */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2 }}>
            {cells.map((day, idx) => {
              if (!day) return <div key={`e${idx}`} />;
              const style = getDayStyle(day);
              return (
                <div
                  key={day}
                  onClick={() => {
                    const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                    setLogDate(dateStr);
                    setShowLogPanel(true);
                  }}
                  style={{
                    height: 32, borderRadius: 8, cursor: "pointer",
                    background: style.bg || "transparent",
                    border: style.border ? `1.5px ${style.dashed ? "dashed" : "solid"} ${style.border}` : "none",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "background 0.15s",
                  }}
                >
                  <span style={{ fontFamily: B, fontSize: "0.75rem", color: style.dot || "#0B1F18", fontWeight: style.dot ? 700 : 400 }}>
                    {day}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div style={{ display: "flex", gap: 12, marginTop: 12, flexWrap: "wrap" }}>
            {[
              { color: "#FECDD3", border: "#F43F5E", label: "Period" },
              { color: "#FEE2E2", border: "#FCA5A5", label: "Predicted", dashed: true },
              { color: "#D1FAE5", border: "#10B981", label: "Ovulation" },
              { color: "#ECFDF5", border: "#6EE7B7", label: "Fertile" },
            ].map(({ color, border, label, dashed }) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <div style={{ width: 12, height: 12, borderRadius: 4, background: color, border: `1.5px ${dashed ? "dashed" : "solid"} ${border}` }} />
                <span style={{ fontFamily: B, fontSize: "0.6rem", color: "#5A7A6E" }}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent History */}
        {logs.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <p style={{ fontFamily: H, fontWeight: 700, fontSize: "0.9rem", color: "#0B1F18", margin: "0 0 12px" }}>History</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {logs.slice(0, 6).map((log) => (
                <div
                  key={log._id}
                  style={{
                    background: "#FDF2F8",
                    border: "1px solid #FBCFE8",
                    borderRadius: 14, padding: "12px 14px",
                    display: "flex", alignItems: "center", gap: 12,
                  }}
                >
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: "#FCE7F3", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Droplets size={16} color="#E91E8C" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontFamily: H, fontWeight: 600, fontSize: "0.85rem", color: "#9D174D", margin: 0 }}>
                      {log.startDate}{log.endDate ? ` → ${log.endDate}` : ""}
                    </p>
                    {log.flowLevel && (
                      <p style={{ fontFamily: B, fontSize: "0.7rem", color: "#BE185D", margin: "2px 0 0" }}>
                        Flow: {log.flowLevel}
                        {log.symptoms?.length ? ` · ${log.symptoms.slice(0, 2).join(", ")}` : ""}
                      </p>
                    )}
                  </div>
                  {log.mood && <span style={{ fontSize: "1.25rem" }}>{MOODS.find((m) => m.id === log.mood)?.emoji || ""}</span>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Log Panel (bottom sheet) */}
      <AnimatePresence>
        {showLogPanel && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 100, display: "flex", alignItems: "flex-end" }}
            onClick={(e) => e.target === e.currentTarget && setShowLogPanel(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              style={{ width: "100%", background: "#fff", borderRadius: "24px 24px 0 0", padding: "20px 16px 40px", maxHeight: "85vh", overflowY: "auto" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <p style={{ fontFamily: H, fontWeight: 700, fontSize: "1rem", color: "#0B1F18", margin: 0 }}>Log Period</p>
                <button onClick={() => setShowLogPanel(false)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
                  <X size={20} color="#8EBAA3" />
                </button>
              </div>

              {/* Date */}
              <label style={{ fontFamily: B, fontSize: "0.75rem", color: "#5A7A6E", fontWeight: 600, display: "block", marginBottom: 6 }}>Date</label>
              <input
                type="date"
                value={logDate}
                onChange={(e) => setLogDate(e.target.value)}
                max={fmt(today)}
                style={{ width: "100%", padding: "10px 12px", borderRadius: 12, border: "1.5px solid #DCE8E2", fontFamily: B, fontSize: "0.875rem", color: "#0B1F18", outline: "none", marginBottom: 16, boxSizing: "border-box" }}
              />

              {/* Flow */}
              <label style={{ fontFamily: B, fontSize: "0.75rem", color: "#5A7A6E", fontWeight: 600, display: "block", marginBottom: 8 }}>Flow Level</label>
              <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                {FLOW_LEVELS.map(({ id, label, color }) => (
                  <button
                    key={id}
                    onClick={() => setLogFlow(id)}
                    style={{
                      flex: 1, padding: "8px 4px", borderRadius: 12, border: "none", cursor: "pointer",
                      background: logFlow === id ? color : `${color}22`,
                      fontFamily: B, fontSize: "0.7rem", fontWeight: logFlow === id ? 700 : 400,
                      color: logFlow === id ? "#fff" : color,
                      transition: "all 0.15s",
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* Symptoms */}
              <label style={{ fontFamily: B, fontSize: "0.75rem", color: "#5A7A6E", fontWeight: 600, display: "block", marginBottom: 8 }}>Symptoms</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
                {SYMPTOMS.map((s) => {
                  const active = logSymptoms.includes(s);
                  return (
                    <button
                      key={s}
                      onClick={() => setLogSymptoms((prev) => active ? prev.filter((x) => x !== s) : [...prev, s])}
                      style={{
                        padding: "6px 12px", borderRadius: 20, border: "none", cursor: "pointer",
                        background: active ? "#FCE7F3" : "#F0F7F4",
                        fontFamily: B, fontSize: "0.75rem", fontWeight: active ? 600 : 400,
                        color: active ? "#BE185D" : "#5A7A6E",
                        border: active ? "1px solid #FBCFE8" : "1px solid #DCE8E2",
                      }}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>

              {/* Mood */}
              <label style={{ fontFamily: B, fontSize: "0.75rem", color: "#5A7A6E", fontWeight: 600, display: "block", marginBottom: 8 }}>Mood</label>
              <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                {MOODS.map(({ id, emoji, label }) => (
                  <button
                    key={id}
                    onClick={() => setLogMood((prev) => prev === id ? "" : id)}
                    style={{
                      flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
                      padding: "8px 4px", borderRadius: 12, border: "none", cursor: "pointer",
                      background: logMood === id ? "#FCE7F3" : "#F9FAFB",
                      border: logMood === id ? "1.5px solid #FBCFE8" : "1.5px solid transparent",
                    }}
                  >
                    <span style={{ fontSize: "1.4rem" }}>{emoji}</span>
                    <span style={{ fontFamily: B, fontSize: "0.6rem", color: logMood === id ? "#BE185D" : "#8EBAA3" }}>{label}</span>
                  </button>
                ))}
              </div>

              {/* Notes */}
              <label style={{ fontFamily: B, fontSize: "0.75rem", color: "#5A7A6E", fontWeight: 600, display: "block", marginBottom: 8 }}>Notes (optional)</label>
              <textarea
                value={logNotes}
                onChange={(e) => setLogNotes(e.target.value)}
                placeholder="Any notes about today..."
                rows={2}
                style={{ width: "100%", padding: "10px 12px", borderRadius: 12, border: "1.5px solid #DCE8E2", fontFamily: B, fontSize: "0.875rem", color: "#0B1F18", outline: "none", marginBottom: 20, resize: "none", boxSizing: "border-box" }}
              />

              <button
                onClick={handleSaveLog}
                disabled={isSaving || saved}
                style={{
                  width: "100%", padding: "14px 0",
                  background: saved ? "#27AE60" : "#E91E8C",
                  border: "none", borderRadius: 16, cursor: isSaving ? "default" : "pointer",
                  fontFamily: H, fontWeight: 700, fontSize: "0.95rem", color: "#fff",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  opacity: isSaving ? 0.7 : 1, transition: "all 0.2s",
                }}
              >
                {saved ? <><Check size={18} /> Saved!</> : isSaving ? "Saving…" : "Save Log"}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 100, display: "flex", alignItems: "flex-end" }}
            onClick={(e) => e.target === e.currentTarget && setShowSettings(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              style={{ width: "100%", background: "#fff", borderRadius: "24px 24px 0 0", padding: "20px 16px 40px" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <p style={{ fontFamily: H, fontWeight: 700, fontSize: "1rem", color: "#0B1F18", margin: 0 }}>Cycle Settings</p>
                <button onClick={() => setShowSettings(false)} style={{ background: "none", border: "none", cursor: "pointer" }}>
                  <X size={20} color="#8EBAA3" />
                </button>
              </div>

              <label style={{ fontFamily: B, fontSize: "0.8rem", color: "#5A7A6E", fontWeight: 600, display: "block", marginBottom: 8 }}>
                Average Cycle Length: <strong style={{ color: "#0B1F18" }}>{settingsCycle} days</strong>
              </label>
              <input
                type="range" min={21} max={45} value={settingsCycle}
                onChange={(e) => setSettingsCycle(Number(e.target.value))}
                style={{ width: "100%", accentColor: "#E91E8C", marginBottom: 20 }}
              />

              <label style={{ fontFamily: B, fontSize: "0.8rem", color: "#5A7A6E", fontWeight: 600, display: "block", marginBottom: 8 }}>
                Average Period Length: <strong style={{ color: "#0B1F18" }}>{settingsPeriod} days</strong>
              </label>
              <input
                type="range" min={2} max={10} value={settingsPeriod}
                onChange={(e) => setSettingsPeriod(Number(e.target.value))}
                style={{ width: "100%", accentColor: "#E91E8C", marginBottom: 24 }}
              />

              <button
                onClick={handleSaveSettings}
                style={{
                  width: "100%", padding: "14px 0",
                  background: "#E91E8C", border: "none", borderRadius: 16, cursor: "pointer",
                  fontFamily: H, fontWeight: 700, fontSize: "0.95rem", color: "#fff",
                }}
              >
                Save Settings
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
