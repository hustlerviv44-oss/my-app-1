import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Query to get all tokens (used by the cron job)
export const getTokens = query(async (ctx) => {
  return await ctx.db.query("fcm_tokens").collect();
});

// Mutation to save the token from the frontend
export const saveToken = mutation({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    // Check if the token already exists to prevent duplicates
    const existingToken = await ctx.db
      .query("fcm_tokens")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (existingToken) {
      console.log("Token already exists. Skipping insertion.");
      return existingToken._id;
    }

    // Insert the new token
    return await ctx.db.insert("fcm_tokens", { 
      token: args.token,
    });
  },
});
