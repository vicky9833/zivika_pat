"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";

const H = "var(--font-outfit, 'Outfit', sans-serif)";
const B = "var(--font-dm-sans, 'DM Sans', sans-serif)";

const SLIDES = [
  {
    id: "scan",
    bgGradient: "linear-gradient(160deg, #E8FBF5 0%, #F0FDFA 55%, #E2F9F3 100%)",
    accent: "#00C9A7",
    title: "Scan any medical report",
    subtitle:
      "Point your camera at prescriptions, lab tests, or X-rays. Our AI reads them instantly — in any Indian language.",
  },
  {
    id: "locker",
    bgGradient: "linear-gradient(160deg, #EFF6FF 0%, #EDE9FE 55%, #E8F4FF 100%)",
    accent: "#2563EB",
    title: "Your complete health story",
    subtitle:
      "Every prescription, lab report, and consultation — safely organized in one place. Accessible anywhere, anytime.",
  },
  {
    id: "ai",
    bgGradient: "linear-gradient(160deg, #ECFDF5 0%, #F0FFF4 55%, #E8FBF2 100%)",
    accent: "#0D6E4F",
    title: "AI that truly understands you",
    subtitle:
      "Ask anything about your health in your language. Get personalized answers based on your medical history — no jargon, just clarity.",
  },
  {
    id: "twin",
    bgGradient: "linear-gradient(160deg, #F5F3FF 0%, #EDE9FE 55%, #FAF5FF 100%)",
    accent: "#7C3AED",
    title: "Your health, reimagined",
    subtitle:
      "A living model of your health that gets smarter every day. Understand your body, track your progress, and stay ahead.",
  },
];

function ScanVisual({ active }) {
  return (
    <svg viewBox="0 0 280 260" width={240} height={220} style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id="ob-scan-line" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="rgba(0,201,167,0)" />
          <stop offset="30%" stopColor="#00C9A7" stopOpacity="0.8" />
          <stop offset="50%" stopColor="#00E8CC" />
          <stop offset="70%" stopColor="#00C9A7" stopOpacity="0.8" />
          <stop offset="100%" stopColor="rgba(0,201,167,0)" />
        </linearGradient>
        <filter id="ob-glow">
          <feGaussianBlur stdDeviation="3.5" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <rect x="96" y="56" width="100" height="145" rx="10" fill="rgba(0,201,167,0.07)" />
      <rect x="90" y="50" width="100" height="145" rx="10" fill="white" stroke="#DCE8E2" strokeWidth="1.5" />
      <rect x="102" y="63" width="76" height="9" rx="4.5" fill="rgba(0,201,167,0.2)" />
      <rect x="102" y="82" width="66" height="6" rx="3" fill="#E8F4EF" />
      <rect x="102" y="93" width="50" height="5" rx="2.5" fill="#E8F4EF" />
      <rect x="102" y="103" width="72" height="5" rx="2.5" fill="#E8F4EF" />
      <rect x="102" y="113" width="42" height="5" rx="2.5" fill="#E8F4EF" />
      <rect x="102" y="123" width="60" height="5" rx="2.5" fill="#E8F4EF" />
      <rect x="102" y="133" width="36" height="5" rx="2.5" fill="#E8F4EF" />
      <rect x="102" y="148" width="76" height="1" fill="#DCE8E2" />
      <rect x="102" y="157" width="54" height="5" rx="2.5" fill="#E8F4EF" />
      <rect x="102" y="167" width="68" height="5" rx="2.5" fill="#E8F4EF" />
      <rect x="102" y="177" width="46" height="5" rx="2.5" fill="#E8F4EF" />
      {active && (
        <motion.rect
          x="90"
          width="100"
          height="4"
          rx="2"
          fill="url(#ob-scan-line)"
          filter="url(#ob-glow)"
          animate={{ y: [54, 189, 54] }}
          transition={{ duration: 2.8, ease: "easeInOut", repeat: Infinity }}
        />
      )}
      <path d="M72 46 L72 55 L81 55" stroke="#00C9A7" strokeWidth="2" fill="none" opacity="0.45" />
      <path d="M208 46 L208 55 L199 55" stroke="#00C9A7" strokeWidth="2" fill="none" opacity="0.45" />
      <path d="M72 199 L72 190 L81 190" stroke="#00C9A7" strokeWidth="2" fill="none" opacity="0.45" />
      <path d="M208 199 L208 190 L199 190" stroke="#00C9A7" strokeWidth="2" fill="none" opacity="0.45" />
      {active &&
        [
          { cx: 215, cy: 88, r: 5.5, color: "#00C9A7", delay: 0 },
          { cx: 218, cy: 120, r: 4.5, color: "#0D6E4F", delay: 0.55 },
          { cx: 213, cy: 153, r: 3.5, color: "#00C9A7", delay: 1.1 },
          { cx: 216, cy: 103, r: 3, color: "#27AE60", delay: 1.65 },
        ].map((dot, i) => (
          <motion.circle
            key={i}
            cx={dot.cx}
            cy={dot.cy}
            r={dot.r}
            fill={dot.color}
            animate={{ x: [0, 22, 38], opacity: [0, 0.9, 0] }}
            transition={{ duration: 2.1, repeat: Infinity, delay: dot.delay }}
          />
        ))}
    </svg>
  );
}

