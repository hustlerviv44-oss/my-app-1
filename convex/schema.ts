import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  courses: defineTable({
    userId: v.id("users"),
    code: v.string(),
    name: v.string(),
    type: v.string(), // "Theory" or "Practical"
    faculty: v.string(),
  }).index("by_user_and_code", ["userId", "code"]),
  
  schedule: defineTable({
    userId: v.id("users"),
    dayOfWeek: v.number(), // 0 = Sunday, 1 = Monday, etc.
    startTime: v.string(), // "08:00"
    endTime: v.string(), // "10:55"
    courseCode: v.string(),
    room: v.string(),
    typeNote: v.optional(v.string()), // For lab sessions
  }).index("by_user_and_day", ["userId", "dayOfWeek"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
