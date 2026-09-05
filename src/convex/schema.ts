import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const schema = defineSchema(
  {
    ...authTables,

    users: defineTable({
      name: v.optional(v.string()),
      image: v.optional(v.string()),
      email: v.optional(v.string()),
      emailVerificationTime: v.optional(v.number()),
      isAnonymous: v.optional(v.boolean()),
    }).index("email", ["email"]),

    notes: defineTable({
      userId: v.id("users"),
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
      createdAt: v.number(),
      updatedAt: v.number(),
    }).index("by_user", ["userId", "createdAt"]),

    tasks: defineTable({
      userId: v.id("users"),
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
      status: v.union(
        v.literal("pending"),
        v.literal("in_progress"),
        v.literal("completed"),
        v.literal("cancelled"),
      ),
      assignee: v.optional(v.string()),
      person: v.optional(v.string()),
      project: v.optional(v.string()),
      confidence: v.optional(v.number()),
      sourceTimestamp: v.optional(v.number()),
      createdAt: v.number(),
      updatedAt: v.number(),
    })
      .index("by_user", ["userId", "createdAt"])
      .index("by_user_priority", ["userId", "priority"])
      .index("by_user_status", ["userId", "status"]),
  },
  {
    schemaValidation: false,
  },
);

export default schema;
