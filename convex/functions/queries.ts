import { query, internalQuery } from "../_generated/server";
import type { QueryCtx } from "../_generated/server";
import { v } from "convex/values";

async function requireIdentity(ctx: QueryCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Unauthenticated");
  }
  return identity;
}

async function getUserByIdentity(ctx: QueryCtx, clerkId: string) {
  return await ctx.db
    .query("users")
    .withIndex("by_clerk", (q) => q.eq("clerk_user_id", clerkId))
    .first();
}

// Internal query used by actions that need to check user role
export const internalGetUserByClerkId = internalQuery({
  args: { clerk_user_id: v.string() },
  handler: async (ctx, args) => {
    return await getUserByIdentity(ctx, args.clerk_user_id);
  },
});

async function requireAdmin(ctx: QueryCtx) {
  const identity = await requireIdentity(ctx);
  const caller = await getUserByIdentity(ctx, identity.subject);
  if (!caller || caller.role !== "admin") {
    throw new Error("Forbidden: Admin access required");
  }
  return { identity, caller };
}

function normalizeDepartment(value: string) {
  const normalized = value.trim().toLowerCase();
  const aliases: Record<string, string> = {
    "computer science": "computer science",
    cs: "computer science",
    "information technology": "information technology",
    it: "information technology",
    electronics: "electronics",
    ece: "electronics",
    mechanical: "mechanical",
    me: "mechanical",
    civil: "civil",
    electrical: "electrical",
    eee: "electrical",
  };
  return aliases[normalized] ?? normalized;
}

// ─── USER QUERIES ───────────────────────────────────────

