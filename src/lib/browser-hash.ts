/**
 * Browser-compatible SHA-256 hashing for Meta Pixel Advanced Matching.
 * Uses Web Crypto API (available in all modern browsers).
 */

export async function sha256(value: string): Promise<string> {
  if (typeof window === "undefined" || !window.crypto?.subtle) {
    // SSR or very old browser - return empty string to skip hashing
    return "";
  }

  try {
    const normalized = value.toLowerCase().trim();
    const encoded = new TextEncoder().encode(normalized);
    const hashBuffer = await window.crypto.subtle.digest("SHA-256", encoded);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  } catch {
    // Crypto API failed - return empty to skip hashing
    return "";
  }
}

/**
 * Normalize and hash phone number for Meta Pixel.
 * Strips all non-digit characters before hashing.
 */
export async function hashPhone(phone: string): Promise<string> {
  const digits = phone.replace(/\D/g, "");
  return digits ? sha256(digits) : "";
}
