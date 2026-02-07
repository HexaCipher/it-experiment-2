import { defineTable, defineSchema } from "convex/server";
import {
  UserObject,
  AdminActionObject,
  MarksheetTemplateObject,
  MarksObject,
  StudentProfileObject,
  NoticeObject,
} from "./types";

export default defineSchema({
  users: defineTable(UserObject)
    .index("by_clerk", ["clerk_user_id"])
    .index("by_status", ["status"])
    .index("by_role", ["role"]),

  admin_actions: defineTable(AdminActionObject)
    .index("by_admin", ["by_clerk_user_id"])
    .index("by_target", ["target_clerk_user_id"])
    .index("by_created_at", ["created_at"]),

  marksheet_templates: defineTable(MarksheetTemplateObject)
    .index("by_active", ["is_active"]),

  marks: defineTable(MarksObject)
    .index("by_student", ["student_clerk_id"])
    .index("by_student_semester", ["student_clerk_id", "semester"])
    .index("by_student_semester_subject", ["student_clerk_id", "semester", "subject_name"]),

  student_profiles: defineTable(StudentProfileObject)
    .index("by_clerk", ["clerk_user_id"])
    .index("by_roll", ["roll_number"])
    .index("by_department", ["department"]),

  notices: defineTable(NoticeObject)
    .index("by_active", ["is_active"])
    .index("by_published_at", ["published_at"]),
});
