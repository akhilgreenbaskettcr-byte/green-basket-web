import type { Metadata } from "next";
import { createClient } from "@/utils/supabase/server";
import { AdminDeliveryAreasClient } from "@/components/admin/AdminDeliveryAreasClient";
import type { DeliveryArea } from "@/types/database";

export const metadata: Metadata = {
  title: "Delivery Areas — Green Basket Admin",
  description: "Manage delivery areas and eligible PIN codes.",
};

export default async function AdminDeliveryAreasPage() {
  const supabase = await createClient();

  const { data: deliveryAreas } = await supabase
    .from("delivery_areas")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <AdminDeliveryAreasClient
        deliveryAreas={(deliveryAreas as DeliveryArea[]) ?? []}
      />
    </div>
  );
}
