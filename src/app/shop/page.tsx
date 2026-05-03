import type { Metadata } from "next";
import { fetchCatalog } from "@/lib/catalog/airtable";
import { CatalogGrid } from "@/components/shop/CatalogGrid";
import { ShopHeader } from "@/components/shop/ShopHeader";
import { PromoBanner } from "@/components/shop/PromoBanner";
import type { CatalogItem } from "@/lib/catalog/types";

// Note: <Navigation /> and <Footer /> are rendered by PageShell at the
// app root (src/components/PageShell.tsx). Do NOT render them again here
// or the page gets a doubled-up sticky nav.

export const metadata: Metadata = {
  title: "Shop fresh produce, pantry, and protein | Uncle May's",
  description:
    "Build your own grocery box from Uncle May's curated catalog. $25 minimum. Chicago delivery or Hyde Park pickup.",
};

export const revalidate = 300;

interface ShopPageSearchParams {
  promo?: string;
  cart?: string;
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<ShopPageSearchParams>;
}) {
  let catalog: CatalogItem[] = [];
  let unavailable = false;
  try {
    catalog = await fetchCatalog();
  } catch {
    unavailable = true;
  }

  const sp = await searchParams;
  const promo = sp?.promo || null;

  return (
    <div className="container mx-auto px-6 py-10">
      <ShopHeader />
      {promo && <PromoBanner code={promo} />}
      {unavailable ? (
        <UnavailableMessage />
      ) : catalog.length === 0 ? (
        <EmptyMessage />
      ) : (
        <CatalogGrid items={catalog} initialPromo={promo} />
      )}
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
