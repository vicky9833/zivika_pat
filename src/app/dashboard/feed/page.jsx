"use client";
export const dynamic = "force-dynamic";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Rss } from "lucide-react";
import { useFeedStore } from "@/lib/stores/feed-store";
import FeedCard from "@/components/feed/FeedCard";

const H = "var(--font-outfit, 'Outfit', sans-serif)";
const B = "var(--font-dm-sans, 'DM Sans', sans-serif)";

const CATEGORIES = ["All", "Nutrition", "Fitness", "Mental Health", "Diabetes", "Heart", "General"];

export default function FeedPage() {
  const { items } = useFeedStore();
  const [activeCategory, setActiveCategory] = useState("All");

  const filtered = activeCategory === "All"
    ? items
    : items.filter((i) => i.category === activeCategory);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#F0F7F4",
        paddingBottom: 90,
      }}
    >
      {/* ── Sticky header ─────────────────────────────────────── */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: "#fff",
          borderBottom: "1px solid #DCE8E2",
          paddingTop: "env(safe-area-inset-top, 0px)",
        }}
      >
        <div style={{ padding: "16px 20px 10px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Rss size={20} color="#0D6E4F" />
            <div>
              <h1 style={{ fontFamily: H, fontWeight: 700, fontSize: "1.05rem", color: "#0B1F18", margin: 0 }}>
                Health Feed
              </h1>
              <p style={{ fontFamily: B, fontSize: "0.72rem", color: "#8EBAA3", margin: 0 }}>
                Daily tips from verified Indian doctors
              </p>
            </div>
          </div>
        </div>

        {/* Category filter tabs */}
        <div
          style={{
            overflowX: "auto",
            WebkitOverflowScrolling: "touch",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            padding: "0 16px 12px",
          }}
        >
          <div style={{ display: "flex", gap: 8, width: "max-content" }}>
            {CATEGORIES.map((cat) => {
              const active = cat === activeCategory;
              return (
                <motion.button
                  key={cat}
                  whileTap={{ scale: 0.92 }}
                  onClick={() => setActiveCategory(cat)}
                  style={{
                    padding: "6px 16px",
                    borderRadius: 20,
                    border: active ? "none" : "1.5px solid #DCE8E2",
                    background: active ? "#0D6E4F" : "#fff",
                    color: active ? "#fff" : "#5A7A6E",
                    fontFamily: B,
                    fontWeight: active ? 700 : 500,
                    fontSize: "0.78rem",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    boxShadow: active ? "0 2px 8px rgba(13,110,79,0.25)" : "none",
                  }}
                >
                  {cat}
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Feed list ──────────────────────────────────────────── */}
      <div style={{ padding: "16px 16px 0" }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22 }}
          >
            {filtered.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "60px 20px",
                  color: "#8EBAA3",
                  fontFamily: B,
                  fontSize: "0.88rem",
                }}
              >
                No posts in this category yet.
              </div>
            ) : (
              filtered.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.25 }}
                >
                  <FeedCard item={item} />
                </motion.div>
              ))
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
