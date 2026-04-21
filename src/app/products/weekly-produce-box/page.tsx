import { redirect } from "next/navigation";

/**
 * Meta ads landing page redirect
 * Campaign URLs point to /products/weekly-produce-box
 * Redirect to family box checkout — active ads feature chicken (included in Family Box)
 * UTM params are forwarded so GA4 attribution is preserved
 */
export default async function WeeklyProduceBoxPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const params = await searchParams;
  const qs = new URLSearchParams(params).toString();
  redirect(qs ? `/checkout/family?${qs}` : "/checkout/family");
}
