"use client";

import { motion } from "framer-motion";
import ZivikaLogo from "@/components/shared/ZivikaLogo";
import { toast } from "@/components/ui/Toast";

const H = "var(--font-outfit, 'Outfit', sans-serif)";
const B = "var(--font-dm-sans, 'DM Sans', sans-serif)";

/**
 * HealthIDCard — premium digital health identity card.
 * Props: user (from useUserStore)
 */
export default function HealthIDCard({ user }) {
  function handleLinkABDM() {
    toast("ABDM integration coming in Phase 2", "info");
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      style={{
        position: "relative",
        borderRadius: 20,
        background: "linear-gradient(135deg, #0B1F18 0%, #0D6E4F 60%, #00C9A7 100%)",
        padding: "1px",
        boxShadow: "0 8px 32px rgba(13,110,79,0.28)",
        overflow: "hidden",
      }}
    >
      {/* Inner card */}
      <div
        style={{
          borderRadius: 19,
          background: "linear-gradient(160deg, #0f2a20 0%, #0D6E4F 100%)",
          padding: "20px 20px 18px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Dot-grid overlay */}
        <div style={{
          position: "absolute", inset: 0, opacity: 0.05,
          backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
          backgroundSize: "24px 24px", pointerEvents: "none", borderRadius: 19,
        }} />
        {/* Decorative circles */}
        <div
          style={{
            position: "absolute",
            top: -40,
            right: -40,
            width: 160,
            height: 160,
            borderRadius: "50%",
            background: "rgba(0,201,167,0.10)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -30,
            left: -30,
            width: 120,
            height: 120,
            borderRadius: "50%",
            background: "rgba(0,201,167,0.07)",
            pointerEvents: "none",
          }}
        />

        {/* Card header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
          <div>
            <ZivikaLogo size={28} showText={true} lightMode={true} />
            <p style={{ fontFamily: B, fontSize: "0.65rem", color: "rgba(255,255,255,0.55)", margin: "4px 0 0", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Health Identity Card
            </p>
          </div>
          {/* QR placeholder */}
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 8,
              background: "rgba(255,255,255,0.12)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid rgba(255,255,255,0.2)",
            }}
          >
            <span style={{ fontFamily: B, fontSize: "0.6rem", color: "rgba(255,255,255,0.5)", fontWeight: 700 }}>QR</span>
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: "rgba(255,255,255,0.12)", marginBottom: 14 }} />

        {/* Name + Health ID */}
        <p style={{ fontFamily: H, fontWeight: 800, fontSize: "1.15rem", color: "#fff", margin: "0 0 2px", letterSpacing: "0.01em" }}>
          {user.name}
        </p>
        <p style={{ fontFamily: B, fontSize: "0.72rem", color: "rgba(0,201,167,0.9)", margin: "0 0 16px", letterSpacing: "0.06em" }}>
          {user.healthId || "ZVK-••••-••••"}
        </p>

        {/* Info row */}
        <div style={{ display: "flex", gap: 20 }}>
          <InfoChip label="DOB" value={user.dob ? formatDOB(user.dob) : "—"} />
          <InfoChip label="Gender" value={capitalize(user.gender)} />
          <InfoChip label="Blood" value={user.bloodGroup} highlight />
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: "rgba(255,255,255,0.12)", margin: "14px 0" }} />

        {/* ABHA row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <p style={{ fontFamily: B, fontSize: "0.65rem", color: "rgba(255,255,255,0.45)", margin: 0, textTransform: "uppercase", letterSpacing: "0.07em" }}>
              ABHA ID
            </p>
            <p style={{ fontFamily: B, fontSize: "0.78rem", color: "rgba(255,255,255,0.55)", margin: "2px 0 0", fontStyle: "italic" }}>
              Not linked yet
            </p>
          </div>
          <button
            onClick={handleLinkABDM}
            style={{
              padding: "6px 14px",
              borderRadius: 20,
              border: "1px solid rgba(0,201,167,0.6)",
              background: "rgba(0,201,167,0.12)",
              color: "#00C9A7",
              fontFamily: B,
              fontWeight: 700,
              fontSize: "0.72rem",
              cursor: "pointer",
            }}
          >
            Link ABDM
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function InfoChip({ label, value, highlight }) {
  return (
    <div>
      <p style={{ fontFamily: B, fontSize: "0.62rem", color: "rgba(255,255,255,0.45)", margin: 0, textTransform: "uppercase", letterSpacing: "0.07em" }}>
        {label}
      </p>
      <p style={{ fontFamily: H, fontWeight: 700, fontSize: "0.82rem", color: highlight ? "#00C9A7" : "#fff", margin: "2px 0 0" }}>
        {value}
      </p>
    </div>
  );
}

function formatDOB(dob) {
  const d = new Date(dob);
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : "—";
}
