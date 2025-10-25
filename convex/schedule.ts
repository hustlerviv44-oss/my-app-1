import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getTodaysSchedule = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const today = new Date();
    const dayOfWeek = today.getDay();

    const scheduleItems = await ctx.db
      .query("schedule")
      .withIndex("by_user_and_day", (q) => 
        q.eq("userId", userId).eq("dayOfWeek", dayOfWeek)
      )
      .collect();

    const result = [];
    for (const item of scheduleItems) {
      const course = await ctx.db
        .query("courses")
        .withIndex("by_user_and_code", (q) => 
          q.eq("userId", userId).eq("code", item.courseCode)
        )
        .first();

      if (course) {
        result.push({
          ...item,
          course,
        });
      }
    }

    return result.sort((a, b) => a.startTime.localeCompare(b.startTime));
  },
});

export const getTomorrowsSchedule = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const today = new Date();
    let tomorrowDay = today.getDay() + 1;
    
    // Handle weekend logic - if today is Friday (5) or weekend, show Monday (1)
    if (tomorrowDay === 6 || tomorrowDay === 0 || tomorrowDay === 7) {
      tomorrowDay = 1; // Monday
    }

    const scheduleItems = await ctx.db
      .query("schedule")
      .withIndex("by_user_and_day", (q) => 
        q.eq("userId", userId).eq("dayOfWeek", tomorrowDay)
      )
      .collect();

    const result = [];
    for (const item of scheduleItems) {
      const course = await ctx.db
        .query("courses")
        .withIndex("by_user_and_code", (q) => 
          q.eq("userId", userId).eq("code", item.courseCode)
        )
        .first();

      if (course) {
        result.push({
          ...item,
          course,
        });
      }
    }

    return result.sort((a, b) => a.startTime.localeCompare(b.startTime));
  },
});

export const initializeExampleData = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Check if user already has data
    const existingCourse = await ctx.db
      .query("courses")
      .withIndex("by_user_and_code", (q) => q.eq("userId", userId))
      .first();

    if (existingCourse) return; // Don't add example data if courses exist

    // Add registered courses
    const courses = [
      {code: "CS3009", name: "Operating Systems", type: "Theory", faculty: "Manmath Narayan Sahoo"},
      {code: "CS3001", name: "Data Communication", type: "Theory", faculty: "Pabitra Mohan Khilar"},
      {code: "CS3011", name: "Formal Language and Automata Theory", type: "Theory", faculty: "Ramesh Kumar Mohapatra"},
      {code: "CS3014", name: "IoT and Embedded Systems", type: "Theory", faculty: "Suchismita Chinara"},
      {code: "ER4231", name: "Science of Climate and Climate Change", type: "Theory", faculty: "Krishna Kishore Osari"},
      {code: "CS3065", name: "IoT Prototyping Laboratory", type: "Practical", faculty: "Suchismita Chinara"},
      {code: "CS3071", name: "Operating Systems Laboratory", type: "Practical", faculty: "Bibhudatta Sahoo"},
      {code: "CS3077", name: "Web and Mobile Application Development", type: "Practical", faculty: "Puneet Kumar Jain"}
    ];

    for (const course of courses) {
      await ctx.db.insert("courses", {
        userId,
        ...course,
      });
    }

    // Add class timetable
    const timetable = [
      // MONDAY
      {dayOfWeek: 1, startTime: "08:00", endTime: "10:55", courseCode: "CS3065", room: "HW LAB", typeNote: "3-Hour Lab Session"},
      {dayOfWeek: 1, startTime: "11:05", endTime: "12:00", courseCode: "ER4231", room: "Room TBA"},
      {dayOfWeek: 1, startTime: "14:15", endTime: "15:10", courseCode: "CS3011", room: "CS325"},
      {dayOfWeek: 1, startTime: "15:15", endTime: "16:10", courseCode: "CS3014", room: "CS325"},
      {dayOfWeek: 1, startTime: "17:20", endTime: "18:15", courseCode: "CS3001", room: "CS231"},
      
      // TUESDAY
      {dayOfWeek: 2, startTime: "11:05", endTime: "12:00", courseCode: "ER4231", room: "Room TBA"},
      {dayOfWeek: 2, startTime: "13:15", endTime: "14:10", courseCode: "CS3011", room: "CS325"},
      {dayOfWeek: 2, startTime: "14:15", endTime: "15:10", courseCode: "CS3014", room: "CS325"},
      
      // WEDNESDAY
      {dayOfWeek: 3, startTime: "09:00", endTime: "11:55", courseCode: "CS3071", room: "SL-II", typeNote: "3-Hour Lab Session"},
      {dayOfWeek: 3, startTime: "13:15", endTime: "14:10", courseCode: "CS3009", room: "CS325"},
      {dayOfWeek: 3, startTime: "17:20", endTime: "18:15", courseCode: "CS3001", room: "CS231"},
      
      // THURSDAY
      {dayOfWeek: 4, startTime: "11:05", endTime: "12:00", courseCode: "CS3009", room: "CS325"},
      {dayOfWeek: 4, startTime: "13:15", endTime: "14:10", courseCode: "CS3014", room: "CS325"},
      
      // FRIDAY
      {dayOfWeek: 5, startTime: "11:05", endTime: "12:00", courseCode: "ER4231", room: "Room TBA"},
      {dayOfWeek: 5, startTime: "15:15", endTime: "16:10", courseCode: "CS3011", room: "CS325"},
      {dayOfWeek: 5, startTime: "16:20", endTime: "17:15", courseCode: "CS3009", room: "CS325"},
      {dayOfWeek: 5, startTime: "17:20", endTime: "18:15", courseCode: "CS3001", room: "CS231"},
    ];

    for (const item of timetable) {
      await ctx.db.insert("schedule", {
        userId,
        ...item,
      });
    }
  },
});
