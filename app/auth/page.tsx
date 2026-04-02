"use client";

import { useSignUp, SignIn } from "@clerk/nextjs";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signUpSchema } from "@/lib/validations";
import { z } from "zod/v4";
import { Eye, EyeOff, AlertCircle, Loader2 } from "lucide-react";

type SignUpFormData = z.infer<typeof signUpSchema>;

// ─── Custom Sign-Up Form ──────────────────────────────────
function CustomSignUpForm() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const [step, setStep] = useState<"details" | "verify">("details");
  const [verificationCode, setVerificationCode] = useState("");
  const [verifyError, setVerifyError] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [clerkError, setClerkError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    mode: "onChange",
  });

  // Block numeric key presses in name fields at the DOM level
  const blockDigits = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (/\d/.test(e.key)) {
      e.preventDefault();
    }
  };

  // Also sanitize paste events in name fields
  const sanitizeNamePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text");
    const cleaned = pasted.replace(/\d/g, "");
    document.execCommand("insertText", false, cleaned);
  };

  const onSubmit = async (data: SignUpFormData) => {
    if (!isLoaded) return;
    setClerkError("");

    try {
      await signUp.create({
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        emailAddress: data.emailAddress.trim().toLowerCase(),
        password: data.password,
      });

      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setStep("verify");
    } catch (err: unknown) {
      const clerkErr = err as { errors?: { message: string }[] };
      const msg = clerkErr?.errors?.[0]?.message ?? "Sign-up failed. Please try again.";
      setClerkError(msg);
    }
  };

  const onVerify = async () => {
    if (!isLoaded) return;
    setVerifyError("");
    setVerifying(true);

    try {
      const result = await signUp.attemptEmailAddressVerification({ code: verificationCode });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
      } else {
        setVerifyError("Verification incomplete. Please try again.");
      }
    } catch (err: unknown) {
      const clerkErr = err as { errors?: { message: string }[] };
      const msg = clerkErr?.errors?.[0]?.message ?? "Invalid code. Please try again.";
      setVerifyError(msg);
    } finally {
      setVerifying(false);
    }
  };

  // ── Step 2: Email Verification ───────────────────────────
  if (step === "verify") {
    return (
      <div className="w-full space-y-5">
        <div className="space-y-1">
          <h2 className="font-display text-xl">Check your inbox</h2>
          <p className="text-sm text-muted-foreground">
            We sent a 6-digit verification code to your email address.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="otp-code" className="label-caps">
            Verification Code
          </Label>
          <Input
            id="otp-code"
            type="text"
            inputMode="numeric"
            maxLength={6}
            placeholder="000000"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ""))}
            className="text-center tracking-widest text-lg font-mono"
          />
          {verifyError && (
            <p className="flex items-center gap-1.5 text-xs text-destructive">
              <AlertCircle className="h-3 w-3 shrink-0" />
              {verifyError}
            </p>
          )}
        </div>

        <Button
          onClick={onVerify}
          disabled={verifyError !== "" || verifying || verificationCode.length < 6}
          className="w-full"
        >
          {verifying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Verify Email
        </Button>

        <button
          type="button"
          onClick={() => setStep("details")}
          className="text-xs text-muted-foreground underline-offset-4 hover:underline w-full text-center"
        >
          ← Back to sign-up
        </button>
      </div>
    );
  }

  // ── Step 1: Registration Details ─────────────────────────
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-4" noValidate>
      <div className="grid grid-cols-2 gap-3">
        {/* First Name */}
        <div className="space-y-1.5">
          <Label htmlFor="firstName" className="label-caps">
            First Name
          </Label>
          <Input
            id="firstName"
            placeholder="Aman"
            autoComplete="given-name"
            onKeyDown={blockDigits}
            onPaste={sanitizeNamePaste}
            {...register("firstName")}
            className={errors.firstName ? "border-destructive focus-visible:ring-destructive" : ""}
          />
          {errors.firstName && (
            <p className="flex items-start gap-1 text-xs text-destructive">
              <AlertCircle className="h-3 w-3 shrink-0 mt-0.5" />
              {errors.firstName.message}
            </p>
          )}
        </div>

        {/* Last Name */}
        <div className="space-y-1.5">
          <Label htmlFor="lastName" className="label-caps">
            Last Name
          </Label>
          <Input
            id="lastName"
            placeholder="Singh"
            autoComplete="family-name"
            onKeyDown={blockDigits}
            onPaste={sanitizeNamePaste}
            {...register("lastName")}
            className={errors.lastName ? "border-destructive focus-visible:ring-destructive" : ""}
          />
          {errors.lastName && (
            <p className="flex items-start gap-1 text-xs text-destructive">
              <AlertCircle className="h-3 w-3 shrink-0 mt-0.5" />
              {errors.lastName.message}
            </p>
          )}
        </div>
      </div>

      {/* Email */}
      <div className="space-y-1.5">
        <Label htmlFor="emailAddress" className="label-caps">
          Email Address
        </Label>
        <Input
          id="emailAddress"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          {...register("emailAddress")}
          className={errors.emailAddress ? "border-destructive focus-visible:ring-destructive" : ""}
        />
        {errors.emailAddress && (
          <p className="flex items-start gap-1 text-xs text-destructive">
            <AlertCircle className="h-3 w-3 shrink-0 mt-0.5" />
            {errors.emailAddress.message}
          </p>
        )}
      </div>

      {/* Password */}
      <div className="space-y-1.5">
        <Label htmlFor="password" className="label-caps">
          Password
        </Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Min. 8 chars, 1 uppercase, 1 number"
            autoComplete="new-password"
            {...register("password")}
            className={errors.password ? "border-destructive focus-visible:ring-destructive pr-10" : "pr-10"}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-foreground transition-colors"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.password && (
          <p className="flex items-start gap-1 text-xs text-destructive">
            <AlertCircle className="h-3 w-3 shrink-0 mt-0.5" />
            {errors.password.message}
          </p>
        )}
      </div>

      {/* Clerk-level error (e.g. email already taken) */}
      {clerkError && (
        <div className="flex items-start gap-2 rounded border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive">
          <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
          {clerkError}
        </div>
      )}

      {/* Required by Clerk custom flows: mount point for Smart CAPTCHA bot-protection widget.
           Clerk controls visibility — only shown when a CAPTCHA challenge is triggered. */}
      <div id="clerk-captcha" />

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Create Account
      </Button>
    </form>
  );
}

// ─── Auth Page ────────────────────────────────────────────
export default function AuthPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-4">
        <Card className="p-6">
          {/* Tab Switcher */}
          <div className="flex gap-2 mb-6">
            <Button
              variant={mode === "signin" ? "default" : "outline"}
              className="flex-1"
              onClick={() => setMode("signin")}
            >
              Sign In
            </Button>
            <Button
              variant={mode === "signup" ? "default" : "outline"}
              className="flex-1"
              onClick={() => setMode("signup")}
            >
              Sign Up
            </Button>
          </div>

          <div className="flex justify-center">
            {mode === "signin" ? (
              <SignIn
                appearance={{
                  elements: {
                    rootBox: "w-full",
                    card: "shadow-none",
                  },
                }}
                routing="hash"
              />
            ) : (
              <CustomSignUpForm />
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
