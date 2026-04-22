import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireOwnUser } from "./lib";

// ── Log a vital reading ───────────────────────────────────────────────────
export const log = mutation({
  args: {
    userId:     v.id("users"),
    type:       v.string(),
    value:      v.any(),
    unit:       v.optional(v.string()),
    notes:      v.optional(v.string()),
    recordedAt: v.string(),
  },
  handler: async (ctx, args) => {
    await requireOwnUser(ctx, args.userId);
    return await ctx.db.insert("vitals", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

// ── Get all vitals for a user ─────────────────────────────────────────────
export const listByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    await requireOwnUser(ctx, args.userId);
    return await ctx.db
      .query("vitals")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});

// ── Get history for a specific vital type ────────────────────────────────
export const getHistory = query({
  args: {
    userId: v.id("users"),
    type:   v.string(),
  },
  handler: async (ctx, args) => {
    await requireOwnUser(ctx, args.userId);
    return await ctx.db
      .query("vitals")
      .withIndex("by_user_type", (q) =>
        q.eq("userId", args.userId).eq("type", args.type)
      )
      .order("desc")
      .take(30);
  },
});

// ── Delete a vital entry ──────────────────────────────────────────────────
export const remove = mutation({
  args: { id: v.id("vitals") },
  handler: async (ctx, args) => {
    const vital = await ctx.db.get(args.id);
    if (!vital) throw new Error("Vital not found");
    await requireOwnUser(ctx, vital.userId);
    await ctx.db.delete(args.id);
  },
});
