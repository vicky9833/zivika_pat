"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, AlertTriangle, CheckCircle, MessageCircle, Trash2, Share2, X, ZoomIn, Pill, TestTube2, Stethoscope, Activity, ScanLine, Building2, Syringe, FileText, Info } from "lucide-react";
import { RECORD_TYPES } from "@/lib/constants";
import { useRecordsStore } from "@/lib/stores/records-store";
import Modal from "@/components/ui/Modal";
import { toast } from "@/components/ui/Toast";

const H = "var(--font-outfit, 'Outfit', sans-serif)";
const B = "var(--font-dm-sans, 'DM Sans', sans-serif)";

const RECORD_ICON_MAP = { Pill, TestTube2, Stethoscope, Activity, ScanLine, Building2, Syringe, FileText };
function RecordTypeIcon({ type, size = 24 }) {
  const rType = RECORD_TYPES[type] || RECORD_TYPES.lab;
  const IconComp = RECORD_ICON_MAP[rType.iconName] || FileText;
  return <IconComp size={size} color={rType.iconColor} />;
}

// ─── Section heading ──────────────────────────────────────────────────────────
function SectionHead({ title }) {
  return (
    <p
      style={{
        fontFamily: B,
        fontSize: "0.68rem",
        color: "#8EBAA3",
        textTransform: "uppercase",
        letterSpacing: "0.06em",
        fontWeight: 700,
        margin: "0 0 10px",
      }}
    >
      {title}
    </p>
  );
}

