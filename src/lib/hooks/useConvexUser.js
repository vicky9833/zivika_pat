"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useUserStore } from "../stores/user-store";

/**
 * useConvexUser
 * - Reads the Convex user document for the currently signed-in Clerk user
 * - Syncs the result into Zustand so all existing UI that reads from
 *   useUserStore() continues to work without changes
 * - Exposes `completeProfile` mutation for the setup page
 */
export function useConvexUser() {
  const { user: clerkUser, isSignedIn } = useUser();
  const updateUser = useUserStore((s) => s.updateUser);

  const convexUser = useQuery(
    api.users.getByClerkId,
    isSignedIn && clerkUser?.id
      ? { clerkId: clerkUser.id }
      : "skip"
  );

  const completeProfileMutation = useMutation(api.users.completeProfile);
  const updateProfileMutation   = useMutation(api.users.updateProfile);

  // Sync Convex → Zustand whenever the document changes
  useEffect(() => {
    if (!convexUser) return;
    updateUser({
      name:                      convexUser.name,
      firstName:                 convexUser.name?.split(" ")[0],
      initials:                  convexUser.name
        ? (convexUser.name.trim().split(/\s+/).length === 1
            ? convexUser.name.slice(0, 2).toUpperCase()
            : (convexUser.name.trim().split(/\s+/)[0][0] +
               convexUser.name.trim().split(/\s+/).at(-1)[0]).toUpperCase())
        : "ZL",
      email:                     convexUser.email,
      imageUrl:                  convexUser.imageUrl,
      dob:                       convexUser.dob,
      gender:                    convexUser.gender,
      bloodGroup:                convexUser.bloodGroup,
      heightCm:                  convexUser.height,
      conditions:                convexUser.conditions ?? [],
      healthGoal:                convexUser.healthGoal,
      nativeLanguage:            convexUser.nativeLanguage ?? "en",
      emergencyContactName:      convexUser.ecName,
      emergencyContactPhone:     convexUser.ecPhone,
      emergencyContactRelation:  convexUser.ecRelation,
      profileComplete:           convexUser.profileComplete ?? false,
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
    isLoading:       convexUser === undefined,
    profileComplete: convexUser?.profileComplete ?? false,
    completeProfile,
    updateProfile,
  };
}

