"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  User,
  UserRound,
  CircleUser,
  Check,
  CheckCircle2,
  Heart,
  FileText,
  Stethoscope,
  ShieldCheck,
  AlertTriangle,
  Activity,
  TrendingDown,
  Zap,
  Users,
  Brain,
  Globe,
} from "lucide-react";
import ZivikaLogo from "@/components/shared/ZivikaLogo";
import { useUserStore } from "@/lib/stores/user-store";
import { useConvexUser } from "@/lib/hooks/useConvexUser";

const H = "var(--font-outfit, 'Outfit', sans-serif)";
const B = "var(--font-dm-sans, 'DM Sans', sans-serif)";

// ── Constants ─────────────────────────────────────────────────────────────────

const TOTAL_STEPS = 6;

const BLOOD_GROUPS = ["A+", "A−", "B+", "B−", "O+", "O−", "AB+", "AB−"];

const CONDITIONS = [
  "Diabetes",
  "Hypertension",
  "Heart Disease",
  "Asthma",
  "Thyroid",
  "Arthritis",
  "Kidney Disease",
  "Liver Disease",
  "Cancer",
  "Mental Health",
  "None of the above",
];

const RELATIONSHIPS = [
  "Parent",
  "Spouse",
  "Sibling",
  "Child",
  "Friend",
  "Other",
];

const HEALTH_GOALS = [
  { id: "weight_loss",       label: "Lose Weight",        Icon: TrendingDown, color: "#D97706" },
  { id: "fitness",          label: "Get Fitter",         Icon: Zap,          color: "#2563EB" },
  { id: "manage_condition", label: "Manage Condition",   Icon: Activity,     color: "#DC2626" },
  { id: "family_health",    label: "Family Health",      Icon: Users,        color: "#7C3AED" },
  { id: "mental_wellness",  label: "Mental Wellness",    Icon: Brain,        color: "#0891B2" },
  { id: "general",          label: "General Wellness",   Icon: Heart,        color: "#0D6E4F" },
];

const LANGUAGES = [
  { code: "en", label: "English",    native: "English" },
  { code: "hi", label: "Hindi",      native: "हिंदी" },
  { code: "ta", label: "Tamil",      native: "தமிழ்" },
  { code: "te", label: "Telugu",     native: "తెలుగు" },
  { code: "kn", label: "Kannada",    native: "ಕನ್ನಡ" },
  { code: "ml", label: "Malayalam",  native: "മലയാളം" },
  { code: "bn", label: "Bengali",    native: "বাংলা" },
];

// ── Slide animation ────────────────────────────────────────────────────────────

