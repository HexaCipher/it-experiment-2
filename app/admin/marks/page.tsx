"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { Save } from "lucide-react";

interface MarkRow {
  subject_name: string;
  mst1: string;
  mst2: string;
  est: string;
}

function getGradeBadge(grade: string) {
  const colors: Record<string, string> = {
    "A+": "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900",
    A: "bg-zinc-800 text-white dark:bg-zinc-200 dark:text-zinc-900",
    "B+": "bg-zinc-700 text-white dark:bg-zinc-300 dark:text-zinc-900",
    B: "bg-zinc-600 text-white dark:bg-zinc-400 dark:text-zinc-900",
    C: "bg-zinc-500 text-white",
    D: "bg-zinc-400 text-zinc-900",
    F: "bg-red-600 text-white dark:bg-red-500",
  };
  return (
    <Badge className={colors[grade] || "bg-zinc-300 text-zinc-900"}>{grade}</Badge>
  );
}

export default function MarksEntryPage() {
  const template = useQuery(api.functions.queries.getActiveTemplate);
  const students = useQuery(api.functions.queries.getConfirmedStudents);
  const saveMarks = useMutation(api.functions.adminMutations.saveMarks);

  const [selectedStudent, setSelectedStudent] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");
  const [markRows, setMarkRows] = useState<MarkRow[]>([]);
  const [saving, setSaving] = useState(false);

  const existingMarks = useQuery(
    api.functions.queries.getMarksByStudentSemester,
    selectedStudent && selectedSemester
      ? { student_clerk_id: selectedStudent, semester: parseInt(selectedSemester) }
      : "skip"
  );

  useEffect(() => {
    if (template) {
      setMarkRows(
        template.subjects.map((name) => ({ subject_name: name, mst1: "", mst2: "", est: "" }))
      );
    }
  }, [template]);

  useEffect(() => {
    if (existingMarks && existingMarks.length > 0 && template) {
      setMarkRows(
        template.subjects.map((name) => {
          const existing = existingMarks.find((m) => m.subject_name === name);
          return {
            subject_name: name,
            mst1: existing ? String(existing.mst1) : "",
            mst2: existing ? String(existing.mst2) : "",
            est: existing ? String(existing.est) : "",
          };
        })
      );
    } else if (template && existingMarks && existingMarks.length === 0) {
      setMarkRows(
        template.subjects.map((name) => ({ subject_name: name, mst1: "", mst2: "", est: "" }))
      );
    }
  }, [existingMarks, template]);

  const handleMarkChange = (index: number, field: "mst1" | "mst2" | "est", value: string) => {
    const updated = [...markRows];
    updated[index] = { ...updated[index], [field]: value };
    setMarkRows(updated);
  };

  const getTotal = (row: MarkRow) => (parseInt(row.mst1) || 0) + (parseInt(row.mst2) || 0) + (parseInt(row.est) || 0);
  const getGrade = (total: number) => {
    if (total >= 90) return "A+";
    if (total >= 80) return "A";
    if (total >= 70) return "B+";
    if (total >= 60) return "B";
    if (total >= 50) return "C";
    if (total >= 40) return "D";
    return "F";
  };

  const handleSubmit = async () => {
    if (!selectedStudent) return toast.error("Please select a student");
    if (!selectedSemester) return toast.error("Please select a semester");

    for (const row of markRows) {
      const m1 = parseInt(row.mst1), m2 = parseInt(row.mst2), e = parseInt(row.est);
      if (row.mst1 === "" || row.mst2 === "" || row.est === "") return toast.error(`All marks required for ${row.subject_name}`);
      if (isNaN(m1) || m1 < 0 || m1 > 25) return toast.error(`MST-I for ${row.subject_name} must be 0-25`);
      if (isNaN(m2) || m2 < 0 || m2 > 25) return toast.error(`MST-II for ${row.subject_name} must be 0-25`);
      if (isNaN(e) || e < 0 || e > 50) return toast.error(`EST for ${row.subject_name} must be 0-50`);
    }

    try {
      setSaving(true);
      await saveMarks({
        student_clerk_id: selectedStudent,
        semester: parseInt(selectedSemester),
        marks: markRows.map((row) => ({
          subject_name: row.subject_name,
          mst1: parseInt(row.mst1),
          mst2: parseInt(row.mst2),
          est: parseInt(row.est),
        })),
      });
      toast.success("Marks saved successfully!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save marks");
    } finally {
      setSaving(false);
    }
  };

  if (template === undefined || students === undefined) {
    return <div className="flex justify-center items-center h-64"><Spinner /></div>;
  }

  if (!template) {
    return (
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Marks Entry</h2>
        </div>
        <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
          <CardContent className="py-12 text-center">
            <p className="text-zinc-600 dark:text-zinc-400">No marksheet template found. Please create a template first.</p>
            <Button className="mt-4 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-50 dark:hover:bg-zinc-200 text-white dark:text-zinc-900" onClick={() => (window.location.href = "/admin/template")}>
              Create Template
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const overallTotal = markRows.reduce((sum, row) => sum + getTotal(row), 0);
  const overallPercentage = markRows.length > 0 ? Math.round((overallTotal / (markRows.length * 100)) * 100) : 0;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Marks Entry</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mt-2">Select a student and semester, then enter marks for all subjects.</p>
      </div>

      <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-zinc-700 dark:text-zinc-300">Student</Label>
              <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                <SelectTrigger className="border-zinc-300 dark:border-zinc-700 dark:bg-zinc-900">
                  <SelectValue placeholder="Select a student" />
                </SelectTrigger>
                <SelectContent>
                  {students?.map((s) => (
                    <SelectItem key={s.clerk_user_id} value={s.clerk_user_id}>
                      {s.name} ({s.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-700 dark:text-zinc-300">Semester</Label>
              <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                <SelectTrigger className="border-zinc-300 dark:border-zinc-700 dark:bg-zinc-900">
                  <SelectValue placeholder="Select semester" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                    <SelectItem key={sem} value={String(sem)}>Semester {sem}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedStudent && selectedSemester && (
        <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
          <CardHeader className="border-b border-zinc-200 dark:border-zinc-800">
            <CardTitle className="text-lg text-zinc-900 dark:text-zinc-50">Enter Marks — Semester {selectedSemester}</CardTitle>
            {existingMarks && existingMarks.length > 0 && (
              <p className="text-sm text-zinc-500 mt-1">Editing existing marks. Changes will overwrite previous entries.</p>
            )}
          </CardHeader>
          <CardContent className="pt-6 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-900">
                  <TableHead className="text-zinc-900 dark:text-zinc-50 font-semibold">Subject</TableHead>
                  <TableHead className="text-zinc-900 dark:text-zinc-50 font-semibold text-center">MST-I (0-25)</TableHead>
                  <TableHead className="text-zinc-900 dark:text-zinc-50 font-semibold text-center">MST-II (0-25)</TableHead>
                  <TableHead className="text-zinc-900 dark:text-zinc-50 font-semibold text-center">EST (0-50)</TableHead>
                  <TableHead className="text-zinc-900 dark:text-zinc-50 font-semibold text-center">Total</TableHead>
                  <TableHead className="text-zinc-900 dark:text-zinc-50 font-semibold text-center">Grade</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {markRows.map((row, i) => {
                  const total = getTotal(row);
                  const grade = getGrade(total);
                  return (
                    <TableRow key={i} className="border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900">
                      <TableCell className="font-medium text-zinc-900 dark:text-zinc-50">{row.subject_name}</TableCell>
                      <TableCell className="text-center">
                        <Input type="number" min="0" max="25" value={row.mst1} onChange={(e) => handleMarkChange(i, "mst1", e.target.value)} className="h-9 w-20 mx-auto text-center border-zinc-300 dark:border-zinc-700 dark:bg-zinc-900" placeholder="0" />
                      </TableCell>
                      <TableCell className="text-center">
                        <Input type="number" min="0" max="25" value={row.mst2} onChange={(e) => handleMarkChange(i, "mst2", e.target.value)} className="h-9 w-20 mx-auto text-center border-zinc-300 dark:border-zinc-700 dark:bg-zinc-900" placeholder="0" />
                      </TableCell>
                      <TableCell className="text-center">
                        <Input type="number" min="0" max="50" value={row.est} onChange={(e) => handleMarkChange(i, "est", e.target.value)} className="h-9 w-20 mx-auto text-center border-zinc-300 dark:border-zinc-700 dark:bg-zinc-900" placeholder="0" />
                      </TableCell>
                      <TableCell className="text-center font-semibold text-zinc-900 dark:text-zinc-50">{total}</TableCell>
                      <TableCell className="text-center">{row.mst1 && row.mst2 && row.est ? getGradeBadge(grade) : "-"}</TableCell>
                    </TableRow>
                  );
                })}
                <TableRow className="bg-zinc-50 dark:bg-zinc-900 border-t-2 border-zinc-300 dark:border-zinc-700">
                  <TableCell className="font-bold text-zinc-900 dark:text-zinc-50">Overall</TableCell>
                  <TableCell /><TableCell /><TableCell />
                  <TableCell className="text-center font-bold text-zinc-900 dark:text-zinc-50">{overallTotal} / {markRows.length * 100}</TableCell>
                  <TableCell className="text-center">{overallTotal > 0 && <span className="font-semibold text-zinc-900 dark:text-zinc-50">{overallPercentage}%</span>}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
            <div className="mt-6 flex justify-end">
              <Button onClick={handleSubmit} disabled={saving} className="bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-50 dark:hover:bg-zinc-200 text-white dark:text-zinc-900">
                {saving ? <Spinner className="mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />}
                Save Marks
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
