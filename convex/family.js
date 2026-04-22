import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireOwnUser } from "./lib";

// ── Add a family member ──────────────────────────────────────────────────
export const add = mutation({
  args: {
    userId:     v.id("users"),
    name:       v.string(),
    relation:   v.string(),
    dob:        v.optional(v.string()),
    bloodGroup: v.optional(v.string()),
    conditions: v.optional(v.array(v.string())),
    imageUrl:   v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireOwnUser(ctx, args.userId);
    return await ctx.db.insert("familyMembers", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

// ── List family members ───────────────────────────────────────────────────
export const listByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    await requireOwnUser(ctx, args.userId);
    return await ctx.db
      .query("familyMembers")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("asc")
      .collect();
  },
});

// ── Update a family member ────────────────────────────────────────────────
export const update = mutation({
  args: {
    id:         v.id("familyMembers"),
    name:       v.optional(v.string()),
    relation:   v.optional(v.string()),
    dob:        v.optional(v.string()),
    bloodGroup: v.optional(v.string()),
    conditions: v.optional(v.array(v.string())),
    imageUrl:   v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args;
    const member = await ctx.db.get(id);
    if (!member) throw new Error("Family member not found");
    await requireOwnUser(ctx, member.userId);
    const updates = Object.fromEntries(
      Object.entries(fields).filter(([, v]) => v !== undefined)
    );
    await ctx.db.patch(id, updates);
  },
});

// ── Remove a family member ─────────────────────────────────────────────────────
export const remove = mutation({
  args: { id: v.id("familyMembers") },
  handler: async (ctx, args) => {
    const member = await ctx.db.get(args.id);
    if (!member) throw new Error("Family member not found");
    await requireOwnUser(ctx, member.userId);
    await ctx.db.delete(args.id);
  },
});
