import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireOwnUser } from "./lib";

// ── Create medication ────────────────────────────────────────────────────
export const create = mutation({
  args: {
    userId:    v.id("users"),
    name:      v.string(),
    dosage:    v.string(),
    frequency: v.string(),
    times:     v.array(v.string()),
    condition: v.optional(v.string()),
    startDate: v.string(),
    endDate:   v.optional(v.string()),
    notes:     v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireOwnUser(ctx, args.userId);
    return await ctx.db.insert("medications", {
      ...args,
      isActive:  true,
      createdAt: Date.now(),
    });
  },
});

// ── List active medications for a user ────────────────────────────────────
export const listActive = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {    await requireOwnUser(ctx, args.userId);    return await ctx.db
      .query("medications")
      .withIndex("by_user_active", (q) =>
        q.eq("userId", args.userId).eq("isActive", true)
      )
      .order("desc")
      .collect();
  },
});

// ── List all medications (including inactive) ────────────────────────────
export const listAll = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {    await requireOwnUser(ctx, args.userId);    return await ctx.db
      .query("medications")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});

// ── Update medication ─────────────────────────────────────────────────────
export const update = mutation({
  args: {
    id:        v.id("medications"),
    name:      v.optional(v.string()),
    dosage:    v.optional(v.string()),
    frequency: v.optional(v.string()),
    times:     v.optional(v.array(v.string())),
    condition: v.optional(v.string()),
    endDate:   v.optional(v.string()),
    isActive:  v.optional(v.boolean()),
    notes:     v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args;
    const med = await ctx.db.get(id);
    if (!med) throw new Error("Medication not found");
    await requireOwnUser(ctx, med.userId);
    const updates = Object.fromEntries(
      Object.entries(fields).filter(([, v]) => v !== undefined)
    );
    await ctx.db.patch(id, updates);
  },
});

// ── Delete medication ─────────────────────────────────────────────────────
export const remove = mutation({
  args: { id: v.id("medications") },
  handler: async (ctx, args) => {
    const med = await ctx.db.get(args.id);
    if (!med) throw new Error("Medication not found");
    await requireOwnUser(ctx, med.userId);
    await ctx.db.delete(args.id);
  },
});

// ── Log a medication dose ─────────────────────────────────────────────────
export const logDose = mutation({
  args: {
    userId:       v.id("users"),
    medicationId: v.id("medications"),
    date:         v.string(),
    time:         v.string(),
    taken:        v.boolean(),
  },
  handler: async (ctx, args) => {
    await requireOwnUser(ctx, args.userId);
    // Check if log already exists for this medication+date+time
    const existing = await ctx.db
      .query("medicationLogs")
      .withIndex("by_medication_date", (q) =>
        q.eq("medicationId", args.medicationId).eq("date", args.date)
      )
      .filter((q) => q.eq(q.field("time"), args.time))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { taken: args.taken });
      return existing._id;
    }

    return await ctx.db.insert("medicationLogs", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

// ── Get logs for a date range ────────────────────────────────────────────
export const getLogsByDate = query({
  args: {
    userId: v.id("users"),
    date:   v.string(),
  },
  handler: async (ctx, args) => {
    await requireOwnUser(ctx, args.userId);
    return await ctx.db
      .query("medicationLogs")
      .withIndex("by_user_date", (q) =>
        q.eq("userId", args.userId).eq("date", args.date)
      )
      .collect();
  },
});
