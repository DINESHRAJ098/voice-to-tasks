import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: {
    status: v.optional(
      v.union(
        v.literal("uploaded"),
        v.literal("transcribing"),
        v.literal("transcribed"),
        v.literal("processing"),
        v.literal("completed"),
        v.literal("failed"),
      ),
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    let q = ctx.db
      .query("notes")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc");

    if (args.status) {
      q = ctx.db
        .query("notes")
        .withIndex("by_user", (q) =>
          q.eq("userId", userId),
        )
        .filter((q) => q.eq(q.field("status"), args.status!))
        .order("desc");
    }

    return await q.collect();
  },
});

export const get = query({
  args: { noteId: v.id("notes") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const note = await ctx.db.get(args.noteId);
    if (!note || note.userId !== userId) return null;
    return note;
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    rawText: v.string(),
    summary: v.optional(v.string()),
    duration: v.optional(v.number()),
    language: v.optional(v.string()),
    status: v.union(
      v.literal("uploaded"),
      v.literal("transcribing"),
      v.literal("transcribed"),
      v.literal("processing"),
      v.literal("completed"),
      v.literal("failed"),
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const now = Date.now();
    return await ctx.db.insert("notes", {
      userId,
      title: args.title,
      rawText: args.rawText,
      summary: args.summary,
      duration: args.duration,
      language: args.language,
      status: args.status,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: {
    noteId: v.id("notes"),
    title: v.optional(v.string()),
    rawText: v.optional(v.string()),
    summary: v.optional(v.string()),
    status: v.optional(
      v.union(
        v.literal("uploaded"),
        v.literal("transcribing"),
        v.literal("transcribed"),
        v.literal("processing"),
        v.literal("completed"),
        v.literal("failed"),
      ),
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const note = await ctx.db.get(args.noteId);
    if (!note || note.userId !== userId) throw new Error("Not found");

    const updates: Record<string, unknown> = { updatedAt: Date.now() };
    if (args.title !== undefined) updates.title = args.title;
    if (args.rawText !== undefined) updates.rawText = args.rawText;
    if (args.summary !== undefined) updates.summary = args.summary;
    if (args.status !== undefined) updates.status = args.status;

    await ctx.db.patch(args.noteId, updates);
  },
});

export const remove = mutation({
  args: { noteId: v.id("notes") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const note = await ctx.db.get(args.noteId);
    if (!note || note.userId !== userId) throw new Error("Not found");

    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    for (const task of tasks) {
      if (task.noteId === args.noteId) {
        await ctx.db.delete(task._id);
      }
    }

    await ctx.db.delete(args.noteId);
  },
});
