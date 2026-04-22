"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Upload, ChevronRight, FlaskConical, Pill, ScanLine, FileText, Globe, Lock, Zap, TestTube2, Stethoscope, Activity, Building2, Syringe } from "lucide-react";
import CameraCapture from "@/components/scan/CameraCapture";
import UploadZone from "@/components/scan/UploadZone";
import ProcessingAnimation from "@/components/scan/ProcessingAnimation";
import ScanResults from "@/components/scan/ScanResults";
import { analyzeReport as analyzeReportMock } from "@/lib/sarvam";
import { useRecordsStore } from "@/lib/stores/records-store";
import { RECORD_TYPES } from "@/lib/constants";
import { toast } from "@/components/ui/Toast";
import { useConvexAnalyze } from "@/lib/hooks/useConvexAnalyze";
import { useConvexRecords } from "@/lib/hooks/useConvexRecords";
import { useConvexUser } from "@/lib/hooks/useConvexUser";

const H = "var(--font-outfit, 'Outfit', sans-serif)";
const B = "var(--font-dm-sans, 'DM Sans', sans-serif)";

// ─── What can I scan card ──────────────────────────────────────────────────────
function ScanTypeCard({ Icon, iconColor, iconBg, title, examples }) {
  return (
    <div
      style={{
        padding: "14px",
        background: "#fff",
        borderRadius: 14,
        border: "1px solid #DCE8E2",
        flex: "1 1 calc(50% - 5px)",
        minWidth: 0,
      }}
    >
      <div style={{ width: 36, height: 36, borderRadius: 10, background: iconBg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 8 }}>
        <Icon size={18} color={iconColor} />
      </div>
      <p style={{ fontFamily: H, fontWeight: 700, fontSize: "0.85rem", color: "#0B1F18", margin: "0 0 3px" }}>
        {title}
      </p>
      <p style={{ fontFamily: B, fontSize: "0.72rem", color: "#8EBAA3", margin: 0, lineHeight: 1.4 }}>
        {examples}
      </p>
    </div>
  );
}

