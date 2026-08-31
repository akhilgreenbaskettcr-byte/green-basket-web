"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { Logo } from "@/components/ui/Logo";
import { Loader2, ArrowRight, Lock, Mail, User, AlertCircle } from "lucide-react";

function SignupFormInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawRedirect = searchParams.get("redirect");
  const targetDestination = rawRedirect && rawRedirect !== "/account" ? rawRedirect : "/";

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

    if (!fullName.trim()) {
      setError("Please enter your full name.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    const supabase = createClient();
    const { data, error: authError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          full_name: fullName.trim(),
          role: "customer",
        },
      },
    });

    if (authError) {
      setLoading(false);
      const msg = authError.message.toLowerCase();
      if (msg.includes("already registered") || msg.includes("already exists") || msg.includes("user already")) {
        setError("An account with this email already exists. Please sign in instead.");
      } else if (msg.includes("rate limit") || msg.includes("rate_limit")) {
        setError("Too many signup attempts sent to this email recently (Supabase security limit). Please wait a few minutes before trying again, or try Signing In if your account was already created.");
      } else if (msg.includes("invalid email")) {
        setError("Please enter a valid email address.");
      } else if (msg.includes("password")) {
        setError("Password is too weak. Please use at least 6 characters.");
      } else {
        setError(authError.message);
      }
      return;
    }

    if (!data.user) {
      setLoading(false);
      setError("Failed to create account. Please try again.");
      return;
    }

    // Account successfully created -> Go DIRECTLY to Main Home Page (/)
    window.location.href = targetDestination;
  };

  return (
    <div className="w-full max-w-md bg-white rounded-3xl border border-gb-border p-8 shadow-sm space-y-6">
      <div className="text-center space-y-2">
        <Logo href="/" size="md" />
        <h1 className="text-2xl font-black text-gb-charcoal tracking-tight pt-2">
          Create an Account
        </h1>
        <p className="text-xs text-gray-500">
          Save your addresses and view order history with Green Basket.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="gb-label">Full Name</label>
          <div className="relative">
            <input
              id="name"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="John Doe"
              className="gb-input pl-10"
              required
              autoComplete="name"
            />
            <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        <div>
          <label htmlFor="email" className="gb-label">Email Address</label>
          <div className="relative">
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="hello@example.com"
              className="gb-input pl-10"
              required
              autoComplete="email"
            />
            <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="gb-label">Password (min 6 characters)</label>
          <div className="relative">
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="gb-input pl-10"
              required
              minLength={6}
              autoComplete="new-password"
            />
            <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        <div>
          <label htmlFor="confirmPassword" className="gb-label">Confirm Password</label>
          <div className="relative">
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="gb-input pl-10"
              required
              minLength={6}
              autoComplete="new-password"
            />
            <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3.5 text-xs text-red-700 space-y-2">
            <div className="flex items-start gap-2">
              <AlertCircle size={16} className="shrink-0 text-red-500 mt-0.5" />
              <span>{error}</span>
            </div>
            {(error.includes("rate limit") || error.includes("already exists")) && (
              <div className="pt-1 border-t border-red-100">
                <Link
                  href={targetDestination && targetDestination !== "/" ? `/login?redirect=${encodeURIComponent(targetDestination)}` : "/login"}
                  className="font-bold text-gb-green hover:underline inline-flex items-center gap-1"
                >
                  Try Signing In with this email →
                </Link>
              </div>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full justify-center py-3 text-sm font-bold mt-2"
          id="customer-signup-submit"
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Creating Account…
            </>
          ) : (
            <>
              Create Account <ArrowRight size={16} />
            </>
          )}
        </button>
      </form>

      <div className="text-center border-t border-gb-border pt-4 text-xs text-gray-500 space-y-2">
        <p>
          Already have an account?{" "}
          <Link
            href={targetDestination && targetDestination !== "/" ? `/login?redirect=${encodeURIComponent(targetDestination)}` : "/login"}
            className="font-bold text-gb-green hover:underline"
          >
            Sign In
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

export function SignupForm() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-gray-500">Loading…</div>}>
      <SignupFormInner />
    </Suspense>
  );
}
