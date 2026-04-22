"use client";

import { useEffect, useRef } from "react";

export default function ProgressRing({ score = 0, size = 140 }) {
  const circleRef = useRef(null);
  const safeScore = (isNaN(score) || score == null) ? 0 : Math.min(Math.max(Number(score), 0), 100);
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = safeScore;
  const offset = circumference - (progress / 100) * circumference;
  const gradientId = "progressGradient";

  useEffect(() => {
    if (circleRef.current) {
      circleRef.current.style.strokeDashoffset = String(offset);
    }
  }, [offset]);

  return (
    <div
      style={{
        width: size,
        height: size,
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <svg
        width={size}
        height={size}
        style={{ transform: "rotate(-90deg)" }}
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0D6E4F" />
            <stop offset="100%" stopColor="#00C9A7" />
          </linearGradient>
        </defs>
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#DCE8E2"
          strokeWidth={10}
        />
        {/* Progress arc */}
        <circle
          ref={circleRef}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={10}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            transition: "stroke-dashoffset 1s ease",
          }}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            fontFamily: "'Outfit', sans-serif",
            fontWeight: 700,
            fontSize: size * 0.23,
            lineHeight: 1,
            background: "linear-gradient(135deg, #0D6E4F, #00C9A7)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          {score}
        </span>
        <span
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: size * 0.1,
            fontWeight: 600,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "#8EBAA3",
            marginTop: 2,
          }}
        >
          Health
        </span>
      </div>
    </div>
  );
}
