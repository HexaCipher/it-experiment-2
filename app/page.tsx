"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  ShieldCheck,
  Lock,
  FileCheck2,
  Users,
  Globe,
  Layers,
  ArrowRight,
  CheckCircle2,
  Activity,
  KeyRound,
  ScanEye,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SecurityShieldAnimation } from "@/components/landing/SecurityShieldAnimation";

/* ─── Animation variants ─────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5 },
  }),
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
};

/* ─── Data ───────────────────────────────────────────── */
const securityFeatures = [
  {
    icon: Lock,
    title: "Access Control & Least Privilege",
    color: "text-blue-500 dark:text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    description:
      "Multi-layered wrappers enforce that every user only sees what their role permits. Unauthenticated users are redirected to /auth, pending users to /pending, and unauthorized users to /403.",
    implementations: [
      "SessionWrapper redirects unauthenticated users",
      "AdminWrapper & StudentWrapper enforce role checks",
      "ConfirmedUserWrapper blocks pending/disabled accounts",
      "Fail-secure: default to DENY, never ALLOW",
    ],
  },
  {
    icon: Globe,
    title: "HTTPS & Secure Communication",
    color: "text-emerald-500 dark:text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    description:
      "All data-in-transit is encrypted via TLS. Clerk manages authentication over HTTPS with JWT tokens. Webhook payloads are verified using Svix HMAC signatures to prevent tampering.",
    implementations: [
      "Clerk auth over HTTPS with secure JWT tokens",
      "Svix HMAC signature verification on webhooks",
      "Convex JWT issuer domain validation",
      "MITM protection for credentials & sessions",
    ],
  },
  {
    icon: FileCheck2,
    title: "Input Validation & Sensitive Data",
    color: "text-violet-500 dark:text-violet-400",
    bg: "bg-violet-500/10",
    border: "border-violet-500/20",
    description:
      "Dual-layer validation: client-side Zod schemas enforce length, type, and format constraints; server-side Convex validators with manual bounds checking provide defense in depth.",
    implementations: [
      "Zod schemas: regex, length, type validation (client)",
      "Convex v validators & manual bounds (server)",
      "Roll number uniqueness check prevents duplicates",
      "Password hashing delegated to Clerk (bcrypt/Argon2)",
    ],
  },
  {
    icon: Users,
    title: "Machine Authorization (RBAC)",
    color: "text-amber-500 dark:text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    description:
      "Backend-enforced role-based access control. Every admin mutation calls requireAdmin() which verifies identity and role from the database — impossible to bypass from the client.",
    implementations: [
      "requireAdmin() guard on all admin mutations",
      "ctx.auth.getUserIdentity() for server-side auth",
      "Scoped queries: students only see own data",
      "Role-filtered navigation in Navbar",
    ],
  },
];

const depthLayers = [
  {
    label: "Clerk Authentication",
    description: "Identity verification via OAuth / Email+Password over HTTPS",
    icon: KeyRound,
  },
  {
    label: "Session Wrapper",
    description: "Client-side gate: redirects unauthenticated to /auth",
    icon: ScanEye,
  },
  {
    label: "Role Wrappers",
    description: "AdminWrapper / StudentWrapper enforce role + status checks",
    icon: ShieldCheck,
  },
  {
    label: "Backend Guards",
    description: "requireAdmin() & identity.subject scoping on every mutation/query",
    icon: Lock,
  },
  {
    label: "Audit Logging",
    description: "Every admin action logged with actor, target, timestamp & details",
    icon: Activity,
  },
];

