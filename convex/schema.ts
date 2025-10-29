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
    // NOTE: Adding an index here is crucial for fetching the schedule, even if you don't use the default 'by_user' index.
    // Assuming you have one main schedule document you fetch.
  }),
  
  notifications: defineTable({
    classCode: v.string(),
    className: v.string(),
    startTime: v.string(),
    room: v.string(),
    scheduledFor: v.number(),
    sent: v.boolean(),
  }).index("by_scheduled_time", ["scheduledFor"]),
  
  // --- NEW TABLE FOR FCM PUSH NOTIFICATIONS ---
  fcm_tokens: defineTable({
    token: v.string(),
    // We add an index to make sure we don't save the same token twice
  }).index("by_token", ["token"]),
};

export default defineSchema({
  ...applicationTables,
});