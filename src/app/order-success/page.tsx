import type { Metadata } from "next";
import { Suspense } from "react";
import OrderSuccessContent from "./OrderSuccessContent";

export const metadata: Metadata = {
  title: "Order Confirmed | Uncle Mays Produce",
  description: "Your Uncle May's produce box order is confirmed. We'll deliver fresh seasonal produce to your door this Wednesday.",
  robots: { index: false, follow: false },
};

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p className="text-muted-foreground">Loading...</p></div>}>
      <OrderSuccessContent />
    </Suspense>
  );
}
