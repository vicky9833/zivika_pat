"use client";

const B = "var(--font-dm-sans, 'DM Sans', sans-serif)";

// Only the three languages shown in the copilot UI
const LANGS = [
  { code: "en", native: "EN" },
  { code: "hi", native: "हिं" },
  { code: "kn", native: "ಕ" },
];

/**
 * LanguageSelector — compact pill-button language picker.
 *
 * Props:
 *  selected   "en" | "hi" | "kn"
 *  onChange   (code: string) => void
 */
export default function LanguageSelector({ selected, onChange }) {
  return (
    <div style={{ display: "flex", gap: 4 }}>
      {LANGS.map((lang) => {
        const active = selected === lang.code;
        return (
          <button
            key={lang.code}
            onClick={() => onChange(lang.code)}
            style={{
              padding: "4px 9px",
              borderRadius: 8,
              border: active ? "1.5px solid #0D6E4F" : "1.5px solid #DCE8E2",
              background: active ? "rgba(13,110,79,0.09)" : "transparent",
              fontFamily: B,
              fontWeight: active ? 700 : 500,
              fontSize: "0.72rem",
              color: active ? "#0D6E4F" : "#8EBAA3",
              cursor: "pointer",
              minWidth: 32,
              textAlign: "center",
              transition: "all 0.15s",
              lineHeight: 1.5,
            }}
          >
            {lang.native}
          </button>
        );
      })}
    </div>
  );
}
