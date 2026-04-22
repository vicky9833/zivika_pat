"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, FileText, Pill, User, Lightbulb, ChevronRight, Activity } from "lucide-react";
import { useRecordsStore } from "@/lib/stores/records-store";
import { useMedicationsStore } from "@/lib/stores/medications-store";
import { useVitalsStore } from "@/lib/stores/vitals-store";
import { useRouter } from "next/navigation";

const H = "var(--font-outfit, 'Outfit', sans-serif)";
const B = "var(--font-dm-sans, 'DM Sans', sans-serif)";

const QUICK_LINKS = [
  { label: "Scan a Report", icon: FileText, path: "/dashboard/scan", color: "#0D6E4F" },
  { label: "Check Symptoms", icon: Lightbulb, path: "/dashboard/symptoms", color: "#F39C12" },
  { label: "Medications", icon: Pill, path: "/dashboard/medications", color: "#9333EA" },
  { label: "AI Copilot", icon: User, path: "/dashboard/copilot", color: "#4F46E5" },
];

const VITAL_LABEL_MAP = {
  heartRate: "Heart Rate", systolic: "Systolic BP", diastolic: "Diastolic BP",
  spo2: "SpO\u2082", temperature: "Temperature", weight: "Weight",
  glucose: "Blood Glucose", steps: "Steps", sleep: "Sleep",
};

