// Blocks internal / test recipients from receiving any triggered email or
// being upserted into Mailchimp. Every transactional Trigger.dev task calls
// `isSuppressed(email)` at its entry point and bails out early if true.

const DOMAIN_SUPPRESSION = ["unclemays.com"];

const EMAIL_SUPPRESSION = new Set(
  [
    "anthonypivy@gmail.com",
    ...(process.env.EMAIL_SUPPRESSION_LIST || "")
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean),
  ].map((s) => s.toLowerCase())
);

export function isSuppressed(email: string | null | undefined): boolean {
  if (!email) return true;
  const normalized = email.trim().toLowerCase();
  if (!normalized) return true;
  if (EMAIL_SUPPRESSION.has(normalized)) return true;
  const domain = normalized.split("@")[1];
  if (domain && DOMAIN_SUPPRESSION.includes(domain)) return true;
  return false;
}
