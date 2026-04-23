"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMedicationsStore } from "@/lib/stores/medications-store";
import { useConvexUser } from "@/lib/hooks/useConvexUser";
import { useConvexMedications } from "@/lib/hooks/useConvexMedications";
import MedCard from "@/components/medications/MedCard";
import AdherenceCalendar from "@/components/medications/AdherenceCalendar";
import AddMedication from "@/components/medications/AddMedication";
import ProgressRing from "@/components/ui/ProgressRing";
import EmptyState from "@/components/shared/EmptyState";
import { Pill, CirclePlus } from "lucide-react";

const H = "var(--font-outfit, 'Outfit', sans-serif)";
const B = "var(--font-dm-sans, 'DM Sans', sans-serif)";

function SectionTitle({ children }) {
  return (
    <h2 style={{ fontFamily: H, fontWeight: 700, fontSize: "1rem", color: "#0B1F18", margin: 0 }}>
      {children}
    </h2>
  );
}

export default function MedicationsPage() {
  // Legacy Zustand store for offline/local operations
  const medications = useMedicationsStore((s) => s.medications);
  const toggleTaken = useMedicationsStore((s) => s.toggleTaken);
  const getTodayAdherence = useMedicationsStore((s) => s.getTodayAdherence);
  const getWeekAdherence = useMedicationsStore((s) => s.getWeekAdherence);
  const getAdherence = useMedicationsStore((s) => s.getAdherence);

  // Convex real-time medications
  const { convexUser } = useConvexUser();
  const {
    activeMeds: convexActiveMeds,
    todayMeds: convexTodayMeds,
    adherenceToday: convexAdherenceToday,
    isLoading: convexLoading,
    logDose,
    createMedication,
  } = useConvexMedications(convexUser);

  const hasConvex = convexActiveMeds.length > 0;
  const canSaveToConvex = !!convexUser?._id;

  const [addOpen, setAddOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  useEffect(() => { const t = setTimeout(() => setLoading(false), 1000); return () => clearTimeout(t); }, []);

  // Use Convex data when available, else fall back to Zustand
  const { taken, total } = getTodayAdherence();
  const weekPct = getWeekAdherence();
  const todayPct = hasConvex
    ? convexAdherenceToday
    : (total > 0 ? Math.round((taken / total) * 100) : 0);

  // Today's medications
  const todayMeds = hasConvex ? convexTodayMeds : medications.filter((m) => m.isToday !== false);

  // All-time medications for the bottom list
  const allMeds = hasConvex
    ? [...convexActiveMeds].sort((a, b) => (a.name ?? "").localeCompare(b.name ?? ""))
    : [...medications].sort((a, b) => a.name.localeCompare(b.name));

  const allTaken = todayMeds.length > 0 && todayMeds.every((m) => m.taken ?? m.takenToday);

  if (loading || (convexLoading && !convexUser)) {
    return (
      <div style={{ padding: "20px 20px 100px", display: "flex", flexDirection: "column", gap: 20 }}>
        <div className="animate-pulse" style={{ background: "#DCE8E2", borderRadius: 16, height: 44, width: 160 }} />
        <div className="animate-pulse" style={{ background: "#DCE8E2", borderRadius: 20, height: 130 }} />
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse" style={{ background: "#DCE8E2", borderRadius: 16, height: 76 }} />
        ))}
        <div className="animate-pulse" style={{ background: "#DCE8E2", borderRadius: 16, height: 160 }} />
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
          Medications
        </h1>
      </div>

      <div style={{ padding: "8px 20px", display: "flex", flexDirection: "column", gap: 20 }}>

        {/* ── Section 1: Today's Summary ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{
            borderRadius: 20,
            background: "linear-gradient(135deg, #0D6E4F 0%, #00C9A7 100%)",
            padding: "20px",
            display: "flex",
            gap: 20,
            alignItems: "center",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <ProgressRing
            pct={todayPct}
            size={90}
            stroke={7}
            color="#fff"
            trackColor="rgba(255,255,255,0.25)"
            label={
              <span style={{ fontFamily: H, fontWeight: 800, fontSize: "1.4rem", color: "#fff" }}>
                {taken}/{total}
              </span>
            }
          />
          <div style={{ flex: 1, position: "relative" }}>
            <p style={{ fontFamily: B, fontSize: "0.6875rem", color: "rgba(255,255,255,0.6)", margin: "0 0 6px" }}>
              {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "short" })}
            </p>
            <p style={{ fontFamily: H, fontWeight: 600, fontSize: "1rem", color: "#fff", margin: 0 }}>
              {taken === total && total > 0
                ? "All done!"
                : total === 0
                ? "No medications yet"
                : `${total - taken} dose${total - taken !== 1 ? "s" : ""} left today`}
            </p>
            <p style={{ fontFamily: B, fontSize: "0.75rem", color: "rgba(255,255,255,0.75)", margin: "6px 0 0" }}>
              This week: {weekPct}%
            </p>
          </div>
        </motion.div>

        {/* ── Section 2: Today's Medications ── */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <SectionTitle>Today&apos;s Schedule</SectionTitle>
            <AnimatePresence>
              {allTaken && (
                <motion.span
                  key="all-done"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  style={{
                    fontFamily: B,
                    fontWeight: 700,
                    fontSize: "0.75rem",
                    color: "#0D6E4F",
                    background: "#E8F7F1",
                    padding: "4px 10px",
                    borderRadius: 20,
                  }}
                >
                  All taken
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          {todayMeds.length === 0 ? (
            <EmptyState
              icon={Pill}
              title="No medications yet"
              description="Add your prescriptions to track doses and build adherence streaks"
              ctaLabel="Add Your First Medication"
              onCta={() => setAddOpen(true)}
            />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {todayMeds.map((med, i) => (
                <motion.div
                  key={med.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                >
                  <MedCard
                    med={med}
                    onToggle={() => {
                      toggleTaken(med.id);
                      if (hasConvex && med._id) {
                        const time = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
                        logDose(med._id, time, !med.takenToday).catch(console.error);
                      }
                    }}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* ── Section 3: Adherence Calendar ── */}
        <div>
          <SectionTitle>7-Day Adherence</SectionTitle>
          <div style={{ marginTop: 12 }}>
            <AdherenceCalendar />
          </div>
        </div>

        {/* ── Section 4: Add Medication ── */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          whileHover={{ borderColor: "#0D6E4F", backgroundColor: "rgba(13,110,79,0.04)" }}
          onClick={() => setAddOpen(true)}
          style={{
            width: "100%",
            padding: "16px",
            borderRadius: 14,
            border: "2px dashed #DCE8E2",
            background: "transparent",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          <CirclePlus size={20} color="#0D6E4F" />
          <span style={{ fontFamily: H, fontWeight: 600, fontSize: "0.875rem", color: "#0D6E4F" }}>
            Add Medication
          </span>
        </motion.button>

        <AddMedication
          open={addOpen}
          onClose={() => setAddOpen(false)}
          onSave={canSaveToConvex ? createMedication : null}
        />

        {/* ── Section 5: All Medications ── */}
        {medications.length > 0 && (
        <div>
          <SectionTitle>All Medications</SectionTitle>          <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 10 }}>
            {allMeds.map((med, i) => {
              const adherence = getAdherence(med.id, 30);
              const statusColor =
                adherence >= 80 ? "#0D6E4F" : adherence >= 50 ? "#F59E0B" : "#EF4444";
              return (
                <motion.div
                  key={med.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  style={{
                    background: "#fff",
                    border: "1.5px solid #DCE8E2",
                    borderRadius: 14,
                    padding: "14px 16px",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <div>
                      <p style={{ fontFamily: H, fontWeight: 700, fontSize: "0.9rem", color: "#0B1F18", margin: 0 }}>
                        {med.name}
                      </p>
                      <p style={{ fontFamily: B, fontSize: "0.78rem", color: "#8EBAA3", margin: "2px 0 0" }}>
                        {med.dosage} · {med.frequency}
                      </p>
                    </div>
                    <span
                      style={{
                        fontFamily: B,
                        fontWeight: 700,
                        fontSize: "0.78rem",
                        color: statusColor,
                        background: `${statusColor}15`,
                        padding: "3px 9px",
                        borderRadius: 20,
                      }}
                    >
                      {adherence}%
                    </span>
                  </div>
                  {/* Adherence bar */}
                  <div
                    style={{
                      height: 5,
                      borderRadius: 4,
                      background: "#E8F7F1",
                      overflow: "hidden",
                    }}
                  >
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${adherence}%` }}
                      transition={{ duration: 0.8, ease: "easeOut", delay: i * 0.06 + 0.2 }}
                      style={{
                        height: "100%",
                        borderRadius: 4,
                        background: statusColor,
                      }}
                    />
                  </div>
                  <p style={{ fontFamily: B, fontSize: "0.72rem", color: "#8EBAA3", margin: "4px 0 0", textAlign: "right" }}>
                    30-day adherence
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
        )}
      </div>
    </motion.div>
  );
}
