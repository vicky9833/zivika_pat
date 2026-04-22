"use client";

import { AlertTriangle, ShieldCheck } from "lucide-react";

const B = "var(--font-dm-sans, 'DM Sans', sans-serif)";
const H = "var(--font-outfit, 'Outfit', sans-serif)";

// Severity map — risks are passed as strings; detect severity by position (first = high)
// or by keywords. Default: first item → high, second → medium, rest → low.
function getSeverityColor(index) {
  if (index === 0) return "#E74C3C";  // high
  if (index === 1) return "#F39C12";  // medium
  return "#27AE60";                   // low
}

function getSeverityLabel(index) {
  if (index === 0) return "High";
  if (index === 1) return "Medium";
  return "Low";
}

/**
 * RiskFactors
 *
 * Props:
 *   risks  — string[]
 */
export default function RiskFactors({ risks }) {
  if (!risks || risks.length === 0) {
    return (
      <div
        style={{
          background: "rgba(39,174,96,0.06)",
          border: "1.5px solid rgba(39,174,96,0.20)",
          borderRadius: 16,
          padding: "20px 16px",
          display: "flex",
          alignItems: "center",
          gap: 14,
        }}
      >
        <div
          style={{
            width: 40, height: 40, borderRadius: 10,
            background: "rgba(39,174,96,0.12)",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <ShieldCheck size={20} color="#27AE60" />
        </div>
        <div>
          <p style={{ fontFamily: H, fontWeight: 700, fontSize: "0.92rem", color: "#0B1F18", margin: "0 0 3px" }}>
            No risk factors detected
          </p>
          <p style={{ fontFamily: B, fontSize: "0.78rem", color: "#8EBAA3", margin: 0 }}>
            Your current health data shows no active concerns.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {risks.map((risk, i) => {
        const severityColor = getSeverityColor(i);
        const severityLabel = getSeverityLabel(i);
        return (
          <div
            key={i}
            style={{
              background: "#fff",
              border: "1px solid #DCE8E2",
              borderLeft: `4px solid ${severityColor}`,
              borderRadius: "0 12px 12px 0",
              padding: "12px 14px",
              display: "flex",
              gap: 10,
              alignItems: "flex-start",
            }}
          >
            <div
              style={{
                width: 28, height: 28, borderRadius: 7,
                background: `${severityColor}14`,
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0, marginTop: 1,
              }}
            >
              <AlertTriangle size={13} color={severityColor} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 3 }}>
                <span
                  style={{
                    fontFamily: B, fontSize: "0.62rem", fontWeight: 700,
                    color: severityColor,
                    background: `${severityColor}14`,
                    padding: "1px 7px", borderRadius: 4,
                    letterSpacing: "0.03em",
                    textTransform: "uppercase",
                  }}
                >
                  {severityLabel}
                </span>
              </div>
              <p style={{ fontFamily: B, fontSize: "0.82rem", color: "#0B1F18", margin: 0, lineHeight: 1.6 }}>
                {risk}
              </p>
            </div>
          </div>
        );
      })}

      <p style={{ fontFamily: B, fontSize: "0.67rem", color: "#8EBAA3", margin: "4px 0 0", lineHeight: 1.5 }}>
        Identified from your health data. Discuss with your doctor.
      </p>
    </div>
  );
}
