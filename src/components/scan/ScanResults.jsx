"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { CheckCircle, Save, MessageCircle, RotateCcw, Info } from "lucide-react";
import { RECORD_TYPES } from "@/lib/constants";
import { useRecordsStore } from "@/lib/stores/records-store";
import { toast } from "@/components/ui/Toast";

const H = "var(--font-outfit, 'Outfit', sans-serif)";
const B = "var(--font-dm-sans, 'DM Sans', sans-serif)";

// ─── Confidence bar ────────────────────────────────────────────────────────────
function ConfidenceBar({ value }) {
  const color = value >= 90 ? "#27AE60" : value >= 75 ? "#F39C12" : "#E74C3C";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ flex: 1, height: 5, background: "#F0F7F4", borderRadius: 3, overflow: "hidden" }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.9, ease: "easeOut", delay: 0.2 }}
          style={{ height: "100%", background: color, borderRadius: 3 }}
        />
      </div>
      <span style={{ fontFamily: B, fontWeight: 700, fontSize: "0.82rem", color, minWidth: 36 }}>
        {value}%
      </span>
    </div>
  );
}

// ─── Lab status badge ──────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const cfg = {
    normal:   { bg: "#F0FDF4", color: "#166534", label: "Normal"     },
    abnormal: { bg: "#FEF2F2", color: "#991B1B", label: "Abnormal"   },
    warning:  { bg: "#FFFBEB", color: "#92400E", label: "Borderline" },
  }[status] || { bg: "#F0FDF4", color: "#166534", label: "Normal" };

  return (
    <span
      style={{
        padding: "2px 8px",
        borderRadius: 6,
        background: cfg.bg,
        color: cfg.color,
        fontFamily: B,
        fontWeight: 700,
        fontSize: "0.68rem",
        display: "inline-block",
        whiteSpace: "nowrap",
        letterSpacing: "0.02em",
      }}
    >
      {cfg.label}
    </span>
  );
}