function LockerVisual({ active }) {
  return (
    <svg viewBox="0 0 280 260" width={240} height={220} style={{ overflow: "visible" }}>
      <path
        d="M140 58 L192 80 L192 136 Q192 178 140 200 Q88 178 88 136 L88 80 Z"
        fill="#EFF6FF"
        stroke="#2563EB"
        strokeWidth="2"
        opacity="0.85"
      />
      <path
        d="M140 72 L178 89 L178 133 Q178 163 140 180 Q102 163 102 133 L102 89 Z"
        fill="none"
        stroke="#2563EB"
        strokeWidth="1"
        opacity="0.2"
      />
      {active &&
        [
          { x: 104, y: 98, w: 72, h: 42, bg: "#DBEAFE", border: "#2563EB", delay: 0.55 },
          { x: 108, y: 117, w: 72, h: 42, bg: "#EDE9FE", border: "#7C3AED", delay: 0.3 },
          { x: 112, y: 136, w: 72, h: 42, bg: "#D1FAE5", border: "#059669", delay: 0.05 },
        ].map((card, i) => (
          <motion.g
            key={i}
            initial={{ y: -28, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: card.delay, duration: 0.42, ease: "easeOut" }}
          >
            <rect x={card.x} y={card.y} width={card.w} height={card.h} rx="7" fill={card.bg} stroke={card.border} strokeWidth="1.2" />
            <rect x={card.x + 7} y={card.y + 9} width={card.w * 0.55} height="4.5" rx="2.2" fill={card.border} opacity="0.3" />
            <rect x={card.x + 7} y={card.y + 18} width={card.w * 0.38} height="3.5" rx="1.8" fill={card.border} opacity="0.2" />
            <rect x={card.x + 7} y={card.y + 26} width={card.w * 0.5} height="3.5" rx="1.8" fill={card.border} opacity="0.2" />
          </motion.g>
        ))}
      {active && (
        <motion.g
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          style={{ transformOrigin: "140px 186px", transformBox: "fill-box" }}
          transition={{ delay: 0.95, type: "spring", stiffness: 240, damping: 18 }}
        >
          <circle cx="140" cy="186" r="16" fill="#2563EB" opacity="0.92" />
          <rect x="134" y="184" width="12" height="9" rx="2.5" fill="white" opacity="0.9" />
          <path d="M135.5 184 L135.5 180 Q135.5 176 140 176 Q144.5 176 144.5 180 L144.5 184" stroke="white" strokeWidth="1.8" fill="none" opacity="0.9" />
          <circle cx="140" cy="188.5" r="1.8" fill="#2563EB" opacity="0.9" />
        </motion.g>
      )}
    </svg>
  );
}

