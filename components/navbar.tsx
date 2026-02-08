"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignedIn, SignedOut, UserButton, useUser } from "@clerk/nextjs";
import { useTheme } from "next-themes";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Moon,
  Sun,
  Menu,
  Home,
  LayoutDashboard,
  ShieldCheck,
  ChevronRight,
  Laptop,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

// Navigation links configuration
const navigationLinks = [
  { href: "/", label: "Home", icon: Home },
  { href: "/student", label: "Student Portal", icon: LayoutDashboard, studentOnly: true },
  { href: "/admin", label: "Admin", icon: ShieldCheck, adminOnly: true },
];

const publicRoutes = ["/auth", "/pending", "/403", "/account-not-found"];

export function Navbar() {
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const { user, isSignedIn } = useUser();

  // Check admin role via Convex
  const dbUser = useQuery(
    api.functions.queries.getUserByClerkId,
    user?.id ? { clerk_user_id: user.id } : "skip",
  );

  const isAdmin = dbUser?.role === "admin";
  const isStudent = dbUser?.role === "user" && dbUser?.status === "confirmed";

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isPublicRoute = publicRoutes.some((route) =>
    pathname?.startsWith(route),
  );

  if (isPublicRoute) return null;

  if (!mounted) {
    return (
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-xl">
              <div className="size-8 rounded-lg bg-primary/20 animate-pulse" />
              <span>App</span>
            </div>
            <div className="size-9 rounded-md bg-muted animate-pulse" />
          </div>
        </div>
      </header>
    );
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        scrolled
          ? "border-b bg-background/80 backdrop-blur-md shadow-sm"
          : "bg-transparent",
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-8">
            <Link
              href="/"
              className="flex items-center gap-2.5 transition-transform hover:scale-[1.02] active:scale-95"
            >
              <div className="flex size-9 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/20">
                <span className="text-lg font-bold text-primary-foreground">
                  P
                </span>
              </div>
              <span className="hidden text-xl font-bold tracking-tight sm:inline-block">
                PortalSafe
              </span>
            </Link>

            {/* Desktop Nav */}
            {isSignedIn && (
            <nav className="hidden lg:flex items-center">
              <NavigationMenu>
                <NavigationMenuList className="gap-4 flex flex-row">
                  {navigationLinks.map((link) => {
                    if (link.adminOnly && !isAdmin) return null;
                    if (link.studentOnly && !isStudent) return null;
                    const Icon = link.icon;
                    const active = pathname === link.href;

                    return (
                      <NavigationMenuItem key={link.href}>
                        <Link href={link.href} className={`flex flex-row items-center gap-2 ${active ? "bg-neutral-800/50" : ""} px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-primary/10 data-[state=open]:bg-primary/10`}>
                          <Icon className="size-4" />
                          {link.label}
                        </Link>
                      </NavigationMenuItem>
                    );
                  })}
                </NavigationMenuList>
              </NavigationMenu>
            </nav>
            )}
          </div>

          {/* Action Area */}
          <div className="flex items-center gap-3">
            {/* Theme Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-full hover:bg-primary/10 flex items-center justify-center"
                >
                  <Sun className="size-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute size-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                  <span className="sr-only">Toggle theme</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40 rounded-xl">
                <DropdownMenuItem
                  onClick={() => setTheme("light")}
                  className="gap-2"
                >
                  <Sun className="size-4" /> Light
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setTheme("dark")}
                  className="gap-2"
                >
                  <Moon className="size-4" /> Dark
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setTheme("system")}
                  className="gap-2"
                >
                  <Laptop className="size-4" /> System
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="hidden h-10 w-px bg-border sm:block" />

            <div className="hidden sm:flex items-center">
              <SignedIn>
                <div className="flex items-center gap-3">
                  <UserButton
                    appearance={{
                      elements: {
                        userButtonAvatarBox:
                          "size-9 border-2 border-primary/10 hover:border-primary/30 transition-all",
                      },
                    }}
                  />
                </div>
              </SignedIn>
              <SignedOut>
                <div className="flex items-center gap-2">
                  <Button
                    asChild
                    variant="ghost"
                    className="rounded-full px-5 h-10 transition-all active:scale-95"
                  >
                    <Link href="/auth">Sign In</Link>
                  </Button>
                  <Button
                    asChild
                    className="rounded-full px-5 h-10 shadow-md transition-all hover:shadow-lg active:scale-95"
                  >
                    <Link href="/auth">Sign Up</Link>
                  </Button>
                </div>
              </SignedOut>
            </div>

            {/* Mobile Nav Trigger */}
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 lg:hidden rounded-full hover:bg-primary/10 flex items-center justify-center"
                >
                  <Menu className="size-6" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="flex w-full flex-col p-0 sm:max-w-xs overflow-hidden"
              >
                <SheetHeader className="border-b p-6 text-left bg-background/50 backdrop-blur-md">
                  <SheetTitle className="flex items-center gap-2">
                    <div className="size-8 rounded-lg bg-primary" />
                    <span>Navigation</span>
                  </SheetTitle>
                </SheetHeader>

                <div className="flex flex-1 flex-col justify-between p-6 overflow-y-auto">
                  <nav className="space-y-2">
                    {isSignedIn && navigationLinks.map((link) => {
                      if (link.adminOnly && !isAdmin) return null;
                      if (link.studentOnly && !isStudent) return null;
                      const Icon = link.icon;
                      const active = pathname === link.href;

                      return (
                        <SheetClose key={link.href} asChild>
                          <Link
                            href={link.href}
                            className={cn(
                              "flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-all active:scale-[0.98]",
                              active
                                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                                : "text-muted-foreground hover:bg-accent hover:text-foreground",
                            )}
                          >
                            <div className="flex items-center gap-3">
                              <Icon className="size-5" />
                              {link.label}
                            </div>
                            <ChevronRight
                              className={cn(
                                "size-4 opacity-50",
                                active && "opacity-100",
                              )}
                            />
                          </Link>
                        </SheetClose>
                      );
                    })}
                  </nav>

                  <div className="space-y-6 pt-6 mt-auto">
                    <div className="flex justify-center gap-2 rounded-xl border bg-muted/20 p-1">
                      <Button
                        variant={theme === "light" ? "secondary" : "ghost"}
                        size="sm"
                        onClick={() => setTheme("light")}
                        className="flex-1 rounded-lg"
                      >
                        <Sun className="size-4" />
                      </Button>
                      <Button
                        variant={theme === "dark" ? "secondary" : "ghost"}
                        size="sm"
                        onClick={() => setTheme("dark")}
                        className="flex-1 rounded-lg"
                      >
                        <Moon className="size-4" />
                      </Button>
                      <Button
                        variant={theme === "system" ? "secondary" : "ghost"}
                        size="sm"
                        onClick={() => setTheme("system")}
                        className="flex-1 rounded-lg"
                      >
                        <Laptop className="size-4" />
                      </Button>
                    </div>

                    <div className="h-px bg-border" />

                    <SignedIn>
                      <div className="flex items-center gap-4 rounded-2xl border bg-muted/30 p-4 transition-colors hover:bg-muted/50">
                        <UserButton
                          appearance={{
                            elements: {
                              userButtonAvatarBox: "size-12 shadow-sm",
                              userButtonTrigger: "focus:ring-0",
                            },
                          }}
                        />
                        <div className="flex flex-col overflow-hidden">
                          <span className="text-sm font-semibold truncate">
                            {user?.fullName || "Account"}
                          </span>
                          <span className="text-xs text-muted-foreground truncate opacity-70">
                            {user?.primaryEmailAddress?.emailAddress}
                          </span>
                        </div>
                      </div>
                    </SignedIn>
                    <SignedOut>
                      <div className="flex flex-col gap-2">
                        <SheetClose asChild>
                          <Button
                            asChild
                            variant="outline"
                            className="w-full rounded-xl py-6 text-base font-semibold active:scale-95"
                          >
                            <Link href="/auth">Sign In</Link>
                          </Button>
                        </SheetClose>
                        <SheetClose asChild>
                          <Button
                            asChild
                            className="w-full rounded-xl py-6 text-base font-semibold shadow-md active:scale-95"
                          >
                            <Link href="/auth">Sign Up</Link>
                          </Button>
                        </SheetClose>
                      </div>
                    </SignedOut>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
