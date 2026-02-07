import { query } from "../_generated/server";
import { v } from "convex/values";

// ─── USER QUERIES ───────────────────────────────────────

export const getUserByClerkId = query({
  args: { clerk_user_id: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_clerk", (q) => q.eq("clerk_user_id", args.clerk_user_id))
      .first();
  },
});

export const listUsers = query({
  args: {
    page: v.optional(v.number()),
    page_size: v.optional(v.number()),
    status_filter: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const page = args.page ?? 0;
    const pageSize = args.page_size ?? 100;

    let users;
    if (args.status_filter && args.status_filter !== "all") {
      users = await ctx.db
        .query("users")
        .withIndex("by_status", (q) =>
          q.eq("status", args.status_filter as "pending" | "confirmed" | "disabled")
        )
        .order("desc")
        .collect();
    } else {
      users = await ctx.db.query("users").order("desc").collect();
    }

    const start = page * pageSize;
    const end = start + pageSize;
    return {
      users: users.slice(start, end),
      total: users.length,
      page,
      page_size: pageSize,
      has_more: end < users.length,
    };
  },
});

export const getAdminStats = query({
  args: {},
  handler: async (ctx) => {
    const allUsers = await ctx.db.query("users").collect();
    const pendingUsers = allUsers.filter((u) => u.status === "pending").length;
    const confirmedUsers = allUsers.filter((u) => u.status === "confirmed").length;
    const adminUsers = allUsers.filter((u) => u.role === "admin").length;

    const recentActions = await ctx.db
      .query("admin_actions")
      .withIndex("by_created_at")
      .order("desc")
      .take(5);

    const totalProfiles = (await ctx.db.query("student_profiles").collect()).length;
    const activeNotices = (
      await ctx.db
        .query("notices")
        .withIndex("by_active", (q) => q.eq("is_active", true))
        .collect()
    ).length;

    return {
      totalUsers: allUsers.length,
      pendingUsers,
      confirmedUsers,
      adminUsers,
      totalProfiles,
      activeNotices,
      recentActions,
    };
  },
});

export const getConfirmedStudents = query({
  args: {},
  handler: async (ctx) => {
    const students = await ctx.db
      .query("users")
      .withIndex("by_status", (q) => q.eq("status", "confirmed"))
      .collect();
    return students.filter((s) => s.role === "user");
  },
});

// ─── MARKSHEET TEMPLATE QUERIES ─────────────────────────

export const getActiveTemplate = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("marksheet_templates")
      .withIndex("by_active", (q) => q.eq("is_active", true))
      .first();
  },
});

// ─── MARKS QUERIES ──────────────────────────────────────

export const getMarksByStudentSemester = query({
  args: {
    student_clerk_id: v.string(),
    semester: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("marks")
      .withIndex("by_student_semester", (q) =>
        q.eq("student_clerk_id", args.student_clerk_id).eq("semester", args.semester)
      )
      .collect();
  },
});

export const getMyMarks = query({
  args: { semester: v.number() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const clerkId = identity.subject;
    return await ctx.db
      .query("marks")
      .withIndex("by_student_semester", (q) =>
        q.eq("student_clerk_id", clerkId).eq("semester", args.semester)
      )
      .collect();
  },
});

// ─── STUDENT PROFILE QUERIES ────────────────────────────

export const getStudentProfile = query({
  args: { clerk_user_id: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("student_profiles")
      .withIndex("by_clerk", (q) => q.eq("clerk_user_id", args.clerk_user_id))
      .first();
  },
});

export const getMyProfile = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    return await ctx.db
      .query("student_profiles")
      .withIndex("by_clerk", (q) => q.eq("clerk_user_id", identity.subject))
      .first();
  },
});

export const listStudentProfiles = query({
  args: {
    department_filter: v.optional(v.string()),
    semester_filter: v.optional(v.number()),
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let profiles;
    if (args.department_filter && args.department_filter !== "all") {
      profiles = await ctx.db
        .query("student_profiles")
        .withIndex("by_department", (q) => q.eq("department", args.department_filter!))
        .collect();
    } else {
      profiles = await ctx.db.query("student_profiles").collect();
    }

    if (args.semester_filter && args.semester_filter > 0) {
      profiles = profiles.filter((p) => p.current_semester === args.semester_filter);
    }

    if (args.search) {
      const s = args.search.toLowerCase();
      profiles = profiles.filter(
        (p) =>
          p.full_name.toLowerCase().includes(s) ||
          p.roll_number.toLowerCase().includes(s) ||
          p.email.toLowerCase().includes(s)
      );
    }

    return profiles.sort((a, b) => b.created_at - a.created_at);
  },
});

export const checkRollNumberExists = query({
  args: { roll_number: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("student_profiles")
      .withIndex("by_roll", (q) => q.eq("roll_number", args.roll_number))
      .first();
    return !!existing;
  },
});

// ─── NOTICE QUERIES ─────────────────────────────────────

export const getActiveNotices = query({
  args: {},
  handler: async (ctx) => {
    const notices = await ctx.db
      .query("notices")
      .withIndex("by_active", (q) => q.eq("is_active", true))
      .collect();
    return notices.sort((a, b) => b.published_at - a.published_at);
  },
});

export const getAllNotices = query({
  args: {},
  handler: async (ctx) => {
    const notices = await ctx.db.query("notices").collect();
    return notices.sort((a, b) => b.published_at - a.published_at);
  },
});

// Students see notices matching them
export const getMyNotices = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const profile = await ctx.db
      .query("student_profiles")
      .withIndex("by_clerk", (q) => q.eq("clerk_user_id", identity.subject))
      .first();

    const notices = await ctx.db
      .query("notices")
      .withIndex("by_active", (q) => q.eq("is_active", true))
      .collect();

    return notices
      .filter((n) => {
        if (n.target_audience === "all") return true;
        if (!profile) return false;
        const target = n.target_audience.toLowerCase();
        return (
          target === profile.department.toLowerCase() ||
          target === `semester ${profile.current_semester}`
        );
      })
      .sort((a, b) => b.published_at - a.published_at);
  },
});
