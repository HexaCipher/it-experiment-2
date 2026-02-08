import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ConvexClientProvider from "@/lib/ConvexClerkProvider";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import { SessionWrapper } from "@/components/wrappers/SessionWrapper";
import { ThemeProvider } from "next-themes";
import { Navbar } from "@/components/navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PortalSafe — Secure Student Management",
  description:
    "A security-first student management system demonstrating Access Control, HTTPS, Input Validation, and Machine Authorization (RBAC).",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ClerkProvider>
          <ConvexClientProvider>
            <SessionWrapper>
              <ThemeProvider
                attribute="class"
                defaultTheme="dark"
                enableSystem
                disableTransitionOnChange
              >
                <Navbar />
                {children}
              </ThemeProvider>
            </SessionWrapper>
            <Toaster />
          </ConvexClientProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
