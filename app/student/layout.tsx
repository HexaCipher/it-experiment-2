"use client";

import { ReactNode } from "react";
import { StudentWrapper } from "@/components/wrappers/StudentWrapper";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, BookOpen, Bell } from "lucide-react";

export default function StudentLayout({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === "/student" && pathname === "/student") return true;
    if (path !== "/student" && pathname.startsWith(path)) return true;
    return false;
  };

  const navLinks = [
    { href: "/student", label: "My Profile", icon: User },
    { href: "/student/marks", label: "My Marks", icon: BookOpen },
    { href: "/student/notices", label: "Notices", icon: Bell },
  ];

  return (
    <StudentWrapper>
      <div className="min-h-screen bg-white dark:bg-zinc-950">
        <div className="flex">
          {/* Sidebar */}
          <aside className="w-64 min-h-[calc(100vh-64px)] sticky top-16 border-r border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
            <div className="p-6">
              <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
                Student Portal
              </h1>
            </div>

            <nav className="space-y-2 px-4">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      active
                        ? "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900"
                        : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{link.label}</span>
                  </Link>
                );
              })}
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            <div className="container mx-auto px-8 py-8">{children}</div>
          </main>
        </div>
      </div>
    </StudentWrapper>
  );
}