export const getUserByClerkId = query({
  args: { clerk_user_id: v.string() },
  handler: async (ctx, args) => {
    const identity = await requireIdentity(ctx);
    const caller = await getUserByIdentity(ctx, identity.subject);

    if (!caller) {
      throw new Error("Forbidden");
    }

    if (caller.role !== "admin" && identity.subject !== args.clerk_user_id) {
      throw new Error("Forbidden");
    }

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
    await requireAdmin(ctx);
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
    await requireAdmin(ctx);
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
    await requireAdmin(ctx);
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
    await requireIdentity(ctx);
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
    await requireAdmin(ctx);
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

// ─── ATTENDANCE QUERIES ─────────────────────────────────

export const getAttendanceSubjects = query({
  args: { semester: v.number() },
  handler: async (ctx, args) => {
    await requireIdentity(ctx);
    if (args.semester < 1 || args.semester > 8) throw new Error("Semester must be 1-8");

    return await ctx.db
      .query("attendance_subjects")
      .withIndex("by_semester", (q) => q.eq("semester", args.semester))
      .first();
  },
});

export const getAttendanceByDateSubject = query({
  args: {
    date: v.string(),
    semester: v.number(),
    subject_name: v.string(),
    department_filter: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    if (args.semester < 1 || args.semester > 8) throw new Error("Semester must be 1-8");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(args.date)) {
      throw new Error("Date must be in YYYY-MM-DD format");
    }

    let profiles;
    if (args.department_filter && args.department_filter !== "all") {
      profiles = await ctx.db
        .query("student_profiles")
        .withIndex("by_department", (q) => q.eq("department", args.department_filter!))
        .collect();
    } else {
      profiles = await ctx.db.query("student_profiles").collect();
    }

    profiles = profiles.filter((p) => p.current_semester === args.semester);

    const dateRecords = await ctx.db
      .query("attendance_records")
      .withIndex("by_date_semester_subject", (q) =>
        q
          .eq("date", args.date)
          .eq("semester", args.semester)
          .eq("subject_name", args.subject_name)
      )
      .collect();

    const byStudent = new Map(dateRecords.map((r) => [r.student_clerk_id, r]));

    return profiles
      .map((p) => ({
        clerk_user_id: p.clerk_user_id,
        full_name: p.full_name,
        email: p.email,
        roll_number: p.roll_number,
        department: p.department,
        current_semester: p.current_semester,
        status:
          byStudent.get(p.clerk_user_id)?.status as
            | "present"
            | "absent"
            | "dl"
            | undefined,
      }))
      .sort((a, b) => a.roll_number.localeCompare(b.roll_number));
  },
});

export const getStudentAttendanceSummary = query({
  args: {
    student_clerk_id: v.string(),
    semester: v.number(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    if (args.semester < 1 || args.semester > 8) throw new Error("Semester must be 1-8");

    const records = await ctx.db
      .query("attendance_records")
      .withIndex("by_student_semester", (q) =>
        q.eq("student_clerk_id", args.student_clerk_id).eq("semester", args.semester)
      )
      .collect();

    const summary = new Map<
      string,
      { subject_name: string; total_classes: number; present: number; absent: number; dl: number }
    >();

    for (const rec of records) {
      const current = summary.get(rec.subject_name) ?? {
        subject_name: rec.subject_name,
        total_classes: 0,
        present: 0,
        absent: 0,
        dl: 0,
      };

      current.total_classes += 1;
      if (rec.status === "present") current.present += 1;
      else if (rec.status === "dl") current.dl += 1;
      else current.absent += 1;

      summary.set(rec.subject_name, current);
    }

    return Array.from(summary.values())
      .map((s) => ({
        ...s,
        percentage: s.total_classes > 0 ? ((s.present + s.dl) / s.total_classes) * 100 : 0,
      }))
      .sort((a, b) => a.subject_name.localeCompare(b.subject_name));
  },
});

export const getMyAttendanceSummary = query({
  args: { semester: v.number() },
  handler: async (ctx, args) => {
    const identity = await requireIdentity(ctx);
    if (args.semester < 1 || args.semester > 8) throw new Error("Semester must be 1-8");

    const records = await ctx.db
      .query("attendance_records")
      .withIndex("by_student_semester", (q) =>
        q.eq("student_clerk_id", identity.subject).eq("semester", args.semester)
      )
      .collect();

    const summary = new Map<
      string,
      { subject_name: string; total_classes: number; present: number; absent: number; dl: number }
    >();

    for (const rec of records) {
      const current = summary.get(rec.subject_name) ?? {
        subject_name: rec.subject_name,
        total_classes: 0,
        present: 0,
        absent: 0,
        dl: 0,
      };

      current.total_classes += 1;
      if (rec.status === "present") current.present += 1;
      else if (rec.status === "dl") current.dl += 1;
      else current.absent += 1;

      summary.set(rec.subject_name, current);
    }

    return Array.from(summary.values())
      .map((s) => ({
        ...s,
        percentage: s.total_classes > 0 ? ((s.present + s.dl) / s.total_classes) * 100 : 0,
      }))
      .sort((a, b) => a.subject_name.localeCompare(b.subject_name));
  },
});

export const getAttendanceReport = query({
  args: {
    semester: v.number(),
    department_filter: v.optional(v.string()),
    subject_name: v.optional(v.string()),
    start_date: v.optional(v.string()),
    end_date: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    if (args.semester < 1 || args.semester > 8) throw new Error("Semester must be 1-8");

    let profiles;
    if (args.department_filter && args.department_filter !== "all") {
      profiles = await ctx.db
        .query("student_profiles")
        .withIndex("by_department", (q) => q.eq("department", args.department_filter!))
        .collect();
    } else {
      profiles = await ctx.db.query("student_profiles").collect();
    }

    profiles = profiles.filter((p) => p.current_semester === args.semester);

    const profileByClerkId = new Map(profiles.map((p) => [p.clerk_user_id, p]));

    const allRecords = await ctx.db.query("attendance_records").collect();

    const filteredRecords = allRecords.filter((r) => {
      if (r.semester !== args.semester) return false;
      if (!profileByClerkId.has(r.student_clerk_id)) return false;
      if (args.subject_name && args.subject_name !== "all" && r.subject_name !== args.subject_name) {
        return false;
      }
      if (args.start_date && r.date < args.start_date) return false;
      if (args.end_date && r.date > args.end_date) return false;
      return true;
    });

    const summaryByStudent = new Map<
      string,
      {
        student_clerk_id: string;
        full_name: string;
        roll_number: string;
        department: string;
        total_classes: number;
        present: number;
        absent: number;
        dl: number;
      }
    >();

    for (const record of filteredRecords) {
      const profile = profileByClerkId.get(record.student_clerk_id);
      if (!profile) continue;

      const existing = summaryByStudent.get(record.student_clerk_id) ?? {
        student_clerk_id: record.student_clerk_id,
        full_name: profile.full_name,
        roll_number: profile.roll_number,
        department: profile.department,
        total_classes: 0,
        present: 0,
        absent: 0,
        dl: 0,
      };

      existing.total_classes += 1;
      if (record.status === "present") existing.present += 1;
      else if (record.status === "dl") existing.dl += 1;
      else existing.absent += 1;

      summaryByStudent.set(record.student_clerk_id, existing);
    }

    return Array.from(summaryByStudent.values())
      .map((s) => ({
        ...s,
        percentage: s.total_classes > 0 ? ((s.present + s.dl) / s.total_classes) * 100 : 0,
      }))
      .sort((a, b) => a.roll_number.localeCompare(b.roll_number));
  },
});

// ─── STUDENT PROFILE QUERIES ────────────────────────────

export const getStudentProfile = query({
  args: { clerk_user_id: v.string() },
  handler: async (ctx, args) => {
    const identity = await requireIdentity(ctx);
    const caller = await getUserByIdentity(ctx, identity.subject);
    if (!caller) throw new Error("Forbidden");

    if (caller.role !== "admin" && identity.subject !== args.clerk_user_id) {
      throw new Error("Forbidden");
    }

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
    await requireAdmin(ctx);
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
    await requireAdmin(ctx);
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
        const target = normalizeDepartment(n.target_audience);
        const profileDepartment = normalizeDepartment(profile.department);
        return (
          target === profileDepartment ||
          target === `semester ${profile.current_semester}`
        );
      })
      .sort((a, b) => b.published_at - a.published_at);
  },
});
