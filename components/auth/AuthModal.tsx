"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { X, Loader2, Mail, Lock, User, AlertCircle, CheckCircle2 } from "lucide-react";
import { Logo } from "@/components/ui/Logo";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setLoading(true);

    const supabase = createClient();

    if (mode === "login") {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (authError || !data.user) {
        setError(authError?.message || "Invalid email or password.");
        setLoading(false);
        return;
      }

      setSuccessMsg("Signed in successfully!");
      setTimeout(() => {
        setLoading(false);
        onSuccess?.();
        onClose();
      }, 500);
    } else {
      if (password.length < 6) {
        setError("Password must be at least 6 characters long.");
        setLoading(false);
        return;
      }

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

      if (authError || !data.user) {
        setError(authError?.message || "Failed to create account.");
        setLoading(false);
        return;
      }

      setSuccessMsg("Account created successfully!");
      setTimeout(() => {
        setLoading(false);
        onSuccess?.();
        onClose();
      }, 500);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-gb-border space-y-5">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Close auth modal"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="text-center space-y-1">
          <Logo href="/" size="sm" />
          <h2 className="text-xl font-bold text-gb-charcoal pt-1">
            {mode === "login" ? "Sign In to Green Basket" : "Create your Account"}
          </h2>
          <p className="text-xs text-gray-500">
            {mode === "login"
              ? "Access your saved addresses and order history"
              : "Save your delivery address for faster checkouts"}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === "signup" && (
            <div>
              <label className="gb-label text-xs">Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Doe"
                  className="gb-input pl-9 text-xs"
                  required
                />
                <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>
          )}

          <div>
            <label className="gb-label text-xs">Email Address</label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="hello@example.com"
                className="gb-input pl-9 text-xs"
                required
              />
              <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          <div>
            <label className="gb-label text-xs">Password</label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="gb-input pl-9 text-xs"
                required
                minLength={6}
              />
              <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-600 flex items-center gap-2">
              <AlertCircle size={14} className="shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-700 flex items-center gap-2">
              <CheckCircle2 size={14} className="shrink-0 text-emerald-500" />
              <span>{successMsg}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full justify-center py-2.5 text-xs font-bold mt-1"
          >
            {loading ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                {mode === "login" ? "Signing In…" : "Creating Account…"}
              </>
            ) : mode === "login" ? (
              "Sign In"
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        {/* Footer toggle */}
        <div className="text-center pt-2 text-xs text-gray-500 border-t border-gray-100">
          {mode === "login" ? (
            <p>
              New customer?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("signup");
                  setError("");
                }}
                className="font-bold text-gb-green hover:underline"
              >
                Create an Account
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setError("");
                }}
                className="font-bold text-gb-green hover:underline"
              >
                Sign In
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
