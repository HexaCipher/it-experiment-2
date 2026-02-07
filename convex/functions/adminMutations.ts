import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { createClerkClient } from "@clerk/backend";

// ─── HELPERS ────────────────────────────────────────────

async function requireAdmin(ctx: any) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Unauthenticated");
  const callerClerkId = identity.subject;
  const caller = await ctx.db
    .query("users")
    .withIndex("by_clerk", (q: any) => q.eq("clerk_user_id", callerClerkId))
    .first();
  if (!caller || caller.role !== "admin") throw new Error("Forbidden: Admin access required");
  return { caller, callerClerkId };
}

async function logAdminAction(
  ctx: any,
  callerClerkId: string,
  actionType: string,
  targetClerkUserId: string,
  details?: any
) {
  await ctx.db.insert("admin_actions", {
    by_clerk_user_id: callerClerkId,
    action_type: actionType,
    target_clerk_user_id: targetClerkUserId,
    details,
    created_at: Date.now(),
  });
}

function calculateGrade(percentage: number): string {
  if (percentage >= 90) return "A+";
  if (percentage >= 80) return "A";
  if (percentage >= 70) return "B+";
  if (percentage >= 60) return "B";
  if (percentage >= 50) return "C";
  if (percentage >= 40) return "D";
  return "F";
}

// ─── USER MANAGEMENT ────────────────────────────────────

export const confirmUser = mutation({
  args: { target_clerk_user_id: v.string() },
  handler: async (ctx, args) => {
    const { callerClerkId } = await requireAdmin(ctx);
    const targetUser = await ctx.db
      .query("users")
      .withIndex("by_clerk", (q) => q.eq("clerk_user_id", args.target_clerk_user_id))
      .first();
    if (!targetUser) throw new Error("User not found");

    await ctx.db.patch(targetUser._id, {
      status: "confirmed",
      confirmed_at: Date.now(),
    });
    await logAdminAction(ctx, callerClerkId, "confirm_user", args.target_clerk_user_id);
    return { success: true };
  },
});

export const deleteUser = mutation({
  args: { target_clerk_user_id: v.string() },
  handler: async (ctx, args) => {
    const { callerClerkId } = await requireAdmin(ctx);
    const targetUser = await ctx.db
      .query("users")
      .withIndex("by_clerk", (q) => q.eq("clerk_user_id", args.target_clerk_user_id))
      .first();
    if (!targetUser) throw new Error("User not found");

    const clerkApiKey = process.env.CLERK_SECRET_KEY;
    if (!clerkApiKey) throw new Error("CLERK_SECRET_KEY not configured");

    try {
      const clerkClient = createClerkClient({ secretKey: clerkApiKey });
      await clerkClient.users.deleteUser(args.target_clerk_user_id);
    } catch (error) {
      console.error("Failed to delete user from Clerk:", error);
      throw new Error("Failed to delete user from Clerk");
    }

    await ctx.db.delete(targetUser._id);
    await logAdminAction(ctx, callerClerkId, "delete_user", args.target_clerk_user_id);
    return { success: true };
  },
});

export const disableUser = mutation({
  args: { target_clerk_user_id: v.string() },
  handler: async (ctx, args) => {
    const { callerClerkId } = await requireAdmin(ctx);
    const targetUser = await ctx.db
      .query("users")
      .withIndex("by_clerk", (q) => q.eq("clerk_user_id", args.target_clerk_user_id))
      .first();
    if (!targetUser) throw new Error("User not found");
    await ctx.db.patch(targetUser._id, { status: "disabled" });
    await logAdminAction(ctx, callerClerkId, "disable_user", args.target_clerk_user_id);
    return { success: true };
  },
});

// ─── MARKSHEET TEMPLATE ─────────────────────────────────

export const saveTemplate = mutation({
  args: {
    subjects: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const { callerClerkId } = await requireAdmin(ctx);
    if (args.subjects.length !== 7) throw new Error("Exactly 7 subjects required");

    // Deactivate any existing template
    const existing = await ctx.db
      .query("marksheet_templates")
      .withIndex("by_active", (q) => q.eq("is_active", true))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        subjects: args.subjects,
        updated_at: Date.now(),
      });
      await logAdminAction(ctx, callerClerkId, "update_template", callerClerkId, {
        subjects: args.subjects,
      });
      return { success: true, id: existing._id };
    }

    const id = await ctx.db.insert("marksheet_templates", {
      subjects: args.subjects,
      exam_types: { mst1: 25, mst2: 25, est: 50 },
      is_active: true,
      created_by: callerClerkId,
      created_at: Date.now(),
      updated_at: Date.now(),
    });

    await logAdminAction(ctx, callerClerkId, "create_template", callerClerkId, {
      subjects: args.subjects,
    });
    return { success: true, id };
  },
});

// ─── MARKS ENTRY ────────────────────────────────────────

