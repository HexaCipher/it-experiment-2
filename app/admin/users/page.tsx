"use client";

import { UserTable } from "@/components/admin/UserTable";

export default function AdminUsersPage() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          User Management
        </h2>
        <p className="text-zinc-600 dark:text-zinc-400 mt-2">
          Manage user accounts, confirm pending users, and moderate access.
        </p>
      </div>
      <UserTable />
    </div>
  );
}
