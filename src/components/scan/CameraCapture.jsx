"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, CameraOff, RefreshCw, Zap, ZapOff } from "lucide-react";

const H = "var(--font-outfit, 'Outfit', sans-serif)";
const B = "var(--font-dm-sans, 'DM Sans', sans-serif)";

export default function CameraCapture({ onCapture, onFallback }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const [status, setStatus] = useState("requesting"); // requesting | active | captured | denied | unavailable
  const [capturedImage, setCapturedImage] = useState(null);
  const [facingMode, setFacingMode] = useState("environment");
  const [flashOn, setFlashOn] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const startCamera = useCallback(async (facing) => {
    // Stop any running stream first
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setStatus("requesting");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: facing }, width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
      setStatus("active");
      setErrorMessage("");
    } catch (err) {
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setStatus("denied");
        setErrorMessage(
          "Camera access was denied. Please allow camera permission in your browser settings, then try again."
        );
      } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
        setStatus("unavailable");
        setErrorMessage("No camera was found on this device.");
      } else {
        setStatus("unavailable");
        setErrorMessage("Unable to start camera. Please upload a photo instead.");
      }
    }
  }, []);

  useEffect(() => {
    if (typeof navigator !== "undefined" && navigator.mediaDevices?.getUserMedia) {
      startCamera("environment");
    } else {
      setStatus("unavailable");
      setErrorMessage("Camera is not supported on this browser. Please upload a file.");
    }
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const flipCamera = () => {
    const next = facingMode === "environment" ? "user" : "environment";
    setFacingMode(next);
    startCamera(next);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current || status !== "active") return;
    const video = videoRef.current;
    const canvas = canvasRef.current;

    let width = video.videoWidth || 1280;
    let height = video.videoHeight || 720;

    // Scale down if larger than 1600px to keep capture under 5 MB
    const MAX_DIM = 1600;
    if (width > MAX_DIM || height > MAX_DIM) {
      if (width >= height) { height = Math.round((height / width) * MAX_DIM); width = MAX_DIM; }
      else { width = Math.round((width / height) * MAX_DIM); height = MAX_DIM; }
    }

    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, width, height);

    // Start with 85% quality; re-encode at 75% if still over 5 MB (approx)
    let dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    const approxBytes = Math.round(dataUrl.length * 0.75);
    if (approxBytes > 5 * 1024 * 1024) {
      dataUrl = canvas.toDataURL("image/jpeg", 0.75);
    }

    // Stop stream to save battery
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCapturedImage(dataUrl);
    setStatus("captured");
  };

  const retake = () => {
    setCapturedImage(null);
    startCamera(facingMode);
  };

  // ── Error / Unavailable state ─────────────────────────────────────────────
  if (status === "denied" || status === "unavailable") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "48px 24px",
          gap: 16,
          textAlign: "center",
          minHeight: 360,
          background: "#fff",
          borderRadius: 16,
        }}
      >
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            background: "#FEF2F2",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CameraOff size={32} color="#E74C3C" />
        </div>
        <h3 style={{ fontFamily: H, fontWeight: 700, fontSize: "1.1rem", color: "#0B1F18", margin: 0 }}>
          Camera Access Needed
        </h3>
        <p
          style={{
            fontFamily: B,
            fontSize: "0.875rem",
            color: "#5A9A7E",
            margin: 0,
            lineHeight: 1.6,
            maxWidth: 280,
          }}
        >
          {errorMessage}
        </p>
        <button
          onClick={onFallback}
          style={{
            marginTop: 8,
            padding: "13px 32px",
            background: "linear-gradient(135deg, #0D6E4F, #00C9A7)",
            color: "#fff",
            border: "none",
            borderRadius: 12,
            fontFamily: B,
            fontWeight: 700,
            fontSize: "0.9rem",
            cursor: "pointer",
          }}
        >
          Upload a Photo Instead
        </button>
      </motion.div>
    );
  }

  // ── Captured preview state ────────────────────────────────────────────────
  if (status === "captured" && capturedImage) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{ display: "flex", flexDirection: "column", flex: 1 }}
      >
        {/* Preview */}
        <div
          style={{
            flex: 1,
            position: "relative",
            background: "#000",
            borderRadius: "16px 16px 0 0",
            overflow: "hidden",
            minHeight: 340,
          }}
        >
          <img
            src={capturedImage}
            alt="Captured report"
            style={{ width: "100%", height: "100%", objectFit: "contain" }}
          />
          {/* Flash effect */}
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            style={{ position: "absolute", inset: 0, background: "#fff", pointerEvents: "none" }}
          />
        </div>

        {/* Action bar */}
        <div
          style={{
            display: "flex",
            gap: 12,
            padding: "14px 16px",
            background: "#fff",
            borderTop: "1px solid #DCE8E2",
            borderRadius: "0 0 16px 16px",
          }}
        >
          <button
            onClick={retake}
            style={{
              flex: 1,
              padding: "13px",
              border: "1.5px solid #0D6E4F",
              borderRadius: 12,
              background: "#fff",
              color: "#0D6E4F",
              fontFamily: B,
              fontWeight: 600,
              fontSize: "0.875rem",
              cursor: "pointer",
            }}
          >
            Retake
          </button>
          <button
            onClick={() => onCapture(capturedImage)}
            style={{
              flex: 2,
              padding: "13px",
              border: "none",
              borderRadius: 12,
              background: "linear-gradient(135deg, #0D6E4F, #00C9A7)",
              color: "#fff",
              fontFamily: B,
              fontWeight: 700,
              fontSize: "0.875rem",
              cursor: "pointer",
            }}
          >
            Analyze Report →
          </button>
        </div>
      </motion.div>
    );
  }

  // ── Live viewfinder ───────────────────────────────────────────────────────
  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
      {/* Video area */}
      <div
        style={{
          flex: 1,
          position: "relative",
          background: "#000",
          borderRadius: "16px 16px 0 0",
          overflow: "hidden",
          minHeight: 340,
        }}
      >
        {/* Loading state */}
        <AnimatePresence>
          {status === "requesting" && (
            <motion.div
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 12,
                zIndex: 5,
              }}
            >
              <motion.div
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.4, repeat: Infinity }}
              >
                <Camera size={40} color="#fff" />
              </motion.div>
              <p style={{ color: "rgba(255,255,255,0.6)", fontFamily: B, fontSize: "0.85rem", margin: 0 }}>
                Starting camera...
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <video
          ref={videoRef}
          muted
          playsInline
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: status === "active" ? 1 : 0,
            transition: "opacity 0.3s ease",
          }}
        />

        {/* Corner guides */}
        {status === "active" && (
          <>
            {[
              { top: 20, left: 20, borderTop: "3px solid #00C9A7", borderLeft: "3px solid #00C9A7", borderRadius: "4px 0 0 0" },
              { top: 20, right: 20, borderTop: "3px solid #00C9A7", borderRight: "3px solid #00C9A7", borderRadius: "0 4px 0 0" },
              { bottom: 20, left: 20, borderBottom: "3px solid #00C9A7", borderLeft: "3px solid #00C9A7", borderRadius: "0 0 0 4px" },
              { bottom: 20, right: 20, borderBottom: "3px solid #00C9A7", borderRight: "3px solid #00C9A7", borderRadius: "0 0 4px 0" },
            ].map((s, i) => (
              <div key={i} style={{ position: "absolute", width: 28, height: 28, ...s }} />
            ))}
            <p
              style={{
                position: "absolute",
                bottom: 20,
                left: "50%",
                transform: "translateX(-50%)",
                fontFamily: B,
                fontSize: "0.72rem",
                color: "rgba(255,255,255,0.55)",
                margin: 0,
                letterSpacing: "0.04em",
                whiteSpace: "nowrap",
              }}
            >
              Point camera at medical report
            </p>
          </>
        )}

        {/* Top controls */}
        {status === "active" && (
          <div style={{ position: "absolute", top: 16, right: 16, display: "flex", gap: 8 }}>
            <button
              onClick={() => setFlashOn((f) => !f)}
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                border: "none",
                background: flashOn ? "#F39C12" : "rgba(0,0,0,0.45)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              {flashOn ? <Zap size={17} color="#fff" /> : <ZapOff size={17} color="#fff" />}
            </button>
            <button
              onClick={flipCamera}
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                border: "none",
                background: "rgba(0,0,0,0.45)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <RefreshCw size={17} color="#fff" />
            </button>
          </div>
        )}
      </div>

      {/* Bottom shutter bar */}
      <div
        style={{
          height: 92,
          background: "#0B1F18",
          borderRadius: "0 0 16px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 28px",
        }}
      >
        <button
          onClick={onFallback}
          style={{
            fontFamily: B,
            fontSize: "0.78rem",
            color: "rgba(255,255,255,0.5)",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "8px 4px",
            width: 60,
          }}
        >
          Upload instead
        </button>

        {/* Shutter */}
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={capturePhoto}
          disabled={status !== "active"}
          style={{
            width: 70,
            height: 70,
            borderRadius: "50%",
            border: "4px solid rgba(255,255,255,0.85)",
            background: "rgba(255,255,255,0.12)",
            cursor: status === "active" ? "pointer" : "not-allowed",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: 50,
              height: 50,
              borderRadius: "50%",
              background: status === "active" ? "#fff" : "rgba(255,255,255,0.35)",
              transition: "background 0.2s",
            }}
          />
        </motion.button>

        <div style={{ width: 60 }} />
      </div>

      <canvas ref={canvasRef} style={{ display: "none" }} />
    </div>
  );
}
