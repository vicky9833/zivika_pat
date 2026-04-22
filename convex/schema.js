import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // ── Users ────────────────────────────────────────────────────────────────
  users: defineTable({
    clerkId:           v.string(),
    email:             v.optional(v.string()),
    name:              v.optional(v.string()),
    phone:             v.optional(v.string()),
    imageUrl:          v.optional(v.string()),
    dob:               v.optional(v.string()),
    gender:            v.optional(v.string()),
    bloodGroup:        v.optional(v.string()),
    height:            v.optional(v.number()),         // cm
    weight:            v.optional(v.number()),         // kg
    conditions:        v.optional(v.array(v.string())),
    healthGoal:        v.optional(v.string()),
    nativeLanguage:    v.optional(v.string()),         // "en"|"hi"|"ta"|"te"|"kn"|"ml"|"bn"
    ecName:            v.optional(v.string()),
    ecPhone:           v.optional(v.string()),
    ecRelation:        v.optional(v.string()),
    profileComplete:   v.optional(v.boolean()),
    onboarded:         v.optional(v.boolean()),
    createdAt:         v.number(),
  }).index("by_clerk_id", ["clerkId"]),

  // ── Health Records ────────────────────────────────────────────────────────
  healthRecords: defineTable({
    userId:            v.id("users"),
    title:             v.string(),
    type:              v.string(),     // "Lab Report"|"Prescription"|"Imaging"|"Discharge"
    summary:           v.optional(v.string()),
    rawText:           v.optional(v.string()),
    extractedData:     v.optional(v.any()),
    fileStorageId:     v.optional(v.string()),
    fileUrl:           v.optional(v.string()),
    imageUrl:          v.optional(v.string()),
    date:              v.string(),
    tags:              v.optional(v.array(v.string())),
    isFavourite:       v.optional(v.boolean()),
    createdAt:         v.number(),
  }).index("by_user", ["userId"]).index("by_user_date", ["userId", "date"]),

  // ── Medications ──────────────────────────────────────────────────────────
  medications: defineTable({
    userId:            v.id("users"),
    name:              v.string(),
    dosage:            v.string(),
    frequency:         v.string(),         // "once"|"twice"|"thrice"|"custom"
    times:             v.array(v.string()), // ["08:00","20:00"]
    condition:         v.optional(v.string()),
    startDate:         v.string(),
    endDate:           v.optional(v.string()),
    isActive:          v.boolean(),
    notes:             v.optional(v.string()),
    createdAt:         v.number(),
  }).index("by_user", ["userId"]).index("by_user_active", ["userId", "isActive"]),

  // ── Medication Logs (adherence tracking) ────────────────────────────────
  medicationLogs: defineTable({
    userId:            v.id("users"),
    medicationId:      v.id("medications"),
    date:              v.string(),         // "YYYY-MM-DD"
    time:              v.string(),         // "08:00"
    taken:             v.boolean(),
    createdAt:         v.number(),
  }).index("by_user_date", ["userId", "date"])
    .index("by_medication_date", ["medicationId", "date"]),

  // ── Vitals ───────────────────────────────────────────────────────────────
  vitals: defineTable({
    userId:            v.id("users"),
    type:              v.string(),   // "heartRate"|"bloodPressure"|"bloodSugar"|"weight"|"spo2"|"temp"|"steps"|"sleep"|"hrv"
    value:             v.any(),      // number or {systolic, diastolic}
    unit:              v.optional(v.string()),
    notes:             v.optional(v.string()),
    recordedAt:        v.string(),   // ISO datetime
    createdAt:         v.number(),
  }).index("by_user", ["userId"])
    .index("by_user_type", ["userId", "type"]),

  // ── Family Members ────────────────────────────────────────────────────────
  familyMembers: defineTable({
    userId:            v.id("users"),
    name:              v.string(),
    relation:          v.string(),
    dob:               v.optional(v.string()),
    bloodGroup:        v.optional(v.string()),
    conditions:        v.optional(v.array(v.string())),
    imageUrl:          v.optional(v.string()),
    createdAt:         v.number(),
  }).index("by_user", ["userId"]),

  // ── Chat Messages ─────────────────────────────────────────────────────────
  chatMessages: defineTable({
    userId:            v.id("users"),
    role:              v.string(),   // "user"|"assistant"
    content:           v.string(),
    mode:              v.string(),   // "copilot"|"doctor"
    language:          v.optional(v.string()),
    createdAt:         v.number(),
  }).index("by_user_mode", ["userId", "mode"]),

  // ── Notifications ─────────────────────────────────────────────────────────
  notifications: defineTable({
    userId:            v.id("users"),
    title:             v.string(),
    body:              v.string(),
    type:              v.string(),   // "medication"|"vital"|"record"|"system"|"tip"
    isRead:            v.boolean(),
    metadata:          v.optional(v.any()),
    createdAt:         v.number(),
  }).index("by_user", ["userId"])
    .index("by_user_read", ["userId", "isRead"]),
});
