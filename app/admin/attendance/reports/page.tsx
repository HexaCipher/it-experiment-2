"use client";

import { useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Spinner } from "@/components/ui/spinner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const DEPARTMENTS = [
  "Computer Science",
  "Information Technology",
  "Electronics",
  "Mechanical",
  "Civil",
  "Electrical",
];

function getTodayDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function AttendanceReportsPage() {
  const [semester, setSemester] = useState("1");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState(getTodayDate());

  const selectedSemester = Number(semester);

  const subjectsTemplate = useQuery(api.functions.queries.getAttendanceSubjects, {
    semester: selectedSemester,
  });

  const report = useQuery(api.functions.queries.getAttendanceReport, {
    semester: selectedSemester,
    department_filter: departmentFilter,
    subject_name: subjectFilter,
    start_date: startDate || undefined,
    end_date: endDate || undefined,
  });

  const stats = useMemo(() => {
    if (!report || report.length === 0) {
      return { avgPercentage: 0, students: 0, below75: 0 };
    }

    const avgPercentage =
      report.reduce((sum, row) => sum + row.percentage, 0) / report.length;
    const below75 = report.filter((row) => row.percentage < 75).length;
    return { avgPercentage, students: report.length, below75 };
  }, [report]);

  return (
    <div className="space-y-8 animate-fade-up">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3" style={{ borderTop: "var(--rule-strong)", paddingTop: "1.5rem" }}>
        <div>
          <p className="label-caps mb-2">Semester</p>
          <Select value={semester} onValueChange={setSemester}>
            <SelectTrigger className="h-9 rounded-sm text-sm">
              <SelectValue placeholder="Semester" />
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
          <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
            <SelectTrigger className="h-9 rounded-sm text-sm">
              <SelectValue placeholder="Department" />
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
          <Select value={subjectFilter} onValueChange={setSubjectFilter}>
            <SelectTrigger className="h-9 rounded-sm text-sm">
              <SelectValue placeholder="Subject" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subjects</SelectItem>
              {(subjectsTemplate?.subjects ?? []).map((subject) => (
                <SelectItem key={subject} value={subject}>
                  {subject}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <p className="label-caps mb-2">Start Date</p>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="h-9 w-full rounded-sm border border-border bg-background px-3 text-sm"
          />
        </div>

        <div>
          <p className="label-caps mb-2">End Date</p>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="h-9 w-full rounded-sm border border-border bg-background px-3 text-sm"
          />
        </div>
      </div>

      <div
        className="grid grid-cols-1 md:grid-cols-3"
        style={{ borderTop: "var(--rule-strong)", borderBottom: "var(--rule-strong)" }}
      >
        <div className="py-5 px-0 md:px-6" style={{ borderRight: "var(--rule)" }}>
          <p className="label-caps mb-1">Students</p>
          <p className="font-display text-2xl text-foreground">{stats.students}</p>
        </div>
        <div className="py-5 px-0 md:px-6" style={{ borderRight: "var(--rule)" }}>
          <p className="label-caps mb-1">Average Attendance</p>
          <p className="font-display text-2xl text-foreground">{stats.avgPercentage.toFixed(1)}%</p>
        </div>
        <div className="py-5 px-0 md:px-6">
          <p className="label-caps mb-1">Below 75%</p>
          <p className="font-display text-2xl text-destructive">{stats.below75}</p>
        </div>
      </div>

      {report === undefined ? (
        <div className="flex justify-center items-center h-24"><Spinner /></div>
      ) : report.length === 0 ? (
        <p className="text-sm text-muted-foreground">No attendance data found for selected filters.</p>
      ) : (
        <div className="overflow-x-auto" style={{ borderTop: "var(--rule-strong)" }}>
          <div
            className="grid gap-3 py-2 px-1 bg-muted/40 min-w-[58rem]"
            style={{
              gridTemplateColumns: "6rem 1fr 10rem 6rem 6rem 6rem 6rem",
              borderBottom: "var(--rule-strong)",
            }}
          >
            {["Roll", "Name", "Department", "P", "A", "DL", "%"].map((header) => (
              <span key={header} className="label-caps">{header}</span>
            ))}
          </div>

          {report.map((row) => (
            <div
              key={row.student_clerk_id}
              className="grid gap-3 py-3 px-1 items-center min-w-[58rem]"
              style={{
                gridTemplateColumns: "6rem 1fr 10rem 6rem 6rem 6rem 6rem",
                borderBottom: "var(--rule)",
              }}
            >
              <span className="text-xs font-mono text-muted-foreground">{row.roll_number}</span>
              <span className="text-sm font-medium text-foreground truncate">{row.full_name}</span>
              <span className="text-xs text-muted-foreground truncate">{row.department}</span>
              <span className="text-sm text-center">{row.present}</span>
              <span className="text-sm text-center">{row.absent}</span>
              <span className="text-sm text-center">{row.dl}</span>
              <span className={`text-sm text-center font-semibold ${row.percentage < 75 ? "text-destructive" : "text-foreground"}`}>
                {row.percentage.toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
