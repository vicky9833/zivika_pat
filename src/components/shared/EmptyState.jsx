"use client";

import { FolderOpen } from "lucide-react";
import Button from "@/components/ui/Button";

export default function EmptyState({
  icon: Icon = FolderOpen,
  iconColor = "#8EBAA3",
  title,
  description,
  ctaLabel,
  onCta,
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "40px 24px",
        gap: 12,
      }}
    >
      <div
        style={{
          width: 60,
          height: 60,
          borderRadius: 16,
          background: "rgba(13,110,79,0.07)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon size={26} color={iconColor} />
      </div>
      {title && (
        <h3
          style={{
            fontFamily: "var(--font-outfit, 'Outfit', sans-serif)",
            fontWeight: 600,
            fontSize: "1.125rem",
            color: "#0B1F18",
            margin: 0,
          }}
        >
          {title}
        </h3>
      )}
      {description && (
        <p
          style={{
            fontFamily: "var(--font-dm-sans, 'DM Sans', sans-serif)",
            fontSize: "0.875rem",
            color: "#8EBAA3",
            margin: 0,
            maxWidth: 280,
            lineHeight: 1.6,
          }}
        >
          {description}
        </p>
      )}
      {ctaLabel && onCta && (
        <Button variant="primary" size="md" onClick={onCta} className="mt-2">
          {ctaLabel}
        </Button>
      )}
    </div>
  );
}
