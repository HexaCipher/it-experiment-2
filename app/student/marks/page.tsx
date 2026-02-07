"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { BookOpen, TrendingUp } from "lucide-react";

function getGradeColor(grade: string) {
  switch (grade) {
    case "A+":
    case "A":
      return "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900";
    case "B+":
    case "B":
      return "bg-zinc-700 text-white dark:bg-zinc-300 dark:text-zinc-900";
    case "C":
      return "bg-zinc-500 text-white dark:bg-zinc-500 dark:text-white";
    case "D":
      return "bg-zinc-400 text-white dark:bg-zinc-600 dark:text-zinc-100";
    default:
      return "bg-zinc-300 text-zinc-900 dark:bg-zinc-700 dark:text-zinc-100";
  }
}

export default function StudentMarksPage() {
  const [semester, setSemester] = useState(1);
  const profile = useQuery(api.functions.queries.getMyProfile);
  const marks = useQuery(api.functions.queries.getMyMarks, { semester });
  const template = useQuery(api.functions.queries.getActiveTemplate);

  if (profile === undefined) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner />
      </div>
    );
  }

  if (profile === null) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="border-zinc-200 dark:border-zinc-800 max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-zinc-900 dark:text-zinc-50">Profile Required</CardTitle>
            <CardDescription>Create your student profile first to view marks.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Calculate overall stats
  const totalMarks = marks?.reduce((sum, m) => sum + m.total, 0) ?? 0;
  const maxMarks = (marks?.length ?? 0) * 100;
  const overallPercentage = maxMarks > 0 ? ((totalMarks / maxMarks) * 100).toFixed(1) : "0.0";

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">My Marks</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">
            View your semester-wise academic performance
          </p>
        </div>
        <Select value={String(semester)} onValueChange={(v) => setSemester(Number(v))}>
          <SelectTrigger className="w-48 border-zinc-300 dark:border-zinc-700">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
              <SelectItem key={s} value={String(s)}>
                Semester {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      {marks && marks.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-zinc-200 dark:border-zinc-800">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800">
                  <BookOpen className="h-5 w-5 text-zinc-900 dark:text-zinc-100" />
                </div>
                <div>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">Subjects</p>
                  <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{marks.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-zinc-200 dark:border-zinc-800">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800">
                  <TrendingUp className="h-5 w-5 text-zinc-900 dark:text-zinc-100" />
                </div>
                <div>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">Total Marks</p>
                  <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                    {totalMarks} / {maxMarks}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-zinc-200 dark:border-zinc-800">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800">
                  <TrendingUp className="h-5 w-5 text-zinc-900 dark:text-zinc-100" />
                </div>
                <div>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">Overall Percentage</p>
                  <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{overallPercentage}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Marks Table */}
      <Card className="border-zinc-200 dark:border-zinc-800">
        <CardHeader>
          <CardTitle className="text-zinc-900 dark:text-zinc-50">
            Semester {semester} Marks
          </CardTitle>
          <CardDescription>
            {marks && marks.length > 0
              ? `${marks.length} subject(s) with marks entered`
              : "No marks available for this semester yet"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {marks && marks.length > 0 ? (
            <div className="border rounded-lg border-zinc-200 dark:border-zinc-800 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
                    <TableHead className="text-zinc-600 dark:text-zinc-400 font-semibold">#</TableHead>
                    <TableHead className="text-zinc-600 dark:text-zinc-400 font-semibold">Subject</TableHead>
                    <TableHead className="text-zinc-600 dark:text-zinc-400 font-semibold text-center">MST-I (25)</TableHead>
                    <TableHead className="text-zinc-600 dark:text-zinc-400 font-semibold text-center">MST-II (25)</TableHead>
                    <TableHead className="text-zinc-600 dark:text-zinc-400 font-semibold text-center">EST (50)</TableHead>
                    <TableHead className="text-zinc-600 dark:text-zinc-400 font-semibold text-center">Total (100)</TableHead>
                    <TableHead className="text-zinc-600 dark:text-zinc-400 font-semibold text-center">%</TableHead>
                    <TableHead className="text-zinc-600 dark:text-zinc-400 font-semibold text-center">Grade</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {marks.map((m, i) => (
                    <TableRow key={m._id} className="border-zinc-200 dark:border-zinc-800">
                      <TableCell className="text-zinc-500 dark:text-zinc-400">{i + 1}</TableCell>
                      <TableCell className="font-medium text-zinc-900 dark:text-zinc-50">{m.subject_name}</TableCell>
                      <TableCell className="text-center text-zinc-900 dark:text-zinc-100">{m.mst1}</TableCell>
                      <TableCell className="text-center text-zinc-900 dark:text-zinc-100">{m.mst2}</TableCell>
                      <TableCell className="text-center text-zinc-900 dark:text-zinc-100">{m.est}</TableCell>
                      <TableCell className="text-center font-bold text-zinc-900 dark:text-zinc-50">{m.total}</TableCell>
                      <TableCell className="text-center text-zinc-900 dark:text-zinc-100">{m.percentage.toFixed(1)}%</TableCell>
                      <TableCell className="text-center">
                        <Badge className={getGradeColor(m.grade)}>{m.grade}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  {/* Summary Row */}
                  <TableRow className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 font-bold">
                    <TableCell></TableCell>
                    <TableCell className="text-zinc-900 dark:text-zinc-50">Overall</TableCell>
                    <TableCell className="text-center text-zinc-900 dark:text-zinc-100">
                      {marks.reduce((s, m) => s + m.mst1, 0)}
                    </TableCell>
                    <TableCell className="text-center text-zinc-900 dark:text-zinc-100">
                      {marks.reduce((s, m) => s + m.mst2, 0)}
                    </TableCell>
                    <TableCell className="text-center text-zinc-900 dark:text-zinc-100">
                      {marks.reduce((s, m) => s + m.est, 0)}
                    </TableCell>
                    <TableCell className="text-center text-zinc-900 dark:text-zinc-50">{totalMarks}</TableCell>
                    <TableCell className="text-center text-zinc-900 dark:text-zinc-100">{overallPercentage}%</TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12 text-zinc-500 dark:text-zinc-400">
              <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg">No marks available</p>
              <p className="text-sm mt-1">Marks for Semester {semester} have not been entered yet.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