/* ─── Page Component ─────────────────────────────────── */
export default function Homepage() {
  return (
    <main className="relative overflow-hidden">
      {/* ─── HERO ──────────────────────────────────── */}
      <section className="relative min-h-[calc(100vh-4rem)] flex items-center">
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.03)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-size-[4rem_4rem] mask-[radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            {/* Left column — copy */}
            <motion.div
              className="flex flex-col gap-2 lg:gap-3 max-w-xl"
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
            >
              <motion.div variants={fadeUp} custom={0}>
                <Badge
                  variant="secondary"
                  className="w-fit gap-1.5 px-3 py-1 text-xs font-medium rounded-full border border-primary/20 bg-primary/5"
                >
                  <ShieldCheck className="size-3.5" />
                  IT Security Assignment — Experiment 2
                </Badge>
              </motion.div>

              <motion.h1
                className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1]"
                variants={fadeUp}
                custom={1}
              >
                Security-First{" "}
                <span className="bg-linear-to-r from-primary/80 to-primary bg-clip-text">
                  Student Management
                </span>
              </motion.h1>

              <motion.p
                className="text-base sm:text-lg text-muted-foreground leading-relaxed"
                variants={fadeUp}
                custom={2}
              >
                A full-stack application demonstrating{" "}
                <strong className="text-foreground font-medium">Access Control</strong>,{" "}
                <strong className="text-foreground font-medium">HTTPS</strong>,{" "}
                <strong className="text-foreground font-medium">Input Validation</strong>, and{" "}
                <strong className="text-foreground font-medium">Machine Authorization</strong> — 
                built with layered defense-in-depth security principles.
              </motion.p>

              <motion.div
                className="flex flex-wrap items-center gap-2 pt-4"
                variants={fadeUp}
                custom={3}
              >
                <Button asChild size="lg" className="rounded-full px-8 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all">
                  <Link href="/auth">
                    Get Started <ArrowRight className="ml-2 size-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="rounded-full px-8"
                >
                  <Link href="#features">
                    View Features <ChevronRight className="ml-1 size-4" />
                  </Link>
                </Button>
              </motion.div>

              {/* Quick stats */}
              <motion.div
                className="flex items-center gap-4 pt-3 border-t border-border/50"
                variants={fadeUp}
                custom={4}
              >
                {[
                  { value: "4", label: "Security Layers" },
                  { value: "2×", label: "Validation (Client + Server)" },
                  { value: "100%", label: "Role-Gated Routes" },
                ].map((stat) => (
                  <div key={stat.label} className="flex flex-col">
                    <span className="text-xl font-bold">{stat.value}</span>
                    <span className="text-xs text-muted-foreground">{stat.label}</span>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* Right column — animated shield */}
            <motion.div
              className="relative"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.7, ease: "easeOut" }}
            >
              <SecurityShieldAnimation />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── DEFENSE IN DEPTH ──────────────────────── */}
      <section className="relative py-20 lg:py-28 border-t border-border/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-14"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeUp} custom={0}>
              <Badge variant="secondary" className="mb-4 gap-1.5 px-3 py-1 text-xs font-medium rounded-full border border-primary/20 bg-primary/5">
                <Layers className="size-3.5" />
                Core Principle
              </Badge>
            </motion.div>
            <motion.h2
              className="text-3xl sm:text-4xl font-bold tracking-tight"
              variants={fadeUp}
              custom={1}
            >
              Defense in Depth
            </motion.h2>
            <motion.p
              className="mt-4 text-muted-foreground max-w-2xl mx-auto text-base sm:text-lg"
              variants={fadeUp}
              custom={2}
            >
              Multiple overlapping security layers ensure that if one fails, the next catches it.
              Each request passes through every gate before reaching data.
            </motion.p>
          </motion.div>

          {/* Layered diagram */}
          <motion.div
            className="relative max-w-3xl mx-auto flex flex-col gap-3"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={staggerContainer}
          >
            {depthLayers.map((layer, i) => {
              const Icon = layer.icon;
              return (
                <motion.div
                  key={layer.label}
                  variants={fadeUp}
                  custom={i}
                  className="group relative flex items-center gap-4 rounded-xl border border-border/60 bg-card/50 backdrop-blur-sm px-5 py-4 transition-all hover:border-primary/30 hover:bg-card"
                >
                  {/* Layer number */}
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary shrink-0">
                    <Icon className="size-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-muted-foreground">
                        Layer {i + 1}
                      </span>
                    </div>
                    <h3 className="font-semibold text-sm sm:text-base">{layer.label}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                      {layer.description}
                    </p>
                  </div>

                  {/* Arrow connector */}
                  {i < depthLayers.length - 1 && (
                    <div className="absolute -bottom-3 left-9 w-px h-3 bg-border z-10" />
                  )}
                </motion.div>
              );
            })}

            {/* Fail-secure callout */}
            <motion.div
              variants={fadeUp}
              custom={depthLayers.length}
              className="mt-4 flex items-start gap-3 rounded-xl border border-destructive/20 bg-destructive/5 px-5 py-4"
            >
              <ShieldCheck className="size-5 text-destructive shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-sm">Fail-Secure Principle</h3>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                  If any layer fails or a component crashes, the system defaults to <strong className="text-foreground">DENY access</strong> — 
                  never ALLOW. Users are redirected to <code className="text-xs bg-muted px-1 py-0.5 rounded">/403</code> or <code className="text-xs bg-muted px-1 py-0.5 rounded">/pending</code> until permissions are fully verified.
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ─── FEATURES ──────────────────────────────── */}
      <section id="features" className="relative py-20 lg:py-28 border-t border-border/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-14"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeUp} custom={0}>
              <Badge variant="secondary" className="mb-4 gap-1.5 px-3 py-1 text-xs font-medium rounded-full border border-primary/20 bg-primary/5">
                <CheckCircle2 className="size-3.5" />
                Implementation Details
              </Badge>
            </motion.div>
            <motion.h2
              className="text-3xl sm:text-4xl font-bold tracking-tight"
              variants={fadeUp}
              custom={1}
            >
              Security Features
            </motion.h2>
            <motion.p
              className="mt-4 text-muted-foreground max-w-2xl mx-auto text-base sm:text-lg"
              variants={fadeUp}
              custom={2}
            >
              Each assignment concept is implemented with real, production-ready patterns — 
              not just theoretical descriptions.
            </motion.p>
          </motion.div>

          {/* Feature cards */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={staggerContainer}
          >
            {securityFeatures.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div key={feature.title} variants={scaleIn}>
                  <Card className="h-full border-border/60 bg-card/50 backdrop-blur-sm transition-all hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`flex items-center justify-center w-10 h-10 rounded-xl ${feature.bg} ${feature.color} border ${feature.border}`}>
                          <Icon className="size-5" />
                        </div>
                        <CardTitle className="text-lg">{feature.title}</CardTitle>
                      </div>
                      <CardDescription className="text-sm leading-relaxed">
                        {feature.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {feature.implementations.map((impl) => (
                          <li key={impl} className="flex items-start gap-2 text-sm">
                            <CheckCircle2 className={`size-4 shrink-0 mt-0.5 ${feature.color}`} />
                            <span className="text-muted-foreground">{impl}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ─── AUDIT LOGGING ─────────────────────────── */}
      <section className="relative py-20 lg:py-28 border-t border-border/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            className="max-w-3xl mx-auto"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={staggerContainer}
          >
            <motion.div
              className="rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm p-8 sm:p-10"
              variants={scaleIn}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 text-primary">
                  <Activity className="size-5" />
                </div>
                <h2 className="text-2xl font-bold">Audit Logging</h2>
              </div>
              <p className="text-muted-foreground mb-6 text-sm sm:text-base leading-relaxed">
                Every privileged operation is recorded in the <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">admin_actions</code> table. 
                This provides a complete accountability trail — who did what, to whom, and when.
              </p>

              {/* Simulated log entries */}
              <div className="rounded-xl bg-muted/30 border border-border/40 p-4 font-mono text-xs sm:text-sm space-y-2 overflow-x-auto">
                {[
                  { action: "confirm_user", target: "user_2abc...", by: "admin_1xyz...", time: "2m ago" },
                  { action: "save_marks", target: "2301010123 / Sem 3", by: "admin_1xyz...", time: "5m ago" },
                  { action: "create_notice", target: "\"Exam Schedule\"", by: "admin_1xyz...", time: "12m ago" },
                  { action: "delete_user", target: "user_3def...", by: "admin_1xyz...", time: "1h ago" },
                ].map((log, i) => (
                  <motion.div
                    key={i}
                    className="flex items-center gap-2 text-muted-foreground"
                    variants={fadeUp}
                    custom={i + 1}
                  >
                    <span className="text-primary/60">[{log.time}]</span>
                    <span className="text-amber-500 dark:text-amber-400">{log.action}</span>
                    <span className="text-muted-foreground/60">→</span>
                    <span className="text-foreground/80 truncate">{log.target}</span>
                    <span className="text-muted-foreground/40 ml-auto shrink-0">by {log.by}</span>
                  </motion.div>
                ))}
              </div>

              <p className="text-xs text-muted-foreground mt-4">
                Logged fields: <code className="bg-muted px-1 py-0.5 rounded">action_type</code>, <code className="bg-muted px-1 py-0.5 rounded">target</code>, <code className="bg-muted px-1 py-0.5 rounded">by_clerk_user_id</code>, <code className="bg-muted px-1 py-0.5 rounded">details</code>, <code className="bg-muted px-1 py-0.5 rounded">_creationTime</code>
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ─── TECH STACK FOOTER ─────────────────────── */}
      <section className="relative py-14 border-t border-border/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.p
              className="text-sm text-muted-foreground mb-6"
              variants={fadeUp}
              custom={0}
            >
              Built with
            </motion.p>
            <motion.div
              className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3"
              variants={fadeUp}
              custom={1}
            >
              {["Next.js 16", "Convex", "Clerk", "Tailwind CSS", "Framer Motion", "Zod", "shadcn/ui"].map(
                (tech) => (
                  <span
                    key={tech}
                    className="text-sm font-medium text-muted-foreground/70 hover:text-foreground transition-colors"
                  >
                    {tech}
                  </span>
                ),
              )}
            </motion.div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}