"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { Spinner } from "@/components/ui/spinner";

// Routes that don't require authentication
const PUBLIC_ROUTES = [
  "/",
  "/auth",
  "/pending",
  "/account-not-found",
  "/403",
];

export function SessionWrapper({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  const isPublicRoute =
    pathname === "/" ||
    PUBLIC_ROUTES.some((route) => route !== "/" && pathname?.startsWith(route));

  useEffect(() => {
    if (isLoaded && !isSignedIn && !isPublicRoute) {
      router.push("/auth");
    }
  }, [isLoaded, isSignedIn, isPublicRoute, router]);

  // Allow public routes without session check
  if (isPublicRoute) {
    return <>{children}</>;
  }

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!isSignedIn) {
    return null;
  }

  return <>{children}</>;
}

