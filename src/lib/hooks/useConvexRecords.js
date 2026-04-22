"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";

/**
 * useConvexRecords
 * Provides Convex-backed health records for the current user.
 * Requires `convexUser` (the Convex user document) to be passed in
 * so we know the Convex user _id.
 */
export function useConvexRecords(convexUser) {
  const userId = convexUser?._id;

  const records = useQuery(
    api.records.listByUser,
    userId ? { userId } : "skip"
  );

  const createRecordMutation      = useMutation(api.records.create);
  const toggleFavouriteMutation   = useMutation(api.records.toggleFavourite);
  const removeRecordMutation      = useMutation(api.records.remove);
  const generateUploadUrlMutation = useMutation(api.records.generateUploadUrl);

  async function createRecord(data) {
    if (!userId) throw new Error("No user");
    return await createRecordMutation({ userId, ...data });
  }

  async function generateUploadUrl() {
    return await generateUploadUrlMutation();
  }

  async function toggleFavourite(id) {
    await toggleFavouriteMutation({ id });
  }

  async function removeRecord(id) {
    await removeRecordMutation({ id });
  }

  return {
    records:          records ?? [],
    isLoading:        records === undefined,
    createRecord,
    generateUploadUrl,
    toggleFavourite,
    removeRecord,
  };
}

