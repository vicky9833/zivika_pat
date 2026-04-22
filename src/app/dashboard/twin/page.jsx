"use client";

import { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Stethoscope, ShieldCheck, AlertTriangle, Download,
  Heart, Activity, Moon, ChevronLeft, Leaf,
} from "lucide-react";
import { useRecordsStore } from "@/lib/stores/records-store";
import { useUserStore } from "@/lib/stores/user-store";
import { useVitalsStore } from "@/lib/stores/vitals-store";
import { useMedicationsStore } from "@/lib/stores/medications-store";
import { computeTwinScores, TWIN_TIMELINE } from "@/lib/twin-engine";
import HealthScoreRing from "@/components/twin/HealthScoreRing";
import ScoreBreakdown from "@/components/twin/ScoreBreakdown";
import HealthTimeline from "@/components/twin/HealthTimeline";
import RiskFactors from "@/components/twin/RiskFactors";
import Recommendations from "@/components/twin/Recommendations";
import HealthSummaryModal from "@/components/shared/HealthSummaryModal";
import EmptyState from "@/components/shared/EmptyState";

const H = "var(--font-outfit, 'Outfit', sans-serif)";
const B = "var(--font-dm-sans, 'DM Sans', sans-serif)";

// 4 mini category pills shown in the gradient header when data exists
const HEADER_PILLS = [
  { key: "cardiovascular", label: "Heart",    icon: Heart    },
  { key: "mentalWellness", label: "Sleep",    icon: Moon     },
  { key: "nutrition",      label: "Diet",     icon: Leaf     },
  { key: "musculoskeletal",label: "Activity", icon: Activity },
];

// ─── Reusable section header ──────────────────────────────────────────────────
function SectionHeader({ title, badge, icon: Icon, iconColor }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
      {Icon && <Icon size={16} color={iconColor || "#8EBAA3"} />}
      <h2
        style={{
          fontFamily: H, fontWeight: 700, fontSize: "1rem",
          color: "#0B1F18", margin: 0, flex: 1,
        }}
      >
        {title}
      </h2>
      {badge && (
        <span
          style={{
            padding: "3px 9px", borderRadius: 6,
            background: "linear-gradient(135deg, rgba(13,110,79,0.12), rgba(0,201,167,0.12))",
            fontFamily: B, fontWeight: 700, fontSize: "0.65rem",
            color: "#0D6E4F", letterSpacing: "0.02em",
          }}
        >
          {badge}
        </span>
      )}
    </div>
  );
}

// ─── Insight card ─────────────────────────────────────────────────────────────
const TWIN_ICON_MAP = { Heart, Activity, Moon };

function InsightCard({ insight }) {
  const IIcon = TWIN_ICON_MAP[insight.iconName] || Activity;
  return (
    <div
      style={{
        background: insight.bgColor,
        border: `1.5px solid ${insight.borderColor}33`,
        borderLeft: `3px solid ${insight.borderColor}`,
        borderRadius: "0 12px 12px 0",
        padding: "12px 14px",
        display: "flex", gap: 10, alignItems: "flex-start",
      }}
    >
      <div
        style={{
          width: 30, height: 30, borderRadius: 8,
          background: `${insight.iconColor || insight.borderColor}18`,
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0, marginTop: 1,
        }}
      >
        <IIcon size={14} color={insight.iconColor || insight.borderColor} />
      </div>
      <div>
        <p style={{ fontFamily: H, fontWeight: 700, fontSize: "0.85rem", color: "#0B1F18", margin: "0 0 3px" }}>
          {insight.title}
        </p>
        <p style={{ fontFamily: B, fontSize: "0.76rem", color: "#5A7A6E", margin: 0, lineHeight: 1.55 }}>
          {insight.description}
        </p>
      </div>
    </div>
  );
}

