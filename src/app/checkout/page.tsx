import { notFound } from "next/navigation";
import { CART_ENABLED } from "@/lib/feature-flags";
import { fetchActiveSlots } from "@/lib/catalog/pickup-slots";
import { CheckoutClient } from "@/components/checkout/CheckoutClient";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import type { PickupSlot } from "@/lib/catalog/types";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  if (!CART_ENABLED) {
    notFound();
  }
  let slots: PickupSlot[] = [];
  try {
    slots = await fetchActiveSlots();
  } catch {
    slots = [];
  }
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-6 py-10">
        <CheckoutClient slots={slots} />
      </main>
      <Footer />
    </div>
  );
}
