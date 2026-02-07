import { UserObject } from "../types";
import { mutation } from "../_generated/server";
import { v } from "convex/values";

type CreateUserReturnProps = {
  status: boolean;
  id: string | null;
};

export const createUser = mutation({
  args: UserObject,
  handler: async (ctx, args): Promise<CreateUserReturnProps> => {
    try {
      const existing = await ctx.db
        .query("users")
        .withIndex("by_clerk", (q) => q.eq("clerk_user_id", args.clerk_user_id))
        .first();

      if (existing) {
        await ctx.db.patch(existing._id, {
          email: args.email,
          name: args.name,
        });
        return { status: true, id: existing._id };
      }

      const id = await ctx.db.insert("users", args);
      return { status: true, id };
    } catch (error) {
      console.error(`Error while adding user: ${error} `);
      return { status: false, id: null };
    }
  },
});

export const deleteUserByClerkId = mutation({
  args: { clerk_user_id: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk", (q) => q.eq("clerk_user_id", args.clerk_user_id))
      .first();
    if (user) await ctx.db.delete(user._id);
    return { success: true };
  },
});

// ─── STUDENT PROFILE ────────────────────────────────────

export const createStudentProfile = mutation({
  args: {
    roll_number: v.string(),
    full_name: v.string(),
    phone_number: v.string(),
    date_of_birth: v.string(),
    gender: v.union(v.literal("Male"), v.literal("Female"), v.literal("Other")),
    department: v.string(),
    batch: v.string(),
    current_semester: v.number(),
    father_name: v.string(),
    mother_name: v.string(),
    address: v.string(),
    city: v.string(),
    state: v.string(),
    pincode: v.string(),
    emergency_contact: v.string(),
    blood_group: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    const clerkId = identity.subject;

    // Check if profile already exists
    const existing = await ctx.db
      .query("student_profiles")
      .withIndex("by_clerk", (q) => q.eq("clerk_user_id", clerkId))
      .first();
    if (existing) throw new Error("Profile already exists");

    // Check roll number uniqueness
    const rollExists = await ctx.db
      .query("student_profiles")
      .withIndex("by_roll", (q) => q.eq("roll_number", args.roll_number))
      .first();
    if (rollExists) throw new Error("Roll number already taken");

    // Get email from Clerk identity
    const email = identity.email ?? "";

    const id = await ctx.db.insert("student_profiles", {
      clerk_user_id: clerkId,
      roll_number: args.roll_number,
      full_name: args.full_name,
      email,
      phone_number: args.phone_number,
      date_of_birth: args.date_of_birth,
      gender: args.gender,
      department: args.department,
      batch: args.batch,
      current_semester: args.current_semester,
      father_name: args.father_name,
      mother_name: args.mother_name,
      address: args.address,
      city: args.city,
      state: args.state,
      pincode: args.pincode,
      emergency_contact: args.emergency_contact,
      blood_group: args.blood_group,
      created_at: Date.now(),
      updated_at: Date.now(),
    });

    return { success: true, id };
  },
});

export const updateMyProfile = mutation({
  args: {
    phone_number: v.optional(v.string()),
    address: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    pincode: v.optional(v.string()),
    emergency_contact: v.optional(v.string()),
    blood_group: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const profile = await ctx.db
      .query("student_profiles")
      .withIndex("by_clerk", (q) => q.eq("clerk_user_id", identity.subject))
      .first();
    if (!profile) throw new Error("Profile not found");

    const updateData: any = { updated_at: Date.now() };
    if (args.phone_number !== undefined) updateData.phone_number = args.phone_number;
    if (args.address !== undefined) updateData.address = args.address;
    if (args.city !== undefined) updateData.city = args.city;
    if (args.state !== undefined) updateData.state = args.state;
    if (args.pincode !== undefined) updateData.pincode = args.pincode;
    if (args.emergency_contact !== undefined) updateData.emergency_contact = args.emergency_contact;
    if (args.blood_group !== undefined) updateData.blood_group = args.blood_group;

    await ctx.db.patch(profile._id, updateData);
    return { success: true };
  },
});
