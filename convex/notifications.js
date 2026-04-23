import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireOwnUser } from "./lib";

// ── Create a notification ────────────────────────────────────────────────
export const create = mutation({
  args: {
    userId:   v.id("users"),
    title:    v.string(),
    body:     v.string(),
    type:     v.string(),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    await requireOwnUser(ctx, args.userId);
    return await ctx.db.insert("notifications", {
      ...args,
      isRead:    false,
      createdAt: Date.now(),
    });
  },
});

// ── List notifications for a user ────────────────────────────────────────
export const listByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return [];
    return await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(50);
  },
});

// ── Count unread notifications ────────────────────────────────────────────
export const countUnread = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return 0;
    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_user_read", (q) =>
        q.eq("userId", args.userId).eq("isRead", false)
      )
      .collect();
    return unread.length;
  },
});

// ── Mark a notification as read ───────────────────────────────────────────
export const markRead = mutation({
  args: { id: v.id("notifications") },
  handler: async (ctx, args) => {
    const notif = await ctx.db.get(args.id);
    if (!notif) throw new Error("Notification not found");
    await requireOwnUser(ctx, notif.userId);
    await ctx.db.patch(args.id, { isRead: true });
  },
});

// ── Mark all notifications as read ───────────────────────────────────────
export const markAllRead = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    await requireOwnUser(ctx, args.userId);
    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_user_read", (q) =>
        q.eq("userId", args.userId).eq("isRead", false)
      )
      .collect();
    await Promise.all(unread.map((n) => ctx.db.patch(n._id, { isRead: true })));
  },
});

// ── Delete a notification ─────────────────────────────────────────────────
export const remove = mutation({
  args: { id: v.id("notifications") },
  handler: async (ctx, args) => {
    const notif = await ctx.db.get(args.id);
    if (!notif) throw new Error("Notification not found");
    await requireOwnUser(ctx, notif.userId);
    await ctx.db.delete(args.id);
  },
});
