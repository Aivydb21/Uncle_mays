import { redirect } from "next/navigation";

/**
 * Meta ads landing page redirect
 * Campaign URLs point to /products/weekly-produce-box
 * Redirect directly to starter box checkout — skip homepage friction for ad traffic
 * UTM params are forwarded so GA4 attribution is preserved
 * NOTE: Active video ads link directly to /checkout/family (Family Box, includes chicken)
 */
export default async function WeeklyProduceBoxPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const params = await searchParams;
  const qs = new URLSearchParams(params).toString();
  redirect(qs ? `/checkout/starter?${qs}` : "/checkout/starter");
}
