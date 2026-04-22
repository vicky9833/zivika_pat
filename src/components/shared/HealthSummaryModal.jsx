"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  X, Download, Shield, Heart, Activity, Pill,
  FolderHeart, AlertTriangle, CheckCircle,
} from "lucide-react";
import { toast } from "@/components/ui/Toast";

const H = "var(--font-outfit, 'Outfit', sans-serif)";
const B = "var(--font-dm-sans, 'DM Sans', sans-serif)";

export default function HealthSummaryModal({ isOpen, onClose, user, vitals, medications, records, twinData }) {
  const today = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

  const riskScore = twinData?.overallScore ?? 82;
  const riskColor = riskScore >= 75 ? "#27AE60" : riskScore >= 50 ? "#F39C12" : "#E74C3C";
  const riskLabel = riskScore >= 75 ? "Good" : riskScore >= 50 ? "Moderate" : "At Risk";

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="health-summary-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: "fixed", top: 0, left: "50%", transform: "translateX(-50%)",
            width: "100%", maxWidth: 390, height: "100dvh",
            zIndex: 9000,
            background: "rgba(11,31,24,0.72)",
            backdropFilter: "blur(10px)",
            display: "flex", alignItems: "flex-end", justifyContent: "center",
            padding: 0,
          }}
          onClick={onClose}
        >
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 340, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 390,
              background: "#F0F7F4",
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              maxHeight: "90vh",
              overflowY: "auto",
              paddingBottom: 40,
            }}
          >
            {/* Drag handle */}
            <div style={{ display: "flex", justifyContent: "center", paddingTop: 12, marginBottom: 4 }}>
              <div style={{ width: 36, height: 4, borderRadius: 2, background: "#DCE8E2" }} />
            </div>

            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 20px 0" }}>
              <div>
                <h2 style={{ fontFamily: H, fontWeight: 800, fontSize: "1.2rem", color: "#0B1F18", margin: 0 }}>
                  Health Summary
                </h2>
                <p style={{ fontFamily: B, fontSize: "0.75rem", color: "#8EBAA3", margin: 0 }}>
                  Generated {today}
                </p>
              </div>
              <button
                onClick={onClose}
                style={{
                  width: 36, height: 36, borderRadius: 10,
                  border: "1.5px solid #DCE8E2", background: "#fff",
                  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                  padding: 0,
                }}
              >
                <X size={16} color="#0B1F18" />
              </button>
            </div>

            <div style={{ padding: "16px 20px 0" }}>
              {/* Zivika header card */}
              <div
                style={{
                  background: "linear-gradient(135deg, #0D6E4F, #00C9A7)",
                  borderRadius: 16, padding: "18px 20px",
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  marginBottom: 14,
                }}
              >
                <div>
                  <p style={{ fontFamily: H, fontWeight: 800, fontSize: "1.1rem", color: "#fff", margin: "0 0 2px" }}>
                    {user?.name ?? "Patient"}
                  </p>
                  <p style={{ fontFamily: B, fontSize: "0.76rem", color: "rgba(255,255,255,0.75)", margin: 0 }}>
                    Zivika Health Record · Confidential
                  </p>
                </div>
                <Shield size={28} color="rgba(255,255,255,0.6)" />
              </div>

              {/* Overall health score */}
              <div
                style={{
                  background: "#fff", border: "1px solid #DCE8E2",
                  borderRadius: 14, padding: "16px",
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  marginBottom: 14,
                }}
              >
                <div>
                  <p style={{ fontFamily: B, fontSize: "0.75rem", color: "#8EBAA3", margin: "0 0 4px" }}>Overall Health Score</p>
                  <p style={{ fontFamily: H, fontWeight: 900, fontSize: "2.2rem", color: riskColor, margin: 0, lineHeight: 1 }}>
                    {riskScore}
                  </p>
                  <p style={{ fontFamily: B, fontWeight: 700, fontSize: "0.8rem", color: riskColor, margin: "2px 0 0" }}>{riskLabel}</p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "flex-end" }}>
                      <span style={{ fontFamily: B, fontSize: "0.75rem", color: "#8EBAA3" }}>{records?.length ?? 0} records</span>
                      <FolderHeart size={13} color="#0D6E4F" />
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "flex-end" }}>
                      <span style={{ fontFamily: B, fontSize: "0.75rem", color: "#8EBAA3" }}>{medications?.length ?? 0} medications</span>
                      <Pill size={13} color="#9333EA" />
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "flex-end" }}>
                      <span style={{ fontFamily: B, fontSize: "0.75rem", color: "#8EBAA3" }}>{vitals?.length ?? 0} vitals tracked</span>
                      <Activity size={13} color="#E74C3C" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Vitals section */}
              {vitals && vitals.length > 0 && (
                <Section title="Recent Vitals" icon={<Activity size={14} color="#E74C3C" />}>
                  {vitals.slice(0, 4).map((v) => (
                    <Row key={v.key ?? v.id} label={v.label ?? v.name ?? v.vitalType} value={`${v.value} ${v.unit ?? ""}`} />
                  ))}
                </Section>
              )}

              {/* Active medications */}
              {medications && medications.length > 0 && (
                <Section title="Active Medications" icon={<Pill size={14} color="#9333EA" />}>
                  {medications.slice(0, 4).map((m) => (
                    <Row key={m.id} label={m.name} value={m.dosage} />
                  ))}
                  {medications.length > 4 && (
                    <p style={{ fontFamily: B, fontSize: "0.76rem", color: "#8EBAA3", margin: "6px 0 0" }}>
                      +{medications.length - 4} more
                    </p>
                  )}
                </Section>
              )}

              {/* Risk indicators from twin */}
              {twinData?.organs && (
                <Section title="Risk Indicators" icon={<AlertTriangle size={14} color="#F39C12" />}>
                  {twinData.organs.map((organ) => (
                    <Row
                      key={organ.id}
                      label={organ.name}
                      value={`${organ.score}%`}
                      valueColor={organ.score >= 70 ? "#27AE60" : organ.score >= 50 ? "#F39C12" : "#E74C3C"}
                    />
                  ))}
                </Section>
              )}

              {/* Disclaimer */}
              <div
                style={{
                  background: "rgba(41,128,185,0.06)", border: "1px solid rgba(41,128,185,0.2)",
                  borderRadius: 12, padding: "12px 14px", marginBottom: 20,
                  display: "flex", gap: 8, alignItems: "flex-start",
                }}
              >
                <CheckCircle size={14} color="#2980B9" style={{ flexShrink: 0, marginTop: 1 }} />
                <p style={{ fontFamily: B, fontSize: "0.72rem", color: "#2980B9", margin: 0, lineHeight: 1.5 }}>
                  This summary is auto-generated by Zivika AI. It is not a substitute for professional medical advice.
                  Please consult your doctor before making health decisions.
                </p>
              </div>

              {/* Download button */}
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => toast("PDF export will be available soon", "info")}
                style={{
                  width: "100%", padding: "15px", borderRadius: 14,
                  border: "none",
                  background: "linear-gradient(135deg, #0D6E4F, #00C9A7)",
                  color: "#fff", fontFamily: H, fontWeight: 700,
                  fontSize: "0.95rem", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                }}
              >
                <Download size={17} />
                Download PDF Report
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Section({ title, icon, children }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #DCE8E2", borderRadius: 14, padding: "14px 16px", marginBottom: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
        {icon}
        <p style={{ fontFamily: H, fontWeight: 700, fontSize: "0.85rem", color: "#0B1F18", margin: 0 }}>{title}</p>
      </div>
      {children}
    </div>
  );
}

function Row({ label, value, valueColor = "#0D6E4F" }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 8, marginBottom: 8, borderBottom: "1px solid #F0F7F4" }}>
      <span style={{ fontFamily: B, fontSize: "0.82rem", color: "#8EBAA3" }}>{label}</span>
      <span style={{ fontFamily: H, fontWeight: 700, fontSize: "0.82rem", color: valueColor }}>{value}</span>
    </div>
  );
}
