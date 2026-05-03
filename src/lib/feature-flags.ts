// Custom-cart launch flag. Reads at build time on the server and at hydration
// time on the client (NEXT_PUBLIC_ prefix exposes to the bundle). Default
// false so legacy /checkout/[product] flow stays live until explicitly
// switched on in Vercel env.
export const CART_ENABLED = process.env.NEXT_PUBLIC_CART_ENABLED === "true";

export function isCartEnabled(): boolean {
  return process.env.NEXT_PUBLIC_CART_ENABLED === "true";
}
