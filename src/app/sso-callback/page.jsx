"use client";
import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";

export default function SSOCallback() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100dvh",
        background: "#F0F7F4",
        flexDirection: "column",
        gap: "16px",
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          border: "3px solid #DCE8E2",
          borderTop: "3px solid #0D6E4F",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }}
      />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <AuthenticateWithRedirectCallback />
    </div>
  );
}