// ─── Lab report table ──────────────────────────────────────────────────────────
function LabReportView({ data }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: B, fontSize: "0.8rem" }}>
        <thead>
          <tr style={{ background: "#F0F7F4" }}>
            {["Test Name", "Result", "Ref Range", ""].map((h) => (
              <th
                key={h}
                style={{
                  padding: "8px 10px",
                  textAlign: "left",
                  color: "#5A9A7E",
                  fontWeight: 600,
                  fontSize: "0.68rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                  whiteSpace: "nowrap",
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.tests.map((test, i) => (
            <tr
              key={i}
              style={{
                borderBottom: "1px solid #F0F7F4",
                background:
                  test.status === "abnormal"
                    ? "rgba(231,76,60,0.025)"
                    : test.status === "warning"
                      ? "rgba(243,156,18,0.025)"
                      : "transparent",
              }}
            >
              <td style={{ padding: "9px 10px", color: "#0B1F18", fontWeight: 500 }}>
                {test.name}
              </td>
              <td
                style={{
                  padding: "9px 10px",
                  fontWeight: 700,
                  color:
                    test.status === "abnormal"
                      ? "#E74C3C"
                      : test.status === "warning"
                        ? "#E67E22"
                        : "#0B1F18",
                  whiteSpace: "nowrap",
                }}
              >
                {test.value}{" "}
                <span style={{ fontWeight: 400, fontSize: "0.7rem", color: "#8EBAA3" }}>
                  {test.unit}
                </span>
              </td>
              <td style={{ padding: "9px 10px", color: "#8EBAA3", whiteSpace: "nowrap", fontSize: "0.75rem" }}>
                {test.refRange}
              </td>
              <td style={{ padding: "9px 6px 9px 0" }}>
                <StatusBadge status={test.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Prescription list ─────────────────────────────────────────────────────────
function PrescriptionView({ data }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: 14 }}>
      {data.medications.map((med, i) => (
        <div
          key={i}
          style={{
            padding: "12px 14px",
            background: "#F0F7F4",
            borderRadius: 10,
            borderLeft: "3px solid #0D6E4F",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: 8,
              marginBottom: 4,
            }}
          >
            <span style={{ fontFamily: B, fontWeight: 700, fontSize: "0.9rem", color: "#0B1F18" }}>
              {med.name}
            </span>
            <span
              style={{
                fontFamily: B,
                fontWeight: 600,
                fontSize: "0.75rem",
                color: "#0D6E4F",
                background: "rgba(13,110,79,0.09)",
                padding: "2px 9px",
                borderRadius: 6,
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}
            >
              {med.dosage}
            </span>
          </div>
          <p style={{ margin: 0, fontFamily: B, fontSize: "0.8rem", color: "#5A9A7E" }}>
            {med.frequency} · {med.duration}
          </p>
          {med.instructions && (
            <p style={{ margin: "4px 0 0", fontFamily: B, fontSize: "0.75rem", color: "#8EBAA3", display: "flex", alignItems: "center", gap: 5 }}>
              <Info size={12} color="#8EBAA3" style={{ flexShrink: 0 }} />
              {med.instructions}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Consultation notes ────────────────────────────────────────────────────────
function ConsultationView({ data }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, padding: 14 }}>
      <div style={{ padding: "11px 13px", background: "#F0F7F4", borderRadius: 10 }}>
        <p style={{ margin: "0 0 3px", fontFamily: B, fontSize: "0.68rem", color: "#8EBAA3", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          Diagnosis
        </p>
        <p style={{ margin: 0, fontFamily: B, fontWeight: 700, fontSize: "0.9rem", color: "#0B1F18" }}>
          {data.diagnosis}
        </p>
      </div>

      {data.vitalsAtVisit && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {Object.entries(data.vitalsAtVisit).map(([k, v]) => (
            <div
              key={k}
              style={{
                padding: "9px 12px",
                background: "#F0F7F4",
                borderRadius: 9,
                flex: "1 1 calc(50% - 4px)",
                minWidth: 100,
              }}
            >
              <p style={{ margin: "0 0 2px", fontFamily: B, fontSize: "0.68rem", color: "#8EBAA3", textTransform: "capitalize", letterSpacing: "0.02em" }}>
                {k.replace(/([A-Z])/g, " $1").trim()}
              </p>
              <p style={{ margin: 0, fontFamily: B, fontWeight: 600, fontSize: "0.85rem", color: "#0B1F18" }}>
                {v}
              </p>
            </div>
          ))}
        </div>
      )}

      <div>
        <p style={{ margin: "0 0 8px", fontFamily: B, fontSize: "0.68rem", color: "#8EBAA3", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          Doctor&apos;s Advice
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {data.advice.map((item, i) => (
            <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
              <span style={{ color: "#27AE60", flexShrink: 0, fontWeight: 700, marginTop: 1 }}>✓</span>
              <p style={{ margin: 0, fontFamily: B, fontSize: "0.85rem", color: "#0B1F18", lineHeight: 1.5 }}>
                {item}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Imaging findings ──────────────────────────────────────────────────────────
function ImagingView({ data }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, padding: 14 }}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {[
          { label: "Modality", value: data.modality },
          { label: "Region",   value: data.region },
          { label: "Quality",  value: data.technicalQuality },
        ].map(({ label, value }) => (
          <div
            key={label}
            style={{ flex: "1 1 80px", padding: "10px 12px", background: "#F0F7F4", borderRadius: 10 }}
          >
            <p style={{ margin: "0 0 2px", fontFamily: B, fontSize: "0.67rem", color: "#8EBAA3", textTransform: "uppercase", letterSpacing: "0.04em" }}>
              {label}
            </p>
            <p style={{ margin: 0, fontFamily: B, fontWeight: 600, fontSize: "0.82rem", color: "#0B1F18" }}>
              {value}
            </p>
          </div>
        ))}
      </div>

      <div>
        <p style={{ margin: "0 0 8px", fontFamily: B, fontSize: "0.68rem", color: "#8EBAA3", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          Findings
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
          {data.findings.map((f, i) => (
            <div key={i} style={{ display: "flex", gap: 9, alignItems: "flex-start" }}>
              <span style={{ fontFamily: B, fontSize: "0.8rem", color: "#8EBAA3", flexShrink: 0, marginTop: 1 }}>·</span>
              <p style={{ margin: 0, fontFamily: B, fontSize: "0.85rem", color: "#0B1F18", lineHeight: 1.5 }}>{f}</p>
            </div>
          ))}
        </div>
      </div>

      <div
        style={{
          padding: "12px 14px",
          background: "rgba(13,110,79,0.05)",
          borderRadius: 10,
          borderLeft: "3px solid #0D6E4F",
        }}
      >
        <p style={{ margin: "0 0 4px", fontFamily: B, fontSize: "0.68rem", color: "#5A9A7E", textTransform: "uppercase", letterSpacing: "0.04em" }}>
          Impression
        </p>
        <p style={{ margin: 0, fontFamily: B, fontWeight: 600, fontSize: "0.88rem", color: "#0B1F18", lineHeight: 1.55 }}>
          {data.impression}
        </p>
      </div>
    </div>
  );
}

// ─── Key finding card ──────────────────────────────────────────────────────────
function FindingCard({ finding, index }) {
  const cfg = {
    normal:   { border: "#27AE60", bg: "rgba(39,174,96,0.055)",  emoji: "✅" },
    abnormal: { border: "#E74C3C", bg: "rgba(231,76,60,0.055)",  emoji: "⚠️" },
    warning:  { border: "#E67E22", bg: "rgba(230,126,34,0.055)", emoji: "🟡" },
  }[finding.severity] || { border: "#27AE60", bg: "rgba(39,174,96,0.055)", emoji: "✅" };

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.08 * index, duration: 0.3 }}
      style={{
        padding: "12px 14px",
        background: cfg.bg,
        borderRadius: 12,
        borderLeft: `3px solid ${cfg.border}`,
        display: "flex",
        gap: 10,
        alignItems: "flex-start",
      }}
    >
      <span style={{ fontSize: 17, flexShrink: 0, lineHeight: 1.4 }}>{cfg.emoji}</span>
      <p style={{ margin: 0, fontFamily: B, fontSize: "0.85rem", color: "#0B1F18", lineHeight: 1.55 }}>
        {finding.text}
      </p>
    </motion.div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────
export default function ScanResults({ result, imageUrl, onScanAnother }) {
  const router = useRouter();
  const addRecord = useRecordsStore((s) => s.addRecord);
  const [saveState, setSaveState] = useState("idle"); // idle | saving | saved

  const recordType = RECORD_TYPES[result.type] || RECORD_TYPES.lab;

  const handleSave = () => {
    if (saveState !== "idle") return;
    setSaveState("saving");
    setTimeout(() => {
      addRecord({
        type: result.type,
        title: result.title,
        doctor: result.doctor,
        facility: result.facility,
        date: result.date,
        specialty: result.specialty,
        imageUrl: imageUrl || null,
        extractedData: result.extractedData,
        keyFindings: result.keyFindings,
        summary: result.summary,
        urgent: result.urgent,
      });
      setSaveState("saved");
      toast("Report saved to your Health Locker!", "success");
    }, 650);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.38 }}
      style={{ display: "flex", flexDirection: "column" }}
    >
      {/* ── Scrollable area ──────────────────────────────────────── */}
      <div style={{ paddingBottom: 172 }}>

        {/* ── Report header card ─────────────────────────────────── */}
        <div style={{ padding: "20px 20px 0" }}>
          <div
            style={{
              background: "#fff",
              borderRadius: 16,
              padding: 16,
              display: "flex",
              gap: 14,
              boxShadow: "0 2px 14px rgba(13,110,79,0.08)",
              border: "1px solid #DCE8E2",
            }}
          >
            {/* Thumbnail */}
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: 10,
                overflow: "hidden",
                flexShrink: 0,
                background: "#F0F7F4",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid #DCE8E2",
              }}
            >
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt="Report thumbnail"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <span style={{ fontSize: 28 }}>{recordType.emoji}</span>
              )}
            </div>

            {/* Meta info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  padding: "3px 10px",
                  borderRadius: 6,
                  background: "rgba(13,110,79,0.08)",
                  fontFamily: B,
                  fontWeight: 700,
                  fontSize: "0.7rem",
                  color: "#0D6E4F",
                  marginBottom: 7,
                  letterSpacing: "0.01em",
                }}
              >
                {recordType.emoji} {recordType.label}
              </span>
              {result.urgent && (
                <span
                  style={{
                    marginLeft: 6,
                    display: "inline-block",
                    padding: "3px 8px",
                    borderRadius: 6,
                    background: "rgba(231,76,60,0.1)",
                    fontFamily: B,
                    fontWeight: 700,
                    fontSize: "0.68rem",
                    color: "#E74C3C",
                  }}
                >
                  Needs Attention
                </span>
              )}
              <h2
                style={{
                  fontFamily: H,
                  fontWeight: 700,
                  fontSize: "0.95rem",
                  color: "#0B1F18",
                  margin: "0 0 4px",
                  lineHeight: 1.3,
                }}
              >
                {result.title}
              </h2>
              <p style={{ fontFamily: B, fontSize: "0.78rem", color: "#5A9A7E", margin: "0 0 2px" }}>
                {result.doctor} · {result.date}
              </p>
              <p style={{ fontFamily: B, fontSize: "0.75rem", color: "#8EBAA3", margin: 0 }}>
                {result.facility}
              </p>
            </div>
          </div>

          {/* AI Confidence */}
          <div
            style={{
              background: "#fff",
              borderRadius: 12,
              padding: "12px 14px",
              marginTop: 10,
              border: "1px solid #DCE8E2",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
              <span style={{ fontFamily: B, fontSize: "0.78rem", color: "#5A9A7E", fontWeight: 600 }}>
                AI Confidence
              </span>
              <span style={{ fontFamily: B, fontSize: "0.7rem", color: "#8EBAA3" }}>Zivika Labs AI</span>
            </div>
            <ConfidenceBar value={result.confidence} />
          </div>
        </div>

        {/* ── Extracted data ────────────────────────────────────── */}
        <div style={{ padding: "16px 20px 0" }}>
          <p style={{ fontFamily: H, fontWeight: 700, fontSize: "0.95rem", color: "#0B1F18", margin: "0 0 10px" }}>
            Extracted Data
          </p>
          <div
            style={{
              background: "#fff",
              borderRadius: 16,
              border: "1px solid #DCE8E2",
              overflow: "hidden",
            }}
          >
            {result.type === "lab"          && <LabReportView     data={result.extractedData} />}
            {result.type === "prescription" && <PrescriptionView  data={result.extractedData} />}
            {result.type === "consultation" && <ConsultationView  data={result.extractedData} />}
            {result.type === "imaging"      && <ImagingView       data={result.extractedData} />}
          </div>
        </div>

        {/* ── Key findings ──────────────────────────────────────── */}
        <div style={{ padding: "16px 20px 0" }}>
          <p style={{ fontFamily: H, fontWeight: 700, fontSize: "0.95rem", color: "#0B1F18", margin: "0 0 10px" }}>
            Key Findings
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            {result.keyFindings.map((finding, i) => (
              <FindingCard key={i} finding={finding} index={i} />
            ))}
          </div>
        </div>

        {/* ── AI Summary ────────────────────────────────────────── */}
        <div style={{ padding: "14px 20px 0" }}>
          <div
            style={{
              padding: "14px",
              background: "linear-gradient(135deg, rgba(13,110,79,0.05), rgba(0,201,167,0.04))",
              borderRadius: 12,
              border: "1px solid rgba(13,110,79,0.1)",
            }}
          >
            <p style={{ fontFamily: B, fontSize: "0.72rem", color: "#5A9A7E", margin: "0 0 5px", fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase" }}>
              AI Summary
            </p>
            <p style={{ fontFamily: B, fontSize: "0.875rem", color: "#0B1F18", margin: 0, lineHeight: 1.6 }}>
              {result.summary}
            </p>
          </div>
        </div>
      </div>

      {/* ── Sticky action buttons ──────────────────────────────── */}
      <div
        style={{
          position: "fixed",
          bottom: "calc(72px + env(safe-area-inset-bottom, 0px))",
          left: "50%",
          transform: "translateX(-50%)",
          width: "100%",
          maxWidth: 390,
          padding: "14px 20px 16px",
          background: "linear-gradient(180deg, transparent 0%, rgba(240,247,244,0.95) 20%, #F0F7F4 100%)",
          zIndex: 20,
        }}
      >
        {/* Primary save button */}
        <motion.button
          onClick={handleSave}
          disabled={saveState !== "idle"}
          whileTap={saveState === "idle" ? { scale: 0.97 } : {}}
          style={{
            width: "100%",
            padding: "14px",
            border: "none",
            borderRadius: 14,
            background:
              saveState === "saved"
                ? "linear-gradient(135deg, #27AE60, #2ECC71)"
                : "linear-gradient(135deg, #0D6E4F, #00C9A7)",
            color: "#fff",
            fontFamily: B,
            fontWeight: 700,
            fontSize: "0.95rem",
            cursor: saveState === "idle" ? "pointer" : "default",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            marginBottom: 10,
            transition: "background 0.4s ease",
            boxShadow: "0 4px 16px rgba(13,110,79,0.25)",
          }}
        >
          <AnimatePresence mode="wait">
            {saveState === "saving" && (
              <motion.div
                key="saving"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{ display: "flex", alignItems: "center", gap: 8 }}
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.7, repeat: Infinity, ease: "linear" }}
                  style={{
                    width: 16,
                    height: 16,
                    border: "2.5px solid rgba(255,255,255,0.35)",
                    borderTopColor: "#fff",
                    borderRadius: "50%",
                  }}
                />
                Saving...
              </motion.div>
            )}
            {saveState === "saved" && (
              <motion.div
                key="saved"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 320 }}
                style={{ display: "flex", alignItems: "center", gap: 8 }}
              >
                <CheckCircle size={18} />
                Saved to Health Locker
              </motion.div>
            )}
            {saveState === "idle" && (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{ display: "flex", alignItems: "center", gap: 8 }}
              >
                <Save size={18} />
                Save to Health Locker
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>

        {/* Secondary row */}
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={() => router.push("/dashboard/copilot")}
            style={{
              flex: 1,
              padding: "12px",
              border: "1.5px solid #0D6E4F",
              borderRadius: 12,
              background: "#fff",
              color: "#0D6E4F",
              fontFamily: B,
              fontWeight: 600,
              fontSize: "0.82rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
            }}
          >
            <MessageCircle size={15} />
            Ask AI Copilot
          </button>
          <button
            onClick={onScanAnother}
            style={{
              flex: 1,
              padding: "12px",
              border: "1.5px solid #DCE8E2",
              borderRadius: 12,
              background: "#fff",
              color: "#5A9A7E",
              fontFamily: B,
              fontWeight: 600,
              fontSize: "0.82rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
            }}
          >
            <RotateCcw size={15} />
            Scan Another
          </button>
        </div>
      </div>
    </motion.div>
  );
}
