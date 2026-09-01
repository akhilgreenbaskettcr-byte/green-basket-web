"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Download, X, Share2, PlusSquare } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already in standalone mode
    const isRunningStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window.navigator as any).standalone === true;

    setIsStandalone(isRunningStandalone);
    if (isRunningStandalone) return;

    // Check if user dismissed recently (wait 5 days before showing again)
    const lastDismissed = localStorage.getItem("gb_pwa_prompt_dismissed");
    if (lastDismissed) {
      const daysSinceDismiss = (Date.now() - parseInt(lastDismissed, 10)) / (1000 * 60 * 60 * 24);
      if (daysSinceDismiss < 5) return;
    }

    // Detect iOS Safari
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    const isSafari = /safari/.test(userAgent) && !/chrome|crios|fxios/.test(userAgent);

    if (isIosDevice && isSafari) {
      setIsIos(true);
      // Small delay before showing iOS install banner
      const timer = setTimeout(() => setShowPrompt(true), 3000);
      return () => clearTimeout(timer);
    }

    // Standard BeforeInstallPrompt (Chrome, Android, Edge, Desktop)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "accepted") {
        console.log("[PWA] User accepted installation");
        setShowPrompt(false);
      }
      setDeferredPrompt(null);
    } catch (err) {
      console.warn("[PWA] Install prompt error:", err);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem("gb_pwa_prompt_dismissed", Date.now().toString());
  };

  if (!showPrompt || isStandalone) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-2xl border-2 border-emerald-500/20 ring-1 ring-black/5 flex flex-col gap-3 relative overflow-hidden backdrop-blur-sm">
        {/* Decorative background accent */}
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-20 h-20 bg-emerald-100 rounded-full blur-xl pointer-events-none opacity-60" />

        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* App Icon */}
            <div className="relative w-12 h-12 rounded-xl bg-[#FAFAF5] border border-emerald-200/80 p-1 shrink-0 shadow-xs overflow-hidden flex items-center justify-center">
              <Image
                src="/icons/icon-192x192.png"
                alt="Green Basket App"
                fill
                sizes="48px"
                className="object-contain select-none"
              />
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="font-extrabold text-sm text-gb-charcoal tracking-tight">
                  Green Basket TCR
                </h4>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-gb-green">
                  App
                </span>
              </div>
              <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">
                Install our app for faster 1-tap ordering
              </p>
            </div>
          </div>

          <button
            onClick={handleDismiss}
            className="text-gray-400 hover:text-gray-600 p-1 -mr-1 -mt-1 rounded-full transition-colors"
            aria-label="Dismiss install prompt"
          >
            <X size={18} />
          </button>
        </div>

        {/* Action / iOS Guide */}
        {isIos ? (
          <div className="bg-emerald-50/70 rounded-xl p-3 text-xs text-emerald-900 border border-emerald-100 space-y-1">
            <p className="font-semibold flex items-center gap-1.5">
              <span>To install on iPhone / iPad:</span>
            </p>
            <p className="text-[11px] text-emerald-800 flex items-center gap-1.5">
              1. Tap the Share button <Share2 size={13} className="inline text-blue-600" /> in Safari
            </p>
            <p className="text-[11px] text-emerald-800 flex items-center gap-1.5">
              2. Scroll down & select <strong className="inline-flex items-center gap-1">Add to Home Screen <PlusSquare size={12} /></strong>
            </p>
          </div>
        ) : (
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={handleInstallClick}
              className="flex-1 bg-gb-green hover:bg-gb-green-dark text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-sm active:scale-98"
            >
              <Download size={15} />
              <span>Install App</span>
            </button>
            <button
              onClick={handleDismiss}
              className="py-2.5 px-3 rounded-xl text-xs font-semibold text-gray-500 hover:bg-gray-100 transition-colors"
            >
              Not now
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
