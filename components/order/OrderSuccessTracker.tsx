"use client";

import { useEffect } from "react";
import { trackPurchase } from "@/lib/analytics";

interface OrderSuccessTrackerProps {
  orderNumber?: string;
}

export function OrderSuccessTracker({ orderNumber }: OrderSuccessTrackerProps) {
  useEffect(() => {
    if (orderNumber) {
      try {
        const trackedKey = `gb_tracked_${orderNumber}`;
        if (!sessionStorage.getItem(trackedKey)) {
          trackPurchase({
            orderNumber,
            total: 0,
            shipping: 40,
            items: [],
          });
          sessionStorage.setItem(trackedKey, "1");
        }
      } catch {}
    }
  }, [orderNumber]);

  return null;
}
