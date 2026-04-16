"use client";

import { ReactNode } from "react";
import { AdminWrapper } from "@/components/wrappers/AdminWrapper";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === "/admin" && pathname === "/admin") return true;
    if (path !== "/admin" && pathname.startsWith(path)) return true;
    return false;
  };

  const navLinks = [
    { href: "/admin",          label: "Dashboard"         },
    { href: "/admin/users",    label: "Users"             },
    { href: "/admin/attendance", label: "Attendance"      },
    { href: "/admin/template", label: "Template"          },
    { href: "/admin/marks",    label: "Marks Entry"       },
    { href: "/admin/notices",  label: "Notices"           },
    { href: "/admin/students", label: "Students"          },
  ];

  return (
    <AdminWrapper>
      <div className="min-h-[calc(100vh-3.5rem)]">

        {/* ── Portal header + horizontal tab bar ───────────── */}
        <div className="border-b border-border bg-background">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            {/* Portal label */}
            <div className="pt-6 pb-3">
              <p className="label-caps">Admin Panel</p>
            </div>

            {/* Tab row */}
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
                    {/* Active indicator — 2px rule underline */}
                    {active && (
                      <span
                        className="absolute bottom-0 left-0 right-0 h-[2px] bg-foreground animate-fade-in"
                      />
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
    </AdminWrapper>
  );
}