function AIVisual({ active }) {
  return (
    <svg viewBox="0 0 280 260" width={240} height={220} style={{ overflow: "visible" }}>
      <rect x="62" y="54" width="142" height="100" rx="20" fill="#E8FBF5" stroke="#0D6E4F" strokeWidth="1.5" />
      <polygon points="78,154 66,172 98,154" fill="#E8FBF5" />
      <rect x="78" y="72" width="110" height="8" rx="4" fill="#0D6E4F" opacity="0.18" />
      <rect x="78" y="86" width="88" height="6" rx="3" fill="#0D6E4F" opacity="0.13" />
      <rect x="78" y="97" width="100" height="6" rx="3" fill="#0D6E4F" opacity="0.13" />
      <rect x="78" y="108" width="74" height="6" rx="3" fill="#0D6E4F" opacity="0.13" />
      {active && (
        <motion.ellipse
          cx="133"
          cy="104"
          fill="none"
          stroke="#00C9A7"
          strokeWidth="1.5"
          initial={{ rx: 84, ry: 60, opacity: 0.35 }}
          animate={{ rx: [84, 92, 84], ry: [60, 66, 60], opacity: [0.35, 0.09, 0.35] }}
          transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
      {active &&
        [0, 1, 2].map((i) => (
          <motion.circle
            key={i}
            cx={78 + i * 14}
            cy="126"
            r="4.5"
            fill="#0D6E4F"
            opacity="0.5"
            animate={{ y: [0, -7, 0], opacity: [0.35, 0.8, 0.35] }}
            transition={{ duration: 0.85, repeat: Infinity, delay: i * 0.2, ease: "easeInOut" }}
          />
        ))}
      {active && (
        <motion.g
          initial={{ x: 24, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.55, duration: 0.38, ease: "easeOut" }}
        >
          <rect x="144" y="174" width="108" height="58" rx="16" fill="#0D6E4F" />
          <polygon points="234,232 246,246 218,232" fill="#0D6E4F" />
          <rect x="156" y="185" width="84" height="6" rx="3" fill="white" opacity="0.65" />
          <rect x="156" y="196" width="64" height="5" rx="2.5" fill="white" opacity="0.45" />
          <rect x="156" y="206" width="74" height="5" rx="2.5" fill="white" opacity="0.45" />
        </motion.g>
      )}
      {active && (
        <motion.g
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{ transformOrigin: "136px 166px", transformBox: "fill-box" }}
          transition={{ delay: 0.7, type: "spring" }}
        >
          <rect x="133" y="160" width="6" height="12" rx="3" fill="#00C9A7" opacity="0.7" />
          <rect x="130" y="163" width="12" height="6" rx="3" fill="#00C9A7" opacity="0.7" />
        </motion.g>
      )}
    </svg>
  );
}

const TWIN_CX = 140;
const TWIN_CY = 126;
const TWIN_R = 72;

function TwinVisual({ active }) {
  const categories = [
    { label: "Cardiovascular", angle: -90 },
    { label: "Metabolic", angle: 0 },
    { label: "Activity", angle: 90 },
    { label: "Sleep", angle: 180 },
  ];
  return (
    <svg viewBox="0 0 280 252" width={240} height={220} style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id="ob-ring-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0D6E4F" />
          <stop offset="100%" stopColor="#00C9A7" />
        </linearGradient>
      </defs>
      <circle cx={TWIN_CX} cy={TWIN_CY} r={TWIN_R + 18} fill="none" stroke="#DCE8E2" strokeWidth="1" strokeDasharray="4 7" />
      <circle cx={TWIN_CX} cy={TWIN_CY} r={TWIN_R} fill="none" stroke="#E8F5F0" strokeWidth="11" />
      {active && (
        <motion.circle
          cx={TWIN_CX}
          cy={TWIN_CY}
          r={TWIN_R}
          fill="none"
          stroke="url(#ob-ring-grad)"
          strokeWidth="11"
          strokeLinecap="round"
          style={{ rotate: -90, transformOrigin: `${TWIN_CX}px ${TWIN_CY}px`, transformBox: "fill-box" }}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 0.82 }}
          transition={{ duration: 1.8, delay: 0.35, ease: "easeOut" }}
        />
      )}
      {active && (
        <>
          <motion.text
            x={TWIN_CX}
            y={TWIN_CY - 4}
            textAnchor="middle"
            fontFamily="'Outfit', sans-serif"
            fontWeight="800"
            fontSize="38"
            fill="#0D6E4F"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.6, duration: 0.4 }}
          >
            82
          </motion.text>
          <motion.text
            x={TWIN_CX}
            y={TWIN_CY + 18}
            textAnchor="middle"
            fontFamily="'DM Sans', sans-serif"
            fontWeight="500"
            fontSize="13"
            fill="#8EBAA3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.8, duration: 0.4 }}
          >
            Health Score
          </motion.text>
        </>
      )}
      {active &&
        categories.map((cat, i) => {
          const rad = (cat.angle * Math.PI) / 180;
          const dist = TWIN_R + 30;
          const x = TWIN_CX + Math.cos(rad) * dist;
          const y = TWIN_CY + Math.sin(rad) * dist + 4;
          return (
            <motion.text
              key={cat.label}
              x={x}
              y={y}
              textAnchor="middle"
              fontFamily="'DM Sans', sans-serif"
              fontSize="9.5"
              fill="#5A9A7E"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.0 + i * 0.15, duration: 0.35 }}
            >
              {cat.label}
            </motion.text>
          );
        })}
    </svg>
  );
}

const VISUALS = [ScanVisual, LockerVisual, AIVisual, TwinVisual];

