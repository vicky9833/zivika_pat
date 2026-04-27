"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, Activity, ScanLine, FolderHeart, Rss, Bell, Search, UserRound, Stethoscope } from "lucide-react";
import ZivikaLogo from "@/components/shared/ZivikaLogo";
import ToastContainer from "@/components/ui/Toast";
import GlobalSearch from "@/components/shared/GlobalSearch";
import { useUserStore } from "@/lib/stores/user-store";
import { useConvexUser } from "@/lib/hooks/useConvexUser";
import { useLanguage } from "@/lib/contexts/LanguageContext";
import { t } from "@/lib/translations";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

const NAV_ITEM_DEFS = [
  { href: "/dashboard", labelKey: "home", icon: Home },
  { href: "/dashboard/twin", labelKey: "twin", icon: Activity },
  { href: "/dashboard/scan", labelKey: "scan", icon: ScanLine, isFab: true },
  { href: "/dashboard/locker", labelKey: "locker", icon: FolderHeart },
  { href: "/dashboard/feed", labelKey: "feed", icon: Rss },
];

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);
  const user = useUserStore((s) => s.user);
  const { language } = useLanguage();
  // Sync Convex user data into Zustand on every dashboard visit
  const { convexUser } = useConvexUser();
  const profilePhotoUrl = useQuery(
    api.users.getPhotoUrl,
    convexUser?.profilePhotoStorageId ? { storageId: convexUser.profilePhotoStorageId } : "skip"
  );

  const NAV_ITEMS = NAV_ITEM_DEFS.map((item) => ({
    ...item,
    label: t(item.labelKey, language),
  }));

  return (
    <div
      style={{
        backgroundColor: "#fff",
        position: "relative",
        minHeight: "100dvh",
      }}
    >
      <ToastContainer />
      <GlobalSearch isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* ── Top Bar ──────────────────────────────────────────── */}
      <header
        style={{
          position: "fixed",
          top: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: "100%",
          maxWidth: 390,
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 20px",
          backgroundColor: "#fff",
          borderBottom: "1px solid #DCE8E2",
          zIndex: 50,
          boxSizing: "border-box",
        }}
      >
        <ZivikaLogo size={36} showText={true} />

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* Search button */}
          <button
            onClick={() => setSearchOpen(true)}
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: "#F0F7F4",
              border: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "#5A9A7E",
            }}
            aria-label="Search"
          >
            <Search size={18} />
          </button>

          {/* Ask Doctor shortcut */}
          <button
            onClick={() => router.push("/dashboard/copilot?mode=doctor")}
            style={{
              position: "relative",
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: "linear-gradient(135deg, rgba(13,110,79,0.10), rgba(0,201,167,0.10))",
              border: "1.5px solid rgba(0,201,167,0.35)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
            aria-label="Ask Doctor"
          >
            <Stethoscope size={17} color="#0D6E4F" />
            {/* Online dot */}
            <span
              className="pulse-dot"
              style={{
                position: "absolute",
                top: 6,
                right: 6,
                width: 7,
                height: 7,
                borderRadius: "50%",
                backgroundColor: "#27AE60",
                border: "2px solid #fff",
              }}
            />
          </button>

          {/* Notification bell */}
          <button
            onClick={() => router.push("/dashboard/notifications")}
            style={{
              position: "relative",
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: "#F0F7F4",
              border: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "#5A9A7E",
            }}
            aria-label="Notifications"
          >
            <Bell size={18} />
          </button>

          {/* User avatar — navigates to profile */}
          <button
            onClick={() => router.push("/dashboard/profile")}
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #0D6E4F, #00C9A7)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              flexShrink: 0,
              border: "none",
              padding: 0,
              overflow: "hidden",
            }}
            aria-label="View profile"
          >
            {profilePhotoUrl ? (
              <img src={profilePhotoUrl} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} />
            ) : user.initials ? (
              <span
                style={{
                  fontFamily: "var(--font-outfit, 'Outfit', sans-serif)",
                  fontWeight: 700,
                  fontSize: 13,
                  color: "#fff",
                  letterSpacing: "0.03em",
                }}
              >
                {user.initials}
              </span>
            ) : (
              <UserRound size={18} color="#fff" />
            )}
          </button>
        </div>
      </header>

      {/* ── Scrollable content area ───────────────────────────── */}
      <main
        style={{
          paddingTop: 64,
          paddingBottom: "calc(72px + env(safe-area-inset-bottom, 0px))",
          position: "relative",
          width: "100%",
        }}
      >
        <motion.div
          key={pathname || "default"}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          style={{ minHeight: "100%" }}
        >
          {children}
        </motion.div>
      </main>

      {/* ── Bottom Navigation ─────────────────────────────────── */}
      <nav
        style={{
          position: "fixed",
          bottom: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: "100%",
          maxWidth: 390,
          backgroundColor: "#fff",
          borderTop: "1px solid #DCE8E2",
          paddingBottom: "env(safe-area-inset-bottom, 4px)",
          zIndex: 50,
          overflow: "visible",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            height: 72,
            width: "100%",
          }}
        >
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);
            const Icon = item.icon;

            if (item.isFab) {
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-label={item.label}
                  aria-current={isActive ? "page" : undefined}
                  style={{
                    flex: 1,
                    minWidth: 0,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    textDecoration: "none",
                    paddingBottom: 10,
                    overflow: "visible",
                  }}
                >
                  {/* Floating scan button */}
                  <div
                    style={{
                      width: 60,
                      height: 60,
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #0D6E4F, #00C9A7)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transform: "translateY(-22px)",
                      boxShadow:
                        "0 6px 24px rgba(0,201,167,0.40), 0 2px 8px rgba(13,110,79,0.25)",
                      border: "3px solid #fff",
                      flexShrink: 0,
                    }}
                  >
                    <Icon size={24} color="#fff" />
                  </div>
                  <span
                    style={{
                      fontFamily: "var(--font-dm-sans, 'DM Sans', sans-serif)",
                      fontSize: 10,
                      fontWeight: 600,
                      color: "#0D6E4F",
                      marginTop: -14,
                      textDecoration: "none",
                    }}
                  >
                    {item.label}
                  </span>
                </Link>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-label={item.label}
                aria-current={isActive ? "page" : undefined}
                style={{
                  flex: 1,
                  minWidth: 0,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "8px 0 6px",
                  textDecoration: "none",
                  gap: 3,
                }}
              >
                <div
                  style={{
                    padding: isActive ? "6px 14px" : "6px 8px",
                    borderRadius: 20,
                    background: isActive ? "rgba(13,110,79,0.10)" : "transparent",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "background 0.2s, padding 0.2s",
                  }}
                >
                  <Icon
                    size={20}
                    color={isActive ? "#0D6E4F" : "#8EBAA3"}
                    strokeWidth={isActive ? 2.2 : 1.8}
                  />
                </div>
                <span
                  style={{
                    fontFamily: "var(--font-dm-sans, 'DM Sans', sans-serif)",
                    fontSize: 10,
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? "#0D6E4F" : "#5A7A6E",
                    textDecoration: "none",
                  }}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
