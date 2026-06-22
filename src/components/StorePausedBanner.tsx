import { getStoreStatus } from "@/lib/store-status";
import { PausedWaitlistForm } from "@/components/PausedWaitlistForm";

// Banner rendered on `/` and `/shop` when STORE_PAUSED is true (UNC-1755).
// Server component — the env-driven status is read at request time and
// embedded in the initial HTML so ad-traffic landings see the paused state
// without a flicker. The email-capture form is the client part.
export function StorePausedBanner({ source }: { source?: string }) {
  const { paused, reason } = getStoreStatus();
  if (!paused) return null;
  return (
    <section
      role="status"
      aria-label="Store paused"
      className="border-y border-amber-300 bg-amber-50 text-foreground"
      data-testid="store-paused-banner"
    >
      <div className="container mx-auto flex flex-col gap-4 px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-xl">
          <p className="text-base font-bold text-amber-900">
            We&rsquo;re paused right now.
          </p>
          <p className="mt-1 text-sm text-amber-900/90">
            {reason} Drop your email and we&rsquo;ll tell you the moment we
            reopen.
          </p>
        </div>
        <PausedWaitlistForm source={source ?? "store_paused_banner"} />
      </div>
    </section>
  );
}
