import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireOwnUser } from "./lib";

// ── Save a chat message ───────────────────────────────────────────────────
export const saveMessage = mutation({
  args: {
    userId:   v.id("users"),
    role:     v.string(),
    content:  v.string(),
    mode:     v.string(),
    language: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireOwnUser(ctx, args.userId);
    return await ctx.db.insert("chatMessages", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

// ── Get chat history for a user + mode ───────────────────────────────────
export const getHistory = query({
  args: {
    userId: v.id("users"),
    mode:   v.string(),
    limit:  v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return [];
    const limit = args.limit ?? 50;
    return await ctx.db
      .query("chatMessages")
      .withIndex("by_user_mode", (q) =>
        q.eq("userId", args.userId).eq("mode", args.mode)
      )
      .order("asc")
      .take(limit);
  },
});

// ── Clear chat history for a user + mode ────────────────────────────────
export const clearHistory = mutation({
  args: {
    userId: v.id("users"),
    mode:   v.string(),
  },
  handler: async (ctx, args) => {
    await requireOwnUser(ctx, args.userId);
    const messages = await ctx.db
      .query("chatMessages")
      .withIndex("by_user_mode", (q) =>
        q.eq("userId", args.userId).eq("mode", args.mode)
      )
      .collect();
    await Promise.all(messages.map((m) => ctx.db.delete(m._id)));
  },
});