// ─── Coming Soon card — glass style ──────────────────────────────────────────
function ComingSoonCard({ icon: Icon, title, description }) {
  return (
    <div
      style={{
        background: "linear-gradient(135deg, rgba(13,110,79,0.04) 0%, rgba(0,201,167,0.06) 100%)",
        border: "1.5px dashed rgba(0,201,167,0.30)",
        borderRadius: 16,
        padding: "16px",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        display: "flex", gap: 14, alignItems: "flex-start",
      }}
    >
      <div
        style={{
          width: 40, height: 40, borderRadius: 10,
          background: "rgba(0,201,167,0.12)",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Icon size={20} color="#00C9A7" />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 5 }}>
          <p style={{ fontFamily: H, fontWeight: 600, fontSize: "0.88rem", color: "#0B1F18", margin: 0 }}>
            {title}
          </p>
          <span
            style={{
              padding: "2px 8px", borderRadius: 5,
              background: "rgba(0,201,167,0.12)",
              fontFamily: B, fontWeight: 700, fontSize: "0.62rem",
              color: "#00C9A7", whiteSpace: "nowrap", marginLeft: 8, flexShrink: 0,
              letterSpacing: "0.03em",
            }}
          >
            Phase 2
          </span>
        </div>
        <p style={{ fontFamily: B, fontSize: "0.78rem", color: "#8EBAA3", margin: 0, lineHeight: 1.5 }}>
          {description}
        </p>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function TwinPage() {
  const router = useRouter();
  const records = useRecordsStore((s) => s.records);
  const user = useUserStore((s) => s.user);
  const vitalsReadings = useVitalsStore((s) => s.readings);
  const getLatestVitals = useVitalsStore((s) => s.getLatestVitals);
  const latestVitals = useMemo(() => getLatestVitals(), [vitalsReadings]);
  const { medications } = useMedicationsStore();
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  useEffect(() => { const t = setTimeout(() => setLoading(false), 400); return () => clearTimeout(t); }, []);

  const twin = useMemo(
    () => computeTwinScores(records, latestVitals, medications, []),
    [records, latestVitals, medications]
  );

  const twinInsight = {
    id: "twin-predict-1",
    iconName: "Activity",
    iconColor: "#00C9A7",
    title: "HbA1c Prediction",
    description:
      "Based on your trajectory (+1.2% reduction in 6 months), maintaining current medication and diet should bring HbA1c below 7.0% within the next 3–4 months.",
    borderColor: "#00C9A7",
    bgColor: "rgba(0,201,167,0.05)",
  };

  if (loading) {
    return (
      <div style={{ padding: "20px 20px 100px", display: "flex", flexDirection: "column", gap: 20 }}>
        <div className="animate-pulse" style={{ background: "#DCE8E2", borderRadius: 20, height: 280 }} />
        <div className="animate-pulse" style={{ background: "#DCE8E2", borderRadius: 16, height: 120 }} />
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse" style={{ background: "#DCE8E2", borderRadius: 14, height: 80 }} />
        ))}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      style={{ background: "#F0F7F4", paddingBottom: 120 }}
    >
      <HealthSummaryModal
        isOpen={summaryOpen}
        onClose={() => setSummaryOpen(false)}
        user={user}
        vitals={latestVitals}
        medications={medications}
        records={records}
        twinData={twin}
      />

      {/* ── Section 1: Gradient Header ────────────────────────── */}
      <div
        style={{
          position: "relative",
          background: "linear-gradient(160deg, #0D6E4F 0%, #065F46 40%, #00C9A7 100%)",
          padding: "20px 20px 28px",
          overflow: "hidden",
        }}
      >
        {/* Dot-grid overlay */}
        <div
          style={{
            position: "absolute", inset: 0,
            backgroundImage: "radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)",
            backgroundSize: "18px 18px",
            pointerEvents: "none",
          }}
        />

        {/* Top row: back + title + download */}
        <div
          style={{
            position: "relative", zIndex: 1,
            display: "flex", alignItems: "center", justifyContent: "space-between",
            marginBottom: 24,
          }}
        >
          <button
            onClick={() => router.back()}
            aria-label="Go back"
            style={{
              width: 36, height: 36, borderRadius: "50%",
              background: "rgba(255,255,255,0.12)",
              border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <ChevronLeft size={20} color="#fff" />
          </button>

          <span style={{ fontFamily: H, fontWeight: 700, fontSize: "1.06rem", color: "#fff", letterSpacing: "-0.01em" }}>
            Digital Twin
          </span>

          <button
            onClick={() => setSummaryOpen(true)}
            aria-label="Download health summary"
            style={{
              width: 36, height: 36, borderRadius: "50%",
              background: "rgba(255,255,255,0.12)",
              border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <Download size={17} color="#fff" />
          </button>
        </div>

        {/* Score ring + pills + completeness bar */}
        <div
          style={{
            position: "relative", zIndex: 1,
            display: "flex", flexDirection: "column", alignItems: "center", gap: 16,
          }}
        >
          <HealthScoreRing
            score={twin.overall}
            recordCount={records.length}
            lastUpdated={twin.lastUpdated}
            variant="white"
            hasData={twin.hasData}
          />

          {/* 4 mini category pills — only when data exists */}
          {twin.hasData && (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
              {HEADER_PILLS.map(({ key, label, icon: PillIcon }) => {
                const catData = twin.categories[key];
                const score = catData ? catData.score : 0;
                return (
                  <div
                    key={key}
                    style={{
                      display: "flex", alignItems: "center", gap: 5,
                      background: "rgba(255,255,255,0.13)",
                      borderRadius: 20, padding: "5px 10px",
                      backdropFilter: "blur(4px)",
                    }}
                  >
                    <PillIcon size={12} color="rgba(255,255,255,0.85)" />
                    <span style={{ fontFamily: B, fontSize: "0.72rem", color: "rgba(255,255,255,0.85)", fontWeight: 600 }}>
                      {label}
                    </span>
                    <span style={{ fontFamily: H, fontSize: "0.76rem", color: "#fff", fontWeight: 700 }}>
                      {score}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Data completeness bar */}
          <div style={{ width: "100%", maxWidth: 280 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
              <span style={{ fontFamily: B, fontSize: "0.67rem", color: "rgba(255,255,255,0.6)" }}>
                Data Completeness
              </span>
              <span style={{ fontFamily: B, fontSize: "0.67rem", color: "rgba(255,255,255,0.85)", fontWeight: 700 }}>
                {twin.dataCompleteness}%
              </span>
            </div>
            <div style={{ height: 4, borderRadius: 2, background: "rgba(255,255,255,0.18)", overflow: "hidden" }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${twin.dataCompleteness}%` }}
                transition={{ duration: 0.9, ease: "easeOut", delay: 0.4 }}
                style={{ height: "100%", background: "rgba(255,255,255,0.75)", borderRadius: 2 }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Score Breakdown or empty state ───────────────────── */}
      {twin.hasData ? (
        <>
          <div style={{ padding: "24px 20px 24px" }}>
            <SectionHeader title="Health Score Breakdown" />
            <ScoreBreakdown categories={twin.categories} />
          </div>

          {/* AI Insights */}
          <div style={{ padding: "0 20px 24px" }}>
            <SectionHeader title="AI Predictions & Insights" badge="AI" />
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[twinInsight].map((insight) => (
                <InsightCard key={insight.id} insight={insight} />
              ))}
            </div>
          </div>

          {/* Risk Factors */}
          <div style={{ padding: "0 20px 24px" }}>
            <SectionHeader title="Risk Factors" icon={AlertTriangle} iconColor="#F39C12" />
            <RiskFactors risks={twin.riskFactors} />
          </div>

          {/* Recommendations */}
          <div style={{ padding: "0 20px 24px" }}>
            <SectionHeader title="AI Recommendations" badge="AI" />
            <Recommendations items={twin.recommendations} />
          </div>

          {/* Health Timeline */}
          <div style={{ padding: "0 20px 24px" }}>
            <SectionHeader title="Health Timeline" />
            <HealthTimeline events={TWIN_TIMELINE} />
          </div>
        </>
      ) : (
        <div style={{ padding: "24px 20px 24px" }}>
          <EmptyState
            icon={Activity}
            title="Your Digital Twin needs data"
            description="Start by scanning a medical report, logging vitals, or adding medications. Your health score will build as you add more data."
            ctaLabel="Scan a Report"
            onCta={() => router.push("/dashboard/scan")}
          />
        </div>
      )}

      {/* Connect & Sync */}
      <div style={{ padding: "0 20px 24px", display: "flex", flexDirection: "column", gap: 12 }}>
        <SectionHeader title="Connect & Sync" />
        <ComingSoonCard
          icon={Stethoscope}
          title="Connect with Your Doctor's Clinic"
          description="Share your Digital Twin with your doctor for smarter, data-driven consultations."
        />
        <ComingSoonCard
          icon={ShieldCheck}
          title="🇮🇳 ABDM Health Sync"
          description="Sync with Ayushman Bharat Digital Mission for national health record interoperability."
        />
      </div>
    </motion.div>
  );
}
