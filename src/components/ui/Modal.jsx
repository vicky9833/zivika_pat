"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

export default function Modal({ open, onClose, title, children }) {
  return (
    <AnimatePresence>
      {open && (
        /* Overlay acts as BOTH backdrop AND flex container for the sheet.
           Constrained to 390px so it stays inside the phone frame on desktop. */
        <motion.div
          key="overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          style={{
            position: "fixed",
            top: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: "100%",
            maxWidth: 390,
            height: "100dvh",
            zIndex: 100,
            backgroundColor: "rgba(11,31,24,0.5)",
            backdropFilter: "blur(2px)",
            display: "flex",
            alignItems: "flex-end",
          }}
        >
          {/* Bottom sheet */}
          <motion.div
            key="sheet"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 260 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 390,
              zIndex: 110,
              backgroundColor: "#FFFFFF",
              borderRadius: "20px 20px 0 0",
              padding: "0 0 32px",
            }}
          >
            {/* Drag handle */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                paddingTop: 12,
                paddingBottom: 8,
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: "#DCE8E2",
                }}
              />
            </div>
            {/* Header */}
            {title && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "8px 20px 16px",
                  borderBottom: "1px solid #DCE8E2",
                }}
              >
                <span
                  style={{
                    fontFamily: "'Outfit', sans-serif",
                    fontWeight: 600,
                    fontSize: "1.125rem",
                    color: "#0B1F18",
                  }}
                >
                  {title}
                </span>
                <button
                  onClick={onClose}
                  style={{
                    background: "#F0F7F4",
                    border: "none",
                    borderRadius: "50%",
                    width: 32,
                    height: 32,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    color: "#5A9A7E",
                  }}
                >
                  <X size={16} />
                </button>
              </div>
            )}
            {/* Content */}
            <div style={{ padding: "16px 20px 0" }}>{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
