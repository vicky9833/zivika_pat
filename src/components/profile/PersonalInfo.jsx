"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUserStore, LANGUAGES } from "@/lib/stores/user-store";
import { toast } from "@/components/ui/Toast";

const H = "var(--font-outfit, 'Outfit', sans-serif)";
const B = "var(--font-dm-sans, 'DM Sans', sans-serif)";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];
const GENDERS = ["Male", "Female", "Other"];

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

/**
 * PersonalInfo — editable personal information section.
 * Props: user (from store)
 */
export default function PersonalInfo({ user }) {
  const updateUser = useUserStore((s) => s.updateUser);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: user.name || "",
    dob: user.dob || "",
    gender: capitalize(user.gender) || "Male",
    bloodGroup: user.bloodGroup || "O+",
    phone: user.phone || "",
    email: user.email || "",
    emergencyContactName: user.emergencyContactName || "",
    emergencyContactPhone: user.emergencyContactPhone || "",
    preferredLanguage: user.preferredLanguage || "en",
    address: user.address || "",
  });

  function handleSave() {
    updateUser({
      ...form,
      gender: form.gender.toLowerCase(),
    });
    setEditing(false);
    toast("Profile saved", "success");
  }

  function handleCancel() {
    // Reset form to current store user
    setForm({
      name: user.name || "",
      dob: user.dob || "",
      gender: capitalize(user.gender) || "Male",
      bloodGroup: user.bloodGroup || "O+",
      phone: user.phone || "",
      email: user.email || "",
      emergencyContactName: user.emergencyContactName || "",
      emergencyContactPhone: user.emergencyContactPhone || "",
      preferredLanguage: user.preferredLanguage || "en",
      address: user.address || "",
    });
    setEditing(false);
  }

  const langLabel = LANGUAGES.find((l) => l.code === form.preferredLanguage)?.label || "English";

  return (
    <div
      style={{
        background: "#fff",
        border: "1.5px solid #DCE8E2",
        borderRadius: 18,
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "16px 18px",
          borderBottom: "1px solid #DCE8E2",
        }}
      >
        <h2 style={{ fontFamily: H, fontWeight: 700, fontSize: "0.95rem", color: "#0B1F18", margin: 0 }}>
          Personal Information
        </h2>
        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            style={{
              padding: "5px 14px",
              borderRadius: 18,
              border: "1.5px solid #0D6E4F",
              background: "transparent",
              color: "#0D6E4F",
              fontFamily: B,
              fontWeight: 700,
              fontSize: "0.75rem",
              cursor: "pointer",
            }}
          >
            Edit
          </button>
        ) : (
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={handleCancel}
              style={{
                padding: "5px 12px",
                borderRadius: 18,
                border: "1.5px solid #DCE8E2",
                background: "transparent",
                color: "#8EBAA3",
                fontFamily: B,
                fontWeight: 700,
                fontSize: "0.75rem",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={handleSave}
              style={{
                padding: "5px 14px",
                borderRadius: 18,
                border: "none",
                background: "linear-gradient(135deg, #0D6E4F, #00C9A7)",
                color: "#fff",
                fontFamily: B,
                fontWeight: 700,
                fontSize: "0.75rem",
                cursor: "pointer",
              }}
            >
              Save
            </motion.button>
          </div>
        )}
      </div>

      {/* Fields */}
      <div style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: 14 }}>
        <Field
          label="Full Name"
          value={form.name}
          editing={editing}
          onChange={(v) => setForm((f) => ({ ...f, name: v }))}
        />
        <Field
          label="Date of Birth"
          value={form.dob}
          editing={editing}
          type="date"
          onChange={(v) => setForm((f) => ({ ...f, dob: v }))}
        />

        {/* Gender — pill selector when editing */}
        <div>
          <p style={{ fontFamily: B, fontSize: "0.72rem", color: "#8EBAA3", margin: "0 0 5px", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>Gender</p>
          {editing ? (
            <div style={{ display: "flex", gap: 8 }}>
              {GENDERS.map((g) => (
                <button
                  key={g}
                  onClick={() => setForm((f) => ({ ...f, gender: g }))}
                  style={{
                    padding: "7px 14px",
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
          ) : (
            <p style={{ fontFamily: B, fontWeight: 600, fontSize: "0.875rem", color: "#0B1F18", margin: 0 }}>{form.gender}</p>
          )}
        </div>

        {/* Blood Group */}
        <div>
          <p style={{ fontFamily: B, fontSize: "0.72rem", color: "#8EBAA3", margin: "0 0 5px", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>Blood Group</p>
          {editing ? (
            <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
              {BLOOD_GROUPS.map((bg) => (
                <button
                  key={bg}
                  onClick={() => setForm((f) => ({ ...f, bloodGroup: bg }))}
                  style={{
                    padding: "6px 12px",
                    borderRadius: 18,
                    border: form.bloodGroup === bg ? "none" : "1.5px solid #DCE8E2",
                    background: form.bloodGroup === bg ? "linear-gradient(135deg, #0D6E4F, #00C9A7)" : "#fff",
                    color: form.bloodGroup === bg ? "#fff" : "#5A7A6E",
                    fontFamily: B,
                    fontWeight: 700,
                    fontSize: "0.8rem",
                    cursor: "pointer",
                  }}
                >
                  {bg}
                </button>
              ))}
            </div>
          ) : (
            <p style={{ fontFamily: B, fontWeight: 700, fontSize: "0.875rem", color: "#0D6E4F", margin: 0 }}>{form.bloodGroup}</p>
          )}
        </div>

        <Field
          label="Phone Number"
          value={form.phone}
          editing={editing}
          type="tel"
          onChange={(v) => setForm((f) => ({ ...f, phone: v }))}
        />
        <Field
          label="Email"
          value={form.email}
          editing={editing}
          type="email"
          onChange={(v) => setForm((f) => ({ ...f, email: v }))}
        />
        <Field
          label="Emergency Contact"
          value={form.emergencyContactName}
          editing={editing}
          onChange={(v) => setForm((f) => ({ ...f, emergencyContactName: v }))}
        />
        <Field
          label="Emergency Phone"
          value={form.emergencyContactPhone}
          editing={editing}
          type="tel"
          onChange={(v) => setForm((f) => ({ ...f, emergencyContactPhone: v }))}
        />

        {/* Preferred Language */}
        <div>
          <p style={{ fontFamily: B, fontSize: "0.72rem", color: "#8EBAA3", margin: "0 0 5px", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>Preferred Language</p>
          {editing ? (
            <select
              value={form.preferredLanguage}
              onChange={(e) => setForm((f) => ({ ...f, preferredLanguage: e.target.value }))}
              style={{ ...inputStyle }}
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>{l.label}</option>
              ))}
            </select>
          ) : (
            <p style={{ fontFamily: B, fontWeight: 600, fontSize: "0.875rem", color: "#0B1F18", margin: 0 }}>{langLabel}</p>
          )}
        </div>

        {/* Address */}
        <div>
          <p style={{ fontFamily: B, fontSize: "0.72rem", color: "#8EBAA3", margin: "0 0 5px", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>Address</p>
          {editing ? (
            <textarea
              value={form.address}
              onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
              rows={3}
              style={{ ...inputStyle, resize: "none", lineHeight: 1.5 }}
            />
          ) : (
            <p style={{ fontFamily: B, fontSize: "0.875rem", color: form.address ? "#0B1F18" : "#8EBAA3", margin: 0, fontStyle: form.address ? "normal" : "italic" }}>
              {form.address || "Not provided"}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, editing, onChange, type = "text" }) {
  return (
    <div>
      <p style={{ fontFamily: B, fontSize: "0.72rem", color: "#8EBAA3", margin: "0 0 5px", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>{label}</p>
      {editing ? (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={inputStyle}
        />
      ) : (
        <p style={{ fontFamily: B, fontWeight: 600, fontSize: "0.875rem", color: value ? "#0B1F18" : "#8EBAA3", margin: 0, fontStyle: value ? "normal" : "italic" }}>
          {value || "Not provided"}
        </p>
      )}
    </div>
  );
}

function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : "";
}
