import { redirect } from "next/navigation";

/**
 * Meta ads landing page redirect
 * Campaign URLs point to /products/weekly-produce-box
 * Redirect to homepage with boxes section for user choice
 */
export default function WeeklyProduceBoxPage() {
  redirect("/#boxes");
}
