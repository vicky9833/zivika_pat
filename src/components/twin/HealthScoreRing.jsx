"use client";

import { useEffect, useRef } from "react";

const H = "var(--font-outfit, 'Outfit', sans-serif)";
const B = "var(--font-dm-sans, 'DM Sans', sans-serif)";

/**
 * HealthScoreRing — hero element for the Digital Twin page.
 *
 * Props:
 *   score        number 0-100
 *   recordCount  number
 *   lastUpdated  ISO timestamp string
 *   variant      "default" | "white"  (white = for dark gradient header)
 *   hasData      boolean
 */
export default function HealthScoreRing({ score = 0, recordCount = 0, lastUpdated, variant = "default", hasData = true }) {
  const circleRef = useRef(null);
  const size = 120;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const safeScore = (isNaN(score) || score == null) ? 0 : Math.min(Math.max(Number(score), 0), 100);
  const progress = safeScore;
  const offset = circumference - (progress / 100) * circumference;

  useEffect(() => {
    if (circleRef.current) {
      circleRef.current.style.strokeDashoffset = String(offset);
    }
  }, [offset]);

  const isWhite = variant === "white";
  const gradientId = "twinRingGradient";

  const updatedDate = lastUpdated
    ? new Date(lastUpdated).toLocaleDateString("en-IN", {
        day: "numeric", month: "short", year: "numeric",
      })
    : "Just now";

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <div style={{ position: "relative", width: size, height: size, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
          {!isWhite && (
            <defs>
              <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0D6E4F" />
                <stop offset="100%" stopColor="#00C9A7" />
              </linearGradient>
            </defs>
          )}
          {/* Background track */}
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none"
            stroke={isWhite ? "rgba(255,255,255,0.20)" : "#DCE8E2"}
            strokeWidth={strokeWidth}
          />
          {/* Progress arc */}
          <circle
            ref={circleRef}
            cx={size / 2} cy={size / 2} r={radius}
            fill="none"
            stroke={isWhite ? "rgba(255,255,255,0.85)" : `url(#${gradientId})`}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={!hasData ? circumference : offset}
            style={{ transition: "stroke-dashoffset 1s ease" }}
          />
        </svg>

        {/* Center text */}
        <div
          style={{
            position: "absolute",
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
          }}
        >
          <span
            style={{
              fontFamily: H,
              fontWeight: 800,
              fontSize: size * 0.28,
              lineHeight: 1,
              color: isWhite ? "#fff" : undefined,
              background: isWhite ? undefined : "linear-gradient(135deg, #0D6E4F, #00C9A7)",
              WebkitBackgroundClip: isWhite ? undefined : "text",
              WebkitTextFillColor: isWhite ? undefined : "transparent",
              backgroundClip: isWhite ? undefined : "text",
            }}
          >
            {safeScore}
          </span>
          <span
            style={{
              fontFamily: B,
              fontSize: size * 0.095,
              fontWeight: 600,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: isWhite ? "rgba(255,255,255,0.70)" : "#8EBAA3",
              marginTop: 3,
            }}
          >
            Health
          </span>
        </div>
      </div>

      {/* Sub-label */}
      <p
        style={{
          fontFamily: B, fontSize: "0.72rem",
          color: isWhite ? "rgba(255,255,255,0.60)" : "#8EBAA3",
          margin: 0, textAlign: "center",
        }}
      >
        {hasData
          ? `${recordCount} record${recordCount !== 1 ? "s" : ""} · Updated ${updatedDate}`
          : "Add health data to see your score"}
      </p>
    </div>
  );
}
