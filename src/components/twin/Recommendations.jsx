"use client";

import { Sparkles } from "lucide-react";

const B = "var(--font-dm-sans, 'DM Sans', sans-serif)";
const H = "var(--font-outfit, 'Outfit', sans-serif)";

// Priority colours by index: high → red, medium → amber, low → green
function getPriority(index) {
  if (index === 0) return { label: "High",   color: "#E74C3C", bg: "rgba(231,76,60,0.10)"  };
  if (index === 1) return { label: "Medium", color: "#F39C12", bg: "rgba(243,156,18,0.10)" };
  return              { label: "Low",    color: "#27AE60", bg: "rgba(39,174,96,0.10)"   };
}

/**
 * Recommendations
 *
 * Props:
 *   items  — string[]
 */
export default function Recommendations({ items }) {
  if (!items || items.length === 0) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {items.map((item, i) => {
        const priority = getPriority(i);
        return (
          <div
            key={i}
            style={{
              background: "#fff",
              border: "1px solid #DCE8E2",
              borderLeft: "3px solid #0D6E4F",
              borderRadius: "0 12px 12px 0",
              padding: "12px 14px",
              display: "flex",
              gap: 10,
              alignItems: "flex-start",
            }}
          >
            {/* Icon bg */}
            <div
              style={{
                width: 28, height: 28, borderRadius: 7,
                background: "rgba(13,110,79,0.08)",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0, marginTop: 1,
              }}
            >
              <Sparkles size={13} color="#0D6E4F" />
            </div>
            <div style={{ flex: 1 }}>
              {/* Priority badge */}
              <span
                style={{
                  display: "inline-block",
                  fontFamily: B, fontSize: "0.60rem", fontWeight: 700,
                  color: priority.color, background: priority.bg,
                  padding: "1px 7px", borderRadius: 4,
                  letterSpacing: "0.03em", textTransform: "uppercase",
                  marginBottom: 5,
                }}
              >
                {priority.label}
              </span>
              <p style={{ fontFamily: B, fontSize: "0.82rem", color: "#0B1F18", margin: 0, lineHeight: 1.6 }}>
                {item}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
