"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useFamilyStore } from "@/lib/stores/family-store";
import { useConvexUser } from "@/lib/hooks/useConvexUser";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import FamilyMemberCard from "@/components/family/FamilyMemberCard";
import AddFamilyMember from "@/components/family/AddFamilyMember";
import EmptyState from "@/components/shared/EmptyState";
import { toast } from "@/components/ui/Toast";
import { Users, Check } from "lucide-react";

const H = "var(--font-outfit, 'Outfit', sans-serif)";
const B = "var(--font-dm-sans, 'DM Sans', sans-serif)";

export default function FamilyPage() {
  const router = useRouter();
  const zustandMembers = useFamilyStore((s) => s.members);
  const [addOpen, setAddOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  useEffect(() => { const t = setTimeout(() => setLoading(false), 400); return () => clearTimeout(t); }, []);

  // Convex wiring
  const { convexUser } = useConvexUser();
  const userId = convexUser?._id;
  const convexMembers = useQuery(api.family.listByUser, userId ? { userId } : "skip");
  const addFamilyMember = useMutation(api.family.add);
  const removeFamilyMember = useMutation(api.family.remove);

  // Use Convex data when available, fall back to Zustand
  const members = convexMembers ?? zustandMembers;

  async function handleSaveMember(memberData) {
    if (!userId) return;
    await addFamilyMember({
      userId,
      name:       memberData.name,
      relation:   memberData.relation ?? "Other",
      dob:        memberData.dob,
      bloodGroup: memberData.bloodGroup,
    });
  }

  function handleMemberTap(member) {
    if (member.isSelf) {
      router.push("/dashboard");
    } else {
      toast(`Switch to ${member.name}'s health profile`, "info");
    }
  }

  if (loading) {
    return (
      <div style={{ padding: "20px 20px 100px", display: "flex", flexDirection: "column", gap: 16 }}>
        <div className="animate-pulse" style={{ background: "#DCE8E2", borderRadius: 10, height: 36, width: 100 }} />
        {[...Array(4)].map((_, i) => <div key={i} className="animate-pulse" style={{ background: "#DCE8E2", borderRadius: 16, height: 80 }} />)}
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
      {/* ── Top Nav ── */}
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
        }}
      >
        <button
          onClick={() => router.back()}
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            border: "1.5px solid #DCE8E2",
            background: "#fff",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 0,
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0B1F18" strokeWidth="2.2" strokeLinecap="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <h1 style={{ fontFamily: H, fontWeight: 700, fontSize: "1.1rem", color: "#0B1F18", margin: 0 }}>
          Family Health
        </h1>
      </div>

      <div style={{ padding: "8px 20px", display: "flex", flexDirection: "column", gap: 20 }}>

        {/* ── Section 1: Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          style={{
            borderRadius: 18,
            background: "linear-gradient(135deg, #0D6E4F 0%, #065F46 100%)",
            padding: "22px 20px",
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: "rgba(255,255,255,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Users size={26} color="#fff" />
          </div>
          <div>
            <h2 style={{ fontFamily: H, fontWeight: 800, fontSize: "1.05rem", color: "#fff", margin: "0 0 4px" }}>
              Family Health
            </h2>
            <p style={{ fontFamily: B, fontSize: "0.8rem", color: "rgba(255,255,255,0.8)", margin: "0 0 8px" }}>
              Manage your family&apos;s health in one place
            </p>
            {members.length > 0 ? (
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  background: "rgba(255,255,255,0.18)",
                  borderRadius: 20,
                  padding: "4px 12px",
                }}
              >
                <span style={{ fontFamily: B, fontWeight: 700, fontSize: "0.8rem", color: "#fff" }}>
                  {members.length} family member{members.length !== 1 ? "s" : ""}
                </span>
              </div>
            ) : (
              <span style={{ fontFamily: B, fontSize: "0.78rem", color: "rgba(255,255,255,0.65)" }}>
                No members yet
              </span>
            )}
          </div>
        </motion.div>

        {/* ── Section 2: Family Members List ── */}
        {members.length === 0 ? (
          <EmptyState
            icon={Users}
            title="Your family health hub"
            description="Add family members to manage their health records, medications, and vitals all in one place"
            ctaLabel="Add Family Member"
            onCta={() => setAddOpen(true)}
          />
        ) : (
        <div>
          <h2 style={{ fontFamily: H, fontWeight: 700, fontSize: "1rem", color: "#0B1F18", margin: "0 0 12px" }}>
            Members
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {members.map((member, i) => (
              <FamilyMemberCard
                key={member._id ?? member.id}
                member={member}
                index={i}
                onClick={() => handleMemberTap(member)}
              />
            ))}
          </div>
        </div>
        )}

        {/* ── Section 3: Add Member ── */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => setAddOpen(true)}
          style={{
            width: "100%",
            padding: "18px",
            borderRadius: 18,
            border: "1.5px dashed #00C9A7",
            background: "rgba(0,201,167,0.05)",
            cursor: "pointer",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #0D6E4F, #00C9A7)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </div>
          <span style={{ fontFamily: H, fontWeight: 700, fontSize: "0.9rem", color: "#0D6E4F" }}>
            Add Family Member
          </span>
          <span style={{ fontFamily: B, fontSize: "0.76rem", color: "#8EBAA3" }}>
            Parents, spouse, children, siblings
          </span>
        </motion.button>

        <AddFamilyMember open={addOpen} onClose={() => setAddOpen(false)} onSave={handleSaveMember} />

        {/* ── Section 4: Family Subscription Card ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          style={{
            borderRadius: 20,
            background: "linear-gradient(135deg, #0B1F18 0%, #0D6E4F 65%, #00C9A7 100%)",
            padding: "1px",
            boxShadow: "0 6px 24px rgba(13,110,79,0.22)",
          }}
        >
          <div
            style={{
              borderRadius: 19,
              background: "linear-gradient(155deg, #0f2a20 0%, #0D6E4F 100%)",
              padding: "22px 20px",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Decorative bg circle */}
            <div
              style={{
                position: "absolute",
                top: -50,
                right: -50,
                width: 180,
                height: 180,
                borderRadius: "50%",
                background: "rgba(0,201,167,0.08)",
                pointerEvents: "none",
              }}
            />

            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                background: "rgba(0,201,167,0.2)",
                borderRadius: 20,
                padding: "4px 12px",
                marginBottom: 12,
              }}
            >
              <span style={{ fontSize: 12 }}>⭐</span>
              <span style={{ fontFamily: B, fontWeight: 700, fontSize: "0.7rem", color: "#00C9A7", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Family Health Plan
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 6 }}>
              <span style={{ fontFamily: H, fontWeight: 900, fontSize: "1.8rem", color: "#fff" }}>₹100</span>
              <span style={{ fontFamily: B, fontSize: "0.8rem", color: "rgba(255,255,255,0.6)" }}>/month</span>
            </div>

            <p style={{ fontFamily: B, fontSize: "0.82rem", color: "rgba(255,255,255,0.75)", margin: "0 0 16px", lineHeight: 1.5 }}>
              Manage health records for your entire family — unlimited members, one plan.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
              {[
                "Health Locker for each member",
                "Dedicated AI Copilot per member",
                "Individual Digital Twins",
                "Separate medication trackers",
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Check size={14} color="#00C9A7" style={{ flexShrink: 0 }} />
                  <span style={{ fontFamily: B, fontSize: "0.8rem", color: "rgba(255,255,255,0.82)" }}>{item}</span>
                </div>
              ))}
            </div>

            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => toast("Subscription coming soon", "info")}
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: 12,
                background: "#00C9A7",
                border: "none",
                color: "#0B1F18",
                fontFamily: B,
                fontWeight: 700,
                fontSize: "0.9rem",
                cursor: "pointer",
              }}
            >
              Coming Soon
            </motion.button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
