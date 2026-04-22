"use client";

import { motion } from "framer-motion";
import { AlertTriangle, Pill, Stethoscope, CheckCircle } from "lucide-react";

const H = "var(--font-outfit, 'Outfit', sans-serif)";
const B = "var(--font-dm-sans, 'DM Sans', sans-serif)";

const TYPE_CONFIG = {
  warning:      { color: "#E67E22", bg: "rgba(230,126,34,0.12)", icon: AlertTriangle },
  prescription: { color: "#8E44AD", bg: "rgba(142,68,173,0.12)", icon: Pill          },
  visit:        { color: "#2980B9", bg: "rgba(41,128,185,0.12)", icon: Stethoscope   },
  positive:     { color: "#27AE60", bg: "rgba(39,174,96,0.12)",  icon: CheckCircle   },
};

/**
 * HealthTimeline — vertical connected timeline of health events.
 *
 * Props:
 *   events  — array of { date, title, description, type, doctor }
 */
export default function HealthTimeline({ events }) {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 16,
        padding: "20px",
        position: "relative",
        paddingLeft: 52,
      }}
    >
      {/* Vertical connecting line */}
      <div
        style={{
          position: "absolute",
          left: 31,
          top: 30,
          bottom: 20,
          width: 2,
          background: "#F0F7F4",
          borderRadius: 1,
        }}
      />

      <div style={{ display: "flex", flexDirection: "column" }}>
        {events.map((event, i) => {
          const cfg = TYPE_CONFIG[event.type] || TYPE_CONFIG.visit;
          const EventIcon = cfg.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25, delay: i * 0.07, ease: "easeOut" }}
              style={{
                display: "flex",
                alignItems: "flex-start",
                paddingBottom: i < events.length - 1 ? 20 : 0,
              }}
            >
              {/* Dot with icon */}
              <div
                style={{
                  position: "absolute",
                  left: 16,
                  width: 30,
                  height: 30,
                  borderRadius: "50%",
                  background: cfg.color,
                  border: "3px solid #fff",
                  boxShadow: `0 0 0 3px ${cfg.color}33, 0 2px 8px ${cfg.color}25`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  zIndex: 1,
                  marginTop: 0,
                }}
              >
                <EventIcon size={13} color="#fff" />
              </div>

              {/* Content */}
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 4 }}>
                  <p
                    style={{
                      fontFamily: H, fontWeight: 600, fontSize: "0.87rem",
                      color: "#0B1F18", margin: 0, lineHeight: 1.35,
                    }}
                  >
                    {event.title}
                  </p>
                  <span
                    style={{
                      fontFamily: B, fontWeight: 700, fontSize: "0.65rem",
                      color: "#8EBAA3",
                      whiteSpace: "nowrap", flexShrink: 0,
                    }}
                  >
                    {event.date}
                  </span>
                </div>
                <p style={{ fontFamily: B, fontSize: "0.76rem", color: "#8EBAA3", margin: 0, lineHeight: 1.5 }}>
                  {event.description}
                </p>
                {event.doctor && (
                  <p style={{ fontFamily: B, fontSize: "0.67rem", color: "#B8D4C5", margin: "4px 0 0" }}>
                    {event.doctor}
                  </p>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
