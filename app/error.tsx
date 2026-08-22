"use client";

import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="min-h-screen bg-gb-cream flex items-center justify-center py-20">
      <div className="gb-container text-center max-w-lg mx-auto">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
          style={{ backgroundColor: "#fef2f2" }}
          aria-hidden="true"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" className="w-8 h-8" aria-hidden="true">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gb-charcoal mb-3">
          Something went wrong.
        </h1>
        <p className="text-gray-500 text-base mb-8 leading-relaxed">
          We hit an unexpected error. Please try again — it usually resolves quickly.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button onClick={reset} className="btn-primary">Try Again</button>
          <Link href="/" className="btn-ghost">Go Home</Link>
        </div>
      </div>
    </main>
  );
}
