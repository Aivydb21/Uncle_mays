import { fetchActiveSlots } from "@/lib/catalog/pickup-slots";
import { CheckoutClient } from "@/components/checkout/CheckoutClient";
import type { PickupSlot } from "@/lib/catalog/types";

// Note: <Navigation /> and <Footer /> are rendered by PageShell at the
// app root (src/components/PageShell.tsx). Do NOT render them again here
// or the page gets a doubled-up sticky nav.

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  let slots: PickupSlot[] = [];
  try {
    slots = await fetchActiveSlots();
  } catch {
    slots = [];
  }
  return (
    <div className="container mx-auto px-6 py-10">
      <CheckoutClient slots={slots} />
    </div>
  );
}
