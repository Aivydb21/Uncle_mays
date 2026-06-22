import type { Metadata } from "next";
import { fetchCatalog } from "@/lib/catalog/airtable";
import { CatalogGrid } from "@/components/shop/CatalogGrid";
import { ShopHeader } from "@/components/shop/ShopHeader";
import { StorePausedBanner } from "@/components/StorePausedBanner";
import { PausedWaitlistForm } from "@/components/PausedWaitlistForm";
import { getStoreStatus } from "@/lib/store-status";
import type { CatalogItem } from "@/lib/catalog/types";

// Note: <Navigation /> and <Footer /> are rendered by PageShell at the
// app root (src/components/PageShell.tsx). Do NOT render them again here
// or the page gets a doubled-up sticky nav.

export const metadata: Metadata = {
  title: "Shop fresh produce, pantry, and protein | Uncle May's",
  description:
    "Build your own grocery box from Uncle May's curated catalog. $20 minimum. Chicago delivery or Hyde Park pickup.",
};

export const revalidate = 300;

interface ShopPageSearchParams {
  cart?: string;
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<ShopPageSearchParams>;
}) {
  const { paused } = getStoreStatus();

  let catalog: CatalogItem[] = [];
  let unavailable = false;
  if (!paused) {
    try {
      catalog = await fetchCatalog();
    } catch {
      unavailable = true;
    }
  }

  // searchParams resolution is still awaited so Next.js doesn't warn about
  // the unused promise, but no params currently feed into render.
  await searchParams;

  if (paused) {
    return (
      <>
        <StorePausedBanner source="shop_paused_banner" />
        <div className="container mx-auto px-6 py-16">
          <ShopHeader />
          <PausedCatalogMessage />
        </div>
      </>
    );
  }

  return (
    <div className="container mx-auto px-6 py-10">
      <ShopHeader />
      {unavailable ? (
        <UnavailableMessage />
      ) : catalog.length === 0 ? (
        <EmptyMessage />
      ) : (
        <CatalogGrid items={catalog} />
      )}
    </div>
  );
}

function PausedCatalogMessage() {
  return (
    <div className="mx-auto mt-12 max-w-lg rounded-2xl border border-border bg-muted/40 p-8 text-center">
      <h2 className="text-lg font-semibold">The catalog is closed right now</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        We&rsquo;ll reopen soon. Drop your email and we&rsquo;ll let you know
        the moment we&rsquo;re back.
      </p>
      <div className="mt-5 flex justify-center">
        <PausedWaitlistForm source="shop_catalog_paused" />
      </div>
    </div>
  );
}

function UnavailableMessage() {
  return (
    <div className="mx-auto mt-16 max-w-md rounded-2xl border border-border bg-muted/40 p-8 text-center">
      <h2 className="text-lg font-semibold">The catalog is updating</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        We&rsquo;re refreshing this week&rsquo;s lineup. Try again in a few
        minutes, or call us at (312) 972-2595.
      </p>
    </div>
  );
}

function EmptyMessage() {
  return (
    <div className="mx-auto mt-16 max-w-md rounded-2xl border border-border bg-muted/40 p-8 text-center">
      <h2 className="text-lg font-semibold">Catalog coming soon</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        We&rsquo;re lining up this week&rsquo;s items now. Check back shortly.
      </p>
    </div>
  );
}
