import { redirect } from "next/navigation";

/**
 * Meta ads landing page redirect
 * Campaign URLs point to /products/weekly-produce-box
 * Redirect directly to starter box checkout — skip homepage friction for ad traffic
 */
export default function WeeklyProduceBoxPage() {
  redirect("/checkout/starter");
}
