import { getSiteSettings } from "@/lib/supabase/queries";

export async function AnnouncementBar() {
  const settings = await getSiteSettings();

  const deliveryMessage =
    settings["delivery_message"] ??
    "Freshly cut. Hygienically packed. Delivered to your doorstep.";
  const sameDayMessage =
    settings["same_day_message"] ?? "Order before 1PM for same day delivery.";

  return (
    <div
      className="announcement-bar bg-gb-green text-white text-xs py-2 px-3 border-b border-emerald-800/30"
      role="banner"
      aria-label="Store announcement"
    >
      <div className="gb-container">
        <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-1 sm:gap-4 text-center sm:text-left leading-tight">
          {/* Main Delivery Message */}
          <span className="font-medium text-[11px] sm:text-xs">
            {deliveryMessage}
          </span>

          {/* Same Day Cutoff Message */}
          {sameDayMessage && (
            <span className="flex items-center justify-center gap-1.5 text-[11px] sm:text-xs text-white/90 shrink-0">
              <span className="hidden sm:inline text-white/40">•</span>
              <span className="font-bold text-lime-300 sm:text-white sm:font-semibold">
                {sameDayMessage}
              </span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