const slideVariants = {
  enter: (dir) => ({ x: dir > 0 ? 340 : -340, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir) => ({ x: dir > 0 ? -340 : 340, opacity: 0 }),
};

export default function OnboardingPage() {
  const router = useRouter();
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);

  const isLast = current === SLIDES.length - 1;
  const slide = SLIDES[current];
  const Visual = VISUALS[current];

  function goTo(index) {
    setDirection(index > current ? 1 : -1);
    setCurrent(index);
  }

  function handleNext() {
    if (isLast) {
      router.push("/auth");
    } else {
      goTo(current + 1);
    }
  }

  function handleSkip() {
    router.push("/auth");
  }

  function handleDragEnd(_, info) {
    const { offset, velocity } = info;
    const swipe = Math.abs(offset.x) * Math.abs(velocity.x);
    if (swipe > 5000 || Math.abs(offset.x) > 60) {
      if (offset.x < 0 && current < SLIDES.length - 1) goTo(current + 1);
      else if (offset.x > 0 && current > 0) goTo(current - 1);
    }
  }

  return (
    <div
      style={{
        height: "100dvh",
        maxWidth: 390,
        margin: "0 auto",
        background: "#fff",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Skip button — absolute top-right */}
      {!isLast && (
        <button
          onClick={handleSkip}
          style={{
            position: "absolute",
            top: 20,
            right: 24,
            zIndex: 10,
            fontFamily: B,
            fontWeight: 500,
            fontSize: "0.875rem",
            color: "#8EBAA3",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "8px 4px",
          }}
        >
          Skip
        </button>
      )}
      {/* Visual area */}
      <motion.div
        key={`bg-${current}`}
        initial={{ opacity: 0.7 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        style={{
          flexShrink: 0,
          height: "55%",
          background: slide.bgGradient,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={`visual-${current}`}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.32, ease: [0.32, 0, 0.67, 0] }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.12}
            onDragEnd={handleDragEnd}
            style={{ display: "flex", alignItems: "center", justifyContent: "center", cursor: "grab", userSelect: "none" }}
          >
            <Visual active={true} />
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* Text area */}
      <div
        style={{
          flex: 1,
          background: "#fff",
          display: "flex",
          flexDirection: "column",
          padding: "28px 28px 0",
          overflow: "hidden",
        }}
      >
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={`text-${current}`}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.32, ease: [0.32, 0, 0.67, 0] }}
          >
            <h1
              style={{
                fontFamily: H,
                fontWeight: 800,
                fontSize: "1.625rem",
                color: "#0B1F18",
                margin: "0 0 10px",
                lineHeight: 1.2,
                letterSpacing: "-0.01em",
                textAlign: "center",
                marginTop: 24,
              }}
            >
              {slide.title}
            </h1>
            <p
              style={{
                fontFamily: B,
                fontSize: "0.9375rem",
                color: "#5A7A6E",
                margin: "10px 0 0",
                lineHeight: 1.6,
                textAlign: "center",
                padding: "0 24px",
              }}
            >
              {slide.subtitle}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom navigation */}
      <div
        style={{
          flexShrink: 0,
          padding: "20px 28px 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: isLast ? "center" : "space-between",
          background: "#fff",
          position: "relative",
        }}
      >
        {/* Skip — removed from here, now at top of page */}

        {isLast ? (
          /* Full-width Get Started */
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleNext}
            style={{
              width: "100%",
              height: 56,
              borderRadius: 16,
              border: "none",
              background: "linear-gradient(135deg, #0D6E4F, #00C9A7)",
              color: "#fff",
              fontFamily: H,
              fontWeight: 700,
              fontSize: "1.0625rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              overflow: "hidden",
              position: "relative",
            }}
          >
            {/* Shimmer */}
            <motion.div
              animate={{ x: ["-100%", "200%"] }}
              transition={{ duration: 1.6, ease: "easeInOut", repeat: Infinity, repeatDelay: 1.2 }}
              style={{
                position: "absolute", top: 0, left: 0,
                width: "50%", height: "100%",
                background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)",
                pointerEvents: "none",
              }}
            />
            Get Started
            <Check size={18} strokeWidth={2.5} />
          </motion.button>
        ) : (
          <>
            {/* Spacer for skip area */}
            <div style={{ width: 64 }} />

            {/* Dot indicators */}
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              {SLIDES.map((_, i) => (
                <motion.div
                  key={i}
                  animate={{
                    width: i === current ? 24 : 6,
                    background: i === current ? "#0D6E4F" : "#DCE8E2",
                  }}
                  transition={{ duration: 0.25 }}
                  onClick={() => goTo(i)}
                  style={{ height: 8, borderRadius: 4, cursor: "pointer" }}
                />
              ))}
            </div>

            {/* Next button */}
            <motion.button
              whileTap={{ scale: 0.94 }}
              onClick={handleNext}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                padding: "10px 18px",
                borderRadius: 50,
                border: "none",
                background: "#0D6E4F",
                color: "#fff",
                fontFamily: B,
                fontWeight: 700,
                fontSize: "0.875rem",
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              Next<ArrowRight size={15} strokeWidth={2.5} />
            </motion.button>
          </>
        )}
      </div>
    </div>
  );
}
