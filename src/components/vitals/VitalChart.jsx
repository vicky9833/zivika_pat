"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { VITAL_META } from "./VitalCard";

const H = "var(--font-outfit, 'Outfit', sans-serif)";
const B = "var(--font-dm-sans, 'DM Sans', sans-serif)";

const CHART_W = 340;
const CHART_H = 110;
const PAD_X = 6;
const PAD_Y = 14;

function buildPath(points) {
  if (points.length < 2) return "";
  // Smooth bezier path
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const cpx = (prev.x + curr.x) / 2;
    d += ` C ${cpx} ${prev.y}, ${cpx} ${curr.y}, ${curr.x} ${curr.y}`;
  }
  return d;
}

function buildArea(points, chartH, padY) {
  const baseline = chartH - padY;
  if (points.length < 2) return "";
  let d = `M ${points[0].x} ${baseline}`;
  d += ` L ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const cpx = (prev.x + curr.x) / 2;
    d += ` C ${cpx} ${prev.y}, ${cpx} ${curr.y}, ${curr.x} ${curr.y}`;
  }
  d += ` L ${points[points.length - 1].x} ${baseline} Z`;
  return d;
}

/**
 * VitalChart — minimal SVG line chart for a vital's history.
 *
 * Props:
 *   type       vital type key
 *   history    array of { value, timestamp }
 *   normalMin
 *   normalMax
 */
export default function VitalChart({ type, history, normalMin, normalMax }) {
  const meta = VITAL_META[type] || { label: type, unit: "" };
  const [range, setRange] = useState(7);

  const slice = useMemo(() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - range);
    return history.filter((r) => new Date(r.timestamp) >= cutoff);
  }, [history, range]);

  const stats = useMemo(() => {
    if (!slice.length) return null;
    const vals = slice.map((r) => r.value);
    const avg = (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1);
    const hi = Math.max(...vals);
    const lo = Math.min(...vals);
    return { avg, hi, lo, count: vals.length };
  }, [slice]);

  const points = useMemo(() => {
    if (slice.length < 2) return [];
    const vals = slice.map((r) => r.value);
    const dataMin = Math.min(...vals);
    const dataMax = Math.max(...vals);
    const spread = dataMax - dataMin || 1;

    return slice.map((r, i) => ({
      x: PAD_X + (i / (slice.length - 1)) * (CHART_W - PAD_X * 2),
      y: PAD_Y + (1 - (r.value - dataMin) / spread) * (CHART_H - PAD_Y * 2),
      value: r.value,
      label: new Date(r.timestamp).toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
    }));
  }, [slice]);

  // Reference band (normalMin–normalMax) mapped to chart coords
  const refBand = useMemo(() => {
    if (!normalMin || !normalMax || slice.length < 2) return null;
    const vals = slice.map((r) => r.value);
    const dataMin = Math.min(...vals);
    const dataMax = Math.max(...vals);
    const spread = dataMax - dataMin || 1;
    const mapY = (v) => PAD_Y + (1 - (v - dataMin) / spread) * (CHART_H - PAD_Y * 2);
    return {
      top: Math.max(PAD_Y, mapY(normalMax)),
      bottom: Math.min(CHART_H - PAD_Y, mapY(normalMin)),
    };
  }, [slice, normalMin, normalMax]);

  const linePath = buildPath(points);
  const areaPath = buildArea(points, CHART_H, PAD_Y);
  const lastPt = points[points.length - 1];

  const gradId = `vChart-${type}`;
  const areaGradId = `vArea-${type}`;

  return (
    <div style={{
      background: "#fff",
      borderRadius: 16,
      padding: 16,
      border: "1px solid #DCE8E2",
      marginTop: 16,
    }}>
      {/* Card header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <span style={{ fontFamily: H, fontWeight: 600, fontSize: "0.875rem", color: "#0B1F18" }}>
          {meta.label}
        </span>
        <span style={{ fontFamily: B, fontSize: "0.75rem", color: "#8EBAA3" }}>Last 30 days</span>
      </div>

      {/* Range selector */}
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        {[7, 30].map((r) => (
          <button
            key={r}
            onClick={() => setRange(r)}
            style={{
              padding: "5px 14px",
              borderRadius: 20,
              border: range === r ? "none" : "1.5px solid #DCE8E2",
              background: range === r ? "linear-gradient(135deg, #0D6E4F, #00C9A7)" : "#fff",
              color: range === r ? "#fff" : "#5A7A6E",
              fontFamily: B,
              fontWeight: 600,
              fontSize: "0.72rem",
              cursor: "pointer",
            }}
          >
            {r} Days
          </button>
        ))}
      </div>

      {/* SVG chart */}
      <div
        style={{
          background: "#fff",
          borderRadius: 14,
          border: "1px solid #DCE8E2",
          padding: "12px 10px",
          overflow: "hidden",
        }}
      >
        {points.length >= 2 ? (
          <svg
            viewBox={`0 0 ${CHART_W} ${CHART_H}`}
            style={{ width: "100%", height: 110, display: "block" }}
          >
            <defs>
              <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#0D6E4F" />
                <stop offset="100%" stopColor="#00C9A7" />
              </linearGradient>
              <linearGradient id={areaGradId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00C9A7" stopOpacity="0.22" />
                <stop offset="100%" stopColor="#00C9A7" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Reference band */}
            {refBand && (
              <rect
                x={PAD_X}
                y={refBand.top}
                width={CHART_W - PAD_X * 2}
                height={Math.max(0, refBand.bottom - refBand.top)}
                fill="rgba(39,174,96,0.07)"
                rx={2}
              />
            )}

            {/* Filled area */}
            <motion.path
              d={areaPath}
              fill={`url(#${areaGradId})`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
            />

            {/* Line */}
            <motion.path
              d={linePath}
              fill="none"
              stroke={`url(#${gradId})`}
              strokeWidth={2.5}
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.9, ease: "easeOut" }}
            />

            {/* Dots — only first and last to keep it minimal */}
            {[points[0], lastPt].map((pt, i) => (
              <circle
                key={i}
                cx={pt.x}
                cy={pt.y}
                r={i === 1 ? 5 : 3}
                fill={i === 1 ? "#0D6E4F" : "#B8D4C5"}
                stroke="#fff"
                strokeWidth={2}
              />
            ))}
          </svg>
        ) : (
          <div
            style={{
              height: 110,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: B,
              fontSize: "0.8rem",
              color: "#8EBAA3",
            }}
          >
            No data for this period
          </div>
        )}

        {/* X-axis labels — just first and last date */}
        {points.length >= 2 && (
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
            <span style={{ fontFamily: B, fontSize: "0.62rem", color: "#B8D4C5" }}>
              {points[0].label}
            </span>
            <span style={{ fontFamily: B, fontSize: "0.62rem", color: "#B8D4C5" }}>
              {lastPt.label}
            </span>
          </div>
        )}
      </div>

      {/* Quick stats */}
      {stats && (
        <div
          style={{
            display: "flex",
            gap: 8,
            marginTop: 10,
          }}
        >
          {[
            { label: "Average", val: `${stats.avg} ${meta.unit}` },
            { label: "Highest", val: `${stats.hi} ${meta.unit}` },
            { label: "Lowest",  val: `${stats.lo} ${meta.unit}` },
            { label: "Readings", val: stats.count },
          ].map((s) => (
            <div
              key={s.label}
              style={{
                flex: 1,
                background: "#fff",
                border: "1px solid #DCE8E2",
                borderRadius: 10,
                padding: "8px 6px",
                textAlign: "center",
              }}
            >
              <p style={{ fontFamily: H, fontWeight: 700, fontSize: "0.82rem", color: "#0B1F18", margin: 0 }}>
                {s.val}
              </p>
              <p style={{ fontFamily: B, fontSize: "0.6rem", color: "#8EBAA3", margin: "2px 0 0" }}>
                {s.label}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
