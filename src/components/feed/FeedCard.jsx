"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart, MessageCircle, Share2, Bookmark,
  Play, UserPlus, ShieldCheck,
} from "lucide-react";
import { useFeedStore } from "@/lib/stores/feed-store";
import DoctorAvatar from "./DoctorAvatar";

const H = "var(--font-outfit, 'Outfit', sans-serif)";
const B = "var(--font-dm-sans, 'DM Sans', sans-serif)";

const CATEGORY_COLORS = {
  Diabetes:      { bg: "rgba(5,150,105,0.18)",  color: "#059669" },
  Nutrition:     { bg: "rgba(124,58,237,0.18)", color: "#7C3AED" },
  "Mental Health": { bg: "rgba(37,99,235,0.18)", color: "#2563EB" },
  General:       { bg: "rgba(180,83,9,0.18)",   color: "#B45309" },
  Heart:         { bg: "rgba(159,18,57,0.18)",  color: "#9F1239" },
  Fitness:       { bg: "rgba(190,24,93,0.18)",  color: "#BE185D" },
};

export default function FeedCard({ item }) {
  const { toggleLike, toggleBookmark } = useFeedStore();
  const [expanded, setExpanded] = useState(false);
  const [followed, setFollowed] = useState(false);
  const [likeBurst, setLikeBurst] = useState(false);

  const [from, to] = item.bannerGradient || ["#0D6E4F", "#00C9A7"];
  const catStyle = CATEGORY_COLORS[item.category] || { bg: "rgba(13,110,79,0.15)", color: "#0D6E4F" };

  const PREVIEW_LENGTH = 140;
  const needsExpand = item.content.length > PREVIEW_LENGTH;
  const displayText = expanded || !needsExpand
    ? item.content
    : item.content.slice(0, PREVIEW_LENGTH) + "…";

  function handleLike() {
    toggleLike(item.id);
    setLikeBurst(true);
    setTimeout(() => setLikeBurst(false), 400);
  }

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 20,
        overflow: "hidden",
        boxShadow: "0 2px 16px rgba(13,110,79,0.07)",
        border: "1px solid #DCE8E2",
        marginBottom: 16,
      }}
    >
      {/* ── Doctor row ─────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "14px 16px 10px",
        }}
      >
        <DoctorAvatar
          initials={item.doctorInitials}
          gradient={item.avatarGradient}
          size={42}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <p style={{ fontFamily: H, fontWeight: 700, fontSize: "0.88rem", color: "#0B1F18", margin: 0 }}>
              {item.doctorName}
            </p>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 3, background: "rgba(13,110,79,0.08)", borderRadius: 20, padding: "2px 6px" }}>
              <ShieldCheck size={11} color="#0D6E4F" />
              <span style={{ fontFamily: B, fontWeight: 600, fontSize: "0.6rem", color: "#0D6E4F" }}>Verified</span>
            </div>
          </div>
          <p style={{ fontFamily: B, fontSize: "0.73rem", color: "#8EBAA3", margin: 0 }}>
            {item.specialty}
          </p>
        </div>
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={() => setFollowed((f) => !f)}
          style={{
            padding: "5px 14px",
            borderRadius: 20,
            border: followed ? "1.5px solid #DCE8E2" : "1.5px solid #0D6E4F",
            background: followed ? "#F0F7F4" : "rgba(13,110,79,0.07)",
            color: followed ? "#8EBAA3" : "#0D6E4F",
            fontFamily: B,
            fontWeight: 700,
            fontSize: "0.72rem",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 5,
          }}
        >
          {!followed && <UserPlus size={12} />}
          {followed ? "Following" : "Follow"}
        </motion.button>
      </div>

      {/* ── Visual banner ──────────────────────────────────────── */}
      <div
        style={{
          height: 200,
          background: `linear-gradient(145deg, ${from}, ${to})`,
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        {/* Subtle pattern overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: "radial-gradient(circle at 20% 80%, rgba(255,255,255,0.08) 0%, transparent 60%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.06) 0%, transparent 50%)",
          }}
        />

        {/* Category badge */}
        <div
          style={{
            position: "absolute",
            top: 12,
            left: 12,
            padding: "4px 12px",
            borderRadius: 20,
            background: "rgba(0,0,0,0.35)",
            backdropFilter: "blur(8px)",
          }}
        >
          <span style={{ fontFamily: B, fontWeight: 700, fontSize: "0.7rem", color: "#fff", letterSpacing: "0.04em" }}>
            {item.category}
          </span>
        </div>

        {/* Play button */}
        <motion.div
          whileTap={{ scale: 0.88 }}
          style={{
            width: 60,
            height: 60,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.25)",
            backdropFilter: "blur(6px)",
            border: "2px solid rgba(255,255,255,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
        >
          <Play size={24} color="#fff" fill="#fff" style={{ marginLeft: 3 }} />
        </motion.div>
      </div>

      {/* ── Content ────────────────────────────────────────────── */}
      <div style={{ padding: "14px 16px 0" }}>
        <p
          style={{
            fontFamily: H,
            fontWeight: 700,
            fontSize: "0.97rem",
            color: "#0B1F18",
            margin: "0 0 8px",
            lineHeight: 1.4,
          }}
        >
          {item.title}
        </p>

        <p
          style={{
            fontFamily: B,
            fontSize: "0.82rem",
            color: "#5A7A6E",
            margin: 0,
            lineHeight: 1.65,
          }}
        >
          {displayText}
        </p>

        {needsExpand && (
          <button
            onClick={() => setExpanded((e) => !e)}
            style={{
              background: "none",
              border: "none",
              padding: 0,
              margin: "4px 0 0",
              fontFamily: B,
              fontWeight: 700,
              fontSize: "0.8rem",
              color: "#0D6E4F",
              cursor: "pointer",
            }}
          >
            {expanded ? "Show less" : "Read more"}
          </button>
        )}
      </div>

      {/* ── Engagement row ─────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 4,
          padding: "10px 12px 14px",
          borderTop: "1px solid #F0F7F4",
        }}
      >
        {/* Like */}
        <motion.button
          animate={likeBurst ? { scale: [1, 1.35, 1] } : { scale: 1 }}
          transition={{ duration: 0.3 }}
          onClick={handleLike}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            padding: "7px 11px",
            borderRadius: 20,
            border: "none",
            background: item.isLiked ? "rgba(239,68,68,0.1)" : "transparent",
            cursor: "pointer",
          }}
        >
          <Heart
            size={17}
            color={item.isLiked ? "#EF4444" : "#8EBAA3"}
            fill={item.isLiked ? "#EF4444" : "none"}
          />
          <span style={{ fontFamily: B, fontWeight: 600, fontSize: "0.78rem", color: item.isLiked ? "#EF4444" : "#8EBAA3" }}>
            {item.likes.toLocaleString("en-IN")}
          </span>
        </motion.button>

        {/* Comment */}
        <button
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            padding: "7px 11px",
            borderRadius: 20,
            border: "none",
            background: "transparent",
            cursor: "pointer",
          }}
        >
          <MessageCircle size={17} color="#8EBAA3" />
          <span style={{ fontFamily: B, fontWeight: 600, fontSize: "0.78rem", color: "#8EBAA3" }}>
            {item.comments}
          </span>
        </button>

        {/* Share */}
        <button
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            padding: "7px 11px",
            borderRadius: 20,
            border: "none",
            background: "transparent",
            cursor: "pointer",
          }}
        >
          <Share2 size={17} color="#8EBAA3" />
        </button>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Bookmark */}
        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={() => toggleBookmark(item.id)}
          style={{
            display: "flex",
            alignItems: "center",
            padding: "7px 10px",
            borderRadius: 20,
            border: "none",
            background: item.isBookmarked ? "rgba(13,110,79,0.1)" : "transparent",
            cursor: "pointer",
          }}
        >
          <Bookmark
            size={17}
            color={item.isBookmarked ? "#0D6E4F" : "#8EBAA3"}
            fill={item.isBookmarked ? "#0D6E4F" : "none"}
          />
        </motion.button>
      </div>
    </div>
  );
}
