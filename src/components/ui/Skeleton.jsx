"use client";

export default function Skeleton({ className = "" }) {
  return (
    <div
      className={[
        "bg-zivika-100 animate-pulse",
        // Only add default rounding if no rounded class is provided
        className.includes("rounded") ? "" : "rounded-[10px]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    />
  );
}
