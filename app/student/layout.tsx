"use client";

import { ReactNode } from "react";
import { StudentWrapper } from "@/components/wrappers/StudentWrapper";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function StudentLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === "/student" && pathname === "/student") return true;
    if (path !== "/student" && pathname.startsWith(path)) return true;
    return false;
  };

  const navLinks = [
    { href: "/student",         label: "My Profile" },
    { href: "/student/attendance", label: "Attendance" },
    { href: "/student/marks",   label: "My Marks"   },
    { href: "/student/notices", label: "Notices"    },
  ];

  return (
    <StudentWrapper>
      <div className="min-h-[calc(100vh-3.5rem)]">

        {/* ── Portal header + horizontal tab bar ───────────── */}
        <div className="border-b border-border bg-background">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="pt-6 pb-3">
              <p className="label-caps">Student Portal</p>
            </div>
            <nav className="flex items-end gap-0 overflow-x-auto">
              {navLinks.map((link) => {
                const active = isActive(link.href);
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
        </div>

        {/* ── Page content ─────────────────────────────────── */}
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-8">
          {children}
        </div>
      </div>
    </StudentWrapper>
  );
}
