"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FileText, Stethoscope, ShieldCheck, Scan, Lock, FolderHeart } from "lucide-react";
import { useRecordsStore } from "@/lib/stores/records-store";
import RecordCard from "@/components/locker/RecordCard";
import RecordFilters from "@/components/locker/RecordFilters";
import EmptyState from "@/components/shared/EmptyState";
import { toast } from "@/components/ui/Toast";

const H = "var(--font-outfit, 'Outfit', sans-serif)";
const B = "var(--font-dm-sans, 'DM Sans', sans-serif)";



// ─── Main page ────────────────────────────────────────────────────────────────
export default function LockerPage() {
  const router = useRouter();
  const records = useRecordsStore((s) => s.records);

  // ── Stats computations ───────────────────────────────────────────────────
  const stats = useMemo(() => {
    const total = records.length;
    const providers = new Set(
      records.flatMap((r) => [r.doctor, r.facility].filter(Boolean))
    ).size;
    const aiCount = records.filter((r) => r.extractedData).length;
    return { total, providers, aiCount };
  }, [records]);

  const [loading, setLoading] = useState(true);
  useEffect(() => { const t = setTimeout(() => setLoading(false), 400); return () => clearTimeout(t); }, []);

  if (loading) {
    return (
      <div style={{ padding: "20px 20px 100px", display: "flex", flexDirection: "column", gap: 20 }}>
        <div className="animate-pulse" style={{ background: "#DCE8E2", borderRadius: 10, height: 36, width: 140 }} />
        <div style={{ display: "flex", gap: 10 }}>
          {[...Array(3)].map((_, i) => <div key={i} className="animate-pulse" style={{ flex: 1, background: "#DCE8E2", borderRadius: 12, height: 80 }} />)}
        </div>
        {[...Array(4)].map((_, i) => (
          <div key={i} className="animate-pulse" style={{ background: "#DCE8E2", borderRadius: 16, height: 90 }} />
        ))}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      style={{ background: "#F0F7F4", minHeight: "100%", paddingBottom: 140 }}
    >

      {/* ── Page header ─────────────────────────────────────────── */}
      <div style={{
        position: "sticky",
        top: 0,
        zIndex: 30,
        backdropFilter: "blur(8px)",
        backgroundColor: "rgba(255,255,255,0.92)",
        borderBottom: "1px solid #DCE8E2",
        padding: "0 20px",
        height: 56,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <h1 style={{ fontFamily: H, fontWeight: 700, fontSize: "1.0625rem", color: "#0B1F18", margin: 0 }}>
          Health Locker
        </h1>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#F0F7F4", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Lock size={16} color="#0D6E4F" />
          </div>
          <span style={{ fontFamily: B, fontSize: "0.625rem", color: "#8EBAA3" }}>Encrypted</span>
        </div>
      </div>

      {/* ── Stats bar ────────────────────────────────────────────── */}
      <div style={{ margin: "16px 20px 16px" }}>
        <div style={{
          background: "#fff",
          borderRadius: 16,
          padding: "14px 0",
          border: "1px solid #DCE8E2",
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
        }}>
          {[
            { value: stats.total,    label: "Total Records" },
            { value: stats.providers, label: "Providers" },
            { value: stats.aiCount,  label: "AI Scanned" },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: "center", borderRight: i < 2 ? "1px solid #DCE8E2" : "none", padding: "0 8px" }}>
              <p style={{ fontFamily: H, fontWeight: 700, fontSize: "1.25rem", color: "#0B1F18", margin: 0, lineHeight: 1 }}>{s.value}</p>
              <p style={{ fontFamily: B, fontSize: "0.6875rem", color: "#8EBAA3", margin: "4px 0 0" }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Filters + list ──────────────────────────────────────── */}
      <RecordFilters records={records}>
        {(filtered, activeTab) => (
          <>
            {filtered.length === 0 ? (
              <div style={{ padding: "40px 20px" }}>
                <EmptyState
                  icon={activeTab === "all" ? FolderHeart : FileText}
                  iconColor="#0D6E4F"
                  title={
                    activeTab === "all"
                      ? "Your health locker is empty"
                      : `Nothing here yet`
                  }
                  description={
                    activeTab === "all"
                      ? "Scan any medical report — lab results, prescriptions, X-rays — and your AI will digitize and store it here securely."
                      : `Scan a ${activeTab} report and it'll show up here.`
                  }
                  ctaLabel="Scan Your First Report"
                  onCta={() => router.push("/dashboard/scan")}
                />
              </div>
            ) : (
              <div style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: 10 }}>
                {filtered.map((record, i) => (
                  <RecordCard
                    key={record.id}
                    record={record}
                    index={i}
                    onClick={() => router.push(`/dashboard/locker/${record.id}`)}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </RecordFilters>

      {/* ── ABDM card ─────────────────────────────────────────────── */}
      <div style={{ padding: "24px 20px 0" }}>
        <div
          style={{
            background: "#fff",
            borderRadius: 16,
            padding: "16px",
            border: "1px solid #DCE8E2",
            display: "flex",
            gap: 14,
            alignItems: "flex-start",
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 11,
              background: "rgba(13,110,79,0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <ShieldCheck size={22} color="#0D6E4F" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
              <p style={{ fontFamily: H, fontWeight: 700, fontSize: "0.95rem", color: "#0B1F18", margin: 0 }}>
                🇮🇳 ABDM Health Locker
              </p>
              <span
                style={{
                  padding: "3px 9px",
                  borderRadius: 6,
                  background: "#DCE8E2",
                  fontFamily: B,
                  fontWeight: 700,
                  fontSize: "0.65rem",
                  color: "#5A9A7E",
                  letterSpacing: "0.03em",
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                  marginLeft: 8,
                }}
              >
                Coming Soon
              </span>
            </div>
            <p style={{ fontFamily: B, fontSize: "0.78rem", color: "#8EBAA3", margin: 0, lineHeight: 1.5 }}>
              Connect to Ayushman Bharat Digital Mission for national health record interoperability
            </p>
          </div>
        </div>
      </div>

      {/* ── Privacy footer ────────────────────────────────────────── */}
      <div
        style={{
          padding: "14px 20px 0",
          display: "flex",
          alignItems: "center",
          gap: 7,
          justifyContent: "center",
        }}
      >
        <Lock size={11} color="#B8D4C5" />
        <p
          style={{
            fontFamily: B,
            fontSize: "0.72rem",
            color: "#B8D4C5",
            margin: 0,
            textAlign: "center",
            lineHeight: 1.5,
          }}
        >
          All records encrypted end-to-end. You control who sees your data.
        </p>
      </div>

      {/* ── Floating bottom action bar ────────────────────────────── */}
      <div
        style={{
          position: "fixed",
          bottom: "calc(72px + env(safe-area-inset-bottom, 0px))",
          left: "50%",
          transform: "translateX(-50%)",
          width: "calc(100% - 40px)",
          maxWidth: 350,
          padding: "10px 20px 12px",
          background: "linear-gradient(180deg, transparent 0%, rgba(240,247,244,0.96) 18%, #F0F7F4 100%)",
          zIndex: 20,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "#fff",
            borderRadius: 14,
            padding: "10px 14px",
            border: "1px solid #DCE8E2",
            boxShadow: "0 2px 16px rgba(13,110,79,0.08)",
          }}
        >
          <p style={{ fontFamily: B, fontWeight: 600, fontSize: "0.82rem", color: "#5A9A7E", margin: 0 }}>
            {records.length} record{records.length !== 1 ? "s" : ""}
          </p>
          <div style={{ display: "flex", gap: 9 }}>
            <button
              onClick={() => toast("Export coming soon", "info")}
              style={{
                padding: "8px 14px",
                border: "1.5px solid #DCE8E2",
                borderRadius: 9,
                background: "#fff",
                color: "#5A9A7E",
                fontFamily: B,
                fontWeight: 600,
                fontSize: "0.78rem",
                cursor: "pointer",
              }}
            >
              Export
            </button>
            <button
              onClick={() => router.push("/dashboard/scan")}
              style={{
                padding: "8px 16px",
                border: "none",
                borderRadius: 9,
                background: "linear-gradient(135deg, #0D6E4F, #00C9A7)",
                color: "#fff",
                fontFamily: B,
                fontWeight: 700,
                fontSize: "0.78rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              <Scan size={13} />
              Scan New
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
