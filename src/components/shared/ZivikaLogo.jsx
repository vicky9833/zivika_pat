"use client";

import { useState } from "react";
import Image from "next/image";

export default function ZivikaLogo({ showText = true, size = 40 }) {
  const [imgError, setImgError] = useState(false);

  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: size * 0.22, flexShrink: 0 }}>
      {/* Logo image with fallback */}
      <div style={{ flexShrink: 0, width: size, height: size, position: "relative" }}>
        {imgError ? (
          <div
            style={{
              width: size, height: size, borderRadius: size * 0.22,
              background: "linear-gradient(135deg, #0D6E4F, #00C9A7)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-outfit,'Outfit',sans-serif)",
                fontWeight: 800, fontSize: size * 0.48, color: "#fff", lineHeight: 1,
              }}
            >
              Z
            </span>
          </div>
        ) : (
          <Image
            src="/logo.png"
            alt="Zivika Labs Logo"
            fill
            style={{ objectFit: "contain" }}
            priority
            quality={85}
            sizes={`${size * 3}px`}
            onError={() => setImgError(true)}
          />
        )}
      </div>

      {showText && (
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          <span
            style={{
              fontFamily: "var(--font-outfit, 'Outfit', sans-serif)",
              fontWeight: 800,
              fontSize: size * 0.52,
              lineHeight: 1.15,
              background: "linear-gradient(135deg, #0D6E4F, #00C9A7)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              whiteSpace: "nowrap",
              letterSpacing: "-0.01em",
            }}
          >
            Zivika Labs
          </span>
          <span
            style={{
              fontFamily: "var(--font-dm-sans, 'DM Sans', sans-serif)",
              fontSize: size * 0.2,
              fontWeight: 500,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "#8EBAA3",
              lineHeight: 1.2,
              whiteSpace: "nowrap",
            }}
          >
            India&apos;s intelligent health OS
          </span>
        </div>
      )}
    </div>
  );
}
