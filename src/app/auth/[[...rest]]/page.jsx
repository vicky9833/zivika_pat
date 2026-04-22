"use client";

import { SignIn, SignUp } from "@clerk/nextjs";
import { useState } from "react";
import ZivikaLogo from "@/components/shared/ZivikaLogo";
import { ShieldCheck, EyeOff, Lock } from "lucide-react";

const B = "DM Sans, var(--font-dm-sans, sans-serif)";
const H = "Outfit, var(--font-outfit, sans-serif)";

const CLERK_APPEARANCE = {
  layout: {
    logoPlacement: "none",
    socialButtonsPlacement: "top",
    socialButtonsVariant: "blockButton",
  },
  variables: {
    colorPrimary: "#0D6E4F",
    colorBackground: "#ffffff",
    colorText: "#0B1F18",
    colorTextSecondary: "#5A7A6E",
    colorInputBackground: "#F0F7F4",
    colorInputText: "#0B1F18",
    borderRadius: "12px",
    fontFamily: B,
    fontSize: "14px",
  },
  elements: {
    rootBox: { width: "100%", maxWidth: "380px" },
    card: {
      boxShadow: "0 8px 32px rgba(13,110,79,0.10)",
      border: "none",
      borderRadius: "20px",
    },
    headerTitle: {
      fontFamily: H,
      fontSize: "22px",
      fontWeight: "700",
      color: "#0B1F18",
    },
    headerSubtitle: { color: "#5A7A6E", fontSize: "14px" },
    socialButtonsBlockButton: {
      border: "1.5px solid #DCE8E2",
      borderRadius: "12px",
      color: "#0B1F18",
      fontSize: "14px",
      fontWeight: "600",
    },
    formButtonPrimary: {
      backgroundColor: "#0D6E4F",
      backgroundImage: "linear-gradient(135deg, #0D6E4F, #00C9A7)",
      borderRadius: "12px",
      fontSize: "15px",
      fontWeight: "700",
      fontFamily: H,
    },
    formFieldInput: {
      borderRadius: "10px",
      border: "1px solid #DCE8E2",
      backgroundColor: "#F0F7F4",
      fontSize: "14px",
    },
    footerActionLink: { color: "#0D6E4F", fontWeight: "600" },
    dividerLine: { backgroundColor: "#DCE8E2" },
    dividerText: { color: "#8EBAA3", fontSize: "13px" },
    footer: { display: "none" },
    badge: { display: "none" },
  },
};

export default function AuthPage() {
  const [mode, setMode] = useState("signIn");

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "#F0F7F4",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px 16px",
      }}
    >
      {/* Logo */}
      <div style={{ marginBottom: 24, textAlign: "center" }}>
        <ZivikaLogo size={48} showText />
      </div>

      {/* CAPTCHA anchor required by Clerk v7 for sign-up flows */}
      <div id="clerk-captcha" />

      {mode === "signIn" ? (
        <SignIn
          routing="path"
          path="/auth"
          forceRedirectUrl="/dashboard"
          fallbackRedirectUrl="/dashboard"
          signUpUrl="/auth"
          signUpForceRedirectUrl="/setup"
          signUpFallbackRedirectUrl="/setup"
          appearance={CLERK_APPEARANCE}
        />
      ) : (
        <SignUp
          routing="path"
          path="/auth"
          forceRedirectUrl="/setup"
          fallbackRedirectUrl="/setup"
          signInUrl="/auth"
          appearance={CLERK_APPEARANCE}
        />
      )}

      {/* Mode toggle */}
      <p
        style={{
          fontFamily: B,
          fontSize: 13,
          color: "#5A7A6E",
          textAlign: "center",
          marginTop: 20,
        }}
      >
        {mode === "signIn" ? "Don't have an account? " : "Already have an account? "}
        <button
          onClick={() => setMode(mode === "signIn" ? "signUp" : "signIn")}
          style={{
            background: "none",
            border: "none",
            color: "#0D6E4F",
            fontFamily: B,
            fontWeight: 700,
            fontSize: 13,
            cursor: "pointer",
            padding: 0,
            textDecoration: "underline",
          }}
        >
          {mode === "signIn" ? "Sign up" : "Sign in"}
        </button>
      </p>

      {/* Trust footer */}
      <div
        style={{
          display: "flex",
          gap: 24,
          marginTop: 24,
          justifyContent: "center",
        }}
      >
        {[
          { Icon: Lock, label: "Encrypted" },
          { Icon: ShieldCheck, label: "DPDP compliant" },
          { Icon: EyeOff, label: "Never sold" },
        ].map(({ Icon, label }) => (
          <div
            key={label}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
            }}
          >
            <Icon size={16} color="#8EBAA3" />
            <span
              style={{
                fontSize: 11,
                color: "#8EBAA3",
                fontFamily: B,
                whiteSpace: "nowrap",
              }}
            >
              {label}
            </span>
          </div>
        ))}
      </div>

      {/* Terms text */}
      <p
        style={{
          fontFamily: B,
          fontSize: 11,
          color: "#8EBAA3",
          textAlign: "center",
          marginTop: 16,
          maxWidth: 320,
          lineHeight: 1.6,
        }}
      >
        By continuing, you agree to Zivika Labs&apos;{" "}
        <a href="/terms" style={{ color: "#5A7A6E", textDecoration: "underline" }}>
          Terms of Service
        </a>{" "}
        and{" "}
        <a href="/privacy" style={{ color: "#5A7A6E", textDecoration: "underline" }}>
          Privacy Policy
        </a>
      </p>
    </div>
  );
}
