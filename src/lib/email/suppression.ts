// Blocks internal / test recipients from receiving any transactional email.
// Mirrors src/trigger/_email-suppression.ts so Trigger.dev tasks and Next.js
// routes share the same rules.

const SUPPRESSED_DOMAINS = ["unclemays.com"];

const SUPPRESSED_EMAILS = new Set(
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
  if (SUPPRESSED_EMAILS.has(normalized)) return true;
  const domain = normalized.split("@")[1];
  return !!domain && SUPPRESSED_DOMAINS.includes(domain);
}
