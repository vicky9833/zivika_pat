"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Upload, FileText, ImageIcon, X, RefreshCw, Info } from "lucide-react";

const H = "var(--font-outfit, 'Outfit', sans-serif)";
const B = "var(--font-dm-sans, 'DM Sans', sans-serif)";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;  // 5 MB
const MAX_PDF_SIZE   = 10 * 1024 * 1024; // 10 MB
const MAX_DIMENSION  = 1600;             // px — max width/height after compression

function formatBytes(bytes) {
  return bytes < 1024 * 1024
    ? `${(bytes / 1024).toFixed(0)} KB`
    : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Compress an image DataURL using Canvas API.
 * Scales down to MAX_DIMENSION × MAX_DIMENSION if larger, then re-encodes at 85% JPEG.
 */
function compressImageDataUrl(dataUrl, originalSize) {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload = () => {
      let { width, height } = img;
      if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
        if (width >= height) { height = Math.round((height / width) * MAX_DIMENSION); width = MAX_DIMENSION; }
        else { width = Math.round((width / height) * MAX_DIMENSION); height = MAX_DIMENSION; }
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);
      const compressed = canvas.toDataURL("image/jpeg", 0.85);
      // Estimate compressed bytes: base64 chars * 0.75
      const compressedBytes = Math.round(compressed.length * 0.75);
      resolve({ dataUrl: compressed, compressedBytes });
    };
    img.src = dataUrl;
  });
}

