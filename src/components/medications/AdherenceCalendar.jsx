"use client";

import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import { useMedicationsStore } from "@/lib/stores/medications-store";

const B = "var(--font-dm-sans, 'DM Sans', sans-serif)";
const H = "var(--font-outfit, 'Outfit', sans-serif)";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function AdherenceCalendar() {
  const getWeekCalendar = useMedicationsStore((s) => s.getWeekCalendar);
  const week = getWeekCalendar();

  return (
    <div style={{ display: "flex", gap: 6, justifyContent: "space-between" }}>
      {week.map((day, i) => {
        const dayLabel = DAY_LABELS[day.date.getDay()];

        // Determine circle style
        let circleBg = "#F0F7F4";
        let circleBorder = "none";
        let circleContent = null;

        if (day.status === "full") {
          circleBg = "#0D6E4F";
          circleContent = <Check size={14} color="#fff" strokeWidth={2.5} />;
        } else if (day.status === "missed") {
          circleBg = "rgba(231,76,60,0.12)";
          circleContent = <X size={12} color="#E74C3C" />;
        } else if (day.status === "partial") {
          circleBg = "rgba(230,126,34,0.15)";
          circleContent = <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#E67E22" }} />;
        } else if (day.isToday) {
          circleBg = "#F0F7F4";
          circleBorder = "2px solid #0D6E4F";
          circleContent = <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#0D6E4F" }} />;
        }

        return (
          <motion.div
            key={day.ds}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04, duration: 0.2 }}
            style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}
          >
            <div style={{
              width: 36, height: 36, borderRadius: "50%",
              background: circleBg,
              border: circleBorder,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {circleContent}
            </div>
            <span style={{ fontFamily: B, fontSize: "0.625rem", color: day.isToday ? "#0D6E4F" : "#8EBAA3", fontWeight: day.isToday ? 600 : 400 }}>
              {dayLabel}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}
