"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useClerk } from "@clerk/nextjs";
import { useUserStore } from "@/lib/stores/user-store";
import { useVitalsStore } from "@/lib/stores/vitals-store";
import { useMedicationsStore } from "@/lib/stores/medications-store";
import HealthIDCard from "@/components/profile/HealthIDCard";
import PersonalInfo from "@/components/profile/PersonalInfo";
import AppSettings from "@/components/profile/AppSettings";
import EmergencySOS from "@/components/shared/EmergencySOS";
import HealthSummaryModal from "@/components/shared/HealthSummaryModal";
import { toast } from "@/components/ui/Toast";
import { AlertTriangle, Download, UserRound } from "lucide-react";
import { useRecordsStore } from "@/lib/stores/records-store";

const H = "var(--font-outfit, 'Outfit', sans-serif)";
const B = "var(--font-dm-sans, 'DM Sans', sans-serif)";

export default function ProfilePage() {
  const router = useRouter();
  const { signOut } = useClerk();
  const user = useUserStore((s) => s.user);
  const records = useRecordsStore((s) => s.records);
  const vitalsReadings = useVitalsStore((s) => s.readings);
  const getLatestVitals = useVitalsStore((s) => s.getLatestVitals);
  const latestVitals = useMemo(() => getLatestVitals(), [vitalsReadings]);
  const { medications } = useMedicationsStore();
  const [sosOpen, setSosOpen] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  useEffect(() => { const t = setTimeout(() => setLoading(false), 400); return () => clearTimeout(t); }, []);

  async function handleLogout() {
    localStorage.removeItem("zivika_onboarded");
    localStorage.removeItem("zivika_profile_complete");
    useUserStore.getState().updateUser({});
    toast("Logged out successfully", "info");
    await signOut();
    router.replace("/onboarding");
  }

  if (loading) {
    return (
      <div style={{ padding: "20px 20px 100px", display: "flex", flexDirection: "column", gap: 20 }}>
        <div className="animate-pulse" style={{ background: "#DCE8E2", borderRadius: 16, height: 160 }} />
        <div className="animate-pulse" style={{ background: "#DCE8E2", borderRadius: 16, height: 24, width: 100 }} />
        {[...Array(4)].map((_, i) => <div key={i} className="animate-pulse" style={{ background: "#DCE8E2", borderRadius: 12, height: 52 }} />)}
        <div className="animate-pulse" style={{ background: "#DCE8E2", borderRadius: 16, height: 110 }} />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      style={{ minHeight: "100vh", background: "#F0F7F4", paddingBottom: 100 }}
    >
      <EmergencySOS
        isOpen={sosOpen}
        onClose={() => setSosOpen(false)}
        emergencyContact={user.emergencyContact}
      />
      <HealthSummaryModal
        isOpen={summaryOpen}
        onClose={() => setSummaryOpen(false)}
        user={user}
        vitals={latestVitals}
        medications={medications}
        records={records}
      />
      {/* ── Top Nav ── */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 40,
          background: "rgba(240,247,244,0.92)",
          backdropFilter: "blur(12px)",
          padding: "16px 20px 12px",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <button
          onClick={() => router.back()}
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            border: "1.5px solid #DCE8E2",
            background: "#fff",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 0,
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0B1F18" strokeWidth="2.2" strokeLinecap="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <h1 style={{ fontFamily: H, fontWeight: 700, fontSize: "1.1rem", color: "#0B1F18", margin: 0 }}>
          My Profile
        </h1>
      </div>

      {/* ── Section 1: Profile Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          style={{
            borderRadius: "0 0 24px 24px",
            background: "linear-gradient(135deg, #0D6E4F 0%, #065F46 100%)",
            padding: "28px 20px 24px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Dot-grid overlay */}
          <div style={{
            position: "absolute", inset: 0, opacity: 0.05,
            backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
            backgroundSize: "24px 24px", pointerEvents: "none",
          }} />

          {/* Avatar */}
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.2)",
              border: "3px solid rgba(255,255,255,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 14,
              position: "relative",
            }}
          >
            {user.initials
              ? <span style={{ fontFamily: H, fontWeight: 700, fontSize: "1.625rem", color: "#fff" }}>{user.initials}</span>
              : <UserRound size={32} color="#fff" />}
          </div>

          <h2 style={{ fontFamily: H, fontWeight: 700, fontSize: "1.25rem", color: "#fff", margin: "0 0 4px", position: "relative" }}>
            {user.name}
          </h2>
          <p style={{ fontFamily: B, fontSize: "0.8125rem", color: "rgba(255,255,255,0.7)", margin: "0 0 16px", position: "relative" }}>
            {user.phone}
          </p>

          <motion.button
            whileTap={{ scale: 0.96 }}
            style={{
              padding: "7px 20px",
              borderRadius: 20,
              border: "1px solid rgba(255,255,255,0.3)",
              background: "rgba(255,255,255,0.15)",
              color: "#fff",
              fontFamily: B,
              fontWeight: 600,
              fontSize: "0.8125rem",
              cursor: "pointer",
              position: "relative",
            }}
            onClick={() => {
              toast("Scroll down to edit your details", "info");
            }}
          >
            Edit Profile
          </motion.button>
        </motion.div>

      <div style={{ padding: "8px 20px", display: "flex", flexDirection: "column", gap: 20 }}>
        <HealthIDCard user={user} />

        {/* ── Section 3: Personal Information ── */}
        <PersonalInfo user={user} />

        {/* ── Section 4: App Settings ── */}
        <AppSettings user={user} />

        {/* ── Section 5: Safety & Actions ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => setSummaryOpen(true)}
            style={{
              width: "100%",
              padding: "15px",
              borderRadius: 14,
              border: "1.5px solid #0D6E4F",
              background: "rgba(13,110,79,0.05)",
              color: "#0D6E4F",
              fontFamily: B,
              fontWeight: 700,
              fontSize: "0.9rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            <Download size={17} />
            Download Health Summary
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => setSosOpen(true)}
            style={{
              width: "100%",
              padding: "15px",
              borderRadius: 14,
              border: "1.5px solid #DC2626",
              background: "rgba(220,38,38,0.05)",
              color: "#DC2626",
              fontFamily: B,
              fontWeight: 700,
              fontSize: "0.9rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            <AlertTriangle size={17} />
            Emergency SOS
          </motion.button>
        </div>

        {/* ── Section 6: Logout ── */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleLogout}
          style={{
            width: "100%",
            padding: "15px",
            borderRadius: 14,
            border: "1.5px solid #EF4444",
            background: "transparent",
            color: "#EF4444",
            fontFamily: B,
            fontWeight: 700,
            fontSize: "0.9rem",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2.2" strokeLinecap="round">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
          </svg>
          Log Out
        </motion.button>
      </div>
    </motion.div>
  );
}
