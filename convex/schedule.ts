import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getScheduleData = query({
  args: {},
  handler: async (ctx) => {
    const schedules = await ctx.db.query("schedules").collect();
    return schedules[0] || null;
  },
});

export const initializeSchedule = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("schedules").first();
    if (existing) return existing._id;

    return await ctx.db.insert("schedules", {
      academicYear: "2025-26/Autumn",
      registeredCourses: [
        {
          code: "CS3009",
          name: "Operating Systems",
          type: "Theory",
          faculty: "Manmath Narayan Sahoo"
        },
        {
          code: "CS3001",
          name: "Data Communication",
          type: "Theory",
          faculty: "Pabitra Mohan Khilar"
        },
        {
          code: "CS3011",
          name: "Formal Language and Automata Theory",
          type: "Theory",
          faculty: "Ramesh Kumar Mohapatra"
        },
        {
          code: "CS3014",
          name: "IoT and Embedded Systems",
          type: "Theory",
          faculty: "Suchismita Chinara"
        },
        {
          code: "ER4231",
          name: "Science of Climate and Climate Change",
          type: "Theory",
          faculty: "Krishna Kishore Osari"
        },
        {
          code: "CS3065",
          name: "IoT Prototyping Laboratory",
          type: "Practical",
          faculty: "Suchismita Chinara"
        },
        {
          code: "CS3071",
          name: "Operating Systems Laboratory",
          type: "Practical",
          faculty: "Bibhudatta Sahoo"
        },
        {
          code: "CS3077",
          name: "Web and Mobile Application Development",
          type: "Practical",
          faculty: "Puneet Kumar Jain"
        }
      ],
      classTimetable: {
        MONDAY: [
          {
            start: "08:00",
            end: "10:55",
            code: "CS3065",
            typeNote: "3-Hour Lab Session",
            room: "(# HW LAB)"
          },
          {
            start: "11:05",
            end: "12:00",
            code: "ER4231",
            room: "(#)"
          },
          {
            start: "14:15",
            end: "15:10",
            code: "CS3011",
            room: "(# CS325)"
          },
          {
            start: "15:15",
            end: "16:10",
            code: "CS3014",
            room: "(# CS325)"
          },
          {
            start: "17:20",
            end: "18:15",
            code: "CS3001",
            room: "(# CS231)"
          }
        ],
        TUESDAY: [
          {
            start: "11:05",
            end: "12:00",
            code: "ER4231",
            room: "(#)"
          },
          {
            start: "13:15",
            end: "14:10",
            code: "CS3011",
            room: "(# CS325)"
          },
          {
            start: "14:15",
            end: "15:10",
            code: "CS3014",
            room: "(# CS325)"
          }
        ],
        WEDNESDAY: [
          {
            start: "09:00",
            end: "11:55",
            code: "CS3071",
            typeNote: "3-Hour Lab Session",
            room: "(# SL-II)"
          },
          {
            start: "13:15",
            end: "14:10",
            code: "CS3009",
            room: "(# CS325)"
          },
          {
            start: "17:20",
            end: "18:15",
            code: "CS3001",
            room: "(# CS231)"
          }
        ],
        THURSDAY: [
          {
            start: "11:05",
            end: "12:00",
            code: "CS3009",
            room: "(# CS325)"
          },
          {
            start: "13:15",
            end: "14:10",
            code: "CS3014",
            room: "(# CS325)"
          }
        ],
        FRIDAY: [
          {
            start: "11:05",
            end: "12:00",
            code: "ER4231",
            room: "(#)"
          },
          {
            start: "15:15",
            end: "16:10",
            code: "CS3011",
            room: "(# CS325)"
          },
          {
            start: "16:20",
            end: "17:15",
            code: "CS3009",
            room: "(# CS325)"
          },
          {
            start: "17:20",
            end: "18:15",
            code: "CS3001",
            room: "(# CS231)"
          }
        ]
      }
    });
  },
});

export const scheduleNotification = mutation({
  args: {
    classCode: v.string(),
    className: v.string(),
    startTime: v.string(),
    room: v.string(),
    scheduledFor: v.number(),
  },
  handler: async (ctx, args) => {
    // Check if notification already exists
    const existing = await ctx.db
      .query("notifications")
      .filter((q) => 
        q.and(
          q.eq(q.field("classCode"), args.classCode),
          q.eq(q.field("scheduledFor"), args.scheduledFor)
        )
      )
      .first();

    if (existing) return existing._id;

    return await ctx.db.insert("notifications", {
      classCode: args.classCode,
      className: args.className,
      startTime: args.startTime,
      room: args.room,
      scheduledFor: args.scheduledFor,
      sent: false,
    });
  },
});

export const getPendingNotifications = query({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    return await ctx.db
      .query("notifications")
      .withIndex("by_scheduled_time")
      .filter((q) => 
        q.and(
          q.lte(q.field("scheduledFor"), now),
          q.eq(q.field("sent"), false)
        )
      )
      .collect();
  },
});

export const markNotificationSent = mutation({
  args: { notificationId: v.id("notifications") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.notificationId, { sent: true });
  },
});
