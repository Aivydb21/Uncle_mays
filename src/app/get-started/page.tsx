import { redirect } from "next/navigation";

/**
 * Legacy ad-funnel landing page. The catalog launch on 2026-04-30 made this
 * redundant: ads now point directly at /shop. UTM params are forwarded so
 * GA4 + Meta Pixel attribution is preserved on any old backlinks or
 * lingering ad creatives that still hit this URL.
 */
export default async function GetStartedPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const params = await searchParams;
  const merged = { promo: "FRESH10", ...params };
  const qs = new URLSearchParams(merged).toString();
  redirect(`/shop?${qs}`);
}