function StepSlide({ children, direction }) {
  return (
    <motion.div
      key={direction}
      initial={{ opacity: 0, x: direction > 0 ? 60 : -60 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: direction > 0 ? -60 : 60 }}
      transition={{ type: "spring", stiffness: 340, damping: 30 }}
      style={{ width: "100%" }}
    >
      {children}
    </motion.div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────

export default function SetupPage() {
  const router = useRouter();
  const updateUser = useUserStore((s) => s.updateUser);
  const { completeProfile } = useConvexUser();

  const [step, setStep] = useState(1);
  const [dir, setDir] = useState(1); // 1 = forward, -1 = backward
  const [done, setDone] = useState(false);

  // Step 1
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const nameRef = useRef(null);

  // Step 2
  const [bloodGroup, setBloodGroup] = useState("");
  const [heightUnit, setHeightUnit] = useState("cm"); // "cm" | "ft"
  const [heightCm, setHeightCm] = useState("");
  const [heightFt, setHeightFt] = useState("");
  const [heightIn, setHeightIn] = useState("");
  const [weight, setWeight] = useState("");

  // Step 3
  const [conditions, setConditions] = useState([]);

  // Step 4
  const [healthGoal, setHealthGoal] = useState("");

  // Step 5
  const [nativeLanguage, setNativeLanguage] = useState("en");

  // Step 6
  const [ecName, setEcName] = useState("");
  const [ecPhone, setEcPhone] = useState("");
  const [ecRelation, setEcRelation] = useState("Parent");

  // Auto-focus name input on mount
  useEffect(() => {
    if (step === 1) setTimeout(() => nameRef.current?.focus(), 400);
  }, [step]);

  // ── Derived validation ───────────────────────────────────────────────────────

  const step1Valid = name.trim().length > 1 && dob.length > 0 && gender.length > 0;
  const step2Valid = bloodGroup.length > 0;
  // Step 3 and 4 can always proceed

  // ── Helpers ──────────────────────────────────────────────────────────────────

  function navigate(nextStep) {
    setDir(nextStep > step ? 1 : -1);
    setStep(nextStep);
  }

  function toggleCondition(cond) {
    if (cond === "None of the above") {
      setConditions(["None of the above"]);
      return;
    }
    setConditions((prev) => {
      const filtered = prev.filter((c) => c !== "None of the above");
      return filtered.includes(cond)
        ? filtered.filter((c) => c !== cond)
        : [...filtered, cond];
    });
  }

  // Build initials from name
  function buildInitials(fullName) {
    const parts = fullName.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  // ── Completion ────────────────────────────────────────────────────────────────

  function completeSetup() {
    const nameTrimmed = name.trim();
    const firstName = nameTrimmed.split(" ")[0];

    // Normalise height to cm
    let normHeightCm = null;
    if (heightUnit === "cm" && heightCm) {
      normHeightCm = Number(heightCm) || null;
    } else if (heightUnit === "ft" && heightFt) {
      normHeightCm = Math.round((Number(heightFt) || 0) * 30.48 + (Number(heightIn) || 0) * 2.54) || null;
    }

    // Live BMI
    const weightNum = Number(weight) || 0;
    let bmi = null;
    let bmiCategory = null;
    if (normHeightCm && weightNum) {
      const hM = normHeightCm / 100;
      bmi = Math.round((weightNum / (hM * hM)) * 10) / 10;
      bmiCategory = bmi < 18.5 ? "Underweight" : bmi < 25 ? "Normal" : bmi < 30 ? "Overweight" : "Obese";
    }

    const profileData = {
      name: nameTrimmed,
      firstName,
      initials: buildInitials(nameTrimmed),
      dob,
      gender,
      bloodGroup: bloodGroup || "Unknown",
      height: heightUnit === "cm"
        ? heightCm ? `${heightCm} cm` : null
        : heightFt ? `${heightFt}'${heightIn || "0"}"` : null,
      heightCm: normHeightCm,
      weight: weight ? `${weight} kg` : null,
      bmi,
      bmiCategory,
      conditions,
      healthGoal,
      nativeLanguage,
      emergencyContactName: ecName,
      emergencyContactPhone: ecPhone ? `+91 ${ecPhone}` : "",
      emergencyContactRelation: ecRelation,
      profileComplete: true,
    };

    updateUser(profileData);

    if (typeof window !== "undefined") {
      localStorage.setItem("zivika_onboarded", "1");
      localStorage.setItem("zivika_profile_complete", "1");
    }

    // Persist to Convex in the background
    completeProfile({
      name: nameTrimmed,
      dob,
      gender,
      bloodGroup: bloodGroup || undefined,
      height: normHeightCm ?? undefined,
      weight: weightNum || undefined,
      conditions,
      healthGoal: healthGoal || undefined,
      nativeLanguage,
      ecName: ecName || undefined,
      ecPhone: ecPhone ? `+91 ${ecPhone}` : undefined,
      ecRelation,
    }).catch((err) => {
      console.error("Failed to sync profile to Convex:", err);
    });

    setDone(true);
    setTimeout(() => router.replace("/dashboard"), 2200);
  }

  // ── Completion screen ─────────────────────────────────────────────────────────

  if (done) {
    const firstName = name.trim().split(" ")[0] || "there";
    return (
      <div
        style={{
          height: "100dvh",
          maxWidth: 390,
          margin: "0 auto",
          background: "linear-gradient(160deg, #0D6E4F 0%, #065F46 100%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 20,
          padding: "0 32px",
          textAlign: "center",
        }}
      >
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 280, damping: 22, delay: 0.15 }}
          style={{
            width: 96,
            height: 96,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.18)",
            border: "2px solid rgba(255,255,255,0.35)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
          }}
        >
          <Check size={46} color="#fff" strokeWidth={3} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
        >
          <h1
            style={{
              fontFamily: H,
              fontWeight: 800,
              fontSize: "1.65rem",
              color: "#fff",
              margin: "0 0 10px",
              lineHeight: 1.25,
            }}
          >
            Welcome to Zivika Labs,
            <br />
            <span style={{ color: "#00C9A7" }}>{firstName}!</span>
          </h1>
          <p style={{ fontFamily: B, fontSize: "0.9rem", color: "rgba(255,255,255,0.7)", margin: 0 }}>
            Your personalised health journey starts now.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}
        >
          {[
            { Icon: FileText, label: "Records ready" },
            { Icon: Stethoscope, label: "AI ready" },
            { Icon: ShieldCheck, label: "Secure" },
          ].map(({ Icon, label }) => (
            <motion.div
              key={label}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.85, type: "spring" }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                padding: "8px 16px",
                borderRadius: 24,
                background: "rgba(255,255,255,0.14)",
                border: "1px solid rgba(255,255,255,0.25)",
              }}
            >
              <Icon size={14} color="#00C9A7" />
              <span style={{ fontFamily: B, fontWeight: 600, fontSize: "0.82rem", color: "#fff" }}>{label}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    );
  }

  // ── Shell ─────────────────────────────────────────────────────────────────────

  return (
    <div
      style={{
        height: "100dvh",
        maxWidth: 430,
        margin: "0 auto",
        background: "#fff",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* ── Header ───────────────────────────────────────────── */}
      <div
        style={{
          padding: "20px 24px 0",
          flexShrink: 0,
        }}
      >
        {/* Top row: back + logo + step count */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 24,
          }}
        >
          {step > 1 ? (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate(step - 1)}
              style={{
                width: 38,
                height: 38,
                borderRadius: 12,
                border: "1.5px solid #DCE8E2",
                background: "#F0F7F4",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ChevronLeft size={20} color="#5A7A6E" />
            </motion.button>
          ) : (
            <div style={{ width: 38 }} />
          )}

          <ZivikaLogo size={32} showText={false} />

          <span
            style={{
              fontFamily: B,
              fontWeight: 600,
              fontSize: "0.78rem",
              color: "#8EBAA3",
            }}
          >
            {step} / {TOTAL_STEPS}
          </span>
        </div>

        {/* Progress bar */}
        <div
          style={{
            height: 4,
            borderRadius: 4,
            background: "#F0F7F4",
            marginBottom: 32,
            overflow: "hidden",
          }}
        >
          <motion.div
            animate={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
            transition={{ type: "spring", stiffness: 180, damping: 24 }}
            style={{
              height: "100%",
              borderRadius: 4,
              background: "linear-gradient(90deg, #0D6E4F, #00C9A7)",
            }}
          />
        </div>
      </div>

      {/* ── Step content ─────────────────────────────────────── */}
      <div style={{ flex: 1, overflowY: "auto", padding: "0 24px", scrollbarWidth: "none" }}>
        <AnimatePresence mode="wait" initial={false}>
          {step === 1 && (
            <StepSlide key="step1" direction={dir}>
              <Step1
                name={name} setName={setName}
                dob={dob} setDob={setDob}
                gender={gender} setGender={setGender}
                nameRef={nameRef}
              />
            </StepSlide>
          )}
          {step === 2 && (
            <StepSlide key="step2" direction={dir}>
              <Step2
                bloodGroup={bloodGroup} setBloodGroup={setBloodGroup}
                heightUnit={heightUnit} setHeightUnit={setHeightUnit}
                heightCm={heightCm} setHeightCm={setHeightCm}
                heightFt={heightFt} setHeightFt={setHeightFt}
                heightIn={heightIn} setHeightIn={setHeightIn}
                weight={weight} setWeight={setWeight}
              />
            </StepSlide>
          )}
          {step === 3 && (
            <StepSlide key="step3" direction={dir}>
              <Step3 conditions={conditions} toggleCondition={toggleCondition} />
            </StepSlide>
          )}
          {step === 4 && (
            <StepSlide key="step4" direction={dir}>
              <Step4HealthGoal healthGoal={healthGoal} setHealthGoal={setHealthGoal} />
            </StepSlide>
          )}
          {step === 5 && (
            <StepSlide key="step5" direction={dir}>
              <Step5Language nativeLanguage={nativeLanguage} setNativeLanguage={setNativeLanguage} />
            </StepSlide>
          )}
          {step === 6 && (
            <StepSlide key="step6" direction={dir}>
              <Step6EmergencyContact
                ecName={ecName} setEcName={setEcName}
                ecPhone={ecPhone} setEcPhone={setEcPhone}
                ecRelation={ecRelation} setEcRelation={setEcRelation}
              />
            </StepSlide>
          )}
        </AnimatePresence>
      </div>

      {/* ── Footer CTA ───────────────────────────────────────── */}
      <div
        style={{
          padding: "16px 24px",
          paddingBottom: "max(env(safe-area-inset-bottom, 0px), 16px)",
          flexShrink: 0,
          borderTop: "1px solid #F0F7F4",
          background: "#fff",
        }}
      >
        {step < 6 ? (
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate(step + 1)}
            disabled={step === 1 ? !step1Valid : step === 2 ? !step2Valid : false}
            style={{
              width: "100%",
              padding: "15px",
              borderRadius: 14,
              border: "none",
              background: (step === 1 ? !step1Valid : step === 2 ? !step2Valid : false)
                ? "#DCE8E2"
                : "linear-gradient(135deg, #0D6E4F, #00C9A7)",
              color: (step === 1 ? !step1Valid : step === 2 ? !step2Valid : false) ? "#8EBAA3" : "#fff",
              fontFamily: H,
              fontWeight: 700,
              fontSize: "1rem",
              cursor: (step === 1 ? !step1Valid : step === 2 ? !step2Valid : false) ? "not-allowed" : "pointer",
              transition: "background 0.2s",
            }}
          >
            Next →
          </motion.button>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={completeSetup}
              style={{
                width: "100%",
                padding: "17px",
                borderRadius: 14,
                border: "none",
                background: "linear-gradient(135deg, #0D6E4F, #00C9A7)",
                color: "#fff",
                fontFamily: H,
                fontWeight: 800,
                fontSize: "1.05rem",
                cursor: "pointer",
                boxShadow: "0 4px 16px rgba(13,110,79,0.25)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              <Heart size={18} fill="#fff" />
              Complete Setup
            </motion.button>
            <button
              onClick={completeSetup}
              style={{
                background: "none",
                border: "none",
                fontFamily: B,
                fontWeight: 600,
                fontSize: "0.85rem",
                color: "#8EBAA3",
                cursor: "pointer",
                padding: "6px",
              }}
            >
              Skip for now
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Step 1: Identity ──────────────────────────────────────────────────────────

function Step1({ name, setName, dob, setDob, gender, setGender, nameRef }) {
  const GENDERS = [
    { id: "male",   label: "Male",   Icon: User },
    { id: "female", label: "Female", Icon: UserRound },
    { id: "other",  label: "Other",  Icon: CircleUser },
  ];

  return (
    <div style={{ paddingBottom: 16 }}>
      <StepHeading
        title="Let's get to know you"
        subtitle="So we can personalise your health experience"
      />

      <Label>Full name</Label>
      <input
        ref={nameRef}
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="e.g. Priya Sharma"
        style={inputStyle}
      />

      <Label top={20}>Date of birth</Label>
      <input
        type="date"
        value={dob}
        onChange={(e) => setDob(e.target.value)}
        max={new Date().toISOString().split("T")[0]}
        style={inputStyle}
      />

      <Label top={20}>Gender</Label>
      <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
        {GENDERS.map(({ id, label, Icon }) => {
          const active = gender === id;
          return (
            <motion.button
              key={id}
              whileTap={{ scale: 0.92 }}
              onClick={() => setGender(id)}
              style={{
                flex: 1,
                padding: "16px 8px",
                borderRadius: 14,
                border: `2px solid ${active ? "#0D6E4F" : "#DCE8E2"}`,
                background: active ? "rgba(13,110,79,0.07)" : "#F8FBFA",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
              }}
            >
              <Icon
                size={24}
                color={active ? "#0D6E4F" : "#8EBAA3"}
                strokeWidth={active ? 2.2 : 1.8}
              />
              <span
                style={{
                  fontFamily: B,
                  fontWeight: active ? 700 : 500,
                  fontSize: "0.82rem",
                  color: active ? "#0D6E4F" : "#5A7A6E",
                }}
              >
                {label}
              </span>
              {active && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: "50%",
                    background: "#0D6E4F",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Check size={10} color="#fff" strokeWidth={3} />
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

// ── BMI helpers ───────────────────────────────────────────────────────────────

function getBmiMeta(bmi) {
  if (bmi < 18.5) return { label: "Underweight", color: "#2563EB", pct: Math.round((bmi - 10) / 8.5 * 33) };
  if (bmi < 25)   return { label: "Normal",       color: "#0D6E4F", pct: 33 + Math.round((bmi - 18.5) / 6.5 * 34) };
  if (bmi < 30)   return { label: "Overweight",   color: "#D97706", pct: 67 + Math.round((bmi - 25) / 5 * 16) };
  return             { label: "Obese",         color: "#DC2626", pct: Math.min(99, 83 + Math.round((bmi - 30) / 10 * 17)) };
}

// ── Step 2: Health Basics ─────────────────────────────────────────────────────

function Step2({
  bloodGroup, setBloodGroup,
  heightUnit, setHeightUnit,
  heightCm, setHeightCm,
  heightFt, setHeightFt,
  heightIn, setHeightIn,
  weight, setWeight,
}) {
  const bmi = useMemo(() => {
    const w = Number(weight) || 0;
    let hM = 0;
    if (heightUnit === "cm") hM = (Number(heightCm) || 0) / 100;
    else hM = ((Number(heightFt) || 0) * 30.48 + (Number(heightIn) || 0) * 2.54) / 100;
    if (!w || !hM) return null;
    return Math.round(w / (hM * hM) * 10) / 10;
  }, [weight, heightCm, heightFt, heightIn, heightUnit]);

  const bmiMeta = bmi ? getBmiMeta(bmi) : null;
  const idealLow  = useMemo(() => {
    let hM = 0;
    if (heightUnit === "cm") hM = (Number(heightCm) || 0) / 100;
    else hM = ((Number(heightFt) || 0) * 30.48 + (Number(heightIn) || 0) * 2.54) / 100;
    return hM ? Math.round(18.5 * hM * hM) : null;
  }, [heightCm, heightFt, heightIn, heightUnit]);
  const idealHigh = useMemo(() => {
    let hM = 0;
    if (heightUnit === "cm") hM = (Number(heightCm) || 0) / 100;
    else hM = ((Number(heightFt) || 0) * 30.48 + (Number(heightIn) || 0) * 2.54) / 100;
    return hM ? Math.round(24.9 * hM * hM) : null;
  }, [heightCm, heightFt, heightIn, heightUnit]);

  return (
    <div style={{ paddingBottom: 16 }}>
      <StepHeading
        title="Your health basics"
        subtitle="Helps us give you accurate health insights"
      />

      <Label>Blood group <span style={{ color: "#E74C3C" }}>*</span></Label>
      <p style={{ fontFamily: B, fontSize: "0.75rem", color: "#8EBAA3", margin: "2px 0 10px" }}>
        Critical for emergency situations
      </p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 8,
          marginBottom: 24,
        }}
      >
        {BLOOD_GROUPS.map((bg) => {
          const active = bloodGroup === bg;
          return (
            <motion.button
              key={bg}
              whileTap={{ scale: 0.88 }}
              onClick={() => setBloodGroup(bg)}
              style={{
                padding: "11px 4px",
                borderRadius: 12,
                border: `2px solid ${active ? "#0D6E4F" : "#DCE8E2"}`,
                background: active ? "#0D6E4F" : "#F8FBFA",
                color: active ? "#fff" : "#5A7A6E",
                fontFamily: H,
                fontWeight: 700,
                fontSize: "0.9rem",
                cursor: "pointer",
                boxShadow: active ? "0 2px 10px rgba(13,110,79,0.25)" : "none",
              }}
            >
              {bg}
            </motion.button>
          );
        })}
      </div>

      <Label>Height</Label>
      {/* Unit toggle */}
      <div style={{ display: "flex", gap: 8, marginTop: 6, marginBottom: 10 }}>
        {["cm", "ft"].map((u) => (
          <button
            key={u}
            onClick={() => setHeightUnit(u)}
            style={{
              padding: "5px 18px",
              borderRadius: 20,
              border: `1.5px solid ${heightUnit === u ? "#0D6E4F" : "#DCE8E2"}`,
              background: heightUnit === u ? "rgba(13,110,79,0.08)" : "#fff",
              color: heightUnit === u ? "#0D6E4F" : "#8EBAA3",
              fontFamily: B,
              fontWeight: 700,
              fontSize: "0.78rem",
              cursor: "pointer",
            }}
          >
            {u}
          </button>
        ))}
      </div>
      {heightUnit === "cm" ? (
        <input
          type="number"
          value={heightCm}
          onChange={(e) => setHeightCm(e.target.value)}
          placeholder="e.g. 168"
          min={100}
          max={250}
          style={inputStyle}
        />
      ) : (
        <div style={{ display: "flex", gap: 10 }}>
          <input
            type="number"
            value={heightFt}
            onChange={(e) => setHeightFt(e.target.value)}
            placeholder="ft"
            min={3}
            max={8}
            style={{ ...inputStyle, flex: 1 }}
          />
          <input
            type="number"
            value={heightIn}
            onChange={(e) => setHeightIn(e.target.value)}
            placeholder="in"
            min={0}
            max={11}
            style={{ ...inputStyle, flex: 1 }}
          />
        </div>
      )}

      <Label top={20}>Weight (kg)</Label>
      <input
        type="number"
        value={weight}
        onChange={(e) => setWeight(e.target.value)}
        placeholder="e.g. 65"
        min={20}
        max={300}
        style={inputStyle}
      />

      {/* ── Live BMI Card ─────────────────────────────────── */}
      <AnimatePresence>
        {bmi && bmiMeta && (
          <motion.div
            key="bmi-card"
            initial={{ opacity: 0, y: 10, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            style={{
              marginTop: 16,
              padding: "16px",
              borderRadius: 16,
              background: "linear-gradient(135deg, #F0F7F4, #E8FBF5)",
              border: `1.5px solid ${bmiMeta.color}30`,
            }}
          >
            {/* Title row */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <span style={{ fontFamily: H, fontWeight: 700, fontSize: "0.8rem", color: "#0B1F18" }}>BMI</span>
              <div style={{ display: "flex", alignItems: "baseline", gap: 5 }}>
                <span style={{ fontFamily: H, fontWeight: 800, fontSize: "1.6rem", color: bmiMeta.color, lineHeight: 1 }}>{bmi}</span>
                <span style={{ fontFamily: B, fontWeight: 600, fontSize: "0.7rem", color: bmiMeta.color, padding: "2px 8px", borderRadius: 8, background: `${bmiMeta.color}18` }}>{bmiMeta.label}</span>
              </div>
            </div>

            {/* Scale bar */}
            <div style={{ position: "relative", height: 8, borderRadius: 6, background: "linear-gradient(90deg, #2563EB 0%, #0D6E4F 33%, #D97706 67%, #DC2626 100%)", marginBottom: 12 }}>
              <motion.div
                animate={{ left: `calc(${Math.min(Math.max(bmiMeta.pct, 1), 99)}% - 7px)` }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                style={{
                  position: "absolute",
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: 14,
                  height: 14,
                  borderRadius: "50%",
                  background: "#fff",
                  border: `2.5px solid ${bmiMeta.color}`,
                  boxShadow: "0 1px 6px rgba(0,0,0,0.18)",
                }}
              />
            </div>

            {/* Scale labels */}
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
              {["Under", "Normal", "Over", "Obese"].map((lbl) => (
                <span key={lbl} style={{ fontFamily: B, fontSize: "0.62rem", color: "#8EBAA3" }}>{lbl}</span>
              ))}
            </div>

            {/* Ideal weight range */}
            {idealLow && idealHigh && (
              <p style={{ margin: 0, fontFamily: B, fontSize: "0.75rem", color: "#5A9A7E" }}>
                Ideal weight for your height: <strong style={{ color: "#0D6E4F" }}>{idealLow}–{idealHigh} kg</strong>
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Step 3: Conditions ─────────────────────────────────────────────────────────

function Step3({ conditions, toggleCondition }) {
  return (
    <div style={{ paddingBottom: 16 }}>
      <StepHeading
        title="Any existing conditions?"
        subtitle="We'll tailor your AI copilot and digital twin accordingly"
      />
      <p style={{ fontFamily: B, fontSize: "0.78rem", color: "#8EBAA3", margin: "0 0 16px" }}>
        Select all that apply
      </p>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 10,
        }}
      >
        {CONDITIONS.map((cond) => {
          const active = conditions.includes(cond);
          const isNone = cond === "None of the above";
          return (
            <motion.button
              key={cond}
              whileTap={{ scale: 0.92 }}
              onClick={() => toggleCondition(cond)}
              style={{
                padding: "9px 16px",
                borderRadius: 24,
                border: `2px solid ${active ? (isNone ? "#27AE60" : "#0D6E4F") : "#DCE8E2"}`,
                background: active
                  ? isNone
                    ? "rgba(39,174,96,0.1)"
                    : "rgba(13,110,79,0.08)"
                  : "#F8FBFA",
                color: active
                  ? isNone
                    ? "#27AE60"
                    : "#0D6E4F"
                  : "#5A7A6E",
                fontFamily: B,
                fontWeight: active ? 700 : 500,
                fontSize: "0.85rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              {active && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 320 }}
                >
                  <Check size={13} strokeWidth={3} />
                </motion.span>
              )}
              {cond}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

// ── Step 4: Health Goal ────────────────────────────────────────────────────────

function Step4HealthGoal({ healthGoal, setHealthGoal }) {
  return (
    <div style={{ paddingBottom: 16 }}>
      <StepHeading
        title="What's your main goal?"
        subtitle="We'll personalise your recommendations around it"
      />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 10,
          marginTop: 8,
        }}
      >
        {HEALTH_GOALS.map(({ id, label, Icon, color }) => {
          const active = healthGoal === id;
          return (
            <motion.button
              key={id}
              whileTap={{ scale: 0.94 }}
              onClick={() => setHealthGoal(id)}
              style={{
                padding: "16px 12px",
                borderRadius: 14,
                border: `2px solid ${active ? color : "#DCE8E2"}`,
                background: active ? `${color}12` : "#F8FBFA",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  background: active ? `${color}20` : "#F0F7F4",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon size={20} color={active ? color : "#8EBAA3"} />
              </div>
              <span
                style={{
                  fontFamily: B,
                  fontWeight: active ? 700 : 500,
                  fontSize: "0.82rem",
                  color: active ? color : "#5A7A6E",
                  textAlign: "center",
                  lineHeight: 1.3,
                }}
              >
                {label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

// ── Step 5: Native Language ────────────────────────────────────────────────────

function Step5Language({ nativeLanguage, setNativeLanguage }) {
  return (
    <div style={{ paddingBottom: 16 }}>
      <StepHeading
        title="Preferred language"
        subtitle="Your health copilot will respond in this language"
      />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 10,
          marginTop: 8,
        }}
      >
        {LANGUAGES.map(({ code, label, native }) => {
          const active = nativeLanguage === code;
          return (
            <motion.button
              key={code}
              whileTap={{ scale: 0.94 }}
              onClick={() => setNativeLanguage(code)}
              style={{
                padding: "14px 12px",
                borderRadius: 14,
                border: `2px solid ${active ? "#0D6E4F" : "#DCE8E2"}`,
                background: active ? "rgba(13,110,79,0.08)" : "#F8FBFA",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
              }}
            >
              <span
                style={{
                  fontFamily: H,
                  fontWeight: 700,
                  fontSize: "1rem",
                  color: active ? "#0D6E4F" : "#0B1F18",
                }}
              >
                {native}
              </span>
              <span
                style={{
                  fontFamily: B,
                  fontSize: "0.72rem",
                  color: active ? "#5A9A7E" : "#8EBAA3",
                }}
              >
                {label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

// ── Step 6: Emergency Contact ──────────────────────────────────────────────────

function Step6EmergencyContact({ ecName, setEcName, ecPhone, setEcPhone, ecRelation, setEcRelation }) {
  return (
    <div style={{ paddingBottom: 16 }}>
      <StepHeading
        title="Emergency contact"
        subtitle="Someone we can alert if you ever need help"
      />

      <div
        style={{
          background: "rgba(220,38,38,0.05)",
          border: "1px solid rgba(220,38,38,0.15)",
          borderRadius: 12,
          padding: "10px 14px",
          marginBottom: 22,
          display: "flex",
          gap: 8,
          alignItems: "flex-start",
        }}
      >
        <AlertTriangle size={16} color="#DC2626" style={{ flexShrink: 0, marginTop: 1 }} />
        <p style={{ fontFamily: B, fontSize: "0.78rem", color: "#DC2626", margin: 0, lineHeight: 1.5 }}>
          This person will be notified in case of an emergency SOS
        </p>
      </div>

      <Label>Contact name</Label>
      <input
        type="text"
        value={ecName}
        onChange={(e) => setEcName(e.target.value)}
        placeholder="e.g. Sunita Sharma"
        style={inputStyle}
      />

      <Label top={18}>Phone number</Label>
      <div style={{ display: "flex", gap: 8 }}>
        <div
          style={{
            padding: "0 14px",
            height: 50,
            borderRadius: 12,
            border: "1.5px solid #DCE8E2",
            background: "#F0F7F4",
            display: "flex",
            alignItems: "center",
            fontFamily: B,
            fontWeight: 700,
            fontSize: "0.88rem",
            color: "#5A7A6E",
            flexShrink: 0,
          }}
        >
          +91
        </div>
        <input
          type="tel"
          value={ecPhone}
          onChange={(e) => {
            const val = e.target.value.replace(/\D/g, "").slice(0, 10);
            setEcPhone(val);
          }}
          placeholder="10-digit mobile number"
          style={{ ...inputStyle, flex: 1, margin: 0 }}
        />
      </div>

      <Label top={18}>Relationship</Label>
      <select
        value={ecRelation}
        onChange={(e) => setEcRelation(e.target.value)}
        style={{
          ...inputStyle,
          appearance: "none",
          WebkitAppearance: "none",
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%238EBAA3' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 14px center",
          paddingRight: 40,
        }}
      >
        {RELATIONSHIPS.map((r) => (
          <option key={r} value={r}>{r}</option>
        ))}
      </select>
    </div>
  );
}

// ── Shared sub-components ─────────────────────────────────────────────────────

function StepHeading({ title, subtitle }) {
  return (
    <div style={{ marginBottom: 26 }}>
      <h2
        style={{
          fontFamily: H,
          fontWeight: 800,
          fontSize: "1.45rem",
          color: "#0B1F18",
          margin: "0 0 6px",
          lineHeight: 1.25,
        }}
      >
        {title}
      </h2>
      <p style={{ fontFamily: B, fontSize: "0.88rem", color: "#8EBAA3", margin: 0 }}>
        {subtitle}
      </p>
    </div>
  );
}

function Label({ children, top = 0 }) {
  return (
    <p
      style={{
        fontFamily: B,
        fontWeight: 700,
        fontSize: "0.82rem",
        color: "#5A7A6E",
        margin: 0,
        marginTop: top,
        marginBottom: 8,
        letterSpacing: "0.02em",
      }}
    >
      {children}
    </p>
  );
}

const inputStyle = {
  width: "100%",
  height: 50,
  borderRadius: 12,
  border: "1.5px solid #DCE8E2",
  background: "#F8FBFA",
  padding: "0 14px",
  fontFamily: "var(--font-dm-sans, 'DM Sans', sans-serif)",
  fontWeight: 500,
  fontSize: "0.92rem",
  color: "#0B1F18",
  outline: "none",
  boxSizing: "border-box",
  marginTop: 0,
};
