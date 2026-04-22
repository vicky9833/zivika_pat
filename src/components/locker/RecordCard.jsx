"use client";

import { motion } from "framer-motion";
import {
  ChevronRight, Pill, FlaskConical, Stethoscope,
  Activity, ScanLine, FileText, Shield,
} from "lucide-react";

const H = "var(--font-outfit, 'Outfit', sans-serif)";
const B = "var(--font-dm-sans, 'DM Sans', sans-serif)";

// Icon per record type
const TYPE_ICON = {
  lab:          FlaskConical,
  prescription: Pill,
  consultation: Stethoscope,
  imaging:      ScanLine,
  vitals:       Activity,
  discharge:    FileText,
  vaccination:  Shield,
};

// Icon bg per type
const TYPE_BG = {
  lab:          "rgba(37,99,235,0.10)",
  prescription: "rgba(13,110,79,0.10)",
  consultation: "rgba(124,58,237,0.10)",
  imaging:      "rgba(234,88,12,0.10)",
  vitals:       "rgba(220,38,38,0.10)",
  discharge:    "rgba(15,118,110,0.10)",
  vaccination:  "rgba(202,138,4,0.10)",
};

// Icon color per type
const TYPE_COLOR = {
  lab:          "#2563EB",
  prescription: "#0D6E4F",
  consultation: "#7C3AED",
  imaging:      "#EA580C",
  vitals:       "#DC2626",
  discharge:    "#0F766E",
  vaccination:  "#CA8A04",
};

export default function RecordCard({ record, onClick, index = 0 }) {
  const Icon        = TYPE_ICON[record.type]   || Activity;
  const iconBg      = TYPE_BG[record.type]     || "rgba(13,110,79,0.10)";
  const iconColor   = TYPE_COLOR[record.type]  || "#0D6E4F";

  const findingPreview =
    record.keyFindings?.[0]?.text || record.summary || null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.045, 0.35), duration: 0.28, ease: "easeOut" }}
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        padding: 16,
        background: "#fff",
        borderRadius: 16,
        border: "1px solid #DCE8E2",
        marginBottom: 10,
        cursor: "pointer",
        WebkitTapHighlightColor: "transparent",
      }}
      whileTap={{ scale: 0.985 }}
    >
      {/* Type icon */}
      <div style={{
        width: 44, height: 44, borderRadius: 12,
        background: iconBg,
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
      }}>
        <Icon size={20} color={iconColor} />
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Title row + urgent badge */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <p style={{
            fontFamily: H, fontWeight: 600, fontSize: "0.875rem",
            color: "#0B1F18", margin: 0,
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            flex: 1,
          }}>{record.title}</p>
          {record.urgent && (
            <span style={{
              fontFamily: B, fontWeight: 600, fontSize: "0.5rem",
              color: "#E74C3C", background: "rgba(231,76,60,0.10)",
              padding: "2px 6px", borderRadius: 6, flexShrink: 0,
            }}>Urgent</span>
          )}
        </div>

        {/* Doctor */}
        {record.doctor && (
          <p style={{ fontFamily: B, fontSize: "0.75rem", color: "#5A7A6E", margin: "2px 0 0" }}>
            {record.doctor}
          </p>
        )}

        {/* Date + type badge */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 3 }}>
          <span style={{ fontFamily: B, fontSize: "0.6875rem", color: "#8EBAA3" }}>{record.date}</span>
          {record.type && (
            <span style={{
              fontFamily: B, fontSize: "0.625rem", fontWeight: 500,
              color: iconColor, background: iconBg,
              padding: "1px 6px", borderRadius: 6,
            }}>{record.type}</span>
          )}
        </div>

        {/* Key finding */}
        {findingPreview && (
          <p style={{
            fontFamily: B, fontSize: "0.6875rem", color: "#8EBAA3",
            margin: "3px 0 0", overflow: "hidden",
            textOverflow: "ellipsis", whiteSpace: "nowrap", fontStyle: "italic",
          }}>· {findingPreview}</p>
        )}
      </div>

      {/* Chevron */}
      <ChevronRight size={16} color="#B8D4C5" style={{ flexShrink: 0, marginTop: 2 }} />
    </motion.div>
  );
}
