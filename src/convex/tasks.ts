import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: {
    status: v.optional(
      v.union(
        v.literal("pending"),
        v.literal("in_progress"),
        v.literal("completed"),
        v.literal("cancelled"),
      ),
    ),
    priority: v.optional(
      v.union(
        v.literal("low"),
        v.literal("medium"),
        v.literal("high"),
        v.literal("urgent"),
      ),
    ),
    noteId: v.optional(v.id("notes")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    let q = ctx.db
      .query("tasks")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc");

    if (args.status) {
      q = q.filter((q) => q.eq(q.field("status"), args.status!));
    }

    if (args.priority) {
      q = q.filter((q) => q.eq(q.field("priority"), args.priority!));
    }

    if (args.noteId) {
      q = q.filter((q) => q.eq(q.field("noteId"), args.noteId!));
    }

    return await q.collect();
  },
});

export const get = query({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const task = await ctx.db.get(args.taskId);
    if (!task || task.userId !== userId) return null;
    return task;
  },
});

export const batchCreate = mutation({
  args: {
    noteId: v.id("notes"),
    tasks: v.array(
      v.object({
        title: v.string(),
        description: v.optional(v.string()),
        dueDate: v.optional(v.number()),
        priority: v.union(
          v.literal("low"),
          v.literal("medium"),
          v.literal("high"),
          v.literal("urgent"),
        ),
        assignee: v.optional(v.string()),
        person: v.optional(v.string()),
        project: v.optional(v.string()),
        confidence: v.optional(v.number()),
        sourceTimestamp: v.optional(v.number()),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const note = await ctx.db.get(args.noteId);
    if (!note || note.userId !== userId) throw new Error("Not found");

    const now = Date.now();
    const ids: string[] = [];

    for (const task of args.tasks) {
      const id = await ctx.db.insert("tasks", {
        userId,
        noteId: args.noteId,
        title: task.title,
        description: task.description,
        dueDate: task.dueDate,
        priority: task.priority,
        status: "pending",
        assignee: task.assignee,
        person: task.person,
        project: task.project,
        confidence: task.confidence,
        sourceTimestamp: task.sourceTimestamp,
        createdAt: now,
        updatedAt: now,
      });
      ids.push(id);
    }

    return ids;
  },
});

export const create = mutation({
  args: {
    noteId: v.id("notes"),
    title: v.string(),
    description: v.optional(v.string()),
    dueDate: v.optional(v.number()),
    priority: v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high"),
      v.literal("urgent"),
    ),
    assignee: v.optional(v.string()),
    person: v.optional(v.string()),
    project: v.optional(v.string()),
    confidence: v.optional(v.number()),
    sourceTimestamp: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const now = Date.now();
    return await ctx.db.insert("tasks", {
      userId,
      noteId: args.noteId,
      title: args.title,
      description: args.description,
      dueDate: args.dueDate,
      priority: args.priority,
      status: "pending",
      assignee: args.assignee,
      person: args.person,
      project: args.project,
      confidence: args.confidence,
      sourceTimestamp: args.sourceTimestamp,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: {
    taskId: v.id("tasks"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    dueDate: v.optional(v.number()),
    priority: v.optional(
      v.union(
        v.literal("low"),
        v.literal("medium"),
        v.literal("high"),
        v.literal("urgent"),
      ),
    ),
    status: v.optional(
      v.union(
        v.literal("pending"),
        v.literal("in_progress"),
        v.literal("completed"),
        v.literal("cancelled"),
      ),
    ),
    assignee: v.optional(v.string()),
    person: v.optional(v.string()),
    project: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const task = await ctx.db.get(args.taskId);
    if (!task || task.userId !== userId) throw new Error("Not found");

    const updates: Record<string, unknown> = { updatedAt: Date.now() };
    if (args.title !== undefined) updates.title = args.title;
    if (args.description !== undefined) updates.description = args.description;
    if (args.dueDate !== undefined) updates.dueDate = args.dueDate;
    if (args.priority !== undefined) updates.priority = args.priority;
    if (args.status !== undefined) updates.status = args.status;
    if (args.assignee !== undefined) updates.assignee = args.assignee;
    if (args.person !== undefined) updates.person = args.person;
    if (args.project !== undefined) updates.project = args.project;

    await ctx.db.patch(args.taskId, updates);
  },
});

export const toggleComplete = mutation({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const task = await ctx.db.get(args.taskId);
    if (!task || task.userId !== userId) throw new Error("Not found");

    await ctx.db.patch(args.taskId, {
      status: task.status === "completed" ? "pending" : "completed",
      updatedAt: Date.now(),
    });
  },
});

export const remove = mutation({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const task = await ctx.db.get(args.taskId);
    if (!task || task.userId !== userId) throw new Error("Not found");

    await ctx.db.delete(args.taskId);
  },
});
