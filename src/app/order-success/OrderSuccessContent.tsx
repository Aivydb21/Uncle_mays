"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-16">
      <div className="max-w-md text-center space-y-6">
        <h1 className="text-3xl font-bold">Thank you for your order</h1>
        <p className="text-muted-foreground leading-relaxed">
          Your produce box is confirmed. We pack from what&apos;s freshest and deliver across Chicago on{" "}
          <span className="font-semibold text-foreground">Wednesdays</span>. You&apos;ll get a confirmation email with your
          delivery window. Order by Tuesday night for the upcoming Wednesday route when possible.
        </p>
        {sessionId ? (
          <p className="text-xs text-muted-foreground break-all">Reference: {sessionId}</p>
        ) : null}
        <Button asChild size="lg" className="rounded-xl">
          <Link href="/">Back to home</Link>
        </Button>
      </div>
    </div>
  );
}