// ─── Feature chip ──────────────────────────────────────────────────────────────
function FeatureChip({ Icon, iconColor, title, subtitle }) {
  return (
    <div
      style={{
        padding: "12px 14px",
        background: "#fff",
        borderRadius: 12,
        border: "1px solid #DCE8E2",
        display: "flex",
        gap: 12,
        alignItems: "flex-start",
      }}
    >
      <div style={{ width: 32, height: 32, borderRadius: 8, background: `${iconColor}18`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Icon size={16} color={iconColor} />
      </div>
      <div>
        <p style={{ fontFamily: B, fontWeight: 700, fontSize: "0.835rem", color: "#0B1F18", margin: "0 0 2px" }}>
          {title}
        </p>
        <p style={{ fontFamily: B, fontSize: "0.73rem", color: "#8EBAA3", margin: 0, lineHeight: 1.45 }}>
          {subtitle}
        </p>
      </div>
    </div>
  );
}

// ─── Recent scan mini-card ─────────────────────────────────────────────────────
const ICON_MAP = { Pill, TestTube2, Stethoscope, Activity, ScanLine, Building2, Syringe, FileText };

function RecentScanCard({ record }) {
  const rType = RECORD_TYPES[record.type] || RECORD_TYPES.lab;
  const IconComp = ICON_MAP[rType.iconName] || FileText;
  return (
    <button
      onClick={() => toast("Opening record...", "info")}
      style={{
        padding: "10px 14px",
        background: "#fff",
        borderRadius: 12,
        border: "1px solid #DCE8E2",
        display: "flex",
        alignItems: "center",
        gap: 10,
        cursor: "pointer",
        width: "100%",
        textAlign: "left",
      }}
    >
      <div style={{ width: 32, height: 32, borderRadius: 8, background: `${rType.iconColor}18`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <IconComp size={16} color={rType.iconColor} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            fontFamily: B,
            fontWeight: 600,
            fontSize: "0.82rem",
            color: "#0B1F18",
            margin: 0,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {record.title}
        </p>
        <p style={{ fontFamily: B, fontSize: "0.72rem", color: "#8EBAA3", margin: 0 }}>{record.date}</p>
      </div>
      <ChevronRight size={14} color="#B8D4C5" style={{ flexShrink: 0 }} />
    </button>
  );
}

// ─── Landing view ──────────────────────────────────────────────────────────────
function LandingView({ onOpenCamera, onOpenUpload, recentRecords }) {
  return (
    <motion.div
      key="landing"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.28 }}
      style={{ padding: "0 20px 120px" }}
    >
      {/* Hero zone */}
      <div
        style={{
          background: "linear-gradient(140deg, #0D6E4F 0%, #084832 55%, #00A885 100%)",
          borderRadius: 20,
          padding: "30px 22px 26px",
          textAlign: "center",
          marginBottom: 20,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {[140, 200, 270].map((size, i) => (
          <motion.div
            key={i}
            animate={{ scale: [1, 1.07, 1], opacity: [0.07, 0.14, 0.07] }}
            transition={{ duration: 3.2, repeat: Infinity, delay: i * 1.05, ease: "easeInOut" }}
            style={{
              position: "absolute",
              width: size,
              height: size,
              borderRadius: "50%",
              border: "1.5px solid rgba(0,201,167,0.45)",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              pointerEvents: "none",
            }}
          />
        ))}

        <motion.div
          animate={{ y: [0, -7, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 68,
            height: 68,
            borderRadius: 18,
            background: "rgba(255,255,255,0.14)",
            marginBottom: 16,
          }}
        >
          <Camera size={34} color="#fff" />
        </motion.div>

        <h1
          style={{
            fontFamily: H,
            fontWeight: 800,
            fontSize: "1.35rem",
            color: "#fff",
            margin: "0 0 8px",
            lineHeight: 1.22,
            letterSpacing: "-0.01em",
          }}
        >
          Scan any medical report
        </h1>
        <p
          style={{
            fontFamily: B,
            fontSize: "0.85rem",
            color: "rgba(255,255,255,0.72)",
            margin: "0 0 22px",
            lineHeight: 1.55,
          }}
        >
          Prescriptions, lab tests, X-rays, discharge summaries — in any Indian language
        </p>

        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={onOpenCamera}
            style={{
              flex: 1,
              padding: "13px 14px",
              background: "#fff",
              border: "none",
              borderRadius: 12,
              fontFamily: B,
              fontWeight: 700,
              fontSize: "0.875rem",
              color: "#0D6E4F",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 7,
            }}
          >
            <Camera size={16} />
            Open Camera
          </button>
          <button
            onClick={onOpenUpload}
            style={{
              flex: 1,
              padding: "13px 14px",
              background: "rgba(255,255,255,0.14)",
              border: "1.5px solid rgba(255,255,255,0.32)",
              borderRadius: 12,
              fontFamily: B,
              fontWeight: 700,
              fontSize: "0.875rem",
              color: "#fff",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 7,
            }}
          >
            <Upload size={16} />
            Upload File
          </button>
        </div>
      </div>

      {recentRecords.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <p style={{ fontFamily: H, fontWeight: 700, fontSize: "0.95rem", color: "#0B1F18", margin: "0 0 10px" }}>
            Recent Scans
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {recentRecords.slice(0, 3).map((r) => (
              <RecentScanCard key={r.id} record={r} />
            ))}
          </div>
        </div>
      )}

      <div style={{ marginBottom: 18 }}>
        <p style={{ fontFamily: H, fontWeight: 700, fontSize: "0.95rem", color: "#0B1F18", margin: "0 0 10px" }}>
          What can I scan?
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          <ScanTypeCard Icon={FlaskConical} iconColor="#2563EB" iconBg="#EFF6FF" title="Lab Reports"   examples="CBC, LFT, KFT, Thyroid, HbA1c" />
          <ScanTypeCard Icon={Pill}         iconColor="#0D6E4F" iconBg="#ECFDF5" title="Prescriptions" examples="Handwritten & digital" />
          <ScanTypeCard Icon={ScanLine}     iconColor="#D97706" iconBg="#FFFBEB" title="Imaging"       examples="X-Ray, MRI, CT, Ultrasound" />
          <ScanTypeCard Icon={FileText}     iconColor="#7C3AED" iconBg="#F5F3FF" title="Discharge"     examples="Hospital summaries" />
        </div>
      </div>

      <div style={{ marginBottom: 18 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <FeatureChip Icon={Globe} iconColor="#2563EB" title="Multilingual"    subtitle="Reports in Hindi, English, Tamil, Telugu, Kannada & more" />
          <FeatureChip Icon={Lock}  iconColor="#0D6E4F" title="Private & Secure" subtitle="Your reports are encrypted and only you can access them" />
          <FeatureChip Icon={Zap}   iconColor="#D97706" title="Instant Analysis" subtitle="AI extracts data in seconds, not minutes" />
        </div>
      </div>

      <div
        style={{
          padding: "14px 16px",
          background: "#fff",
          borderRadius: 12,
          border: "1px solid #DCE8E2",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 10,
        }}
      >
        <div>
          <div style={{ fontFamily: B, fontWeight: 700, fontSize: "0.82rem", color: "#0B1F18", margin: "0 0 2px" }}>
            ABDM Health Locker
          </div>
          <p style={{ fontFamily: B, fontSize: "0.73rem", color: "#8EBAA3", margin: 0 }}>
            Connect to national health system for interoperability
          </p>
        </div>
        <span
          style={{
            padding: "4px 10px",
            borderRadius: 6,
            background: "#DCE8E2",
            fontFamily: B,
            fontWeight: 700,
            fontSize: "0.68rem",
            color: "#5A9A7E",
            whiteSpace: "nowrap",
            letterSpacing: "0.02em",
          }}
        >
          Coming Soon
        </span>
      </div>
    </motion.div>
  );
}

// ─── Back button ───────────────────────────────────────────────────────────────
function BackBtn({ onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: "none",
        border: "none",
        fontFamily: B,
        fontSize: "0.875rem",
        color: "#5A9A7E",
        cursor: "pointer",
        padding: "6px 0",
        display: "flex",
        alignItems: "center",
        gap: 4,
      }}
    >
      ← Back
    </button>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────
export default function ScanPage() {
  const [mode, setMode] = useState("landing"); // landing | camera | upload | processing | results
  const [capturedImage, setCapturedImage] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);

  const { convexUser } = useConvexUser();
  const { records, createRecord, generateUploadUrl } = useConvexRecords(convexUser);
  const { analyzeReport } = useConvexAnalyze();

  const recentScanned = records.filter((r) => r.imageUrl);

  const handleImageReady = async (imageBase64) => {
    setCapturedImage(imageBase64);
    setMode("processing");
    try {
      const language = convexUser?.nativeLanguage ?? "en";
      const result = await analyzeReport(imageBase64, language);
      setAnalysisResult(result);
      setMode("results");

      // Upload image + save record to Convex in the background
      if (convexUser?._id) {
        (async () => {
          try {
            // Convert base64 to Blob
            const base64Data = imageBase64.includes(",")
              ? imageBase64.split(",")[1]
              : imageBase64;
            const mimeType = imageBase64.includes("data:")
              ? imageBase64.split(";")[0].split(":")[1]
              : "image/jpeg";
            const byteCharacters = atob(base64Data);
            const byteArray = new Uint8Array(Array.from(byteCharacters, (c) => c.charCodeAt(0)));
            const blob = new Blob([byteArray], { type: mimeType });

            // Upload to Convex storage
            const uploadUrl = await generateUploadUrl();
            const res = await fetch(uploadUrl, {
              method: "POST",
              headers: { "Content-Type": mimeType },
              body: blob,
            });
            const { storageId } = await res.json();

            await createRecord({
              title:         result.title  ?? "Medical Report",
              type:          result.type   ?? "Other",
              summary:       result.summary,
              extractedData: result,
              fileStorageId: storageId,
              date:          result.date   ?? new Date().toISOString().slice(0, 10),
              tags:          result.keyFindings?.slice(0, 3),
            });
          } catch (err) {
            console.error("Failed to save record:", err);
          }
        })();
      }
    } catch {
      toast("Analysis failed. Please try again.", "error");
      setMode("landing");
    }
  };

  const handleScanAnother = () => {
    setCapturedImage(null);
    setAnalysisResult(null);
    setMode("landing");
  };

  const showHeader = mode !== "camera" && mode !== "processing";

  return (
    <div style={{ minHeight: "100%", background: "#F0F7F4", display: "flex", flexDirection: "column" }}>
      {showHeader && (
        <div style={{ padding: "24px 20px 14px", flexShrink: 0 }}>
          <h1
            style={{
              fontFamily: H,
              fontWeight: 800,
              fontSize: "1.5rem",
              color: "#0B1F18",
              margin: 0,
              letterSpacing: "-0.01em",
            }}
          >
            Scan &amp; Digitize
          </h1>
          <p style={{ fontFamily: B, fontSize: "0.85rem", color: "#8EBAA3", margin: "4px 0 0" }}>
            AI-powered medical report analysis
          </p>
        </div>
      )}

      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <AnimatePresence mode="wait">

          {mode === "landing" && (
            <LandingView
              key="landing"
              onOpenCamera={() => setMode("camera")}
              onOpenUpload={() => setMode("upload")}
              recentRecords={recentScanned}
            />
          )}

          {mode === "camera" && (
            <motion.div
              key="camera"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.24 }}
              style={{ flex: 1, display: "flex", flexDirection: "column", padding: "0 16px 16px" }}
            >
              <div style={{ padding: "14px 0 10px" }}>
                <BackBtn onClick={() => setMode("landing")} />
              </div>
              <div style={{ flex: 1, borderRadius: 16, overflow: "hidden", display: "flex", flexDirection: "column" }}>
                <CameraCapture onCapture={handleImageReady} onFallback={() => setMode("upload")} />
              </div>
            </motion.div>
          )}

          {mode === "upload" && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.24 }}
            >
              <div style={{ padding: "0 20px 10px" }}>
                <BackBtn onClick={() => setMode("landing")} />
              </div>
              <UploadZone onFileReady={handleImageReady} />
            </motion.div>
          )}

          {mode === "processing" && (
            <motion.div
              key="processing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.32 }}
              style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: "calc(100vh - 64px)" }}
            >
              <ProcessingAnimation imageUrl={capturedImage} />
            </motion.div>
          )}

          {mode === "results" && analysisResult && (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              style={{ flex: 1 }}
            >
              <ScanResults
                result={analysisResult}
                imageUrl={capturedImage}
                onScanAnother={handleScanAnother}
              />
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
