"use client";
import { SignIn, SignUp } from "@clerk/nextjs";
import { useState } from "react";
import ZivikaLogo from "@/components/shared/ZivikaLogo";
import { ShieldCheck, EyeOff, Lock } from "lucide-react";

const APPEARANCE = {
  layout: {
    logoPlacement: "none",
    socialButtonsPlacement: "top",
    socialButtonsVariant: "blockButton",
    privacyPageUrl: "/privacy",
    termsPageUrl: "/terms",
  },
  variables: {
    colorPrimary: "#0D6E4F",
    colorBackground: "#ffffff",
    colorText: "#0B1F18",
    colorTextSecondary: "#5A7A6E",
    colorInputBackground: "#F0F7F4",
    colorInputText: "#0B1F18",
    colorNeutral: "#DCE8E2",
    borderRadius: "12px",
    fontFamily: "DM Sans, sans-serif",
    fontSize: "14px",
    spacingUnit: "16px",
  },
  elements: {
    rootBox: {
      width: "100%",
    },
    card: {
      boxShadow: "0 8px 32px rgba(13,110,79,0.08)",
      border: "1px solid #DCE8E2",
      borderRadius: "20px",
      padding: "28px 24px",
    },
    headerTitle: {
      fontFamily: "Outfit, sans-serif",
      fontSize: "22px",
      fontWeight: "700",
      color: "#0B1F18",
    },
    headerSubtitle: {
      color: "#5A7A6E",
      fontSize: "14px",
    },
    socialButtonsBlockButton: {
      border: "1.5px solid #DCE8E2",
      borderRadius: "12px",
      color: "#0B1F18",
      fontSize: "14px",
      fontWeight: "600",
      backgroundColor: "#ffffff",
      height: "48px",
    },
    socialButtonsBlockButtonText: {
      fontWeight: "600",
      fontSize: "14px",
    },
    dividerLine: { backgroundColor: "#DCE8E2" },
    dividerText: { color: "#8EBAA3", fontSize: "13px" },
    formFieldInput: {
      borderRadius: "10px",
      border: "1px solid #DCE8E2",
      backgroundColor: "#F0F7F4",
      fontSize: "14px",
      height: "48px",
    },
    formFieldLabel: {
      color: "#5A7A6E",
      fontSize: "13px",
      fontWeight: "500",
    },
    formButtonPrimary: {
      backgroundImage: "linear-gradient(135deg, #0D6E4F, #00C9A7)",
      borderRadius: "12px",
      fontSize: "15px",
      fontWeight: "700",
      fontFamily: "Outfit, sans-serif",
      height: "52px",
      border: "none",
    },
    footerActionText: { color: "#8EBAA3", fontSize: "13px" },
    footerActionLink: {
      color: "#0D6E4F",
      fontWeight: "600",
      fontSize: "13px",
    },
    identityPreviewText: { color: "#5A7A6E" },
    identityPreviewEditButton: { color: "#0D6E4F" },
    otpCodeFieldInput: {
      borderRadius: "10px",
      border: "1px solid #DCE8E2",
      backgroundColor: "#F0F7F4",
      fontSize: "20px",
      fontWeight: "700",
      fontFamily: "Outfit, sans-serif",
      width: "48px",
      height: "56px",
    },
    footer: { display: "none" },
    badge: { display: "none" },
    logoBox: { display: "none" },
    logoImage: { display: "none" },
  },
};

const TRUST_ITEMS = [
  { icon: Lock, label: "Encrypted" },
  { icon: ShieldCheck, label: "DPDP compliant" },
  { icon: EyeOff, label: "Never sold" },
];

export default function AuthPage() {
  const [mode, setMode] = useState("signIn");

  return (
    <div style={{
      minHeight: "100dvh",
      background: "#F0F7F4",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px 20px",
    }}>

      {/* Logo */}
      <div style={{ marginBottom: "32px", textAlign: "center" }}>
        <ZivikaLogo size={72} showText showTagline />
      </div>

      {/* Clerk Component */}
      <div style={{ width: "100%", maxWidth: "380px" }}>
        {mode === "signIn" ? (
          <SignIn
            routing="hash"
            signUpUrl="/auth"
            fallbackRedirectUrl="/dashboard"
            forceRedirectUrl="/dashboard"
            appearance={APPEARANCE}
          />
        ) : (
          <SignUp
            routing="hash"
            signInUrl="/auth"
            fallbackRedirectUrl="/setup"
            forceRedirectUrl="/setup"
            appearance={APPEARANCE}
          />
        )}
      </div>

      {/* Toggle between Sign In and Sign Up */}
      <div style={{
        marginTop: "20px",
        textAlign: "center",
        fontFamily: "var(--font-dm-sans)",
        fontSize: "14px",
        color: "#5A7A6E",
      }}>
        {mode === "signIn" ? (
          <>
            New to Zivika Labs?{" "}
            <button
              onClick={() => setMode("signUp")}
              style={{
                background: "none",
                border: "none",
                color: "#0D6E4F",
                fontWeight: "700",
                fontSize: "14px",
                cursor: "pointer",
                fontFamily: "var(--font-dm-sans)",
                padding: 0,
              }}
            >
              Create account
            </button>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <button
              onClick={() => setMode("signIn")}
              style={{
                background: "none",
                border: "none",
                color: "#0D6E4F",
                fontWeight: "700",
                fontSize: "14px",
                cursor: "pointer",
                fontFamily: "var(--font-dm-sans)",
                padding: 0,
              }}
            >
              Sign in
            </button>
          </>
        )}
      </div>

      {/* Trust indicators */}
      <div style={{
        display: "flex",
        gap: "28px",
        marginTop: "24px",
        justifyContent: "center",
      }}>
        {TRUST_ITEMS.map(({ icon: Icon, label }) => (
          <div key={label} style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "5px",
          }}>
            <Icon size={16} color="#8EBAA3" />
            <span style={{
              fontSize: "11px",
              color: "#8EBAA3",
              fontFamily: "var(--font-dm-sans)",
              whiteSpace: "nowrap",
            }}>
              {label}
            </span>
          </div>
        ))}
      </div>

      {/* Terms */}
      <p style={{
        marginTop: "20px",
        fontSize: "11px",
        color: "#8EBAA3",
        textAlign: "center",
        fontFamily: "var(--font-dm-sans)",
        lineHeight: 1.6,
        maxWidth: "280px",
      }}>
        By continuing, you agree to our{" "}
        <a href="/terms" style={{ color: "#0D6E4F", fontWeight: "600" }}>
          Terms of Service
        </a>
        {" "}and{" "}
        <a href="/privacy" style={{ color: "#0D6E4F", fontWeight: "600" }}>
          Privacy Policy
        </a>
      </p>
    </div>
  );
}


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

