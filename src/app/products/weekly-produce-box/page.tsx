import { redirect } from "next/navigation";

/**
 * Meta ads landing page redirect.
 * Campaign URLs point to /products/weekly-produce-box. Send the visitor
 * straight into the build-your-own catalog at /shop. UTM params are
 * forwarded so GA4 + Meta Pixel attribution is preserved.
 *
 * Pre-2026-04-30 this redirected to /checkout/starter (legacy Spring Box
 * flow). The starter / family / community boxes are retired; everything
 * is build-your-own from the catalog now.
 */
export default async function WeeklyProduceBoxPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const params = await searchParams;
  const qs = new URLSearchParams(params).toString();
  redirect(qs ? `/shop?${qs}` : "/shop");
}
