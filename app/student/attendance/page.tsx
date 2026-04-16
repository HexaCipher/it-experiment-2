"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";

export default function StudentAttendancePage() {
  const [semester, setSemester] = useState(1);
  const profile = useQuery(api.functions.queries.getMyProfile);
  const summary = useQuery(api.functions.queries.getMyAttendanceSummary, { semester });

  if (profile === undefined || summary === undefined) {
    return <div className="flex items-center justify-center min-h-[60vh]"><Spinner /></div>;
  }

  if (profile === null) {
    return (
      <div className="animate-fade-up">
        <p className="label-caps mb-2">My Attendance</p>
        <p className="text-sm text-muted-foreground">
          You need to create your student profile before attendance is available.
        </p>
      </div>
    );
  }

  const totalClasses = summary.reduce((sum, row) => sum + row.total_classes, 0);
  const totalPresent = summary.reduce((sum, row) => sum + row.present, 0);
  const totalDl = summary.reduce((sum, row) => sum + row.dl, 0);
  const overallPct =
    totalClasses > 0 ? (((totalPresent + totalDl) / totalClasses) * 100).toFixed(1) : "0.0";

  return (
    <div className="animate-fade-up space-y-8">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="label-caps mb-1">Student</p>
          <h1 className="font-display text-2xl text-foreground">My Attendance</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {profile.full_name} · {profile.department} · Roll {profile.roll_number}
          </p>
        </div>
        <div>
          <p className="label-caps mb-2">Semester</p>
          <Select value={String(semester)} onValueChange={(v) => setSemester(Number(v))}>
            <SelectTrigger className="w-40 h-9 rounded-sm text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-sm">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                <SelectItem key={s} value={String(s)}>
                  Semester {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {summary.length > 0 && (
        <div
          className="grid grid-cols-3"
          style={{ borderTop: "var(--rule-strong)", borderBottom: "var(--rule-strong)" }}
        >
          {[
            { label: "Subjects", value: String(summary.length) },
            { label: "Total Classes", value: String(totalClasses) },
            { label: "Overall %", value: `${overallPct}%` },
          ].map((stat, i) => (
            <div
              key={stat.label}
              className="py-5 px-0 md:px-6 first:pl-0"
              style={{ borderRight: i < 2 ? "var(--rule)" : "none" }}
            >
              <p className="label-caps mb-1">{stat.label}</p>
              <p className="font-display text-2xl text-foreground">{stat.value}</p>
            </div>
          ))}
        </div>
      )}

      {summary.length === 0 ? (
        <div style={{ borderTop: "var(--rule)" }}>
          <p className="text-sm text-muted-foreground py-10">
            No attendance records available for Semester {semester} yet.
          </p>
        </div>
      ) : (
        <div>
          <p className="label-caps mb-4">Semester {semester} - Attendance Summary</p>
          <div className="overflow-x-auto" style={{ borderTop: "var(--rule-strong)" }}>
            <div
              className="grid gap-3 py-2 px-1 bg-muted/40 min-w-[42rem]"
              style={{
                gridTemplateColumns: "1fr 6rem 6rem 6rem 6rem 7rem",
                borderBottom: "var(--rule-strong)",
              }}
            >
              {["Subject", "Classes", "Present", "Absent", "DL", "Percentage"].map((h) => (
                <span key={h} className="label-caps">{h}</span>
              ))}
            </div>

            {summary.map((row) => (
              <div
                key={row.subject_name}
                className="grid gap-3 py-3 px-1 items-center min-w-[42rem]"
                style={{
                  gridTemplateColumns: "1fr 6rem 6rem 6rem 6rem 7rem",
                  borderBottom: "var(--rule)",
                }}
              >
                <span className="text-sm font-medium text-foreground">{row.subject_name}</span>
                <span className="text-sm text-center">{row.total_classes}</span>
                <span className="text-sm text-center">{row.present}</span>
                <span className="text-sm text-center">{row.absent}</span>
                <span className="text-sm text-center">{row.dl}</span>
                <span
                  className={`text-sm text-center font-semibold ${
                    row.percentage < 75 ? "text-destructive" : "text-foreground"
                  }`}
                >
                  {row.percentage.toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
