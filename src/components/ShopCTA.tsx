import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { fetchCatalog } from "@/lib/catalog/airtable";
import { formatCents } from "@/lib/format";
import type { CatalogItem } from "@/lib/catalog/types";

const PREVIEW_LIMIT = 4;

export async function ShopCTA() {
  let preview: CatalogItem[] = [];
  try {
    const all = await fetchCatalog();
    preview = all.slice(0, PREVIEW_LIMIT);
  } catch {
    preview = [];
  }

  return (
    <section id="boxes" className="py-24 bg-muted/30 relative" style={{ zIndex: 1 }}>
      <div className="container px-6">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-5 py-2 text-sm font-semibold text-primary mb-6">
            Build Your Own Box
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Shop the catalog
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Pick the produce, pantry items, and protein you actually want.
            Sourced from our Black farmer partners. $25 minimum.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
            Use code{" "}
            <span className="bg-primary text-primary-foreground px-2 py-0.5 rounded text-xs font-bold tracking-wider">
              FRESH10
            </span>{" "}
            for $10 off your first order
          </div>
        </div>

        {preview.length > 0 && (
          <div className="mx-auto mt-12 grid max-w-4xl grid-cols-2 gap-4 md:grid-cols-4">
            {preview.map((item) => (
              <Link
                key={item.sku}
                href="/shop"
                className="group rounded-2xl border border-border bg-card p-4 text-left shadow-soft transition-shadow hover:shadow-medium"
              >
                <div className="aspect-square w-full overflow-hidden rounded-xl bg-muted">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                      {item.name}
                    </div>
                  )}
                </div>
                <p className="mt-3 font-semibold text-foreground">
                  {item.name}
                </p>
                <p className="text-sm text-primary">
                  {formatCents(item.priceCents)} / {item.unit}
                </p>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-10 flex justify-center">
          <Link
            href="/shop"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-8 text-base font-semibold text-primary-foreground shadow-medium transition-colors hover:bg-primary/90"
          >
            Shop the catalog
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <p className="mt-3 text-center text-sm text-muted-foreground">
          Chicago delivery $7.99 · Polsky Center pickup free · 1% IL grocery tax
        </p>
      </div>
    </section>
  );
}