// ─── Lab report table ─────────────────────────────────────────────────────────
function LabTable({ data }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: B, fontSize: "0.8rem" }}>
        <thead>
          <tr style={{ background: "#F0F7F4" }}>
            {["Test", "Result", "Ref Range", ""].map((h) => (
              <th
                key={h}
                style={{
                  padding: "8px 10px",
                  textAlign: "left",
                  color: "#5A9A7E",
                  fontWeight: 700,
                  fontSize: "0.67rem",
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
                    ? "rgba(231,76,60,0.03)"
                    : test.status === "warning"
                    ? "rgba(243,156,18,0.03)"
                    : "transparent",
              }}
            >
              <td style={{ padding: "9px 10px", color: "#0B1F18", fontWeight: 500 }}>{test.name}</td>
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
                <span style={{ fontWeight: 400, fontSize: "0.7rem", color: "#8EBAA3" }}>{test.unit}</span>
              </td>
              <td style={{ padding: "9px 10px", color: "#8EBAA3", whiteSpace: "nowrap", fontSize: "0.75rem" }}>
                {test.refRange}
              </td>
              <td style={{ padding: "9px 6px 9px 0" }}>
                {test.status === "abnormal" && (
                  <AlertTriangle size={13} color="#E74C3C" />
                )}
                {test.status === "normal" && (
                  <CheckCircle size={13} color="#27AE60" />
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Prescription list ────────────────────────────────────────────────────────
function PrescriptionList({ data }) {
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
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 4 }}>
            <span style={{ fontFamily: B, fontWeight: 700, fontSize: "0.9rem", color: "#0B1F18" }}>{med.name}</span>
            <span
              style={{
                fontFamily: B,
                fontWeight: 600,
                fontSize: "0.72rem",
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
            <p style={{ margin: "4px 0 0", fontFamily: B, fontSize: "0.73rem", color: "#8EBAA3", display: "flex", alignItems: "center", gap: 5 }}>
              <Info size={12} color="#8EBAA3" style={{ flexShrink: 0 }} />
              {med.instructions}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Consultation notes ───────────────────────────────────────────────────────
function ConsultationNotes({ data }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, padding: 14 }}>
      <div style={{ padding: "11px 13px", background: "#F0F7F4", borderRadius: 10 }}>
        <SectionHead title="Diagnosis" />
        <p style={{ margin: 0, fontFamily: B, fontWeight: 700, fontSize: "0.9rem", color: "#0B1F18" }}>
          {data.diagnosis}
        </p>
      </div>
      {data.symptoms?.length > 0 && (
        <div>
          <SectionHead title="Symptoms Noted" />
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {data.symptoms.map((s, i) => (
              <span
                key={i}
                style={{
                  padding: "4px 11px",
                  borderRadius: 20,
                  background: "#F0F7F4",
                  fontFamily: B,
                  fontSize: "0.78rem",
                  color: "#0B1F18",
                  border: "1px solid #DCE8E2",
                }}
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      )}
      {data.vitalsAtVisit && (
        <div>
          <SectionHead title="Vitals at Visit" />
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {Object.entries(data.vitalsAtVisit).map(([k, v]) => (
              <div
                key={k}
                style={{ flex: "1 1 calc(50% - 4px)", padding: "9px 12px", background: "#F0F7F4", borderRadius: 9 }}
              >
                <p style={{ margin: "0 0 2px", fontFamily: B, fontSize: "0.67rem", color: "#8EBAA3", textTransform: "capitalize" }}>
                  {k.replace(/([A-Z])/g, " $1").trim()}
                </p>
                <p style={{ margin: 0, fontFamily: B, fontWeight: 600, fontSize: "0.82rem", color: "#0B1F18" }}>{v}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      <div>
        <SectionHead title="Doctor's Advice" />
        <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
          {data.advice?.map((item, i) => (
            <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
              <span style={{ color: "#27AE60", flexShrink: 0, fontWeight: 700, marginTop: 1 }}>✓</span>
              <p style={{ margin: 0, fontFamily: B, fontSize: "0.85rem", color: "#0B1F18", lineHeight: 1.5 }}>{item}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Imaging findings ─────────────────────────────────────────────────────────
function ImagingDetails({ data }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, padding: 14 }}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {[
          { label: "Modality", value: data.modality },
          { label: "Region",   value: data.region },
          { label: "Quality",  value: data.technicalQuality },
        ].filter((i) => i.value).map(({ label, value }) => (
          <div key={label} style={{ flex: "1 1 80px", padding: "10px 12px", background: "#F0F7F4", borderRadius: 10 }}>
            <p style={{ margin: "0 0 2px", fontFamily: B, fontSize: "0.67rem", color: "#8EBAA3", textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</p>
            <p style={{ margin: 0, fontFamily: B, fontWeight: 600, fontSize: "0.82rem", color: "#0B1F18" }}>{value}</p>
          </div>
        ))}
      </div>
      <div>
        <SectionHead title="Findings" />
        <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
          {data.findings?.map((f, i) => (
            <div key={i} style={{ display: "flex", gap: 9, alignItems: "flex-start" }}>
              <span style={{ fontFamily: B, fontSize: "0.8rem", color: "#8EBAA3", flexShrink: 0, marginTop: 1 }}>·</span>
              <p style={{ margin: 0, fontFamily: B, fontSize: "0.85rem", color: "#0B1F18", lineHeight: 1.5 }}>{f}</p>
            </div>
          ))}
        </div>
      </div>
      {data.impression && (
        <div style={{ padding: "12px 14px", background: "rgba(13,110,79,0.05)", borderRadius: 10, borderLeft: "3px solid #0D6E4F" }}>
          <SectionHead title="Impression" />
          <p style={{ margin: 0, fontFamily: B, fontWeight: 600, fontSize: "0.88rem", color: "#0B1F18", lineHeight: 1.55 }}>{data.impression}</p>
        </div>
      )}
    </div>
  );
}

// ─── Key finding cards ────────────────────────────────────────────────────────
function FindingCard({ finding, index }) {
  const text = typeof finding === "string" ? finding : finding.text;
  const severity = typeof finding === "object" ? finding.severity : "normal";
  const cfg = {
    normal:   { border: "#27AE60", bg: "rgba(39,174,96,0.055)",  Icon: CheckCircle,    iconColor: "#27AE60"  },
    abnormal: { border: "#E74C3C", bg: "rgba(231,76,60,0.055)",   Icon: AlertTriangle,  iconColor: "#E74C3C"  },
    warning:  { border: "#E67E22", bg: "rgba(230,126,34,0.055)",  Icon: AlertTriangle,  iconColor: "#E67E22"  },
  }[severity] || { border: "#27AE60", bg: "rgba(39,174,96,0.055)", Icon: CheckCircle, iconColor: "#27AE60" };

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.06 * index, duration: 0.25 }}
      style={{
        padding: "11px 13px",
        background: cfg.bg,
        borderRadius: 11,
        borderLeft: `3px solid ${cfg.border}`,
        display: "flex",
        gap: 10,
        alignItems: "flex-start",
      }}
    >
      <cfg.Icon size={15} color={cfg.iconColor} style={{ flexShrink: 0, marginTop: 2 }} />
      <p style={{ margin: 0, fontFamily: B, fontSize: "0.85rem", color: "#0B1F18", lineHeight: 1.55 }}>{text}</p>
    </motion.div>
  );
}

// ─── Fullscreen image viewer ──────────────────────────────────────────────────
function ImageFullscreen({ src, onClose }) {
  return (
    <AnimatePresence>
      {src && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.92)",
            zIndex: 200,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={onClose}
        >
          <button
            onClick={onClose}
            style={{
              position: "absolute",
              top: 20,
              right: 20,
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.14)",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <X size={18} color="#fff" />
          </button>
          <img
            src={src}
            alt="Full size report"
            style={{ maxWidth: "95%", maxHeight: "90vh", objectFit: "contain", borderRadius: 8 }}
            onClick={(e) => e.stopPropagation()}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Delete confirmation modal ────────────────────────────────────────────────
function DeleteModal({ open, onClose, onConfirm }) {
  return (
    <Modal open={open} onClose={onClose} title="Delete Record">
      <div style={{ padding: "0 20px 20px" }}>
        <div
          style={{
            padding: "16px",
            background: "rgba(231,76,60,0.06)",
            borderRadius: 12,
            marginBottom: 18,
            border: "1px solid rgba(231,76,60,0.15)",
          }}
        >
          <p style={{ fontFamily: B, fontSize: "0.875rem", color: "#0B1F18", margin: 0, lineHeight: 1.6 }}>
            Are you sure you want to delete this record? This cannot be undone.
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: "13px",
              border: "1.5px solid #DCE8E2",
              borderRadius: 12,
              background: "#fff",
              color: "#5A9A7E",
              fontFamily: B,
              fontWeight: 600,
              fontSize: "0.875rem",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1,
              padding: "13px",
              border: "none",
              borderRadius: 12,
              background: "#E74C3C",
              color: "#fff",
              fontFamily: B,
              fontWeight: 700,
              fontSize: "0.875rem",
              cursor: "pointer",
            }}
          >
            Delete
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ─── Main RecordDetail component ──────────────────────────────────────────────
export default function RecordDetail({ record }) {
  const router = useRouter();
  const deleteRecord = useRecordsStore((s) => s.deleteRecord);
  const [fullscreenImg, setFullscreenImg] = useState(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const rType = RECORD_TYPES[record.type] || RECORD_TYPES.lab;

  const handleDelete = () => {
    deleteRecord(record.id);
    toast("Record deleted.", "success");
    router.back();
  };

  return (
    <>
      {/* Full screen image */}
      <ImageFullscreen src={fullscreenImg} onClose={() => setFullscreenImg(null)} />

      {/* Delete modal */}
      <DeleteModal open={deleteOpen} onClose={() => setDeleteOpen(false)} onConfirm={handleDelete} />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.25 }}
        style={{ background: "#F0F7F4", minHeight: "100%" }}
      >
        {/* ── Sticky header ──────────────────────────────────────── */}
        <div
          style={{
            position: "sticky",
            top: 0,
            zIndex: 10,
            background: "rgba(240,247,244,0.96)",
            backdropFilter: "blur(8px)",
            padding: "14px 20px 12px",
            borderBottom: "1px solid #DCE8E2",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <button
              onClick={() => router.back()}
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                border: "1.5px solid #DCE8E2",
                background: "#fff",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <ArrowLeft size={16} color="#0D6E4F" />
            </button>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p
                style={{
                  fontFamily: H,
                  fontWeight: 700,
                  fontSize: "0.95rem",
                  color: "#0B1F18",
                  margin: 0,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {record.title}
              </p>
              <p style={{ fontFamily: B, fontSize: "0.72rem", color: "#8EBAA3", margin: 0 }}>
                {record.date}
              </p>
            </div>
          </div>
        </div>

        {/* ── Scrollable content ──────────────────────────────────── */}
        <div style={{ padding: "16px 20px 160px", display: "flex", flexDirection: "column", gap: 16 }}>

          {/* ── Report badge card ─────────────────────────────────── */}
          <div
            style={{
              background: "#fff",
              borderRadius: 16,
              padding: 16,
              border: "1px solid #DCE8E2",
              boxShadow: "0 2px 12px rgba(13,110,79,0.06)",
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
              {/* Type icon */}
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 14,
                  background: `${(RECORD_TYPES[record.type] || RECORD_TYPES.lab).iconColor}18`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <RecordTypeIcon type={record.type} size={26} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap", marginBottom: 6 }}>
                  <span
                    style={{
                      padding: "2px 9px",
                      borderRadius: 6,
                      background: "rgba(13,110,79,0.08)",
                      fontFamily: B,
                      fontWeight: 700,
                      fontSize: "0.7rem",
                      color: "#0D6E4F",
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                    }}
                  >
                    <RecordTypeIcon type={record.type} size={11} />
                    {rType.label}
                  </span>
                  {record.urgent && (
                    <span
                      style={{
                        padding: "2px 8px",
                        borderRadius: 6,
                        background: "rgba(231,76,60,0.1)",
                        fontFamily: B,
                        fontWeight: 700,
                        fontSize: "0.68rem",
                        color: "#E74C3C",
                        display: "flex",
                        alignItems: "center",
                        gap: 3,
                      }}
                    >
                      <AlertTriangle size={10} color="#E74C3C" />
                      Needs Attention
                    </span>
                  )}
                </div>
                <h1
                  style={{
                    fontFamily: H,
                    fontWeight: 700,
                    fontSize: "1.05rem",
                    color: "#0B1F18",
                    margin: "0 0 5px",
                    lineHeight: 1.3,
                  }}
                >
                  {record.title}
                </h1>
                {record.doctor && (
                  <p style={{ fontFamily: B, fontSize: "0.8rem", color: "#5A9A7E", margin: "0 0 2px" }}>
                    {record.doctor}
                  </p>
                )}
                {record.facility && (
                  <p style={{ fontFamily: B, fontSize: "0.75rem", color: "#8EBAA3", margin: 0 }}>
                    {record.facility}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* ── Report image ──────────────────────────────────────── */}
          {record.imageUrl && (
            <div>
              <SectionHead title="Report Image" />
              <div
                onClick={() => setFullscreenImg(record.imageUrl)}
                style={{
                  borderRadius: 14,
                  overflow: "hidden",
                  border: "1.5px solid #DCE8E2",
                  cursor: "zoom-in",
                  position: "relative",
                  background: "#F0F7F4",
                }}
              >
                <img
                  src={record.imageUrl}
                  alt="Original scanned report"
                  style={{ width: "100%", maxHeight: 220, objectFit: "contain", display: "block" }}
                />
                <div
                  style={{
                    position: "absolute",
                    bottom: 10,
                    right: 10,
                    background: "rgba(0,0,0,0.55)",
                    borderRadius: 8,
                    padding: "4px 8px",
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                  }}
                >
                  <ZoomIn size={12} color="#fff" />
                  <span style={{ fontFamily: B, fontSize: "0.68rem", color: "#fff" }}>View full</span>
                </div>
              </div>
            </div>
          )}

          {/* ── Extracted data ──────────────────────────────────────── */}
          {record.extractedData && (
            <div>
              <SectionHead title="Extracted Data" />
              <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #DCE8E2", overflow: "hidden" }}>
                {record.type === "lab"          && <LabTable         data={record.extractedData} />}
                {record.type === "prescription" && <PrescriptionList data={record.extractedData} />}
                {record.type === "consultation" && <ConsultationNotes data={record.extractedData} />}
                {record.type === "imaging"      && <ImagingDetails   data={record.extractedData} />}
              </div>
            </div>
          )}

          {/* ── Key findings ─────────────────────────────────────────── */}
          {record.keyFindings?.length > 0 && (
            <div>
              <SectionHead title="Key Findings" />
              <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                {record.keyFindings.map((f, i) => <FindingCard key={i} finding={f} index={i} />)}
              </div>
            </div>
          )}

          {/* ── AI Summary ───────────────────────────────────────────── */}
          {record.summary && (
            <div>
              <SectionHead title="AI Summary" />
              <div
                style={{
                  padding: "14px 16px",
                  background: "linear-gradient(135deg, rgba(13,110,79,0.05), rgba(0,201,167,0.04))",
                  borderRadius: 13,
                  border: "1px solid rgba(13,110,79,0.1)",
                }}
              >
                <p style={{ fontFamily: B, fontSize: "0.875rem", color: "#0B1F18", margin: 0, lineHeight: 1.65 }}>
                  {record.summary}
                </p>
              </div>
            </div>
          )}

          {/* ── No AI data — plain summary card ──────────────────────── */}
          {!record.extractedData && !record.keyFindings?.length && (
            <div
              style={{
                padding: "20px 18px",
                background: "#fff",
                borderRadius: 14,
                border: "1px solid #DCE8E2",
                textAlign: "center",
              }}
            >
              <p style={{ fontFamily: B, fontSize: "0.85rem", color: "#5A9A7E", margin: 0, lineHeight: 1.6 }}>
                This record was added before AI analysis was available. Scan a new version for full data extraction.
              </p>
            </div>
          )}

          {/* ── Action buttons ─────────────────────────────────────── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <button
              onClick={() =>
                router.push(
                  `/dashboard/copilot?title=${encodeURIComponent(record.title)}&record=${record.id}`
                )
              }
              style={{
                padding: "14px",
                border: "none",
                borderRadius: 14,
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
              <MessageCircle size={17} />
              Ask AI about this report
            </button>

            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => toast("Doctor sharing is coming in Phase 2.", "info")}
                style={{
                  flex: 1,
                  padding: "13px",
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
                  position: "relative",
                }}
              >
                <Share2 size={14} />
                Share with Doctor
                <span
                  style={{
                    position: "absolute",
                    top: -6,
                    right: 6,
                    padding: "1px 5px",
                    borderRadius: 4,
                    background: "#DCE8E2",
                    fontSize: "0.625rem",
                    fontWeight: 700,
                    color: "#5A9A7E",
                    letterSpacing: "0.03em",
                  }}
                >
                  SOON
                </span>
              </button>
              <button
                onClick={() => setDeleteOpen(true)}
                style={{
                  flex: 1,
                  padding: "13px",
                  border: "1.5px solid rgba(231,76,60,0.4)",
                  borderRadius: 12,
                  background: "rgba(231,76,60,0.04)",
                  color: "#E74C3C",
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
                <Trash2 size={14} />
                Delete
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}
