import { getSiteSettings } from "@/lib/supabase/queries";

export async function AnnouncementBar() {
  const settings = await getSiteSettings();

  const deliveryMessage =
    settings["delivery_message"] ??
    "Freshly cut. Hygienically packed. Delivered to your doorstep.";
  const sameDayMessage =
    settings["same_day_message"] ?? "Order before 1PM for same day delivery.";

  return (
    <div className="announcement-bar" role="banner" aria-label="Store announcement">
      <div className="gb-container">
        <div className="flex items-center justify-between gap-4">
          <span className="hidden sm:block truncate">{deliveryMessage}</span>
          <span className="sm:hidden text-center w-full">
            Freshly cut. Hygienically packed.
          </span>
          <span className="hidden sm:flex items-center gap-1.5 shrink-0 text-white/80">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span className="font-medium text-white">{sameDayMessage}</span>
          </span>
        </div>
      </div>
    </div>
  );
}
