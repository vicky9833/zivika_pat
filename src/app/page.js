"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";

export default function RootPage() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Safety net: if Clerk never finishes loading, redirect after 5 seconds
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!isLoaded) {
        router.replace("/onboarding");
      }
    }, 5000);
    return () => clearTimeout(timeout);
  }, [isLoaded, router]);

  useEffect(() => {
    if (!mounted || !isLoaded) return;

    if (!user) {
      const hasOnboarded = localStorage.getItem("zivika_onboarded");
      if (hasOnboarded === "1") {
        router.replace("/auth");
      } else {
        router.replace("/onboarding");
      }
      return;
    }

    const profileComplete = localStorage.getItem("zivika_profile_complete");
    if (profileComplete === "1") {
      router.replace("/dashboard");
    } else {
      router.replace("/setup");
    }
  }, [mounted, isLoaded, user, router]);

  return (
    <div
      style={{
        height: "100dvh",
        background: "#F0F7F4",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
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
    </div>
  );
}

