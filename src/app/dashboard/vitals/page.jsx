"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useVitalsStore, NORMAL_RANGES } from "@/lib/stores/vitals-store";
import { useConvexUser } from "@/lib/hooks/useConvexUser";
import { useConvexVitals } from "@/lib/hooks/useConvexVitals";
import VitalCard, { VITAL_META } from "@/components/vitals/VitalCard";
import VitalChart from "@/components/vitals/VitalChart";
import LogVital from "@/components/vitals/LogVital";
import EmptyState from "@/components/shared/EmptyState";
import { Activity, Plus } from "lucide-react";

const H = "var(--font-outfit, 'Outfit', sans-serif)";
const B = "var(--font-dm-sans, 'DM Sans', sans-serif)";

// Ordered display grid: 3×3
const VITAL_ORDER = [
  "heartRate",
  "systolic",
  "diastolic",
  "spo2",
  "temperature",
  "weight",
  "glucose",
  "steps",
  "sleep",
];

export default function VitalsPage() {
  // Legacy Zustand store (still used by LogVital component)
  const getLatestVitals = useVitalsStore((s) => s.getLatestVitals);
  const vitalsReadings = useVitalsStore((s) => s.readings);
  const getVitalHistory = useVitalsStore((s) => s.getVitalHistory);
  const getNormalRange = useVitalsStore((s) => s.getNormalRange);

  // Convex real-time vitals
  const { convexUser } = useConvexUser();
  const { latestMap: convexLatestMap, historyMap: convexHistoryMap, isLoading: convexLoading, logVital, getNormalRange: getConvexNormalRange } = useConvexVitals(convexUser);

  // Recompute status for Convex vitals using the correct vitals-store NORMAL_RANGES
  // Build a new annotated map instead of mutating Convex objects
  const annotatedConvexMap = Object.fromEntries(
    Object.entries(convexLatestMap).map(([type, v]) => {
      const range = NORMAL_RANGES[type];
      if (!range) return [type, { ...v, statusLabel: "Logged", statusColor: "#27AE60" }];
      if (v.value < range.min)      return [type, { ...v, statusLabel: "Low",    statusColor: "#E74C3C" }];
      if (v.value > range.max)      return [type, { ...v, statusLabel: "High",   statusColor: "#E74C3C" }];
      return                               [type, { ...v, statusLabel: "Normal", statusColor: "#27AE60" }];
    })
  );

  // Use Convex data if available, fall back to Zustand
  const hasConvexData = Object.keys(annotatedConvexMap).length > 0;
  const zustandLatest = useMemo(() => getLatestVitals(), [vitalsReadings]);

  const [selected, setSelected] = useState(null);
  const [logOpen, setLogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  useEffect(() => { const t = setTimeout(() => setLoading(false), 400); return () => clearTimeout(t); }, []);

  const latestMap = hasConvexData ? annotatedConvexMap : zustandLatest;
  const hasVitals = Object.keys(latestMap).length > 0;

  function handleCardClick(type) {
    setSelected((prev) => (prev === type ? null : type));
  }

  // Build the history + range for the selected vital
  const chartHistory = selected
    ? (hasConvexData ? (convexHistoryMap[selected] ?? []) : getVitalHistory(selected, 30))
    : [];
  const normalRange = selected
    ? (hasConvexData ? getConvexNormalRange(selected) : getNormalRange(selected))
    : null;

  if (loading || (convexLoading && !convexUser)) {
    return (
      <div style={{ padding: "20px 20px 100px", display: "flex", flexDirection: "column", gap: 20 }}>
        <div className="animate-pulse" style={{ background: "#DCE8E2", borderRadius: 10, height: 36, width: 120 }} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
          {[...Array(9)].map((_, i) => <div key={i} className="animate-pulse" style={{ background: "#DCE8E2", borderRadius: 14, height: 90 }} />)}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      style={{
        minHeight: "100vh",
        background: "#F0F7F4",
        paddingBottom: 100,
      }}
    >
      {/* Top nav */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 40,
          background: "rgba(240,247,244,0.92)",
          backdropFilter: "blur(12px)",
          padding: "16px 20px 12px",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <button
          onClick={() => window.history.back()}
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            border: "1.5px solid #DCE8E2",
            background: "#fff",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 0,
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0B1F18" strokeWidth="2.2" strokeLinecap="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <h1 style={{ fontFamily: H, fontWeight: 700, fontSize: "1.1rem", color: "#0B1F18", margin: 0 }}>
          Vitals
        </h1>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setLogOpen(true)}
          style={{
            marginLeft: "auto",
            padding: "6px 16px",
            borderRadius: 20,
            border: "none",
            background: "#0D6E4F",
            color: "#fff",
            fontFamily: H,
            fontWeight: 600,
            fontSize: "0.8125rem",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          <Plus size={14} />
          Log Vital
        </motion.button>
      </div>

      <div style={{ padding: "8px 20px", display: "flex", flexDirection: "column", gap: 20 }}>

        {/* ── Section 1: Vitals Grid ── */}
        <div>
          <h2 style={{ fontFamily: H, fontWeight: 700, fontSize: "1rem", color: "#0B1F18", margin: "0 0 12px" }}>
            Current Readings
          </h2>
          {!hasVitals ? (
            <EmptyState
              icon={Activity}
              title="No vitals recorded yet"
              description="Track your heart rate, blood pressure, SpO2, weight, and more. Tap the button below to log your first reading."
              ctaLabel="Log Your First Vital"
              onCta={() => setLogOpen(true)}
            />
          ) : (
            <>
            {selected && (
              <p style={{ fontFamily: B, fontSize: "0.78rem", color: "#8EBAA3", margin: "-8px 0 12px" }}>
                Tap a card to view its chart
              </p>
            )}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 10,
              }}
            >
              {VITAL_ORDER.map((type, i) => {
                const data = latestMap[type];
                if (!data) return null;
                return (
                  <motion.div
                    key={type}
                    initial={{ opacity: 0, scale: 0.88 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05, type: "spring", stiffness: 260, damping: 22 }}
                  >
                    <VitalCard
                      type={type}
                      value={data.value}
                      statusLabel={data.statusLabel}
                      statusColor={data.statusColor}
                      trend={data.trend}
                      active={selected === type}
                      onClick={() => handleCardClick(type)}
                    />
                  </motion.div>
                );
              })}
            </div>
            </>
          )}
        </div>

        {/* ── Section 2: Chart (when a vital is selected) ── */}
        <AnimatePresence mode="wait">
          {selected && (
            <motion.div
              key={selected}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ type: "spring", stiffness: 240, damping: 26 }}
            >
              <VitalChart
                type={selected}
                history={chartHistory}
                normalMin={normalRange?.min}
                normalMax={normalRange?.max}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {!selected && (
          <div
            style={{
              padding: "20px",
              borderRadius: 16,
              border: "1.5px dashed #DCE8E2",
              background: "rgba(255,255,255,0.5)",
              textAlign: "center",
            }}
          >
            <p style={{ fontFamily: B, color: "#8EBAA3", fontSize: "0.82rem", margin: 0 }}>
              Tap any reading above to view its trend chart
            </p>
          </div>
        )}

        {/* ── Section 3: Log Vital CTA ── */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => setLogOpen(true)}
          style={{
            width: "100%",
            padding: "15px",
            borderRadius: 14,
            border: "none",
            background: "linear-gradient(135deg, #0D6E4F, #00C9A7)",
            color: "#fff",
            fontFamily: B,
            fontWeight: 700,
            fontSize: "0.9rem",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Log Vital Reading
        </motion.button>

        <LogVital open={logOpen} onClose={() => setLogOpen(false)} onSave={convexUser?._id ? logVital : undefined} />

        {/* ── Section 4: Wearable — Coming Soon ── */}
        <div
          style={{
            borderRadius: 18,
            border: "1.5px solid #DCE8E2",
            background: "#fff",
            padding: "20px 20px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: "linear-gradient(135deg, #E8F7F1, #DCE8E2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.3rem",
              }}
            >
              ⌚
            </div>
            <div>
              <p style={{ fontFamily: H, fontWeight: 700, fontSize: "0.9rem", color: "#0B1F18", margin: 0 }}>
                Connect Wearable
              </p>
              <p style={{ fontFamily: B, fontSize: "0.75rem", color: "#8EBAA3", margin: "2px 0 0" }}>
                Auto-sync from your device
              </p>
            </div>
            <span
              style={{
                marginLeft: "auto",
                fontFamily: B,
                fontWeight: 700,
                fontSize: "0.68rem",
                color: "#F59E0B",
                background: "#FEF3C7",
                padding: "3px 9px",
                borderRadius: 20,
                flexShrink: 0,
              }}
            >
              Coming Soon
            </span>
          </div>
          <p style={{ fontFamily: B, fontSize: "0.8rem", color: "#5A7A6E", margin: 0 }}>
            Sync your Apple Watch, Garmin, Google Fit or any Bluetooth-enabled device for continuous vitals monitoring.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
