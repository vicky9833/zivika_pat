"use client";

import { create } from "zustand";
import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCircle,
  XCircle,
  Info,
  AlertTriangle,
  X,
} from "lucide-react";

/* ─── Zustand store ─────────────────────────────────────── */
let toastId = 0;

export const useToastStore = create((set) => ({
  toasts: [],
  addToast: (message, variant = "success") => {
    const id = ++toastId;
    set((state) => ({
      toasts: [...state.toasts, { id, message, variant }],
    }));
    return id;
  },
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}));

/* Convenience helper usable from any component */
export function toast(message, variant = "success") {
  return useToastStore.getState().addToast(message, variant);
}

/* ─── Variant config ─────────────────────────────────────── */
const variantConfig = {
  success: {
    icon: CheckCircle,
    bg: "#F0FDF4",
    border: "#27AE60",
    color: "#166534",
  },
  error: {
    icon: XCircle,
    bg: "#FEF2F2",
    border: "#E74C3C",
    color: "#991B1B",
  },
  info: {
    icon: Info,
    bg: "#EFF6FF",
    border: "#2980B9",
    color: "#1E40AF",
  },
  warning: {
    icon: AlertTriangle,
    bg: "#FFFBEB",
    border: "#F39C12",
    color: "#92400E",
  },
};

/* ─── Single toast item ─────────────────────────────────── */
function ToastItem({ id, message, variant }) {
  const removeToast = useToastStore((s) => s.removeToast);
  const cfg = variantConfig[variant] ?? variantConfig.success;
  const Icon = cfg.icon;

  useEffect(() => {
    const timer = setTimeout(() => removeToast(id), 3000);
    return () => clearTimeout(timer);
  }, [id, removeToast]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -12, scale: 0.96 }}
      transition={{ type: "spring", damping: 22, stiffness: 280 }}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        backgroundColor: cfg.bg,
        border: `1.5px solid ${cfg.border}`,
        borderRadius: 12,
        padding: "12px 14px",
        boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
        minWidth: 240,
        maxWidth: 380,
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <Icon size={18} color={cfg.border} style={{ flexShrink: 0 }} />
      <span style={{ fontSize: 14, fontWeight: 500, color: cfg.color, flex: 1 }}>
        {message}
      </span>
      <button
        onClick={() => removeToast(id)}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          color: cfg.color,
          opacity: 0.6,
          display: "flex",
          alignItems: "center",
          padding: 0,
        }}
      >
        <X size={14} />
      </button>
    </motion.div>
  );
}

/* ─── Toast container (render in layout or page) ─────────── */
export default function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts);

  return (
    <div
      style={{
        position: "fixed",
        top: 16,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        gap: 8,
        alignItems: "center",
        pointerEvents: "none",
        width: "100%",
        maxWidth: 390,
        padding: "0 16px",
      }}
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((t) => (
          <div key={t.id} style={{ pointerEvents: "auto", width: "100%" }}>
            <ToastItem {...t} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}
