import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthenticatedUser } from "./lib";

// ── Create or update user (called from Clerk webhook) ──────────────────────
export const upsertUser = mutation({
  args: {
    clerkId:  v.string(),
    email:    v.optional(v.string()),
    name:     v.optional(v.string()),
    phone:    v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        email:    args.email ?? existing.email,
        name:     args.name ?? existing.name,
        phone:    args.phone ?? existing.phone,
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
      profileComplete: false,
      onboarded:       false,
      createdAt:       Date.now(),
    });
  },
});

// ── Complete profile setup ────────────────────────────────────────────────
export const completeProfile = mutation({
  args: {
    clerkId:        v.string(),
    name:           v.string(),
    dob:            v.optional(v.string()),
    gender:         v.optional(v.string()),
    bloodGroup:     v.optional(v.string()),
    height:         v.optional(v.number()),
    weight:         v.optional(v.number()),
    conditions:     v.optional(v.array(v.string())),
    healthGoal:     v.optional(v.string()),
    nativeLanguage: v.optional(v.string()),
    ecName:         v.optional(v.string()),
    ecPhone:        v.optional(v.string()),
    ecRelation:     v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    if (identity.subject !== args.clerkId) throw new Error("Unauthorized");
    const { clerkId, ...profileFields } = args;

    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        ...profileFields,
        profileComplete: true,
        onboarded:       true,
      });
      return existing._id;
    }

    return await ctx.db.insert("users", {
      clerkId,
      ...profileFields,
      profileComplete: true,
      onboarded:       true,
      createdAt:       Date.now(),
    });
  },
});

// ── Get user by Clerk ID — only the authenticated user can read their own doc ──
export const getByClerkId = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    if (identity.subject !== args.clerkId) throw new Error("Unauthorized");
    return await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();
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
    conditions:     v.optional(v.array(v.string())),
    healthGoal:     v.optional(v.string()),
    nativeLanguage: v.optional(v.string()),
    ecName:         v.optional(v.string()),
    ecPhone:        v.optional(v.string()),
    ecRelation:     v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    if (identity.subject !== args.clerkId) throw new Error("Unauthorized");
    const { clerkId, ...fields } = args;
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .first();
    if (!user) throw new Error("User not found");
    const updates = Object.fromEntries(
      Object.entries(fields).filter(([, v]) => v !== undefined)
    );
    await ctx.db.patch(user._id, updates);
    return user._id;
  },
});

// ── Upload profile photo ──────────────────────────────────────────────────
export const updateProfilePhoto = mutation({
  args: {
    clerkId:          v.string(),
    photoStorageId:   v.string(),
  },
  handler: async (ctx, { clerkId, photoStorageId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    if (identity.subject !== clerkId) throw new Error("Unauthorized");
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .first();
    if (!user) throw new Error("User not found");
    await ctx.db.patch(user._id, { profilePhotoStorageId: photoStorageId });
    return user._id;
  },
});

// ── Get profile photo URL ─────────────────────────────────────────────────
export const getPhotoUrl = query({
  args: { storageId: v.string() },
  handler: async (ctx, { storageId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    return await ctx.storage.getUrl(storageId);
  },
});

// ── Generate upload URL for profile photo ────────────────────────────────
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    return await ctx.storage.generateUploadUrl();
  },
});
