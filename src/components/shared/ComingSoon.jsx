"use client";

import { Rocket } from "lucide-react";
import Badge from "@/components/ui/Badge";

export default function ComingSoon({ featureName = "This Feature" }) {
  return (
    <div
      className="glass rounded-[16px] p-5"
      style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}
    >
      <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(13,110,79,0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Rocket size={22} color="#0D6E4F" />
      </div>
      <h3
        style={{
          fontFamily: "'Outfit', sans-serif",
          fontWeight: 600,
          fontSize: "1rem",
          color: "#0B1F18",
          margin: 0,
        }}
      >
        {featureName}
      </h3>
      <p
        style={{
          fontFamily: "var(--font-dm-sans, 'DM Sans', sans-serif)",
          fontSize: "0.8rem",
          color: "#5A9A7E",
          margin: 0,
          lineHeight: 1.5,
        }}
      >
        Zivika Labs is building something amazing for you.
      </p>
      <Badge variant="coming">Phase 2 — Coming Soon</Badge>
    </div>
  );
}
