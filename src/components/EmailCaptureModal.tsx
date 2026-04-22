"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface EmailCaptureModalProps {
  productSlug: string | null;
  onCapture: (email: string) => void;
  onDismiss: () => void;
}

export const EmailCaptureModal = ({
  productSlug,
  onCapture,
  onDismiss,
}: EmailCaptureModalProps) => {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setEmailError("Please enter a valid email address.");
      return;
    }
    setEmailError(null);

    // Fire and forget — never block checkout
    fetch("/api/capture-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: trimmed,
        phone: phone.trim() || undefined,
        product: productSlug,
      }),
    }).catch(() => {});

    onCapture(trimmed);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) onDismiss();
  };

  return (
    <Dialog open={!!productSlug} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl p-8">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">One quick step!</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground mt-1">
            Enter your email to continue. We&apos;ll send your order confirmation and delivery updates here.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} noValidate className="mt-4">
          <div className="mb-4">
            <label htmlFor="modal-email" className="block text-sm font-medium mb-1.5">
              Email <span className="text-destructive">*</span>
            </label>
            <input
              id="modal-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              autoFocus
              className="w-full border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {emailError && (
              <p className="text-destructive text-xs mt-1.5">{emailError}</p>
            )}
          </div>

          <div className="mb-6">
            <label htmlFor="modal-phone" className="block text-sm font-medium mb-1.5">
              Phone{" "}
              <span className="text-muted-foreground text-xs font-normal">(optional)</span>
            </label>
            <input
              id="modal-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(312) 555-0100"
              autoComplete="tel"
              className="w-full border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-primary text-primary-foreground rounded-xl px-4 py-3 text-base font-semibold hover:bg-primary/90 transition-colors"
          >
            Get My Box →
          </button>

          <p className="mt-3 text-xs text-muted-foreground text-center leading-relaxed">
            By continuing, you agree to receive order updates and occasional product news from Uncle May&apos;s Produce. You can unsubscribe at any time.
          </p>
        </form>

        <button
          onClick={onDismiss}
          className="mt-2 w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors py-1"
        >
          Skip — go straight to checkout
        </button>
      </DialogContent>
    </Dialog>
  );
};
