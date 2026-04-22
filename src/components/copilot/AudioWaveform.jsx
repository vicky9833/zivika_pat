"use client";

// 24 bars with deterministic (non-random) durations and delays so SSR and
// client render produce the same values and avoid hydration mismatches.
const BARS = Array.from({ length: 24 }, (_, i) => ({
  id: i,
  // duration cycles 0.30s → 0.54s across the 24 bars
  duration: (0.30 + (i % 5) * 0.06).toFixed(2),
  // delay staggers 0s → 0.23s
  delay: ((i * 7) % 24 / 100).toFixed(2),
}));

const WAVE_CSS = `
@keyframes zivikaWaveBar {
  0%, 100% { height: 6px; }
  50%       { height: 28px; }
}
`;

/**
 * AudioWaveform — animated bar-graph that simulates audio input.
 *
 * Props:
 *   active  bool — when true, bars animate; when false they freeze at 14px
 */
export default function AudioWaveform({ active = true }) {
  return (
    <>
      <style>{WAVE_CSS}</style>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 4,
          height: 36,
        }}
      >
        {BARS.map((bar) => (
          <div
            key={bar.id}
            style={{
              width: 3,
              height: active ? 14 : 14,
              borderRadius: 2,
              background: "linear-gradient(180deg, #00C9A7 0%, #0D6E4F 100%)",
              animation: active
                ? `zivikaWaveBar ${bar.duration}s ease-in-out ${bar.delay}s infinite`
                : "none",
              transition: "height 0.3s ease",
            }}
          />
        ))}
      </div>
    </>
  );
}