export const saveMarks = mutation({
  args: {
    student_clerk_id: v.string(),
    semester: v.number(),
    marks: v.array(
      v.object({
        subject_name: v.string(),
        mst1: v.number(),
        mst2: v.number(),
        est: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const { callerClerkId } = await requireAdmin(ctx);

    if (args.semester < 1 || args.semester > 8) throw new Error("Semester must be 1-8");

    for (const mark of args.marks) {
      if (mark.mst1 < 0 || mark.mst1 > 25) throw new Error(`MST-I marks for ${mark.subject_name} must be 0-25`);
      if (mark.mst2 < 0 || mark.mst2 > 25) throw new Error(`MST-II marks for ${mark.subject_name} must be 0-25`);
      if (mark.est < 0 || mark.est > 50) throw new Error(`EST marks for ${mark.subject_name} must be 0-50`);
    }

    for (const mark of args.marks) {
      const total = mark.mst1 + mark.mst2 + mark.est;
      const percentage = total; // out of 100
      const grade = calculateGrade(percentage);

      // Check if marks already exist for this student+semester+subject
      const existing = await ctx.db
        .query("marks")
        .withIndex("by_student_semester_subject", (q) =>
          q
            .eq("student_clerk_id", args.student_clerk_id)
            .eq("semester", args.semester)
            .eq("subject_name", mark.subject_name)
        )
        .first();

      if (existing) {
        await ctx.db.patch(existing._id, {
          mst1: mark.mst1,
          mst2: mark.mst2,
          est: mark.est,
          total,
          percentage,
          grade,
          entered_by: callerClerkId,
          updated_at: Date.now(),
        });
      } else {
        await ctx.db.insert("marks", {
          student_clerk_id: args.student_clerk_id,
          semester: args.semester,
          subject_name: mark.subject_name,
          mst1: mark.mst1,
          mst2: mark.mst2,
          est: mark.est,
          total,
          percentage,
          grade,
          entered_by: callerClerkId,
          created_at: Date.now(),
          updated_at: Date.now(),
        });
      }
    }

    await logAdminAction(ctx, callerClerkId, "save_marks", args.student_clerk_id, {
      semester: args.semester,
      subjects_count: args.marks.length,
    });

    return { success: true };
  },
});

// ─── NOTICES ────────────────────────────────────────────

export const createNotice = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
    target_audience: v.string(),
  },
  handler: async (ctx, args) => {
    const { callerClerkId } = await requireAdmin(ctx);

    const id = await ctx.db.insert("notices", {
      title: args.title,
      description: args.description,
      priority: args.priority,
      target_audience: args.target_audience,
      published_by: callerClerkId,
      published_at: Date.now(),
      is_active: true,
    });

    await logAdminAction(ctx, callerClerkId, "create_notice", callerClerkId, {
      title: args.title,
    });
    return { success: true, id };
  },
});

export const deleteNotice = mutation({
  args: { notice_id: v.id("notices") },
  handler: async (ctx, args) => {
    const { callerClerkId } = await requireAdmin(ctx);
    const notice = await ctx.db.get(args.notice_id);
    if (!notice) throw new Error("Notice not found");

    await ctx.db.patch(args.notice_id, { is_active: false });

    await logAdminAction(ctx, callerClerkId, "delete_notice", callerClerkId, {
      title: notice.title,
    });
    return { success: true };
  },
});

// ─── STUDENT PROFILE MANAGEMENT (Admin edit) ────────────

export const updateStudentProfile = mutation({
  args: {
    clerk_user_id: v.string(),
    phone_number: v.optional(v.string()),
    current_semester: v.optional(v.number()),
    department: v.optional(v.string()),
    address: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    pincode: v.optional(v.string()),
    emergency_contact: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { callerClerkId } = await requireAdmin(ctx);
    const profile = await ctx.db
      .query("student_profiles")
      .withIndex("by_clerk", (q) => q.eq("clerk_user_id", args.clerk_user_id))
      .first();
    if (!profile) throw new Error("Profile not found");

    const updateData: any = { updated_at: Date.now() };
    if (args.phone_number !== undefined) updateData.phone_number = args.phone_number;
    if (args.current_semester !== undefined) updateData.current_semester = args.current_semester;
    if (args.department !== undefined) updateData.department = args.department;
    if (args.address !== undefined) updateData.address = args.address;
    if (args.city !== undefined) updateData.city = args.city;
    if (args.state !== undefined) updateData.state = args.state;
    if (args.pincode !== undefined) updateData.pincode = args.pincode;
    if (args.emergency_contact !== undefined) updateData.emergency_contact = args.emergency_contact;

    await ctx.db.patch(profile._id, updateData);
    await logAdminAction(ctx, callerClerkId, "update_student_profile", args.clerk_user_id);
    return { success: true };
  },
});
