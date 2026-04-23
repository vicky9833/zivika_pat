import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireOwnUser, getAuthenticatedUser } from "./lib";

// ── Create a health record ────────────────────────────────────────────────
export const create = mutation({
  args: {
    userId:        v.id("users"),
    title:         v.string(),
    type:          v.string(),
    summary:       v.optional(v.string()),
    rawText:       v.optional(v.string()),
    extractedData: v.optional(v.any()),
    fileStorageId: v.optional(v.string()),
    fileUrl:       v.optional(v.string()),
    imageUrl:      v.optional(v.string()),
    date:          v.string(),
    tags:          v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    await requireOwnUser(ctx, args.userId);
    return await ctx.db.insert("healthRecords", {
      ...args,
      isFavourite: false,
      createdAt:   Date.now(),
    });
  },
});

// ── List all records for a user ───────────────────────────────────────────
export const listByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    await requireOwnUser(ctx, args.userId);
    return await ctx.db
      .query("healthRecords")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});

// ── Get a single record ───────────────────────────────────────────────────
export const getById = query({
  args: { id: v.id("healthRecords") },
  handler: async (ctx, args) => {
    const record = await ctx.db.get(args.id);
    if (!record) return null;
    await requireOwnUser(ctx, record.userId);
    return record;
  },
});

// ── Toggle favourite ──────────────────────────────────────────────────────
export const toggleFavourite = mutation({
  args: { id: v.id("healthRecords") },
  handler: async (ctx, args) => {
    const record = await ctx.db.get(args.id);
    if (!record) throw new Error("Record not found");
    await requireOwnUser(ctx, record.userId);
    await ctx.db.patch(args.id, { isFavourite: !record.isFavourite });
  },
});

// ── Delete a record ───────────────────────────────────────────────────────
export const remove = mutation({
  args: { id: v.id("healthRecords") },
  handler: async (ctx, args) => {
    const record = await ctx.db.get(args.id);
    if (!record) throw new Error("Record not found");
    await requireOwnUser(ctx, record.userId);
    await ctx.db.delete(args.id);
  },
});

// ── Generate upload URL (for storing files in Convex) ────────────────────
export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});
