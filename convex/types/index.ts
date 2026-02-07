import { v } from "convex/values";

export const UserObject = v.object({
  clerk_user_id: v.string(),
  role: v.union(v.literal("user"), v.literal("admin")),
  email: v.string(),
  status: v.union(
    v.literal("pending"),
    v.literal("confirmed"),
    v.literal("disabled")
  ),
  name: v.string(),
  created_at: v.number(),
  confirmed_at: v.optional(v.number()),
});

export const AdminActionObject = v.object({
  by_clerk_user_id: v.string(),
  action_type: v.string(),
  target_clerk_user_id: v.string(),
  details: v.optional(v.any()),
  created_at: v.number(),
});

// Marksheet template — one active template with 7 subjects
export const MarksheetTemplateObject = v.object({
  subjects: v.array(v.string()), // exactly 7 subject names
  exam_types: v.object({
    mst1: v.number(), // 25
    mst2: v.number(), // 25
    est: v.number(),  // 50
  }),
  is_active: v.boolean(),
  created_by: v.string(), // clerk_user_id of admin
  created_at: v.number(),
  updated_at: v.number(),
});

// Marks per student per semester per subject
export const MarksObject = v.object({
  student_clerk_id: v.string(),
  semester: v.number(), // 1-8
  subject_name: v.string(),
  mst1: v.number(), // 0-25
  mst2: v.number(), // 0-25
  est: v.number(),  // 0-50
  total: v.number(),
  percentage: v.number(),
  grade: v.string(),
  entered_by: v.string(), // clerk_user_id of admin
  created_at: v.number(),
  updated_at: v.number(),
});

// Student profile
export const StudentProfileObject = v.object({
  clerk_user_id: v.string(),
  roll_number: v.string(),
  full_name: v.string(),
  email: v.string(),
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
  created_at: v.number(),
  updated_at: v.number(),
});

// Notices
export const NoticeObject = v.object({
  title: v.string(),
  description: v.string(),
  priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
  target_audience: v.string(), // "all" or specific department/semester
  published_by: v.string(),
  published_at: v.number(),
  is_active: v.boolean(),
});