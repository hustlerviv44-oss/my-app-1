import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const applicationTables = {
  schedules: defineTable({
    academicYear: v.string(),
    registeredCourses: v.array(v.object({
      code: v.string(),
      name: v.string(),
      type: v.string(),
      faculty: v.string(),
    })),
    classTimetable: v.object({
      MONDAY: v.array(v.object({
        start: v.string(),
        end: v.string(),
        code: v.string(),
        typeNote: v.optional(v.string()),
        room: v.string(),
      })),
      TUESDAY: v.array(v.object({
        start: v.string(),
        end: v.string(),
        code: v.string(),
        typeNote: v.optional(v.string()),
        room: v.string(),
      })),
      WEDNESDAY: v.array(v.object({
        start: v.string(),
        end: v.string(),
        code: v.string(),
        typeNote: v.optional(v.string()),
        room: v.string(),
      })),
      THURSDAY: v.array(v.object({
        start: v.string(),
        end: v.string(),
        code: v.string(),
        typeNote: v.optional(v.string()),
        room: v.string(),
      })),
      FRIDAY: v.array(v.object({
        start: v.string(),
        end: v.string(),
        code: v.string(),
        typeNote: v.optional(v.string()),
        room: v.string(),
      })),
    }),
  }),
  notifications: defineTable({
    classCode: v.string(),
    className: v.string(),
    startTime: v.string(),
    room: v.string(),
    scheduledFor: v.number(),
    sent: v.boolean(),
  }).index("by_scheduled_time", ["scheduledFor"]),
};

export default defineSchema({
  ...applicationTables,
});
