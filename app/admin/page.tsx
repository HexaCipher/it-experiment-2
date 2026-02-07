"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCheck, Clock, ShieldCheck, ArrowRight, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Spinner } from "@/components/ui/spinner";

export default function AdminOverviewPage() {
  const stats = useQuery(api.functions.queries.getAdminStats);

  if (!stats) {
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
          Dashboard Overview
        </h2>
        <p className="text-zinc-600 dark:text-zinc-400 mt-2">
          A high-level view of your application's user base and recent administrative actions.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Total Users
            </CardTitle>
            <Users className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              {stats.totalUsers}
            </div>
          </CardContent>
        </Card>
        <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Pending Approval
            </CardTitle>
            <Clock className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              {stats.pendingUsers}
            </div>
          </CardContent>
        </Card>
        <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Confirmed Users
            </CardTitle>
            <UserCheck className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              {stats.confirmedUsers}
            </div>
          </CardContent>
        </Card>
        <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Admins
            </CardTitle>
            <ShieldCheck className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              {stats.adminUsers}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
          <CardHeader className="border-b border-zinc-200 dark:border-zinc-800">
            <CardTitle className="text-zinc-900 dark:text-zinc-50">
              Recent Administrative Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {stats.recentActions.length === 0 ? (
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  No recent actions recorded.
                </p>
              ) : (
                stats.recentActions.map((action) => (
                  <div
                    key={action._id}
                    className="flex items-center gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-2 last:border-0 last:pb-0"
                  >
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none text-zinc-900 dark:text-zinc-50">
                        {action.action_type.replace("_", " ").toUpperCase()}
                      </p>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400">
                        Target: {action.target_clerk_user_id}
                      </p>
                    </div>
                    <div className="text-xs text-zinc-600 dark:text-zinc-400">
                      {new Date(action.created_at).toLocaleString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
          <CardHeader className="border-b border-zinc-200 dark:border-zinc-800">
            <CardTitle className="text-zinc-900 dark:text-zinc-50">Quick Access</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Manage user accounts and approve pending users.
              </p>
              <Link href="/admin/users">
                <Button className="w-full justify-between bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-50 dark:hover:bg-zinc-200 text-white dark:text-zinc-900">
                  Manage Users
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-2">
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Update student marks for MST and EST.
              </p>
              <Link href="/admin/marks">
                <Button
                  variant="outline"
                  className="w-full justify-between border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-50"
                >
                  Marks Management
                  <BookOpen className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
