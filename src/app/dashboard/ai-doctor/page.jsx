"use client";
export const dynamic = "force-dynamic";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const B = "var(--font-dm-sans, 'DM Sans', sans-serif)";

export default function AIDoctorPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard/copilot?mode=doctor");
  }, [router]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60dvh",
        gap: 12,
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: "50%",
          border: "3px solid #DCE8E2",
          borderTop: "3px solid #0D6E4F",
          animation: "spin 0.8s linear infinite",
        }}
      />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <p style={{ fontFamily: B, fontSize: 14, color: "#8EBAA3", margin: 0 }}>
        Loading AI Doctor...
      </p>
    </div>
  );
}
