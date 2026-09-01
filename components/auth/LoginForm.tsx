"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { Logo } from "@/components/ui/Logo";
import { Loader2, ArrowRight, Lock, Mail, AlertCircle, MailOpen, CheckCircle2 } from "lucide-react";

function LoginFormInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawRedirect = searchParams.get("redirect");
  const targetDestination = rawRedirect && rawRedirect !== "/account" ? rawRedirect : "/";
  const initialEmail = searchParams.get("email") || "";
  const isJustRegistered = searchParams.get("registered") === "true";

  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [emailNotConfirmed, setEmailNotConfirmed] = useState(false);

  // If user is already signed in, redirect them directly to the main home page (/)
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        window.location.href = targetDestination;
      }
    });
  }, [targetDestination]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setEmailNotConfirmed(false);

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }
    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);

    const supabase = createClient();
    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (authError) {
      setLoading(false);
      const msg = authError.message.toLowerCase();
      if (msg.includes("email not confirmed") || msg.includes("email_not_confirmed")) {
        setEmailNotConfirmed(true);
        return;
      } else if (msg.includes("invalid login") || msg.includes("invalid credentials") || msg.includes("wrong password")) {
        setError("Email or password is incorrect. Please try again.");
      } else if (msg.includes("user not found") || msg.includes("no user")) {
        setError("No account found with this email. Please create an account.");
      } else if (msg.includes("too many")) {
        setError("Too many login attempts. Please wait a moment and try again.");
      } else {
        setError(authError.message);
      }
      return;
    }

    if (!data.user) {
      setLoading(false);
      setError("Login failed. Please try again.");
      return;
    }

    // Direct hard browser navigation to Main Home Page (/) — bypasses router cache
    window.location.href = targetDestination;
  };

  return (
    <div className="w-full max-w-md bg-white rounded-3xl border border-gb-border p-5 sm:p-8 shadow-sm space-y-4 sm:space-y-6">
      <div className="text-center space-y-1.5">
        <Logo href="/" size="md" />
        <h1 className="text-xl sm:text-2xl font-black text-gb-charcoal tracking-tight pt-1 sm:pt-2">
          Customer Sign In
        </h1>
        <p className="text-xs text-gray-500">
          Sign in to access your saved addresses and order history.
        </p>
      </div>

      {isJustRegistered && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 text-xs text-emerald-800 flex items-center gap-2 font-medium">
          <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />
          <span>Account created successfully! Please sign in to continue.</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
        <div>
          <label htmlFor="email" className="gb-label">
            Email Address
          </label>
          <div className="relative flex items-center">
            <div className="absolute left-0 top-0 bottom-0 w-11 flex items-center justify-center pointer-events-none text-gray-400">
              <Mail size={18} />
            </div>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="hello@example.com"
              className="gb-input !pl-11"
              required
              autoComplete="email"
            />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="gb-label">
            Password
          </label>
          <div className="relative flex items-center">
            <div className="absolute left-0 top-0 bottom-0 w-11 flex items-center justify-center pointer-events-none text-gray-400">
              <Lock size={18} />
            </div>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="gb-input !pl-11"
              required
              autoComplete="current-password"
            />
          </div>
        </div>

        {/* Email not confirmed special message */}
        {emailNotConfirmed && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-800 flex items-start gap-2">
            <MailOpen size={16} className="shrink-0 text-amber-600 mt-0.5" />
            <div>
              <p className="font-bold mb-0.5">Email not confirmed yet</p>
              <p>Please check your inbox for a confirmation email from Green Basket and click the link before signing in.</p>
              <p className="mt-1 text-amber-600">Can&apos;t find it? Check your spam folder.</p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3.5 text-xs text-red-700 flex items-start gap-2">
            <AlertCircle size={16} className="shrink-0 text-red-500 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full justify-center py-2.5 sm:py-3 text-sm font-bold mt-1 sm:mt-2"
          id="customer-login-submit"
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Signing in…
            </>
          ) : (
            <>
              Sign In <ArrowRight size={16} />
            </>
          )}
        </button>
      </form>

      <div className="text-center border-t border-gb-border pt-3 sm:pt-4 text-xs text-gray-500 space-y-1.5 sm:space-y-2">
        <p>
          Don&apos;t have an account?{" "}
          <Link
            href={targetDestination && targetDestination !== "/" ? `/signup?redirect=${encodeURIComponent(targetDestination)}` : "/signup"}
            className="font-bold text-gb-green hover:underline"
          >
            Create an Account
          </Link>
        </p>
        <p>
          <Link href="/checkout" className="text-gray-400 hover:text-gray-600">
            ← Continue as Guest to Checkout
          </Link>
        </p>
      </div>
    </div>
  );
}

export function LoginForm() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-gray-500">Loading…</div>}>
      <LoginFormInner />
    </Suspense>
  );
}
