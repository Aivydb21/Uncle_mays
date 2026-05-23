import type { Metadata } from "next";
import { VendorOnboardingForm } from "@/components/vendor-onboarding/VendorOnboardingForm";

// Navigation + Footer are rendered by PageShell at the app root. Do not
// double-render them here.

export const metadata: Metadata = {
  title: "Stock your products at Uncle May's | Vendor application",
  description:
    "Apply to stock your products at Uncle May's Produce. We source primarily from Black farmers and Black-owned brands serving Chicago. 8-minute application.",
  // Don't index — keep this off Google so the only traffic is invited.
  robots: { index: false, follow: false },
};

export default function VendorOnboardingPage() {
  return (
    <div className="container mx-auto px-6 py-10">
      <header className="mx-auto mb-10 max-w-2xl text-center">
        <h1 className="text-3xl font-bold text-foreground sm:text-4xl">
          Stock your products at Uncle May&rsquo;s
        </h1>
        <p className="mt-3 text-base text-muted-foreground">
          Uncle May&rsquo;s is a Chicago-based grocery and produce platform
          sourcing primarily from Black farmers and Black-owned brands.
          We&rsquo;re expanding our catalog and inviting suppliers to apply.
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          This form takes about 8 minutes. We review every submission within 5
          business days. Questions: <a className="font-semibold text-primary hover:underline" href="mailto:anthony@unclemays.com">anthony@unclemays.com</a> &middot; (312)&nbsp;972-2595.
        </p>
      </header>
      <VendorOnboardingForm />
    </div>
  );
}
