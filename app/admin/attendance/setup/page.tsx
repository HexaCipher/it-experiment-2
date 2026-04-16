"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Spinner } from "@/components/ui/spinner";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export default function AttendanceSetupPage() {
  const [semester, setSemester] = useState("1");
  const [subjectsInput, setSubjectsInput] = useState("");
  const [saving, setSaving] = useState(false);

  const selectedSemester = Number(semester);
  const existingTemplate = useQuery(api.functions.queries.getAttendanceSubjects, {
    semester: selectedSemester,
  });
  const saveAttendanceSubjects = useMutation(
    api.functions.adminMutations.saveAttendanceSubjects
  );

  const parsedSubjects = useMemo(() => {
    return subjectsInput
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  }, [subjectsInput]);

  const handleLoadExisting = () => {
    if (!existingTemplate) {
      toast.error("No existing subject template for this semester");
      return;
    }
    setSubjectsInput(existingTemplate.subjects.join(", "));
    toast.success("Loaded existing subjects");
  };

  const handleSave = async () => {
    if (parsedSubjects.length === 0) {
      toast.error("Please add at least one subject");
      return;
    }

    try {
      setSaving(true);
      await saveAttendanceSubjects({
        semester: selectedSemester,
        subjects: parsedSubjects,
      });
      toast.success(`Attendance subjects saved for Semester ${selectedSemester}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save subjects");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-up">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4" style={{ borderTop: "var(--rule-strong)", paddingTop: "1.5rem" }}>
        <div>
          <p className="label-caps mb-2">Semester</p>
          <Select value={semester} onValueChange={setSemester}>
            <SelectTrigger className="h-9 rounded-sm text-sm border-border">
              <SelectValue placeholder="Select semester" />
            </SelectTrigger>
            <SelectContent className="rounded-sm">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                <SelectItem key={sem} value={String(sem)}>
                  Semester {sem}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-end">
          <button
            onClick={handleLoadExisting}
            className="h-9 px-4 text-sm font-medium border border-border rounded-sm hover:bg-muted/40 transition-colors"
            type="button"
          >
            Load Existing Subjects
          </button>
        </div>
      </div>

      <div>
        <p className="label-caps mb-2">Subjects (comma separated)</p>
        <Input
          value={subjectsInput}
          onChange={(e) => setSubjectsInput(e.target.value)}
          placeholder="e.g. Mathematics, Physics, Chemistry Lab, Workshop"
          className="h-9 rounded-sm text-sm"
        />
        <p className="text-xs text-muted-foreground mt-2">
          Flexible subject count supported. This template is independent from marks.
        </p>
      </div>

      <div>
        <p className="label-caps mb-3">Preview</p>
        {parsedSubjects.length === 0 ? (
          <p className="text-sm text-muted-foreground">No subjects parsed yet.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {parsedSubjects.map((subject) => (
              <span
                key={subject}
                className="px-2.5 py-1 text-xs rounded-sm border border-border bg-muted/30"
              >
                {subject}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between" style={{ borderTop: "var(--rule)", paddingTop: "1rem" }}>
        <div className="text-xs text-muted-foreground">
          {existingTemplate === undefined ? (
            <span className="inline-flex items-center gap-2"><Spinner className="size-3" /> Loading template...</span>
          ) : existingTemplate ? (
            <span>Existing template has {existingTemplate.subjects.length} subject(s).</span>
          ) : (
            <span>No existing template for this semester.</span>
          )}
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 h-9 px-6 text-sm font-semibold text-primary-foreground bg-primary transition-opacity hover:opacity-90 disabled:opacity-50"
          style={{ borderRadius: "2px" }}
          type="button"
        >
          {saving && <Spinner className="size-4" />}
          Save Subjects
        </button>
      </div>
    </div>
  );
}
