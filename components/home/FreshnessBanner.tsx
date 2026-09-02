import Link from "next/link";
import { Sparkles, Clock, Truck, ShieldCheck, ArrowRight, Sun, Leaf } from "lucide-react";

export function FreshnessBanner() {
  return (
    <section className="py-4 sm:py-6 bg-gradient-to-b from-white via-emerald-50/40 to-white" aria-label="Farm to Door Freshness Promise">
      <div className="gb-container">
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#12311c] via-[#245B35] to-[#1c472a] text-white p-5 sm:p-8 md:p-10 shadow-xl border border-emerald-700/30">
          {/* Ambient Glow / Organic Pattern */}
          <div className="absolute -right-12 -top-12 w-64 h-64 rounded-full bg-emerald-400/10 blur-3xl pointer-events-none" />
          <div className="absolute -left-12 -bottom-12 w-64 h-64 rounded-full bg-amber-400/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-4xl mx-auto text-center flex flex-col items-center">
            {/* Top Eye-Catching Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-emerald-200 text-xs sm:text-sm font-bold uppercase tracking-wider mb-3.5 shadow-sm">
              <Sparkles size={15} className="text-amber-300 animate-pulse" />
              <span>Pure Farm-To-Door Harvest</span>
            </div>

            {/* Main Headline */}
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight sm:leading-snug mb-3">
              No day-old storage —{" "}
              <span className="text-emerald-300 underline decoration-emerald-400/50 decoration-wavy underline-offset-4">
                just pure farm-to-door freshness.
              </span>
            </h2>

            {/* Subtext */}
            <p className="text-emerald-100/90 text-xs sm:text-sm md:text-base leading-relaxed max-w-2xl mx-auto mb-6">
              Order by <span className="font-extrabold text-amber-300 bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-300/30">1 PM today</span> to enjoy crisp, freshly harvested vegetables and premium quality fruits delivered straight to your doorstep tomorrow morning.
            </p>

            {/* 4 Trust Feature Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 w-full max-w-3xl mb-6">
              <div className="flex items-center justify-center gap-2 bg-white/10 backdrop-blur-xs rounded-xl p-2.5 border border-white/10 text-left">
                <Leaf size={16} className="text-emerald-300 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-white leading-tight">Fresh Harvest</p>
                  <p className="text-[10px] text-emerald-200/70 leading-tight">Direct from farms</p>
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 bg-white/10 backdrop-blur-xs rounded-xl p-2.5 border border-white/10 text-left">
                <Clock size={16} className="text-amber-300 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-white leading-tight">1 PM Cutoff</p>
                  <p className="text-[10px] text-emerald-200/70 leading-tight">Daily fresh dispatch</p>
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 bg-white/10 backdrop-blur-xs rounded-xl p-2.5 border border-white/10 text-left">
                <Truck size={16} className="text-emerald-300 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-white leading-tight">Doorstep Delivery</p>
                  <p className="text-[10px] text-emerald-200/70 leading-tight">Next morning fresh</p>
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 bg-white/10 backdrop-blur-xs rounded-xl p-2.5 border border-white/10 text-left">
                <ShieldCheck size={16} className="text-amber-300 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-white leading-tight">100% Quality</p>
                  <p className="text-[10px] text-emerald-200/70 leading-tight">Clean & hygienic</p>
                </div>
              </div>
            </div>

            {/* Quick Action Button */}
            <Link
              href="/products"
              className="inline-flex items-center gap-2 bg-white hover:bg-emerald-50 text-gb-green font-extrabold text-xs sm:text-sm px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105"
            >
              <span>Order Tomorrow's Fresh Basket</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
