"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { Save, FileText } from "lucide-react";

const DEFAULT_SUBJECTS = [
  "Subject 1",
  "Subject 2",
  "Subject 3",
  "Subject 4",
  "Subject 5",
  "Subject 6",
  "Subject 7",
];

export default function TemplatePage() {
  const template = useQuery(api.functions.queries.getActiveTemplate);
  const saveTemplate = useMutation(api.functions.adminMutations.saveTemplate);
  const [subjects, setSubjects] = useState<string[]>(DEFAULT_SUBJECTS);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (template) {
      setSubjects(template.subjects);
    }
  }, [template]);

  const handleSubjectChange = (index: number, value: string) => {
    const updated = [...subjects];
    updated[index] = value;
    setSubjects(updated);
  };

  const handleSave = async () => {
    const empty = subjects.findIndex((s) => !s.trim());
    if (empty !== -1) {
      toast.error(`Subject ${empty + 1} name cannot be empty`);
      return;
    }
    try {
      setSaving(true);
      await saveTemplate({ subjects: subjects.map((s) => s.trim()) });
      toast.success("Template saved successfully");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save template");
    } finally {
      setSaving(false);
    }
  };

  if (template === undefined) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Marksheet Template
        </h2>
        <p className="text-zinc-600 dark:text-zinc-400 mt-2">
          Configure the universal marksheet template with 7 subjects. This applies to all students.
        </p>
      </div>

      {/* Exam Structure Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
              MST-I
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">25</div>
            <p className="text-xs text-zinc-500 mt-1">Max marks</p>
          </CardContent>
        </Card>
        <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
              MST-II
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">25</div>
            <p className="text-xs text-zinc-500 mt-1">Max marks</p>
          </CardContent>
        </Card>
        <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
              EST
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">50</div>
            <p className="text-xs text-zinc-500 mt-1">Max marks</p>
          </CardContent>
        </Card>
        <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
              Total per Subject
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">100</div>
            <p className="text-xs text-zinc-500 mt-1">MST-I + MST-II + EST</p>
          </CardContent>
        </Card>
      </div>

      {/* Template Editor */}
      <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
        <CardHeader className="border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
              <div>
                <CardTitle className="text-lg text-zinc-900 dark:text-zinc-50">
                  Subject Names
                </CardTitle>
                <p className="text-sm text-zinc-500 mt-1">
                  Define the 7 subjects for the marksheet
                </p>
              </div>
            </div>
            {template && (
              <Badge
                variant="outline"
                className="border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400"
              >
                Last updated: {new Date(template.updated_at).toLocaleDateString()}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-2">
            {subjects.map((subject, i) => (
              <div key={i} className="flex items-center gap-3">
                <Label className="w-24 text-zinc-700 dark:text-zinc-300 shrink-0">
                  Subject {i + 1}
                </Label>
                <Input
                  value={subject}
                  onChange={(e) => handleSubjectChange(i, e.target.value)}
                  placeholder={`Enter subject ${i + 1} name`}
                  className="border-zinc-300 dark:border-zinc-700 dark:bg-zinc-900"
                />
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-end">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-50 dark:hover:bg-zinc-200 text-white dark:text-zinc-900"
            >
              {saving ? <Spinner className="mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />}
              Save Template
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
