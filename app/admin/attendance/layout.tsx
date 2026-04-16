"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminAttendanceLayout({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();

  const navLinks = [
    { href: "/admin/attendance/setup", label: "Setup" },
    { href: "/admin/attendance/mark", label: "Mark" },
    { href: "/admin/attendance/reports", label: "Reports" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <p className="label-caps mb-1">Admin</p>
        <h1 className="font-display text-2xl text-foreground">Attendance</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage semester subjects, mark daily attendance, and review reports.
        </p>
      </div>

      <div className="border-b border-border" style={{ borderTop: "var(--rule-strong)" }}>
        <nav className="flex items-end gap-0 overflow-x-auto pt-3">
          {navLinks.map((link) => {
            const active = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className="relative shrink-0 px-4 pb-3 pt-1 text-sm font-medium transition-colors"
                style={{
                  color: active
                    ? "var(--color-foreground)"
                    : "var(--color-muted-foreground)",
                }}
              >
                {link.label}
                {active && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-foreground animate-fade-in" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {children}
    </div>
  );
}
