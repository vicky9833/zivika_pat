"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import Modal from "@/components/ui/Modal";
import { toast } from "@/components/ui/Toast";
import { useVitalsStore, NORMAL_RANGES } from "@/lib/stores/vitals-store";

const B = "var(--font-dm-sans, 'DM Sans', sans-serif)";

const VITAL_TYPES = [
  { id: "heartRate",   label: "Heart Rate",     unit: "bpm",    placeholder: "72",   hint: "Steps, activity or resting?" },
  { id: "bp",          label: "Blood Pressure", unit: "mmHg",   placeholder: "120",  hint: "Sit quietly 5 min before measuring" },
  { id: "spo2",        label: "SpO₂",           unit: "%",      placeholder: "98",   hint: "Keep finger still, good contact" },
  { id: "temperature", label: "Temperature",    unit: "°F",     placeholder: "98.6", hint: "Oral reading is most accurate" },
  { id: "weight",      label: "Weight",         unit: "kg",     placeholder: "74",   hint: "Best measured in the morning" },
  { id: "glucose",     label: "Blood Glucose",  unit: "mg/dL",  placeholder: "110",  hint: "Note if fasting or post-meal" },
  { id: "steps",       label: "Steps",          unit: "steps",  placeholder: "8000", hint: "Daily goal: 8,000–10,000 steps" },
  { id: "sleep",       label: "Sleep",          unit: "hrs",    placeholder: "7.5",  hint: "Count total hours slept last night" },
];

// Map internal type id → store vital types
const BP_TYPES = ["systolic", "diastolic"];
const STORE_KEY = {
  heartRate: "heartRate", bp: null, spo2: "spo2", temperature: "temperature",
  weight: "weight", glucose: "glucose", steps: "steps", sleep: "sleep",
};

