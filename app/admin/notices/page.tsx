"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { Plus, Trash2, Bell } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";

function getPriorityBadge(priority: string) {
  switch (priority) {
    case "high":
      return <Badge className="bg-red-600 text-white hover:bg-red-700">High</Badge>;
    case "medium":
      return <Badge className="bg-yellow-500 text-zinc-900 hover:bg-yellow-600">Medium</Badge>;
    case "low":
      return <Badge className="bg-green-600 text-white hover:bg-green-700">Low</Badge>;
    default:
      return <Badge variant="outline">{priority}</Badge>;
  }
}

export default function NoticesPage() {
  const notices = useQuery(api.functions.queries.getAllNotices);
  const createNotice = useMutation(api.functions.adminMutations.createNotice);
  const deleteNotice = useMutation(api.functions.adminMutations.deleteNotice);

  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [targetAudience, setTargetAudience] = useState("all");

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setPriority("medium");
    setTargetAudience("all");
  };

  const handleCreate = async () => {
    if (title.length < 3) return toast.error("Title must be at least 3 characters");
    if (description.length < 10) return toast.error("Description must be at least 10 characters");

    try {
      setSaving(true);
      await createNotice({ title, description, priority, target_audience: targetAudience });
      toast.success("Notice published successfully");
      resetForm();
      setOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create notice");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: Id<"notices">) => {
    try {
      setDeletingId(id);
      await deleteNotice({ notice_id: id });
      toast.success("Notice deleted");
    } catch (error) {
      toast.error("Failed to delete notice");
    } finally {
      setDeletingId(null);
    }
  };

  if (notices === undefined) {
    return <div className="flex justify-center items-center h-64"><Spinner /></div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Notices
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 mt-2">
            Publish and manage notices visible to students.
          </p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-50 dark:hover:bg-zinc-200 text-white dark:text-zinc-900">
              <Plus className="mr-2 h-4 w-4" />
              Create Notice
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800">
            <DialogHeader>
              <DialogTitle className="text-zinc-900 dark:text-zinc-50">
                New Notice
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label className="text-zinc-700 dark:text-zinc-300">Title</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Notice title"
                  className="border-zinc-300 dark:border-zinc-700 dark:bg-zinc-900"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-700 dark:text-zinc-300">Description</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Write the notice description..."
                  rows={4}
                  className="border-zinc-300 dark:border-zinc-700 dark:bg-zinc-900"
                />
              </div>
              <div className="grid gap-4 grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-zinc-700 dark:text-zinc-300">Priority</Label>
                  <Select value={priority} onValueChange={(val) => setPriority(val as "low" | "medium" | "high")}>
                    <SelectTrigger className="border-zinc-300 dark:border-zinc-700 dark:bg-zinc-900">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-zinc-700 dark:text-zinc-300">Target Audience</Label>
                  <Select value={targetAudience} onValueChange={setTargetAudience}>
                    <SelectTrigger className="border-zinc-300 dark:border-zinc-700 dark:bg-zinc-900">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Students</SelectItem>
                      <SelectItem value="CS">CS</SelectItem>
                      <SelectItem value="IT">IT</SelectItem>
                      <SelectItem value="ECE">ECE</SelectItem>
                      <SelectItem value="ME">ME</SelectItem>
                      <SelectItem value="Civil">Civil</SelectItem>
                      <SelectItem value="EEE">EEE</SelectItem>
                      <SelectItem value="Semester 1">Semester 1</SelectItem>
                      <SelectItem value="Semester 2">Semester 2</SelectItem>
                      <SelectItem value="Semester 3">Semester 3</SelectItem>
                      <SelectItem value="Semester 4">Semester 4</SelectItem>
                      <SelectItem value="Semester 5">Semester 5</SelectItem>
                      <SelectItem value="Semester 6">Semester 6</SelectItem>
                      <SelectItem value="Semester 7">Semester 7</SelectItem>
                      <SelectItem value="Semester 8">Semester 8</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <Button
                  onClick={handleCreate}
                  disabled={saving}
                  className="bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-50 dark:hover:bg-zinc-200 text-white dark:text-zinc-900"
                >
                  {saving && <Spinner className="mr-2 h-4 w-4" />}
                  Publish Notice
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {notices.length === 0 ? (
        <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
          <CardContent className="py-12 text-center">
            <Bell className="h-12 w-12 mx-auto text-zinc-300 dark:text-zinc-700 mb-4" />
            <p className="text-zinc-600 dark:text-zinc-400">No notices yet. Create one to get started.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {notices.map((notice) => (
            <Card
              key={notice._id}
              className={`border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 ${
                !notice.is_active ? "opacity-50" : ""
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <CardTitle className="text-base text-zinc-900 dark:text-zinc-50">
                        {notice.title}
                      </CardTitle>
                      {getPriorityBadge(notice.priority)}
                      {!notice.is_active && (
                        <Badge variant="outline" className="border-red-300 text-red-600">
                          Deleted
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-zinc-500">
                      <span>{new Date(notice.published_at).toLocaleDateString()}</span>
                      <span>Target: {notice.target_audience}</span>
                    </div>
                  </div>
                  {notice.is_active && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(notice._id)}
                      disabled={deletingId === notice._id}
                      className="border-zinc-300 dark:border-zinc-700 text-red-600 hover:bg-red-50 dark:hover:bg-red-950 shrink-0"
                    >
                      {deletingId === notice._id ? (
                        <Spinner className="h-4 w-4" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">
                  {notice.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
