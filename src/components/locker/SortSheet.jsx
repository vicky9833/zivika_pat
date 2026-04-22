"use client";

import Modal from "@/components/ui/Modal";

const B = "var(--font-dm-sans, 'DM Sans', sans-serif)";
const H = "var(--font-outfit, 'Outfit', sans-serif)";

export const SORT_OPTIONS = [
  { id: "newest",    label: "Newest First",        description: "Most recently added records first" },
  { id: "oldest",    label: "Oldest First",         description: "Earliest records first" },
  { id: "by-type",   label: "By Record Type",       description: "Group by prescription, lab, imaging…" },
  { id: "by-specialty", label: "By Specialty",      description: "Group by medical department" },
];

export default function SortSheet({ open, onClose, value, onChange }) {
  return (
    <Modal open={open} onClose={onClose} title="Sort Records">
      <div style={{ padding: "0 20px 20px", display: "flex", flexDirection: "column", gap: 8 }}>
        {SORT_OPTIONS.map((opt) => {
          const active = value === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => { onChange(opt.id); onClose(); }}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "13px 16px",
                border: `1.5px solid ${active ? "#0D6E4F" : "#DCE8E2"}`,
                borderRadius: 12,
                background: active ? "rgba(13,110,79,0.05)" : "#fff",
                cursor: "pointer",
                textAlign: "left",
                width: "100%",
              }}
            >
              <div>
                <p
                  style={{
                    fontFamily: B,
                    fontWeight: active ? 700 : 500,
                    fontSize: "0.9rem",
                    color: active ? "#0D6E4F" : "#0B1F18",
                    margin: "0 0 2px",
                  }}
                >
                  {opt.label}
                </p>
                <p
                  style={{
                    fontFamily: B,
                    fontSize: "0.73rem",
                    color: "#8EBAA3",
                    margin: 0,
                  }}
                >
                  {opt.description}
                </p>
              </div>
              {active && (
                <div
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: "50%",
                    background: "#0D6E4F",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4l2.5 2.5L9 1" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </Modal>
  );
}
