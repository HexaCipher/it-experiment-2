"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Spinner } from "@/components/ui/spinner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const DEPARTMENTS = [
  "Computer Science",
  "Information Technology",
  "Electronics",
  "Mechanical",
  "Civil",
  "Electrical",
];

type AttendanceStatus = "present" | "absent" | "dl";

function getTodayDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function AttendanceMarkPage() {
  const [date, setDate] = useState(getTodayDate());
  const [semester, setSemester] = useState("1");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [subject, setSubject] = useState("");
  const [saving, setSaving] = useState(false);
  const [statusMap, setStatusMap] = useState<Record<string, AttendanceStatus>>({});

  const selectedSemester = Number(semester);

  const subjectTemplate = useQuery(api.functions.queries.getAttendanceSubjects, {
    semester: selectedSemester,
  });

  const studentsForSession = useQuery(api.functions.queries.getAttendanceByDateSubject,
    subject
      ? {
          date,
          semester: selectedSemester,
          subject_name: subject,
          department_filter: departmentFilter,
        }
      : "skip"
  );

  const markAttendanceBatch = useMutation(api.functions.adminMutations.markAttendanceBatch);

  const activeSubjectOptions = subjectTemplate?.subjects ?? [];

  const rows = useMemo(() => {
    if (!studentsForSession) return [];
    return studentsForSession.map((student) => ({
      ...student,
      status: statusMap[student.clerk_user_id] ?? student.status ?? "absent",
    }));
  }, [studentsForSession, statusMap]);

  const handleStatusChange = (clerkUserId: string, status: AttendanceStatus) => {
    setStatusMap((prev) => ({ ...prev, [clerkUserId]: status }));
  };

  const markAll = (status: AttendanceStatus) => {
    if (!studentsForSession) return;
    const updated: Record<string, AttendanceStatus> = {};
    for (const student of studentsForSession) {
      updated[student.clerk_user_id] = status;
    }
    setStatusMap(updated);
  };

  const handleSave = async () => {
    if (!subject) {
      toast.error("Please select a subject");
      return;
    }
    if (!studentsForSession || studentsForSession.length === 0) {
      toast.error("No students found for the selected filters");
      return;
    }

    try {
      setSaving(true);
      await markAttendanceBatch({
        date,
        semester: selectedSemester,
        subject_name: subject,
        records: rows.map((row) => ({
          student_clerk_id: row.clerk_user_id,
          status: row.status,
        })),
      });
      toast.success("Attendance saved successfully");
      setStatusMap({});
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save attendance");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-up">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3" style={{ borderTop: "var(--rule-strong)", paddingTop: "1.5rem" }}>
        <div>
          <p className="label-caps mb-2">Date</p>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="h-9 w-full rounded-sm border border-border bg-background px-3 text-sm"
          />
        </div>

        <div>
          <p className="label-caps mb-2">Semester</p>
          <Select value={semester} onValueChange={(value) => {
            setSemester(value);
            setSubject("");
            setStatusMap({});
          }}>
            <SelectTrigger className="h-9 rounded-sm text-sm">
              <SelectValue placeholder="Select semester" />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                <SelectItem key={sem} value={String(sem)}>
                  Semester {sem}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <p className="label-caps mb-2">Department</p>
          <Select value={departmentFilter} onValueChange={(value) => {
            setDepartmentFilter(value);
            setStatusMap({});
          }}>
            <SelectTrigger className="h-9 rounded-sm text-sm">
              <SelectValue placeholder="All departments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {DEPARTMENTS.map((department) => (
                <SelectItem key={department} value={department}>
                  {department}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <p className="label-caps mb-2">Subject</p>
          <Select value={subject} onValueChange={(value) => {
            setSubject(value);
            setStatusMap({});
          }} disabled={subjectTemplate === undefined || !subjectTemplate || activeSubjectOptions.length === 0}>
            <SelectTrigger className="h-9 rounded-sm text-sm">
              <SelectValue placeholder="Select subject" />
            </SelectTrigger>
            <SelectContent>
              {activeSubjectOptions.map((subjectName) => (
                <SelectItem key={subjectName} value={subjectName}>
                  {subjectName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {subjectTemplate === undefined ? (
        <div className="flex justify-center items-center h-24"><Spinner /></div>
      ) : !subjectTemplate ? (
        <p className="text-sm text-muted-foreground">No attendance subjects configured for Semester {selectedSemester}. Go to Setup tab first.</p>
      ) : !subject ? (
        <p className="text-sm text-muted-foreground">Select a subject to begin attendance marking.</p>
      ) : studentsForSession === undefined ? (
        <div className="flex justify-center items-center h-24"><Spinner /></div>
      ) : studentsForSession.length === 0 ? (
        <p className="text-sm text-muted-foreground">No students found for selected semester/department.</p>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="label-caps">
              {subject} - {date} - Semester {selectedSemester}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => markAll("present")}
                className="h-8 px-3 text-xs rounded-sm border border-border hover:bg-muted/40"
              >
                Mark All P
              </button>
              <button
                type="button"
                onClick={() => markAll("absent")}
                className="h-8 px-3 text-xs rounded-sm border border-border hover:bg-muted/40"
              >
                Mark All A
              </button>
              <button
                type="button"
                onClick={() => markAll("dl")}
                className="h-8 px-3 text-xs rounded-sm border border-border hover:bg-muted/40"
              >
                Mark All DL
              </button>
            </div>
          </div>

          <div className="overflow-x-auto" style={{ borderTop: "var(--rule-strong)" }}>
            <div
              className="grid gap-3 py-2 px-1 bg-muted/40 min-w-[52rem]"
              style={{
                gridTemplateColumns: "6rem 1fr 1fr 10rem 14rem",
                borderBottom: "var(--rule-strong)",
              }}
            >
              {["Roll No", "Name", "Email", "Department", "Status"].map((header) => (
                <span key={header} className="label-caps">{header}</span>
              ))}
            </div>

            {rows.map((student) => (
              <div
                key={student.clerk_user_id}
                className="grid gap-3 py-3 px-1 items-center min-w-[52rem]"
                style={{
                  gridTemplateColumns: "6rem 1fr 1fr 10rem 14rem",
                  borderBottom: "var(--rule)",
                }}
              >
                <span className="text-xs font-mono text-muted-foreground">{student.roll_number}</span>
                <span className="text-sm font-medium text-foreground truncate">{student.full_name}</span>
                <span className="text-xs text-muted-foreground truncate">{student.email}</span>
                <span className="text-xs text-muted-foreground truncate">{student.department}</span>

                <div className="inline-flex items-center gap-1 rounded-sm border border-border p-1 w-fit">
                  <button
                    type="button"
                    onClick={() => handleStatusChange(student.clerk_user_id, "present")}
                    className="h-7 px-3 text-xs rounded-sm transition-colors"
                    style={{
                      backgroundColor:
                        student.status === "present" ? "var(--color-primary)" : "transparent",
                      color:
                        student.status === "present"
                          ? "var(--color-primary-foreground)"
                          : "var(--color-foreground)",
                    }}
                  >
                    P
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStatusChange(student.clerk_user_id, "absent")}
                    className="h-7 px-3 text-xs rounded-sm transition-colors"
                    style={{
                      backgroundColor:
                        student.status === "absent" ? "var(--color-destructive)" : "transparent",
                      color:
                        student.status === "absent"
                          ? "var(--color-destructive-foreground)"
                          : "var(--color-foreground)",
                    }}
                  >
                    A
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStatusChange(student.clerk_user_id, "dl")}
                    className="h-7 px-3 text-xs rounded-sm transition-colors"
                    style={{
                      backgroundColor:
                        student.status === "dl" ? "oklch(0.55 0.14 200)" : "transparent",
                      color:
                        student.status === "dl" ? "white" : "var(--color-foreground)",
                    }}
                  >
                    DL
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 h-9 px-6 text-sm font-semibold text-primary-foreground bg-primary transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ borderRadius: "2px" }}
            >
              {saving && <Spinner className="size-4" />}
              Save Attendance
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
