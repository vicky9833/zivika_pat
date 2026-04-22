"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUserStore, LANGUAGES } from "@/lib/stores/user-store";
import { useConvexUser } from "@/lib/hooks/useConvexUser";
import { toast } from "@/components/ui/Toast";
import Modal from "@/components/ui/Modal";
import { ShieldCheck, KeyRound, Upload, Globe, Bell, Moon, Lock, Smartphone } from "lucide-react";

const H = "var(--font-outfit, 'Outfit', sans-serif)";
const B = "var(--font-dm-sans, 'DM Sans', sans-serif)";

// ─── Toggle Switch Component ──────────────────────────────────────────────────
function Toggle({ value, onChange }) {
  return (
    <motion.button
      onClick={() => onChange(!value)}
      style={{
        width: 46,
        height: 26,
        borderRadius: 13,
        background: value ? "linear-gradient(135deg, #0D6E4F, #00C9A7)" : "#DCE8E2",
        border: "none",
        cursor: "pointer",
        position: "relative",
        padding: 0,
        flexShrink: 0,
      }}
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        animate={{ x: value ? 22 : 2 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        style={{
          position: "absolute",
          top: 3,
          width: 20,
          height: 20,
          borderRadius: "50%",
          background: "#fff",
          boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
        }}
      />
    </motion.button>
  );
}

// ─── Setting Row ──────────────────────────────────────────────────────────────
function SettingRow({ icon, label, sublabel, right, onClick, danger }) {
  function handleKeyDown(e) {
    if (onClick && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      onClick();
    }
  }

  return (
    <div
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "14px 18px",
        background: "transparent",
        cursor: onClick ? "pointer" : "default",
        textAlign: "left",
        userSelect: "none",
      }}
    >
      <span style={{ width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontFamily: B, fontWeight: 600, fontSize: "0.88rem", color: danger ? "#EF4444" : "#0B1F18", margin: 0 }}>{label}</p>
        {sublabel && <p style={{ fontFamily: B, fontSize: "0.75rem", color: "#8EBAA3", margin: "2px 0 0" }}>{sublabel}</p>}
      </div>
      {right}
    </div>
  );
}

