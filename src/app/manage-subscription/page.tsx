import type { Metadata } from "next";
import ManageSubscriptionContent from "./ManageSubscriptionContent";

export const metadata: Metadata = {
  title: "Manage Subscription | Uncle Mays Produce",
  description: "Cancel, pause, or update your billing for Uncle May's weekly produce box subscription.",
  robots: { index: false, follow: false },
};

export default function ManageSubscriptionPage() {
  return <ManageSubscriptionContent />;
}
