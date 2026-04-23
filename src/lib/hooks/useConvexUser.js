"use client";

import { useEffect, useRef, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useUserStore } from "../stores/user-store";

/**
 * useConvexUser
 *
 * Boot sequence:
 * 1. Wait for Clerk to load (isLoaded)
 * 2. Query Convex for the user record (getUser — no auth required)
 * 3. If null: call createUser (no auth required) to bootstrap the record
 * 4. Sync the Convex user into Zustand so existing UI keeps working
 *
 * This hook never throws or blocks forever even if Clerk JWT auth is broken.
 */
export function useConvexUser() {
  const { user: clerkUser, isLoaded } = useUser();
  const updateUser = useUserStore((s) => s.updateUser);
  const createAttempted = useRef(false);
  const [localUserId, setLocalUserId] = useState(null);

  // Public query — does NOT require Clerk auth to succeed
  const convexUser = useQuery(
    api.users.getUser,
    isLoaded && clerkUser?.id ? { clerkId: clerkUser.id } : "skip"
  );

  const createUserMutation      = useMutation(api.users.createUser);
  const completeProfileMutation = useMutation(api.users.completeProfile);
  const updateProfileMutation   = useMutation(api.users.updateProfile);

  // Bootstrap: create user record when Clerk webhook hasn't fired yet
  useEffect(() => {
    if (!isLoaded || !clerkUser) return;
    if (convexUser !== null) return; // still loading (undefined) or already exists
    if (createAttempted.current) return;
    createAttempted.current = true;

    const name =
      clerkUser.fullName ||
      clerkUser.primaryEmailAddress?.emailAddress?.split("@")[0] ||
      "User";
    const firstName = clerkUser.firstName || name.split(" ")[0];
    const words = name.trim().split(/\s+/).filter(Boolean);
    const initials = words.length >= 2
      ? (words[0][0] + words[words.length - 1][0]).toUpperCase()
      : (words[0]?.slice(0, 2) ?? "ZL").toUpperCase();

    createUserMutation({
      clerkId:   clerkUser.id,
      email:     clerkUser.primaryEmailAddress?.emailAddress,
      name,
      firstName,
      initials,
    })
      .then((id) => { if (id) setLocalUserId(id); })
      .catch((err) =>
        console.error("[useConvexUser] createUser failed:", err?.message)
      );
  }, [convexUser, isLoaded, clerkUser, createUserMutation]);

  // Sync Convex → Zustand whenever the document changes
  useEffect(() => {
    if (!convexUser) return;
    if (convexUser?._id) setLocalUserId(convexUser._id);

    // Derive firstName / initials from name if not stored yet
    const name = convexUser.name ?? "";
    const words = name.trim().split(/\s+/).filter(Boolean);
    const derivedFirstName =
      convexUser.firstName ?? words[0] ?? clerkUser?.firstName ?? "";
    const derivedInitials =
      convexUser.initials ??
      (words.length >= 2
        ? (words[0][0] + words[words.length - 1][0]).toUpperCase()
        : (words[0]?.slice(0, 2) ?? "ZL").toUpperCase());

    updateUser({
      name,
      firstName:                 derivedFirstName,
      initials:                  derivedInitials,
      email:                     convexUser.email,
      imageUrl:                  convexUser.imageUrl,
      dob:                       convexUser.dob,
      gender:                    convexUser.gender,
      bloodGroup:                convexUser.bloodGroup,
      heightCm:                  convexUser.height,
      weightKg:                  convexUser.weight,
      bmi:                       convexUser.bmi,
      bmiCategory:               convexUser.bmiCategory,
      conditions:                convexUser.conditions ?? [],
      healthGoal:                convexUser.healthGoal,
      nativeLanguage:            convexUser.nativeLanguage ?? "en",
      emergencyContactName:      convexUser.ecName,
      emergencyContactPhone:     convexUser.ecPhone,
      emergencyContactRelation:  convexUser.ecRelation,
      healthId:                  convexUser.healthId,
      profileComplete:           convexUser.profileComplete ?? false,
      profilePhotoStorageId:     convexUser.profilePhotoStorageId,
    });
  }, [convexUser, updateUser]);

  async function completeProfile(profileData) {
    if (!clerkUser?.id) throw new Error("Not signed in");
    await completeProfileMutation({ clerkId: clerkUser.id, ...profileData });
  }

  async function updateProfile(fields) {
    if (!clerkUser?.id) throw new Error("Not signed in");
    await updateProfileMutation({ clerkId: clerkUser.id, ...fields });
  }

  return {
    convexUser,
    clerkUser,
    isLoaded,
    convexUserId:    convexUser?._id ?? localUserId,
    isLoading:       convexUser === undefined,
    profileComplete: convexUser?.profileComplete ?? false,
    completeProfile,
    updateProfile,
  };
}