export default function UploadZone({ onFileReady }) {
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(null); // { type, dataUrl, name, size, originalSize }
  const [dragging, setDragging] = useState(false);
  const [sizeError, setSizeError] = useState(""); // error message string
  const [compressing, setCompressing] = useState(false);

  const processFile = async (file) => {
    if (!file) return;
    setSizeError("");

    const isPdf = file.type === "application/pdf";
    const isImage = file.type.startsWith("image/");
    if (!isPdf && !isImage) return;

    // PDF: hard size limit, no compression
    if (isPdf) {
      if (file.size > MAX_PDF_SIZE) {
        setSizeError(`PDF too large (${formatBytes(file.size)}). Max allowed: 10 MB.`);
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview({ type: "pdf", dataUrl: e.target.result, name: file.name, size: formatBytes(file.size) });
      };
      reader.readAsDataURL(file);
      return;
    }

    // Image: compress if over 5 MB
    const reader = new FileReader();
    reader.onload = async (e) => {
      const originalDataUrl = e.target.result;
      if (file.size > MAX_IMAGE_SIZE) {
        setCompressing(true);
        const { dataUrl: compressedDataUrl, compressedBytes } = await compressImageDataUrl(originalDataUrl, file.size);
        setCompressing(false);
        setPreview({
          type: "image",
          dataUrl: compressedDataUrl,
          name: file.name,
          size: formatBytes(compressedBytes),
          originalSize: formatBytes(file.size),
        });
      } else {
        setPreview({
          type: "image",
          dataUrl: originalDataUrl,
          name: file.name,
          size: formatBytes(file.size),
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleInputChange = (e) => processFile(e.target.files?.[0]);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    processFile(e.dataTransfer.files?.[0]);
  };

  const clear = () => {
    setPreview(null);
    setSizeError("");
    setCompressing(false);
    if (inputRef.current) inputRef.current.value = "";
  };

  // ── Preview state ──────────────────────────────────────────────────────────
  if (preview) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ padding: "0 20px" }}
      >
        <div
          style={{
            border: "1.5px solid #DCE8E2",
            borderRadius: 16,
            overflow: "hidden",
            background: "#fff",
          }}
        >
          {preview.type === "image" ? (
            <img
              src={preview.dataUrl}
              alt="Selected file preview"
              style={{ width: "100%", maxHeight: 280, objectFit: "contain", background: "#F0F7F4", display: "block" }}
            />
          ) : (
            <div
              style={{
                height: 148,
                background: "#F0F7F4",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
              }}
            >
              <FileText size={44} color="#0D6E4F" />
              <span style={{ fontFamily: B, fontSize: "0.78rem", color: "#5A9A7E", textAlign: "center", padding: "0 20px" }}>
                {preview.name}
              </span>
            </div>
          )}

          <div
            style={{
              padding: "12px 16px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderTop: "1px solid #DCE8E2",
            }}
          >
            <div>
              <p style={{ fontFamily: B, fontWeight: 600, fontSize: "0.85rem", color: "#0B1F18", margin: 0, maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {preview.name}
              </p>
              <p style={{ fontFamily: B, fontSize: "0.75rem", color: preview.originalSize ? "#0D6E4F" : "#8EBAA3", margin: 0 }}>
                {preview.originalSize ? `${preview.originalSize} → ${preview.size}` : preview.size}
              </p>
            </div>
            <button
              onClick={clear}
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                border: "1px solid #DCE8E2",
                background: "#fff",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <X size={14} color="#5A9A7E" />
            </button>
          </div>
        </div>

        <div style={{ display: "flex", gap: 12, marginTop: 14 }}>
          <button
            onClick={clear}
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
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
            }}
          >
            <RefreshCw size={14} />
            Change
          </button>
          <button
            onClick={() => onFileReady(preview.dataUrl)}
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

  // ── Drop zone ──────────────────────────────────────────────────────────────
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ padding: "0 20px" }}
    >
      <div
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onClick={() => inputRef.current?.click()}
        style={{
          border: `2px dashed ${dragging ? "#0D6E4F" : sizeError ? "#E74C3C" : "#B8D4C5"}`,
          borderRadius: 16,
          background: dragging
            ? "rgba(13,110,79,0.04)"
            : sizeError
              ? "rgba(231,76,60,0.03)"
              : "#FAFCFB",
          padding: "44px 24px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 12,
          cursor: "pointer",
          transition: "all 0.18s ease",
          userSelect: "none",
        }}
      >
        <motion.div
          animate={{ y: dragging ? -5 : 0 }}
          transition={{ type: "spring", stiffness: 300 }}
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            background: sizeError
              ? "rgba(231,76,60,0.1)"
              : "linear-gradient(135deg, rgba(13,110,79,0.1), rgba(0,201,167,0.1))",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Upload size={28} color={sizeError ? "#E74C3C" : "#0D6E4F"} />
        </motion.div>

        <div style={{ textAlign: "center" }}>
          {compressing ? (
            <p style={{ fontFamily: H, fontWeight: 700, fontSize: "1rem", color: "#0D6E4F", margin: 0, marginBottom: 4 }}>
              Compressing image…
            </p>
          ) : sizeError ? (
            <p style={{ fontFamily: H, fontWeight: 700, fontSize: "1rem", color: "#E74C3C", margin: 0, marginBottom: 4 }}>
              File too large
            </p>
          ) : (
            <p style={{ fontFamily: H, fontWeight: 700, fontSize: "1rem", color: "#0B1F18", margin: 0, marginBottom: 4 }}>
              {dragging ? "Drop it here" : "Tap to select a file"}
            </p>
          )}
          <p style={{ fontFamily: B, fontSize: "0.8rem", color: sizeError ? "#E74C3C" : "#8EBAA3", margin: 0 }}>
            {sizeError || (compressing ? "Optimising for upload…" : "JPG, PNG, HEIC, or PDF")}
          </p>
        </div>

        {!sizeError && !compressing && (
          <>
            <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
              {[{ icon: ImageIcon, label: "Photo" }, { icon: FileText, label: "PDF" }].map(({ icon: Icon, label }) => (
                <span
                  key={label}
                  style={{
                    padding: "4px 12px",
                    background: "rgba(13,110,79,0.08)",
                    borderRadius: 20,
                    fontSize: "0.75rem",
                    fontFamily: B,
                    color: "#0D6E4F",
                    fontWeight: 500,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <Icon size={11} />{label}
                </span>
              ))}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
              <Info size={11} color="#B8D4C5" />
              <span style={{ fontFamily: B, fontSize: "0.7rem", color: "#B8D4C5" }}>
                Max: 5 MB images · 10 MB PDFs
              </span>
            </div>
          </>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*,.pdf,image/heic,image/heif"
        style={{ display: "none" }}
        onChange={handleInputChange}
      />
    </motion.div>
  );
}
