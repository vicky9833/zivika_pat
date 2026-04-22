"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Modal from "@/components/ui/Modal";
import { toast } from "@/components/ui/Toast";
import { useMedicationsStore } from "@/lib/stores/medications-store";

const H = "var(--font-outfit, 'Outfit', sans-serif)";
const B = "var(--font-dm-sans, 'DM Sans', sans-serif)";

const FREQUENCIES = [
  { id: "once", label: "Once daily" },
  { id: "twice", label: "Twice daily" },
  { id: "thrice", label: "Three times" },
  { id: "weekly", label: "Weekly" },
  { id: "asneeded", label: "As needed" },
];

const SCHEDULE_PRESETS = {
  once: ["Morning"],
  twice: ["Morning", "Night"],
  thrice: ["Morning", "Noon", "Night"],
  weekly: ["Sunday morning"],
  asneeded: ["As needed"],
};

const DEFAULT_FORM = {
  name: "",
  dosage: "",
  frequency: "twice",
  instructions: "",
  startDate: new Date().toISOString().slice(0, 10),
  endDate: "",
};

/**
 * AddMedication — bottom sheet form to add a new medication.
 * Props:
 *   open     — boolean
 *   onClose  — () => void
 *   onSave   — optional async (data) => void — Convex createMedication handler
 *              If not provided, saves to Zustand local store only.
 */
export default function AddMedication({ open, onClose, onSave }) {
  const addMedication = useMedicationsStore((s) => s.addMedication);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [saving, setSaving] = useState(false);

  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave() {
    if (!form.name.trim()) {
      toast("Please enter a medication name", "warning");
      return;
    }
    const schedules = SCHEDULE_PRESETS[form.frequency] || ["As needed"];
    setSaving(true);
    try {
      if (onSave) {
        // Save to Convex
        await onSave({
          name:      form.name.trim(),
          dosage:    form.dosage.trim() || "As prescribed",
          frequency: form.frequency,
          times:     schedules,
          condition: form.instructions.trim() || undefined,
          startDate: form.startDate,
          endDate:   form.endDate || undefined,
        });
      } else {
        // Fallback: Zustand only
        addMedication({
          name:        `${form.name.trim()}${form.dosage ? " " + form.dosage.trim() : ""}`,
          schedule:    schedules.join(" & "),
          time:        schedules[0],
          taken:       false,
          timeLabel:   "Today",
          isToday:     true,
          frequency:   form.frequency,
          instructions: form.instructions,
          startDate:   form.startDate,
          endDate:     form.endDate,
        });
      }
      toast(`${form.name.trim()} added to your medications`, "success");
      setForm(DEFAULT_FORM);
      onClose();
    } catch {
      toast("Failed to save medication. Please try again.", "error");
    } finally {
      setSaving(false);
    }
  }

  const inputStyle = {
    width: "100%",
    padding: "10px 14px",
    border: "1.5px solid #DCE8E2",
    borderRadius: 10,
    fontFamily: B,
    fontSize: "0.875rem",
    color: "#0B1F18",
    background: "#fff",
    outline: "none",
    boxSizing: "border-box",
  };

  const labelStyle = {
    fontFamily: B,
    fontWeight: 600,
    fontSize: "0.78rem",
    color: "#5A7A6E",
    marginBottom: 6,
    display: "block",
  };

  return (
    <Modal open={open} onClose={onClose} title="Add Medication">
      <div
        style={{
          padding: "0 20px 16px",
          display: "flex",
          flexDirection: "column",
          gap: 16,
          maxHeight: "70vh",
          overflowY: "auto",
        }}
      >
        {/* Name */}
        <div>
          <label style={labelStyle}>Medication Name *</label>
          <input
            style={inputStyle}
            placeholder="e.g. Metformin"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
          />
        </div>

        {/* Dosage */}
        <div>
          <label style={labelStyle}>Dosage</label>
          <input
            style={inputStyle}
            placeholder="e.g. 500mg"
            value={form.dosage}
            onChange={(e) => set("dosage", e.target.value)}
          />
        </div>

        {/* Frequency */}
        <div>
          <label style={labelStyle}>Frequency</label>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {FREQUENCIES.map((f) => (
              <button
                key={f.id}
                onClick={() => set("frequency", f.id)}
                style={{
                  padding: "7px 13px",
                  borderRadius: 20,
                  border: form.frequency === f.id ? "none" : "1.5px solid #DCE8E2",
                  background:
                    form.frequency === f.id
                      ? "linear-gradient(135deg, #0D6E4F, #00C9A7)"
                      : "#fff",
                  color: form.frequency === f.id ? "#fff" : "#5A7A6E",
                  fontFamily: B,
                  fontWeight: 600,
                  fontSize: "0.75rem",
                  cursor: "pointer",
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
          {form.frequency && (
            <p style={{ fontFamily: B, fontSize: "0.72rem", color: "#8EBAA3", marginTop: 6 }}>
              Schedule: {SCHEDULE_PRESETS[form.frequency]?.join(" · ")}
            </p>
          )}
        </div>

        {/* Instructions */}
        <div>
          <label style={labelStyle}>Special Instructions (optional)</label>
          <textarea
            style={{ ...inputStyle, resize: "none", height: 72 }}
            placeholder="e.g. Take after meals"
            value={form.instructions}
            onChange={(e) => set("instructions", e.target.value)}
          />
        </div>

        {/* Dates */}
        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <label style={labelStyle}>Start Date</label>
            <input
              type="date"
              style={inputStyle}
              value={form.startDate}
              onChange={(e) => set("startDate", e.target.value)}
            />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <label style={labelStyle}>End Date (optional)</label>
            <input
              type="date"
              style={inputStyle}
              value={form.endDate}
              onChange={(e) => set("endDate", e.target.value)}
            />
          </div>
        </div>

        {/* Save button */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleSave}
          disabled={saving}
          style={{
            padding: "14px",
            border: "none",
            borderRadius: 12,
            background: saving
              ? "#DCE8E2"
              : "linear-gradient(135deg, #0D6E4F, #00C9A7)",
            color: saving ? "#8EBAA3" : "#fff",
            fontFamily: B,
            fontWeight: 700,
            fontSize: "0.9rem",
            cursor: saving ? "not-allowed" : "pointer",
          }}
        >
          {saving ? "Saving…" : "Save Medication"}
        </motion.button>
      </div>
    </Modal>
  );
}
