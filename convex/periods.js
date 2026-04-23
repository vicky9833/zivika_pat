import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// ── Log a period start (or update today's entry) ─────────────────────────────
export const logPeriod = mutation({
  args: {
    clerkId:   v.string(),
    startDate: v.string(),                       // YYYY-MM-DD
    endDate:   v.optional(v.string()),
    flowLevel: v.optional(v.string()),           // light/medium/heavy/spotting
    symptoms:  v.optional(v.array(v.string())),
    mood:      v.optional(v.string()),
    notes:     v.optional(v.string()),
  },
  handler: async (ctx, { clerkId, startDate, ...rest }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .first();
    if (!user) throw new Error("User not found");

    // Check if entry for this start date already exists → update
    const existing = await ctx.db
      .query("periodLogs")
      .withIndex("by_user_date", (q) =>
        q.eq("userId", user._id).eq("startDate", startDate)
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { startDate, ...rest });
      return existing._id;
    }

    const id = await ctx.db.insert("periodLogs", {
      userId: user._id,
      startDate,
      ...rest,
      createdAt: Date.now(),
    });

    // Update user's lastPeriodDate
    await ctx.db.patch(user._id, { lastPeriodDate: startDate });

    return id;
  },
});

// ── Mark period end date ──────────────────────────────────────────────────────
export const endPeriod = mutation({
  args: {
    clerkId:   v.string(),
    startDate: v.string(),
    endDate:   v.string(),
  },
  handler: async (ctx, { clerkId, startDate, endDate }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .first();
    if (!user) throw new Error("User not found");

    const entry = await ctx.db
      .query("periodLogs")
      .withIndex("by_user_date", (q) =>
        q.eq("userId", user._id).eq("startDate", startDate)
      )
      .first();
    if (!entry) throw new Error("Period log not found");

    await ctx.db.patch(entry._id, { endDate });

    // Recalculate avg period length from last 6 cycles
    const logs = await ctx.db
      .query("periodLogs")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(6);
    const withDuration = logs.filter((l) => l.endDate).map((l) => {
      const start = new Date(l.startDate);
      const end   = new Date(l.endDate);
      return Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1;
    });
    if (withDuration.length > 0) {
      const avg = Math.round(withDuration.reduce((a, b) => a + b, 0) / withDuration.length);
      await ctx.db.patch(user._id, { avgPeriodLength: avg });
    }

    // Recalculate avg cycle length from gaps between start dates
    const recent = await ctx.db
      .query("periodLogs")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(7);
    if (recent.length >= 2) {
      const sorted = recent.sort((a, b) => a.startDate.localeCompare(b.startDate));
      const gaps = [];
      for (let i = 1; i < sorted.length; i++) {
        const d1 = new Date(sorted[i - 1].startDate);
        const d2 = new Date(sorted[i].startDate);
        gaps.push(Math.round((d2 - d1) / (1000 * 60 * 60 * 24)));
      }
      const avgCycle = Math.round(gaps.reduce((a, b) => a + b, 0) / gaps.length);
      await ctx.db.patch(user._id, { avgCycleLength: avgCycle });
    }
  },
});

// ── Get period logs for a user ────────────────────────────────────────────────
export const getPeriodLogs = query({
  args: { clerkId: v.string() },
  handler: async (ctx, { clerkId }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .first();
    if (!user) return [];

    return ctx.db
      .query("periodLogs")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(24);  // last 24 entries (~2 years)
  },
});

// ── Get next period prediction ────────────────────────────────────────────────
export const getPeriodPrediction = query({
  args: { clerkId: v.string() },
  handler: async (ctx, { clerkId }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .first();
    if (!user?.lastPeriodDate) return null;

    const cycleLength = user.avgCycleLength || 28;
    const periodLength = user.avgPeriodLength || 5;

    const lastStart = new Date(user.lastPeriodDate);

    const nextStart = new Date(lastStart);
    nextStart.setDate(nextStart.getDate() + cycleLength);

    const nextEnd = new Date(nextStart);
    nextEnd.setDate(nextEnd.getDate() + periodLength - 1);

    // Fertile window: ovulation ~day 14, fertile days 10–17
    const ovulation = new Date(nextStart);
    ovulation.setDate(ovulation.getDate() - 14);
    const fertileStart = new Date(ovulation);
    fertileStart.setDate(fertileStart.getDate() - 4);
    const fertileEnd = new Date(ovulation);
    fertileEnd.setDate(fertileEnd.getDate() + 3);

    const fmt = (d) => d.toISOString().slice(0, 10);
    return {
      nextPeriodStart:  fmt(nextStart),
      nextPeriodEnd:    fmt(nextEnd),
      ovulationDate:    fmt(ovulation),
      fertileWindowStart: fmt(fertileStart),
      fertileWindowEnd:   fmt(fertileEnd),
      cycleLength,
      periodLength,
      lastPeriodDate: user.lastPeriodDate,
    };
  },
});

// ── Update period cycle settings ──────────────────────────────────────────────
export const updateCycleSettings = mutation({
  args: {
    clerkId:        v.string(),
    avgCycleLength: v.optional(v.number()),
    avgPeriodLength: v.optional(v.number()),
    lastPeriodDate:  v.optional(v.string()),
  },
  handler: async (ctx, { clerkId, ...updates }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .first();
    if (!user) throw new Error("User not found");
    const patch = Object.fromEntries(
      Object.entries(updates).filter(([, v]) => v !== undefined)
    );
    if (Object.keys(patch).length > 0) await ctx.db.patch(user._id, patch);
  },
});