// ─── Delete confirmation modal ────────────────────────────────────────────────
function DeleteModal({ open, onClose, onConfirm }) {
  return (
    <Modal open={open} onClose={onClose} title="Delete All Data">
      <div style={{ padding: "0 20px 20px" }}>
        <p style={{ fontFamily: B, fontSize: "0.875rem", color: "#5A7A6E", margin: "0 0 20px" }}>
          This will permanently delete all your health records, medications, and vitals. This action cannot be undone.
        </p>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: "12px",
              borderRadius: 12,
              border: "1.5px solid #DCE8E2",
              background: "#fff",
              fontFamily: B,
              fontWeight: 700,
              fontSize: "0.875rem",
              color: "#5A7A6E",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={onConfirm}
            style={{
              flex: 1,
              padding: "12px",
              borderRadius: 12,
              border: "none",
              background: "#EF4444",
              fontFamily: B,
              fontWeight: 700,
              fontSize: "0.875rem",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            Delete All
          </motion.button>
        </div>
      </div>
    </Modal>
  );
}

// ─── Language Sheet ───────────────────────────────────────────────────────────
function LanguageSheet({ open, onClose, currentCode, onSelect }) {
  return (
    <Modal open={open} onClose={onClose} title="Select Language">
      <div style={{ padding: "0 20px 20px", display: "flex", flexDirection: "column", gap: 4 }}>
        {LANGUAGES.map((lang) => (
          <button
            key={lang.code}
            onClick={() => { onSelect(lang.code); onClose(); }}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "13px 16px",
              borderRadius: 12,
              border: "1.5px solid",
              borderColor: lang.code === currentCode ? "#00C9A7" : "#DCE8E2",
              background: lang.code === currentCode ? "rgba(0,201,167,0.07)" : "#fff",
              cursor: "pointer",
              fontFamily: B,
              fontWeight: lang.code === currentCode ? 700 : 500,
              fontSize: "0.875rem",
              color: lang.code === currentCode ? "#0D6E4F" : "#0B1F18",
              textAlign: "left",
            }}
          >
            {lang.label}
            {lang.code === currentCode && (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0D6E4F" strokeWidth="2.5" strokeLinecap="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </button>
        ))}
      </div>
    </Modal>
  );
}

// ─── Privacy Section ─────────────────────────────────────────────────────────
function PrivacySection({ user }) {
  const setBiometricLock = useUserStore((s) => s.setBiometricLock);

  return (
    <div style={{ padding: "12px 0" }}>
      {/* Encrypted row */}
      <div
        style={{
          margin: "0 18px 12px",
          display: "flex",
          gap: 12,
          alignItems: "center",
          padding: "12px 14px",
          borderRadius: 12,
          background: "rgba(13,110,79,0.06)",
          border: "1px solid rgba(13,110,79,0.15)",
        }}
      >
        <ShieldCheck size={16} color="#0D6E4F" />
        <p style={{ fontFamily: B, fontSize: "0.78rem", color: "#0D6E4F", fontWeight: 600, margin: 0 }}>
          All your data is encrypted end-to-end
        </p>
      </div>

      <SettingRow
        icon={<KeyRound size={18} color="#5A7A6E" />}
        label="Biometric Lock"
        sublabel="Face ID or fingerprint"
        right={<Toggle value={user.biometricLock} onChange={(v) => { setBiometricLock(v); toast(v ? "Biometric lock enabled" : "Biometric lock disabled", "info"); }} />}
      />

      <div style={{ height: 1, background: "#DCE8E2", margin: "0 18px" }} />

      <SettingRow
        icon={<Upload size={18} color="#5A7A6E" />}
        label="Export My Data"
        sublabel="Download all health records"
        onClick={() => toast("Preparing your health data export...", "info")}
        right={<ChevronRight />}
      />

      <div style={{ height: 1, background: "#DCE8E2", margin: "0 18px" }} />

      <SettingRow
        icon={<Trash2 size={18} color="#EF4444" />}
        label="Delete All Data"
        danger
        onClick={() => {
          // Trigger from parent via state
          window.__zivikaDeleteTrigger?.();
        }}
        right={<ChevronRight color="#EF4444" />}
      />
    </div>
  );
}

// ─── About Section ────────────────────────────────────────────────────────────
function AboutSection() {
  return (
    <div style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span style={{ fontFamily: B, fontSize: "0.82rem", color: "#8EBAA3" }}>Version</span>
        <span style={{ fontFamily: B, fontWeight: 600, fontSize: "0.82rem", color: "#0B1F18" }}>v1.0.0</span>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span style={{ fontFamily: B, fontSize: "0.82rem", color: "#8EBAA3" }}>Website</span>
        <span style={{ fontFamily: B, fontWeight: 600, fontSize: "0.82rem", color: "#0D6E4F" }}>www.zivikalabs.com</span>
      </div>
      <div style={{ textAlign: "center", paddingTop: 8 }}>
        <p style={{ fontFamily: B, fontSize: "0.82rem", color: "#8EBAA3", margin: 0 }}>Made with ❤️ in India</p>
        <p style={{ fontFamily: B, fontWeight: 700, fontSize: "0.78rem", color: "#0D6E4F", margin: "4px 0 0" }}>
          India&apos;s intelligent health OS
        </p>
      </div>
    </div>
  );
}

// ─── Main AppSettings Component ───────────────────────────────────────────────

export default function AppSettings({ user }) {
  const setLanguage = useUserStore((s) => s.setLanguage);
  const setNotifications = useUserStore((s) => s.setNotifications);
  const setDarkMode = useUserStore((s) => s.setDarkMode);
  const { updateProfile } = useConvexUser();

  const [langOpen, setLangOpen] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  // Bridge delete trigger from PrivacySection
  if (typeof window !== "undefined") {
    window.__zivikaDeleteTrigger = () => setDeleteOpen(true);
  }

  const currentLangLabel = LANGUAGES.find((l) => l.code === user.preferredLanguage)?.label || "English";

  function handleDelete() {
    setDeleteOpen(false);
    toast("All data deleted", "error");
  }

  return (
    <div>
      <div
        style={{
          background: "#fff",
          border: "1px solid #DCE8E2",
          borderRadius: 16,
          overflow: "hidden",
        }}
      >
        <div style={{ padding: "16px 18px", borderBottom: "1px solid #DCE8E2" }}>
          <h2 style={{ fontFamily: H, fontWeight: 700, fontSize: "0.95rem", color: "#0B1F18", margin: 0 }}>Settings</h2>
        </div>

        <SettingRow
          icon={<Globe size={18} color="#5A7A6E" />}
          label="Language"
          sublabel={currentLangLabel}
          onClick={() => setLangOpen(true)}
          right={<ChevronRight />}
        />

        <div style={{ height: 1, background: "#DCE8E2", margin: "0 18px" }} />

        <SettingRow
          icon={<Bell size={18} color="#5A7A6E" />}
          label="Notifications"
          right={<Toggle value={user.notifications} onChange={(v) => { setNotifications(v); }} />}
        />

        <div style={{ height: 1, background: "#DCE8E2", margin: "0 18px" }} />

        <SettingRow
          icon={<Moon size={18} color="#5A7A6E" />}
          label="Dark Mode"
          sublabel="Coming soon"
          right={<Toggle value={user.darkMode} onChange={(v) => { setDarkMode(v); toast("Dark mode coming soon!", "info"); }} />}
        />

        <div style={{ height: 1, background: "#DCE8E2", margin: "0 18px" }} />

        {/* Privacy expandable */}
        <SettingRow
          icon={<Lock size={18} color="#5A7A6E" />}
          label="Privacy & Security"
          onClick={() => setPrivacyOpen((o) => !o)}
          right={
            <motion.div animate={{ rotate: privacyOpen ? 90 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronRight />
            </motion.div>
          }
        />

        <AnimatePresence>
          {privacyOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              style={{ overflow: "hidden", borderTop: "1px solid #DCE8E2" }}
            >
              <PrivacySection user={user} />
            </motion.div>
          )}
        </AnimatePresence>

        <div style={{ height: 1, background: "#DCE8E2", margin: "0 18px" }} />

        {/* About expandable */}
        <SettingRow
          icon={<Smartphone size={18} color="#5A7A6E" />}
          label="About Zivika Labs"
          onClick={() => setAboutOpen((o) => !o)}
          right={
            <motion.div animate={{ rotate: aboutOpen ? 90 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronRight />
            </motion.div>
          }
        />

        <AnimatePresence>
          {aboutOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              style={{ overflow: "hidden", borderTop: "1px solid #DCE8E2" }}
            >
              <AboutSection />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <LanguageSheet
        open={langOpen}
        onClose={() => setLangOpen(false)}
        currentCode={user.preferredLanguage}
        onSelect={(code) => {
          setLanguage(code);
          updateProfile({ nativeLanguage: code }).catch(console.error);
          const label = LANGUAGES.find((l) => l.code === code)?.label;
          toast(`Language set to ${label}`, "success");
        }}
      />

      <DeleteModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
}

function ChevronRight({ color = "#B8D4C5" }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" style={{ flexShrink: 0 }}>
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}
