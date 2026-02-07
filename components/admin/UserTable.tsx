"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";

type User = {
  _id: string;
  clerk_user_id: string;
  email: string;
  name: string;
  role: "user" | "admin";
  status: "pending" | "confirmed" | "disabled";
  created_at: number;
  confirmed_at?: number;
};

export function UserTable() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const data = useQuery(api.functions.queries.listUsers, {
    page: 0,
    page_size: 100,
    status_filter: statusFilter,
  });

  const confirmUser = useMutation(api.functions.adminMutations.confirmUser);
  const deleteUser = useMutation(api.functions.adminMutations.deleteUser);

  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [confirmingUserId, setConfirmingUserId] = useState<string | null>(null);

  const handleConfirmUser = async (clerkUserId: string) => {
    try {
      setConfirmingUserId(clerkUserId);
      await confirmUser({ target_clerk_user_id: clerkUserId });
      toast.success("User confirmed successfully");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to confirm user"
      );
    } finally {
      setConfirmingUserId(null);
    }
  };

  const handleDeleteUser = async (clerkUserId: string) => {
    try {
      setDeletingUserId(clerkUserId);
      await deleteUser({ target_clerk_user_id: clerkUserId });
      toast.success("User deleted successfully");
      setDeletingUserId(null);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete user"
      );
      setDeletingUserId(null);
    }
  };

  if (!data) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner />
      </div>
    );
  }

  const users = data.users as User[];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return (
          <Badge className="bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900">
            Confirmed
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="outline" className="border-zinc-300 dark:border-zinc-700">
            Pending
          </Badge>
        );
      case "disabled":
        return (
          <Badge variant="destructive" className="bg-zinc-700 hover:bg-zinc-800">
            Disabled
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="border-zinc-300 dark:border-zinc-700">
            {status}
          </Badge>
        );
    }
  };

  const getRoleBadge = (role: string) => {
    return role === "admin" ? (
      <Badge className="bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900">
        Admin
      </Badge>
    ) : (
      <Badge variant="outline" className="border-zinc-300 dark:border-zinc-700">
        User
      </Badge>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        <Button
          variant={statusFilter === "all" ? "default" : "outline"}
          onClick={() => setStatusFilter("all")}
          size="sm"
          className={
            statusFilter === "all"
              ? "bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-50 dark:hover:bg-zinc-200 text-white dark:text-zinc-900"
              : "border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900"
          }
        >
          All
        </Button>
        <Button
          variant={statusFilter === "pending" ? "default" : "outline"}
          onClick={() => setStatusFilter("pending")}
          size="sm"
          className={
            statusFilter === "pending"
              ? "bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-50 dark:hover:bg-zinc-200 text-white dark:text-zinc-900"
              : "border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900"
          }
        >
          Pending
        </Button>
        <Button
          variant={statusFilter === "confirmed" ? "default" : "outline"}
          onClick={() => setStatusFilter("confirmed")}
          size="sm"
          className={
            statusFilter === "confirmed"
              ? "bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-50 dark:hover:bg-zinc-200 text-white dark:text-zinc-900"
              : "border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900"
          }
        >
          Confirmed
        </Button>
        <Button
          variant={statusFilter === "disabled" ? "default" : "outline"}
          onClick={() => setStatusFilter("disabled")}
          size="sm"
          className={
            statusFilter === "disabled"
              ? "bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-50 dark:hover:bg-zinc-200 text-white dark:text-zinc-900"
              : "border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900"
          }
        >
          Disabled
        </Button>
      </div>

      <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-900">
              <TableHead className="text-zinc-900 dark:text-zinc-50 font-semibold">
                Name
              </TableHead>
              <TableHead className="text-zinc-900 dark:text-zinc-50 font-semibold">
                Email
              </TableHead>
              <TableHead className="text-zinc-900 dark:text-zinc-50 font-semibold">
                Role
              </TableHead>
              <TableHead className="text-zinc-900 dark:text-zinc-50 font-semibold">
                Status
              </TableHead>
              <TableHead className="text-zinc-900 dark:text-zinc-50 font-semibold">
                Created
              </TableHead>
              <TableHead className="text-zinc-900 dark:text-zinc-50 font-semibold text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-8 text-zinc-500 dark:text-zinc-400"
                >
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow
                  key={user._id}
                  className="border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                >
                  <TableCell className="font-medium text-zinc-900 dark:text-zinc-50">
                    {user.name}
                  </TableCell>
                  <TableCell className="text-zinc-700 dark:text-zinc-300">
                    {user.email}
                  </TableCell>
                  <TableCell>{getRoleBadge(user.role)}</TableCell>
                  <TableCell>{getStatusBadge(user.status)}</TableCell>
                  <TableCell className="text-zinc-700 dark:text-zinc-300">
                    {new Date(user.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    {user.status === "pending" && (
                      <Button
                        size="sm"
                        onClick={() => handleConfirmUser(user.clerk_user_id)}
                        disabled={confirmingUserId === user.clerk_user_id}
                        className="bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-50 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 h-8"
                      >
                        {confirmingUserId === user.clerk_user_id ? (
                          <Spinner className="h-4 w-4" />
                        ) : (
                          "Confirm"
                        )}
                      </Button>
                    )}
                    <DeleteConfirmDialog
                      userName={user.name}
                      userEmail={user.email}
                      onConfirm={() => handleDeleteUser(user.clerk_user_id)}
                      isDeleting={deletingUserId === user.clerk_user_id}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="text-sm text-zinc-600 dark:text-zinc-400">
        Showing {users.length} of {data.total} users
      </div>
    </div>
  );
}
