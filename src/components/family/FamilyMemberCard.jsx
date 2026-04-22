"use client";

import { motion } from "framer-motion";
import ProgressRing from "@/components/ui/ProgressRing";
import { Pill, Folder } from "lucide-react";

const H = "var(--font-outfit, 'Outfit', sans-serif)";
const B = "var(--font-dm-sans, 'DM Sans', sans-serif)";

/**
 * FamilyMemberCard — displays a family member with health stats.
 * Props: member, onClick
 */
export default function FamilyMemberCard({ member, onClick, index = 0 }) {
  const [g1, g2] = member.avatarGradient;

  return (
    <motion.button
      onClick={onClick}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, type: "spring", stiffness: 260, damping: 24 }}
      whileTap={{ scale: 0.98 }}
      style={{
        width: "100%",
        background: "#fff",
        border: "1.5px solid #DCE8E2",
        borderRadius: 18,
        padding: "16px",
        cursor: "pointer",
        textAlign: "left",
        display: "flex",
        alignItems: "center",
        gap: 14,
      }}
    >
      {/* Avatar */}
      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: "50%",
          background: `linear-gradient(135deg, ${g1}, ${g2})`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          boxShadow: `0 3px 12px ${g1}40`,
        }}
      >
        <span style={{ fontFamily: H, fontWeight: 800, fontSize: "1rem", color: "#fff" }}>
          {member.initials}
        </span>
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
          <p style={{ fontFamily: H, fontWeight: 700, fontSize: "0.92rem", color: "#0B1F18", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {member.name}
          </p>
          <span
            style={{
              flexShrink: 0,
              fontFamily: B,
              fontWeight: 700,
              fontSize: "0.65rem",
              color: member.isSelf ? "#0D6E4F" : "#7C3AED",
              background: member.isSelf ? "#E8F7F1" : "#F3E8FF",
              padding: "2px 8px",
              borderRadius: 20,
            }}
          >
            {member.isSelf ? "Self" : "Family"}
          </span>
        </div>

        <p style={{ fontFamily: B, fontSize: "0.75rem", color: "#8EBAA3", margin: "0 0 8px" }}>
          {member.relation} · {member.age} yrs · {member.gender}
        </p>

        {/* Stats badges */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <span
            style={{
              fontFamily: B,
              fontWeight: 600,
              fontSize: "0.7rem",
              color: "#0D6E4F",
              background: "#E8F7F1",
              padding: "3px 9px",
              borderRadius: 20,
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <Pill size={11} color="#0D6E4F" /> {member.medicationCount} meds
          </span>
          <span
            style={{
              fontFamily: B,
              fontWeight: 600,
              fontSize: "0.7rem",
              color: "#1D4ED8",
              background: "#EFF6FF",
              padding: "3px 9px",
              borderRadius: 20,
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <Folder size={11} color="#1D4ED8" /> {member.recordCount} records
          </span>
        </div>
      </div>

      {/* Health Score Ring */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, flexShrink: 0 }}>
        {member.healthScore !== null ? (
          <ProgressRing score={member.healthScore} size={52} />
        ) : (
          <div style={{ width: 52, height: 52, borderRadius: "50%", background: "#F0F7F4", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontFamily: B, fontSize: "0.6rem", color: "#8EBAA3" }}>—</span>
          </div>
        )}
      </div>

      {/* Chevron */}
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#B8D4C5" strokeWidth="2.2" strokeLinecap="round" style={{ flexShrink: 0 }}>
        <path d="M9 18l6-6-6-6" />
      </svg>
    </motion.button>
  );
}