function getStatusForValue(storeKey, val) {
  const r = NORMAL_RANGES[storeKey];
  if (!r || !val || isNaN(val)) return null;
  if (val < r.min) return { label: "Low", color: "#2980B9" };
  if (val > r.max) return { label: "Elevated", color: "#E67E22" };
  return { label: r.label || "Normal", color: "#27AE60" };
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

export default function LogVital({ open, onClose, onSave }) {
  const addVital = useVitalsStore((s) => s.addVital);
  const [type, setType] = useState("heartRate");
  const [value, setValue] = useState("");
  const [valueSys, setValueSys] = useState(""); // BP systolic
  const [valueDia, setValueDia] = useState(""); // BP diastolic
  const [timestamp, setTimestamp] = useState(new Date().toISOString().slice(0, 16));

  const meta = VITAL_TYPES.find((v) => v.id === type) || VITAL_TYPES[0];
  const isBP = type === "bp";
  const storeKey = STORE_KEY[type];
  const numVal = parseFloat(value);

  // Live status pill for non-BP vitals
  const status = useMemo(() => {
    if (isBP) return null;
    return getStatusForValue(storeKey, numVal);
  }, [storeKey, numVal, isBP]);

  // Normal range for hint
  const range = storeKey ? NORMAL_RANGES[storeKey] : null;
  const sysRange = NORMAL_RANGES.systolic;
  const diaRange = NORMAL_RANGES.diastolic;

  function handleSave() {
    if (isBP) {
      const sys = parseFloat(valueSys);
      const dia = parseFloat(valueDia);
      if (!valueSys || isNaN(sys) || !valueDia || isNaN(dia)) {
        toast("Enter both systolic and diastolic values", "warning");
        return;
      }
      const ts = new Date(timestamp).toISOString();
      addVital("systolic", sys, ts);
      addVital("diastolic", dia, ts);
      onSave?.({ type: "systolic", value: sys, recordedAt: ts }).catch(console.error);
      onSave?.({ type: "diastolic", value: dia, recordedAt: ts }).catch(console.error);
      toast(`Blood pressure logged: ${sys}/${dia} mmHg`, "success");
      setValueSys(""); setValueDia("");
    } else {
      const num = parseFloat(value);
      if (!value || isNaN(num)) {
        toast("Please enter a valid value", "warning");
        return;
      }
      const ts = new Date(timestamp).toISOString();
      addVital(type, num, ts);
      onSave?.({ type, value: num, recordedAt: ts }).catch(console.error);
      toast(`${meta.label} logged: ${num} ${meta.unit}`, "success");
      setValue("");
    }
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title="Log Vital Reading">
      <div style={{ padding: "0 20px 16px", display: "flex", flexDirection: "column", gap: 16 }}>

        {/* Vital type picker */}
        <div>
          <p style={{ fontFamily: B, fontWeight: 600, fontSize: "0.78rem", color: "#5A7A6E", margin: "0 0 8px" }}>
            Vital Type
          </p>
          <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
            {VITAL_TYPES.map((v) => (
              <button
                key={v.id}
                onClick={() => { setType(v.id); setValue(""); setValueSys(""); setValueDia(""); }}
                style={{
                  padding: "6px 11px", borderRadius: 18,
                  border: type === v.id ? "none" : "1.5px solid #DCE8E2",
                  background: type === v.id ? "linear-gradient(135deg, #0D6E4F, #00C9A7)" : "#fff",
                  color: type === v.id ? "#fff" : "#5A7A6E",
                  fontFamily: B, fontWeight: 600, fontSize: "0.72rem", cursor: "pointer",
                }}
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>

        {/* Value input */}
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
            <p style={{ fontFamily: B, fontWeight: 600, fontSize: "0.78rem", color: "#5A7A6E", margin: 0 }}>
              {meta.label} ({meta.unit})
            </p>
            {status && (
              <span style={{
                padding: "2px 9px", borderRadius: 10,
                background: `${status.color}18`,
                fontFamily: B, fontWeight: 700, fontSize: "0.68rem", color: status.color,
              }}>
                {status.label}
              </span>
            )}
          </div>

          {isBP ? (
            <div style={{ display: "flex", gap: 10 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <input
                  type="number" style={inputStyle}
                  placeholder="Systolic (e.g. 120)"
                  value={valueSys} onChange={(e) => setValueSys(e.target.value)}
                />
                {sysRange && (
                  <p style={{ margin: "4px 0 0", fontFamily: B, fontSize: "0.67rem", color: "#8EBAA3" }}>
                    Normal: {sysRange.min}–{sysRange.max} mmHg
                  </p>
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <input
                  type="number" style={inputStyle}
                  placeholder="Diastolic (e.g. 80)"
                  value={valueDia} onChange={(e) => setValueDia(e.target.value)}
                />
                {diaRange && (
                  <p style={{ margin: "4px 0 0", fontFamily: B, fontSize: "0.67rem", color: "#8EBAA3" }}>
                    Normal: {diaRange.min}–{diaRange.max} mmHg
                  </p>
                )}
              </div>
            </div>
          ) : (
            <>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <input
                  type="number" style={{ ...inputStyle, flex: 1 }}
                  placeholder={meta.placeholder}
                  value={value} onChange={(e) => setValue(e.target.value)}
                />
                <span style={{ fontFamily: B, fontWeight: 600, fontSize: "0.82rem", color: "#8EBAA3", flexShrink: 0 }}>
                  {meta.unit}
                </span>
              </div>
              {range && (
                <p style={{ margin: "5px 0 0", fontFamily: B, fontSize: "0.67rem", color: "#8EBAA3" }}>
                  Normal range: {range.min}–{range.max} {meta.unit}
                </p>
              )}
            </>
          )}

          {meta.hint && (
            <p style={{ margin: "5px 0 0", fontFamily: B, fontSize: "0.68rem", color: "#00C9A7", fontStyle: "italic" }}>
              {meta.hint}
            </p>
          )}
        </div>

        {/* Timestamp */}
        <div>
          <p style={{ fontFamily: B, fontWeight: 600, fontSize: "0.78rem", color: "#5A7A6E", margin: "0 0 6px" }}>
            Date & Time
          </p>
          <input
            type="datetime-local" style={inputStyle}
            value={timestamp} onChange={(e) => setTimestamp(e.target.value)}
          />
        </div>

        {/* Save */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleSave}
          style={{
            padding: "14px", border: "none", borderRadius: 12,
            background: "linear-gradient(135deg, #0D6E4F, #00C9A7)",
            color: "#fff", fontFamily: B, fontWeight: 700, fontSize: "0.9rem", cursor: "pointer",
          }}
        >
          Log Reading
        </motion.button>
      </div>
    </Modal>
  );
}