export default function GlobalSearch({ isOpen, onClose }) {
  const router = useRouter();
  const inputRef = useRef(null);
  const [query, setQuery] = useState("");

  const records = useRecordsStore((s) => s.records);
  const medications = useMedicationsStore((s) => s.medications);
  const vitalsReadings = useVitalsStore((s) => s.readings);
  const getLatestVitals = useVitalsStore((s) => s.getLatestVitals);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 80);
    } else {
      setQuery("");
    }
  }, [isOpen]);

  const q = query.toLowerCase().trim();

  const matchedVitals = useMemo(() => {
    if (q.length <= 1) return [];
    const latestMap = getLatestVitals();
    return Object.entries(latestMap)
      .filter(([type]) => VITAL_LABEL_MAP[type]?.toLowerCase().includes(q))
      .map(([type, v]) => ({ type, label: VITAL_LABEL_MAP[type], value: v.value, unit: v.unit, status: v.statusLabel }));
  }, [q, vitalsReadings]);

  const matchedRecords = q.length > 1
    ? records.filter((r) =>
        r.title?.toLowerCase().includes(q) ||
        r.hospital?.toLowerCase().includes(q) ||
        r.doctor?.toLowerCase().includes(q)
      )
    : [];

  const matchedMeds = q.length > 1
    ? medications.filter((m) =>
        m.name?.toLowerCase().includes(q) ||
        m.dosage?.toLowerCase().includes(q)
      )
    : [];

  function navigate(path) {
    onClose();
    router.push(path);
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="global-search"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: "fixed", top: 0, left: "50%", transform: "translateX(-50%)",
            width: "100%", maxWidth: 390, height: "100dvh",
            zIndex: 8888,
            background: "rgba(11,31,24,0.65)",
            backdropFilter: "blur(8px)",
            display: "flex", flexDirection: "column",
            alignItems: "center",
            padding: "0",
          }}
          onClick={onClose}
        >
          <motion.div
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#F0F7F4",
              borderBottomLeftRadius: 24,
              borderBottomRightRadius: 24,
              padding: "12px 20px 20px",
              maxHeight: "85vh",
              overflowY: "auto",
              width: "100%",
              maxWidth: 390,
            }}
          >
            {/* Search input */}
            <div
              style={{
                display: "flex", alignItems: "center", gap: 10,
                background: "#fff", borderRadius: 14,
                border: "1.5px solid #DCE8E2",
                padding: "12px 16px",
                marginBottom: 20,
              }}
            >
              <Search size={18} color="#8EBAA3" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search records, medications, doctors…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                style={{
                  flex: 1, border: "none", outline: "none",
                  background: "transparent", fontFamily: B,
                  fontSize: "0.9rem", color: "#0B1F18",
                }}
              />
              {query && (
                <button onClick={() => setQuery("")} style={{ border: "none", background: "none", cursor: "pointer", padding: 0 }}>
                  <X size={16} color="#8EBAA3" />
                </button>
              )}
            </div>

            {/* Quick links (shown when no query) */}
            {!q && (
              <div>
                <p style={{ fontFamily: H, fontWeight: 700, fontSize: "0.8rem", color: "#8EBAA3", textTransform: "uppercase", letterSpacing: 1, margin: "0 0 12px" }}>
                  Quick Navigate
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {QUICK_LINKS.map((ql) => (
                    <button
                      key={ql.path}
                      onClick={() => navigate(ql.path)}
                      style={{
                        display: "flex", alignItems: "center", gap: 10,
                        padding: "13px 14px", borderRadius: 12,
                        border: "1.5px solid #DCE8E2", background: "#fff",
                        cursor: "pointer", textAlign: "left",
                      }}
                    >
                      <div style={{ width: 30, height: 30, borderRadius: 8, background: `${ql.color}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <ql.icon size={15} color={ql.color} />
                      </div>
                      <span style={{ fontFamily: B, fontWeight: 600, fontSize: "0.82rem", color: "#0B1F18" }}>{ql.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Search results */}
            {q.length > 1 && (
              <div>
                {matchedRecords.length === 0 && matchedMeds.length === 0 && matchedVitals.length === 0 && (
                  <p style={{ fontFamily: B, fontSize: "0.88rem", color: "#8EBAA3", textAlign: "center", padding: "24px 0" }}>
                    No results found for &quot;{query}&quot;
                  </p>
                )}

                {matchedRecords.length > 0 && (
                  <div style={{ marginBottom: 20 }}>
                    <p style={{ fontFamily: H, fontWeight: 700, fontSize: "0.8rem", color: "#8EBAA3", textTransform: "uppercase", letterSpacing: 1, margin: "0 0 10px" }}>
                      Health Records ({matchedRecords.length})
                    </p>
                    {matchedRecords.map((r) => (
                      <button
                        key={r.id}
                        onClick={() => navigate("/dashboard/locker")}
                        style={{
                          width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                          padding: "13px 14px", borderRadius: 12, border: "1px solid #DCE8E2",
                          background: "#fff", cursor: "pointer", marginBottom: 8,
                        }}
                      >
                        <div style={{ textAlign: "left" }}>
                          <p style={{ fontFamily: B, fontWeight: 600, fontSize: "0.88rem", color: "#0B1F18", margin: 0 }}>{r.title}</p>
                          <p style={{ fontFamily: B, fontSize: "0.75rem", color: "#8EBAA3", margin: 0 }}>{r.hospital} · {r.date}</p>
                        </div>
                        <ChevronRight size={14} color="#8EBAA3" />
                      </button>
                    ))}
                  </div>
                )}

                {matchedMeds.length > 0 && (
                  <div>
                    <p style={{ fontFamily: H, fontWeight: 700, fontSize: "0.8rem", color: "#8EBAA3", textTransform: "uppercase", letterSpacing: 1, margin: "0 0 10px" }}>
                      Medications ({matchedMeds.length})
                    </p>
                    {matchedMeds.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => navigate("/dashboard/medications")}
                        style={{
                          width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                          padding: "13px 14px", borderRadius: 12, border: "1px solid #DCE8E2",
                          background: "#fff", cursor: "pointer", marginBottom: 8,
                        }}
                      >
                        <div style={{ textAlign: "left" }}>
                          <p style={{ fontFamily: B, fontWeight: 600, fontSize: "0.88rem", color: "#0B1F18", margin: 0 }}>{m.name}</p>
                          <p style={{ fontFamily: B, fontSize: "0.75rem", color: "#8EBAA3", margin: 0 }}>{m.dosage} · {m.frequency}</p>
                        </div>
                        <ChevronRight size={14} color="#8EBAA3" />
                      </button>
                    ))}
                  </div>
                )}

                {matchedVitals.length > 0 && (
                  <div style={{ marginTop: matchedMeds.length > 0 ? 12 : 0 }}>
                    <p style={{ fontFamily: H, fontWeight: 700, fontSize: "0.8rem", color: "#8EBAA3", textTransform: "uppercase", letterSpacing: 1, margin: "0 0 10px" }}>
                      Vitals ({matchedVitals.length})
                    </p>
                    {matchedVitals.map((v) => (
                      <button
                        key={v.type}
                        onClick={() => navigate("/dashboard/vitals")}
                        style={{
                          width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                          padding: "13px 14px", borderRadius: 12, border: "1px solid #DCE8E2",
                          background: "#fff", cursor: "pointer", marginBottom: 8,
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 10, textAlign: "left" }}>
                          <Activity size={15} color="#0D6E4F" />
                          <div>
                            <p style={{ fontFamily: B, fontWeight: 600, fontSize: "0.88rem", color: "#0B1F18", margin: 0 }}>{v.label}</p>
                            <p style={{ fontFamily: B, fontSize: "0.75rem", color: "#8EBAA3", margin: 0 }}>{v.value} {v.unit} · {v.status}</p>
                          </div>
                        </div>
                        <ChevronRight size={14} color="#8EBAA3" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
