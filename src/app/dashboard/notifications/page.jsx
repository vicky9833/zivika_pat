"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Bell, FileText, Pill, Activity, Brain, Calendar,
  Trophy, Lightbulb, CheckCircle, ChevronLeft,
} from "lucide-react";
import { useConvexUser } from "@/lib/hooks/useConvexUser";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";

const H = "var(--font-outfit, 'Outfit', sans-serif)";
const B = "var(--font-dm-sans, 'DM Sans', sans-serif)";

const NOTIF_META = {
  report:       { Icon: FileText,   color: "#2563EB", bg: "rgba(37,99,235,0.1)"   },
  medication:   { Icon: Pill,       color: "#9333EA", bg: "rgba(147,51,234,0.1)"  },
  vital_alert:  { Icon: Activity,   color: "#E74C3C", bg: "rgba(231,76,60,0.1)"   },
  insight:      { Icon: Brain,      color: "#0D9488", bg: "rgba(13,148,136,0.1)"  },
  appointment:  { Icon: Calendar,   color: "#0D6E4F", bg: "rgba(13,110,79,0.1)"  },
  achievement:  { Icon: Trophy,     color: "#F39C12", bg: "rgba(243,156,18,0.1)"  },
  tip:          { Icon: Lightbulb,  color: "#4F46E5", bg: "rgba(79,70,229,0.1)"  },
};


