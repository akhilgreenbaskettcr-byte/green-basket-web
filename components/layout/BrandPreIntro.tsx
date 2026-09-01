"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Leaf } from "lucide-react";

export function BrandPreIntro() {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [fadingOut, setFadingOut] = useState(false);

  useEffect(() => {
    setMounted(true);

    try {
      const hasSeenIntro = sessionStorage.getItem("gb_preintro_played");
      if (hasSeenIntro) return;
    } catch {
      // Storage restricted
    }

    setVisible(true);

    const fadeTimer = setTimeout(() => {
      setFadingOut(true);
    }, 1350);

    const endTimer = setTimeout(() => {
      setVisible(false);
      try {
        sessionStorage.setItem("gb_preintro_played", "1");
      } catch {}
    }, 1750);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(endTimer);
    };
  }, []);

  const handleSkip = () => {
    setFadingOut(true);
    setTimeout(() => {
      setVisible(false);
      try {
        sessionStorage.setItem("gb_preintro_played", "1");
      } catch {}
    }, 200);
  };

  if (!mounted || !visible) return null;

  return (
    <div
      onClick={handleSkip}
      className={`fixed inset-0 z-[99999] flex items-center justify-center bg-[#173822] transition-all duration-400 ease-out cursor-pointer select-none overflow-hidden ${
        fadingOut ? "opacity-0 pointer-events-none scale-105" : "opacity-100"
      }`}
      role="dialog"
      aria-label="Welcome to Green Basket TCR"
    >
      <div className="absolute w-80 h-80 rounded-full bg-[#245B35] blur-3xl opacity-60 pointer-events-none animate-pulse" />
      <div className="absolute w-44 h-44 rounded-full bg-[#718F42] blur-2xl opacity-40 pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-sm">
        <div className="relative mb-4 sm:mb-5">
          <div className="absolute -inset-2 rounded-3xl bg-gradient-to-tr from-emerald-400/40 via-lime-400/30 to-emerald-500/40 blur-md opacity-80 animate-pulse" />
          
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-white p-3.5 shadow-2xl flex items-center justify-center border border-emerald-100/80 transform transition-transform">
            <Image
              src="/images/logo/Green-basket-logo.png"
              alt="Green Basket TCR"
              width={96}
              height={96}
              priority
              className="object-contain"
            />
          </div>
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-wider uppercase font-sans mb-1.5 drop-shadow-sm">
          Green Basket <span className="text-[#BBF062]">TCR</span>
        </h2>

        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-900/70 border border-emerald-600/40 text-xs sm:text-sm font-semibold text-emerald-100 shadow-inner">
          <Leaf size={14} className="text-[#BBF062] shrink-0" />
          <span>Fresh Kerala Groceries • Simplified</span>
        </div>

        <p className="text-[11px] text-emerald-200/70 font-medium tracking-wide mt-3 uppercase">
          Cut Vegetables • Stone-Ground Powders • Pure Oils
        </p>

        <span className="mt-8 text-[10px] text-emerald-300/40 uppercase tracking-widest font-mono">
          Tap anywhere to enter
        </span>
      </div>
    </div>
  );
}
