"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Modal from "@/components/ui/Modal";
import { useFamilyStore, RELATION_OPTIONS } from "@/lib/stores/family-store";
import { toast } from "@/components/ui/Toast";

const H = "var(--font-outfit, 'Outfit', sans-serif)";
const B = "var(--font-dm-sans, 'DM Sans', sans-serif)";

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
  WebkitAppearance: "none",
};

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];
const GENDERS = ["Male", "Female", "Other"];

function getInitials(name) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const EMPTY_FORM = {
  name: "",
  relation: "Mother",
  dob: "",
  gender: "Female",
  bloodGroup: "O+",
  phone: "",
};

/**
 * AddFamilyMember — bottom sheet form to add a new family member.
 * Props: open, onClose
 */
export default function AddFamilyMember({ open, onClose, onSave }) {
  const addMember = useFamilyStore((s) => s.addMember);
  const [form, setForm] = useState({ ...EMPTY_FORM });

  function handleAdd() {
    if (!form.name.trim()) {
      toast("Name is required", "warning");
      return;
    }
    const age = form.dob
      ? Math.floor((new Date() - new Date(form.dob)) / (365.25 * 24 * 3600 * 1000))
      : null;

    const memberData = {
      name: form.name.trim(),
      initials: getInitials(form.name),
      relation: form.relation,
      dob: form.dob,
      age: age,
      gender: form.gender,
      bloodGroup: form.bloodGroup,
      phone: form.phone,
    };
    addMember(memberData);
    onSave?.(memberData).catch(console.error);
    toast(`${form.name} added to family`, "success");
    setForm({ ...EMPTY_FORM });
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title="Add Family Member">
      <div style={{ padding: "0 20px 16px", display: "flex", flexDirection: "column", gap: 14 }}>

        {/* Name */}
        <div>
          <p style={{ fontFamily: B, fontWeight: 600, fontSize: "0.78rem", color: "#5A7A6E", margin: "0 0 6px" }}>
            Full Name *
          </p>
          <input
            type="text"
            style={inputStyle}
            placeholder="e.g. Priya Vishwakarma"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
        </div>

        {/* Relation */}
        <div>
          <p style={{ fontFamily: B, fontWeight: 600, fontSize: "0.78rem", color: "#5A7A6E", margin: "0 0 6px" }}>
            Relation
          </p>
          <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
            {RELATION_OPTIONS.map((r) => (
              <button
                key={r}
                onClick={() => setForm((f) => ({ ...f, relation: r }))}
                style={{
                  padding: "6px 12px",
                  borderRadius: 18,
                  border: form.relation === r ? "none" : "1.5px solid #DCE8E2",
                  background: form.relation === r ? "linear-gradient(135deg, #0D6E4F, #00C9A7)" : "#fff",
                  color: form.relation === r ? "#fff" : "#5A7A6E",
                  fontFamily: B,
                  fontWeight: 600,
                  fontSize: "0.75rem",
                  cursor: "pointer",
                }}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* DOB */}
        <div>
          <p style={{ fontFamily: B, fontWeight: 600, fontSize: "0.78rem", color: "#5A7A6E", margin: "0 0 6px" }}>
            Date of Birth
          </p>
          <input
            type="date"
            style={inputStyle}
            value={form.dob}
            onChange={(e) => setForm((f) => ({ ...f, dob: e.target.value }))}
          />
        </div>

        {/* Gender */}
        <div>
          <p style={{ fontFamily: B, fontWeight: 600, fontSize: "0.78rem", color: "#5A7A6E", margin: "0 0 6px" }}>
            Gender
          </p>
          <div style={{ display: "flex", gap: 8 }}>
            {GENDERS.map((g) => (
              <button
                key={g}
                onClick={() => setForm((f) => ({ ...f, gender: g }))}
                style={{
                  padding: "7px 16px",
                  borderRadius: 18,
                  border: form.gender === g ? "none" : "1.5px solid #DCE8E2",
                  background: form.gender === g ? "linear-gradient(135deg, #0D6E4F, #00C9A7)" : "#fff",
                  color: form.gender === g ? "#fff" : "#5A7A6E",
                  fontFamily: B,
                  fontWeight: 600,
                  fontSize: "0.8rem",
                  cursor: "pointer",
                }}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* Blood Group */}
        <div>
          <p style={{ fontFamily: B, fontWeight: 600, fontSize: "0.78rem", color: "#5A7A6E", margin: "0 0 6px" }}>
            Blood Group
          </p>
          <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
            {BLOOD_GROUPS.map((bg) => (
              <button
                key={bg}
                onClick={() => setForm((f) => ({ ...f, bloodGroup: bg }))}
                style={{
                  padding: "6px 11px",
                  borderRadius: 18,
                  border: form.bloodGroup === bg ? "none" : "1.5px solid #DCE8E2",
                  background: form.bloodGroup === bg ? "linear-gradient(135deg, #0D6E4F, #00C9A7)" : "#fff",
                  color: form.bloodGroup === bg ? "#fff" : "#5A7A6E",
                  fontFamily: B,
                  fontWeight: 700,
                  fontSize: "0.78rem",
                  cursor: "pointer",
                }}
              >
                {bg}
              </button>
            ))}
          </div>
        </div>

        {/* Phone */}
        <div>
          <p style={{ fontFamily: B, fontWeight: 600, fontSize: "0.78rem", color: "#5A7A6E", margin: "0 0 6px" }}>
            Phone (optional)
          </p>
          <input
            type="tel"
            style={inputStyle}
            placeholder="+91 98XXX XXXXX"
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
          />
        </div>

        {/* Submit */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleAdd}
          style={{
            padding: "14px",
            border: "none",
            borderRadius: 12,
            background: "linear-gradient(135deg, #0D6E4F, #00C9A7)",
            color: "#fff",
            fontFamily: B,
            fontWeight: 700,
            fontSize: "0.9rem",
            cursor: "pointer",
          }}
        >
          Add Member
        </motion.button>
      </div>
    </Modal>
  );
}