export default function NotificationsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  useEffect(() => { const t = setTimeout(() => setLoading(false), 400); return () => clearTimeout(t); }, []);

  // Convex wiring
  const { convexUser } = useConvexUser();
  const userId = convexUser?._id;
  const convexNotifications = useQuery(api.notifications.listByUser, userId ? { userId } : "skip");
  const markReadMutation   = useMutation(api.notifications.markRead);
  const markAllReadMutation = useMutation(api.notifications.markAllRead);

  // Normalize Convex notification shape → local shape
  const notifications = (convexNotifications ?? []).map((n) => ({
    id:    n._id,
    type:  n.type,
    title: n.title ?? n.body ?? "",
    read:  n.isRead,
    time:  n.createdAt
      ? (() => {
          const diff = Date.now() - n.createdAt;
          if (diff < 60000)              return "Just now";
          if (diff < 3600000)            return `${Math.floor(diff / 60000)}m ago`;
          if (diff < 86400000)           return `${Math.floor(diff / 3600000)}h ago`;
          return `${Math.floor(diff / 86400000)}d ago`;
        })()
      : "",
  }));

  const unreadCount = notifications.filter((n) => !n.read).length;

  function markRead(id) {
    markReadMutation({ id }).catch(console.error);
  }

  function markAllRead() {
    if (!userId) return;
    markAllReadMutation({ userId }).catch(console.error);
  }

  if (loading) {
    return (
      <div style={{ padding: "20px 20px 100px", display: "flex", flexDirection: "column", gap: 14 }}>
        <div className="animate-pulse" style={{ background: "#DCE8E2", borderRadius: 10, height: 36, width: 120 }} />
        {[...Array(6)].map((_, i) => <div key={i} className="animate-pulse" style={{ background: "#DCE8E2", borderRadius: 14, height: 68 }} />)}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      style={{ minHeight: "100vh", background: "#F0F7F4", paddingBottom: 100 }}
    >
      {/* Top Nav */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 40,
          background: "rgba(240,247,244,0.92)",
          backdropFilter: "blur(12px)",
          padding: "16px 20px 12px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          borderBottom: "1px solid rgba(220,232,226,0.6)",
        }}
      >
        <button
          onClick={() => router.back()}
          style={{
            width: 36, height: 36, borderRadius: 10,
            border: "1.5px solid #DCE8E2", background: "#fff",
            cursor: "pointer", display: "flex", alignItems: "center",
            justifyContent: "center", padding: 0,
          }}
        >
          <ChevronLeft size={18} color="#0B1F18" />
        </button>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontFamily: H, fontWeight: 700, fontSize: "1.1rem", color: "#0B1F18", margin: 0 }}>
            Notifications
          </h1>
          {unreadCount > 0 && (
            <p style={{ fontFamily: B, fontSize: "0.72rem", color: "#8EBAA3", margin: 0 }}>
              {unreadCount} unread
            </p>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            style={{
              background: "none", border: "none", cursor: "pointer",
              fontFamily: B, fontWeight: 600, fontSize: "0.8rem", color: "#0D6E4F",
              display: "flex", alignItems: "center", gap: 4,
            }}
          >
            <CheckCircle size={14} />
            Mark all read
          </button>
        )}
      </div>

      <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
        {notifications.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              background: "linear-gradient(135deg, #F0F7F4, #E8FBF5)",
              borderRadius: 20,
              padding: "24px 20px",
              border: "1px solid rgba(13,110,79,0.1)",
            }}
          >
            {/* Icon */}
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
              <div style={{
                width: 56, height: 56, borderRadius: 16,
                background: "rgba(13,110,79,0.08)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Bell size={26} color="#0D6E4F" />
              </div>
            </div>

            <h3 style={{ fontFamily: "var(--font-outfit,'Outfit',sans-serif)", fontWeight: 700, fontSize: "1.05rem", color: "#0B1F18", textAlign: "center", margin: "0 0 6px" }}>
              You&apos;re all caught up!
            </h3>
            <p style={{ fontFamily: B, fontSize: "0.78rem", color: "#8EBAA3", textAlign: "center", margin: "0 0 20px", lineHeight: 1.5 }}>
              Notifications will appear here as you use Zivika
            </p>

            {/* Preview rows */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
              {[
                { type: "medication",  text: "Medication reminders & adherence alerts" },
                { type: "vital_alert", text: "Vital sign alerts when readings are off" },
                { type: "report",      text: "AI insights from your scanned reports" },
                { type: "achievement", text: "Health milestones and streaks" },
              ].map(({ type, text }) => {
                const m = NOTIF_META[type];
                return (
                  <div key={type} style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "10px 12px", borderRadius: 12,
                    background: "#fff", border: "1px solid #DCE8E2",
                  }}>
                    <div style={{
                      width: 34, height: 34, borderRadius: 10,
                      background: m.bg,
                      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                    }}>
                      <m.Icon size={16} color={m.color} />
                    </div>
                    <p style={{ margin: 0, fontFamily: B, fontSize: "0.8rem", color: "#5A7A6E", lineHeight: 1.4 }}>{text}</p>
                  </div>
                );
              })}
            </div>

            {/* CTA */}
            <button
              onClick={() => router.push("/dashboard/scan")}
              style={{
                width: "100%", padding: "13px", border: "none", borderRadius: 13,
                background: "linear-gradient(135deg, #0D6E4F, #00C9A7)",
                color: "#fff", fontFamily: B, fontWeight: 700, fontSize: "0.875rem",
                cursor: "pointer",
              }}
            >
              Start by scanning a report →
            </button>
          </motion.div>
        ) : notifications.map((notif, i) => {
          const meta = NOTIF_META[notif.type] || NOTIF_META.tip;
          const { Icon } = meta;
          return (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.28 }}
              onClick={() => markRead(notif.id)}
              style={{
                background: notif.read ? "#fff" : "rgba(13,110,79,0.03)",
                border: notif.read ? "1px solid #DCE8E2" : "1px solid rgba(13,110,79,0.12)",
                borderRadius: 14,
                padding: "14px 16px",
                display: "flex",
                alignItems: "flex-start",
                gap: 13,
                cursor: "pointer",
                transition: "background 0.2s, border-color 0.2s",
              }}
            >
              {/* Icon */}
              <div
                style={{
                  width: 40, height: 40, borderRadius: 12,
                  background: meta.bg, display: "flex",
                  alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Icon size={18} color={meta.color} />
              </div>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  style={{
                    fontFamily: B,
                    fontWeight: notif.read ? 400 : 600,
                    fontSize: "0.85rem",
                    color: "#0B1F18",
                    margin: 0,
                    lineHeight: 1.5,
                  }}
                >
                  {notif.title}
                </p>
                <p
                  style={{
                    fontFamily: B, fontSize: "0.72rem",
                    color: "#B8D4C5", margin: "4px 0 0",
                  }}
                >
                  {notif.time}
                </p>
              </div>

              {/* Unread dot */}
              {!notif.read && (
                <div
                  style={{
                    width: 9, height: 9,
                    borderRadius: "50%",
                    background: "#2563EB",
                    flexShrink: 0,
                    marginTop: 5,
                  }}
                />
              )}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
