"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { Bell, AlertTriangle, Info, AlertCircle } from "lucide-react";

function getPriorityConfig(priority: string) {
  switch (priority) {
    case "high":
      return {
        icon: AlertTriangle,
        badge: "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900",
        border: "border-l-zinc-900 dark:border-l-zinc-100",
        label: "High",
      };
    case "medium":
      return {
        icon: AlertCircle,
        badge: "bg-zinc-600 text-white dark:bg-zinc-400 dark:text-zinc-900",
        border: "border-l-zinc-600 dark:border-l-zinc-400",
        label: "Medium",
      };
    default:
      return {
        icon: Info,
        badge: "bg-zinc-400 text-white dark:bg-zinc-600 dark:text-zinc-100",
        border: "border-l-zinc-400 dark:border-l-zinc-600",
        label: "Low",
      };
  }
}

export default function StudentNoticesPage() {
  const notices = useQuery(api.functions.queries.getMyNotices);

  if (notices === undefined) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">Notices</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-1">
          Important announcements and updates
        </p>
      </div>

      {notices.length === 0 ? (
        <div className="text-center py-16">
          <Bell className="h-12 w-12 mx-auto mb-4 text-zinc-400 dark:text-zinc-600" />
          <p className="text-lg text-zinc-500 dark:text-zinc-400">No notices at the moment</p>
          <p className="text-sm text-zinc-400 dark:text-zinc-500 mt-1">
            Check back later for updates
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {notices.map((notice) => {
            const config = getPriorityConfig(notice.priority);
            const Icon = config.icon;
            return (
              <Card
                key={notice._id}
                className={`border-zinc-200 dark:border-zinc-800 border-l-4 ${config.border}`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <Icon className="h-5 w-5 mt-0.5 text-zinc-600 dark:text-zinc-400 shrink-0" />
                      <div>
                        <CardTitle className="text-lg text-zinc-900 dark:text-zinc-50">
                          {notice.title}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {new Date(notice.published_at).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                          {notice.target_audience !== "all" && (
                            <span className="ml-2">· For: {notice.target_audience}</span>
                          )}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge className={config.badge}>{config.label}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap leading-relaxed">
                    {notice.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
