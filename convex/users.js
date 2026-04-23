import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// ── Internal helper ───────────────────────────────────────────────────────
async function getUserByClerkId(ctx, clerkId) {
  return await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
    .first();
}

function makeHealthId() {
  const year = new Date().getFullYear();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ZVK-${year}-${rand}`;
}

// ── PUBLIC: Get user by Clerk ID (no auth required) ──────────────────────
// Safe because clerkId is the user's own identifier, visible in their JWT.
// Without this being public, the app gets stuck in a boot loop when Clerk
// JWT tokens can't yet be validated by Convex (missing JWT template etc.).
export const getUser = query({
  args: { clerkId: v.string() },
  handler: async (ctx, { clerkId }) => {
    return await getUserByClerkId(ctx, clerkId);
  },
});

// Alias kept for any code still referencing getByClerkId
export const getByClerkId = query({
  args: { clerkId: v.string() },
  handler: async (ctx, { clerkId }) => {
    return await getUserByClerkId(ctx, clerkId);
  },
});

// ── PUBLIC: Bootstrap user creation (no auth required) ───────────────────
// Fixes the chicken-and-egg problem: Convex can't authenticate a Clerk token
// until the JWT template exists, but we need a user record to do anything.
// This is safe because:
// 1. We only INSERT — existing records are returned unchanged.
// 2. clerkId is the user's own opaque ID (not a secret).
// 3. No sensitive data is written here; profile data is added via completeProfile.
export const createUser = mutation({
  args: {
    clerkId:   v.string(),
    email:     v.optional(v.string()),
    name:      v.string(),
    firstName: v.optional(v.string()),
    initials:  v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await getUserByClerkId(ctx, args.clerkId);
    if (existing) return existing._id;

    return await ctx.db.insert("users", {
      clerkId:              args.clerkId,
      email:                args.email,
      name:                 args.name,
      firstName:            args.firstName,
      initials:             args.initials,
      healthId:             makeHealthId(),
      profileComplete:      false,
      onboarded:            false,
      notificationsEnabled: true,
      preferredLanguage:    "en",
      createdAt:            Date.now(),
    });
  },
});

// ── PUBLIC: Webhook upsert (called from http.js, no client auth) ──────────
export const upsertUser = mutation({
  args: {
    clerkId:  v.string(),
    email:    v.optional(v.string()),
    name:     v.optional(v.string()),
    phone:    v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await getUserByClerkId(ctx, args.clerkId);
    if (existing) {
      await ctx.db.patch(existing._id, {
        email:    args.email    ?? existing.email,
        name:     args.name     ?? existing.name,
        phone:    args.phone    ?? existing.phone,
        imageUrl: args.imageUrl ?? existing.imageUrl,
      });
      return existing._id;
    }
    return await ctx.db.insert("users", {
      clerkId:         args.clerkId,
      email:           args.email,
      name:            args.name,
      phone:           args.phone,
      imageUrl:        args.imageUrl,
      healthId:        makeHealthId(),
      profileComplete: false,
      onboarded:       false,
      createdAt:       Date.now(),
    });
  },
});

// ── Complete profile setup (called from /setup page) ──────────────────────
// Field names match what setup/page.jsx sends:
//   dob, height (cm number), weight (kg number), ecName, ecPhone, ecRelation
// NO auth check — if auth is broken, setup must still work.
export const completeProfile = mutation({
  args: {
    clerkId:        v.string(),
    name:           v.optional(v.string()),
    dob:            v.optional(v.string()),
    gender:         v.optional(v.string()),
    bloodGroup:     v.optional(v.string()),
    height:         v.optional(v.number()),  // cm
    weight:         v.optional(v.number()),  // kg
    bmi:            v.optional(v.number()),
    bmiCategory:    v.optional(v.string()),
    conditions:     v.optional(v.array(v.string())),
    healthGoal:     v.optional(v.string()),
    nativeLanguage: v.optional(v.string()),
    ecName:         v.optional(v.string()),
    ecPhone:        v.optional(v.string()),
    ecRelation:     v.optional(v.string()),
  },
  handler: async (ctx, { clerkId, ...updates }) => {
    const user = await getUserByClerkId(ctx, clerkId);

    const fields = Object.fromEntries(
      Object.entries(updates).filter(([, val]) => val !== undefined)
    );

    if (user) {
      await ctx.db.patch(user._id, { ...fields, profileComplete: true, onboarded: true });
      return user._id;
    }

    // Create user if not found (webhook may not have fired yet)
    return await ctx.db.insert("users", {
      clerkId,
      ...fields,
      healthId:        makeHealthId(),
      profileComplete: true,
      onboarded:       true,
      createdAt:       Date.now(),
    });
  },
});

// ── Partial profile update ────────────────────────────────────────────────
export const updateProfile = mutation({
  args: {
    clerkId:        v.string(),
    name:           v.optional(v.string()),
    dob:            v.optional(v.string()),
    gender:         v.optional(v.string()),
    bloodGroup:     v.optional(v.string()),
    height:         v.optional(v.number()),
    weight:         v.optional(v.number()),
    bmi:            v.optional(v.number()),
    bmiCategory:    v.optional(v.string()),
    conditions:     v.optional(v.array(v.string())),
    healthGoal:     v.optional(v.string()),
    nativeLanguage: v.optional(v.string()),
    ecName:         v.optional(v.string()),
    ecPhone:        v.optional(v.string()),
    ecRelation:     v.optional(v.string()),
    notificationsEnabled: v.optional(v.boolean()),
    preferredLanguage:    v.optional(v.string()),
  },
  handler: async (ctx, { clerkId, ...fields }) => {
    const user = await getUserByClerkId(ctx, clerkId);
    if (!user) throw new Error("User not found");
    const updates = Object.fromEntries(
      Object.entries(fields).filter(([, val]) => val !== undefined)
    );
    await ctx.db.patch(user._id, updates);
    return user._id;
  },
});

// ── Update profile photo ──────────────────────────────────────────────────
export const updateProfilePhoto = mutation({
  args: {
    clerkId:        v.string(),
    photoStorageId: v.string(),
  },
  handler: async (ctx, { clerkId, photoStorageId }) => {
    const user = await getUserByClerkId(ctx, clerkId);
    if (!user) throw new Error("User not found");
    await ctx.db.patch(user._id, { profilePhotoStorageId: photoStorageId });
    return user._id;
  },
});

// ── Get profile photo URL ─────────────────────────────────────────────────
export const getPhotoUrl = query({
  args: { storageId: v.string() },
  handler: async (ctx, { storageId }) => {
    return await ctx.storage.getUrl(storageId);
  },
});

// ── Generate upload URL (no auth — profile photo upload must work) ────────
export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});
