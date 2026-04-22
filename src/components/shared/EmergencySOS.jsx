"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, Shield, AlertTriangle, X, MapPin, UserPlus } from "lucide-react";
import { toast } from "@/components/ui/Toast";
import { useUserStore } from "@/lib/stores/user-store";

const H = "var(--font-outfit, 'Outfit', sans-serif)";
const B = "var(--font-dm-sans, 'DM Sans', sans-serif)";

export default function EmergencySOS({ isOpen, onClose, emergencyContact }) {
  const router = useRouter();
  const storeUser = useUserStore((s) => s.user);
  const [countdown, setCountdown] = useState(5);
  const [fired, setFired] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      setCountdown(5);
      setFired(false);
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(timerRef.current);
          setFired(true);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [isOpen]);

  // Derive contact: prop > store fields > null
  const contact = emergencyContact
    || (storeUser?.emergencyContactName
        ? { name: storeUser.emergencyContactName, phone: storeUser.emergencyContactPhone || "" }
        : null);
  const hasContact = !!(contact?.name && contact?.phone);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="sos-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: "fixed", top: 0, left: "50%", transform: "translateX(-50%)",
            width: "100%", maxWidth: 390, height: "100dvh",
            zIndex: 9999,
            background: "rgba(185,28,28,0.97)",
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            padding: "24px 28px",
            boxSizing: "border-box",
          }}
        >
          {/* Cancel button */}
          <button
            onClick={onClose}
            style={{
              position: "absolute", top: 20, right: 20,
              width: 40, height: 40, borderRadius: 20,
              background: "rgba(255,255,255,0.15)",
              border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <X size={20} color="#fff" />
          </button>

          {/* Icon */}
          <motion.div
            animate={{ scale: [1, 1.12, 1] }}
            transition={{ repeat: Infinity, duration: 0.9, ease: "easeInOut" }}
            style={{
              width: 96, height: 96, borderRadius: 48,
              background: "rgba(255,255,255,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center",
              marginBottom: 24,
            }}
          >
            <AlertTriangle size={48} color="#fff" />
          </motion.div>

          {fired ? (
            <motion.p
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              style={{ fontFamily: H, fontWeight: 900, fontSize: "2rem", color: "#fff", textAlign: "center", margin: "0 0 16px" }}
            >
              SOS Sent!
            </motion.p>
          ) : (
            <>
              <p style={{ fontFamily: H, fontWeight: 900, fontSize: "1.6rem", color: "#fff", textAlign: "center", margin: "0 0 6px" }}>
                SOS Alert in
              </p>
              <motion.p
                key={countdown}
                initial={{ scale: 1.4, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                style={{
                  fontFamily: H, fontWeight: 900, fontSize: "4rem",
                  color: "#fff", margin: "0 0 16px", lineHeight: 1,
                }}
              >
                {countdown}
              </motion.p>
            </>
          )}

          <p style={{ fontFamily: B, fontWeight: 400, fontSize: "0.88rem", color: "rgba(255,255,255,0.75)", textAlign: "center", margin: "0 0 32px" }}>
            {fired
              ? hasContact ? `Your location has been shared with ${contact.name}` : "Emergency services have been alerted"
              : hasContact ? `Will alert ${contact.name} and share your location` : "Will alert emergency services and share your location"}
          </p>

          {/* Contacts */}
          <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
            <a
              href="tel:108"
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                padding: "15px", borderRadius: 14,
                background: "rgba(255,255,255,0.18)", textDecoration: "none",
              }}
            >
              <Phone size={18} color="#fff" />
              <span style={{ fontFamily: H, fontWeight: 700, fontSize: "0.95rem", color: "#fff" }}>
                Call 108 — Ambulance
              </span>
            </a>
            <a
              href="tel:112"
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                padding: "15px", borderRadius: 14,
                background: "rgba(255,255,255,0.18)", textDecoration: "none",
              }}
            >
              <Phone size={18} color="#fff" />
              <span style={{ fontFamily: H, fontWeight: 700, fontSize: "0.95rem", color: "#fff" }}>
                Call 112 — Emergency Services
              </span>
            </a>
            {hasContact ? (
              <a
                href={`tel:${contact.phone.replace(/\s/g, "")}`}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                  padding: "15px", borderRadius: 14,
                  background: "rgba(255,255,255,0.18)", textDecoration: "none",
                }}
              >
                <Phone size={18} color="#fff" />
                <span style={{ fontFamily: H, fontWeight: 700, fontSize: "0.95rem", color: "#fff" }}>
                  Call {contact.name}
                </span>
              </a>
            ) : (
              <button
                onClick={() => { onClose(); router.push("/dashboard/profile"); }}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                  padding: "14px", borderRadius: 14,
                  background: "rgba(255,255,255,0.1)",
                  border: "1.5px dashed rgba(255,255,255,0.4)",
                  color: "rgba(255,255,255,0.75)",
                  fontFamily: B, fontWeight: 600, fontSize: "0.875rem", cursor: "pointer",
                }}
              >
                <UserPlus size={16} color="rgba(255,255,255,0.75)" />
                Add emergency contact in Profile
              </button>
            )}
          </div>

          {/* Share Location */}
          <button
            onClick={() => toast("Location shared with emergency contacts", "success")}
            style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "12px 24px", borderRadius: 12,
              background: "rgba(255,255,255,0.12)", border: "1.5px solid rgba(255,255,255,0.3)",
              color: "#fff", fontFamily: B, fontWeight: 600, fontSize: "0.88rem",
              cursor: "pointer", marginBottom: 20,
            }}
          >
            <MapPin size={16} color="#fff" />
            Share My Location Now
          </button>

          {!fired && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              style={{
                padding: "12px 32px", borderRadius: 12,
                background: "rgba(255,255,255,0.2)",
                border: "2px solid rgba(255,255,255,0.5)",
                color: "#fff", fontFamily: H, fontWeight: 700,
                fontSize: "1rem", cursor: "pointer",
              }}
            >
              Cancel — I&apos;m Safe
            </motion.button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
