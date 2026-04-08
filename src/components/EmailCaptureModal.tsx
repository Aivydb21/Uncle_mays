"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck } from "lucide-react";

const MAILCHIMP_USER_ID = "41d4b428c76e2f30506057dad";
const MAILCHIMP_LIST_ID = "2645503d11";

function subscribeToMailchimp(email: string, tag: string): void {
  // Fire-and-forget JSONP request to Mailchimp — no server needed
  const script = document.createElement("script");
  const callbackName = `mc_callback_${Date.now()}`;
  const encodedEmail = encodeURIComponent(email);
  const encodedTag = encodeURIComponent(tag);
  const url =
    `https://gmail.us19.list-manage.com/subscribe/post-json` +
    `?u=${MAILCHIMP_USER_ID}&id=${MAILCHIMP_LIST_ID}` +
    `&EMAIL=${encodedEmail}&MMERGE3=${encodedTag}` +
    `&b_${MAILCHIMP_USER_ID}_${MAILCHIMP_LIST_ID}=` +
    `&c=${callbackName}`;

  (window as unknown as Record<string, unknown>)[callbackName] = () => {
    if (script.parentNode) script.parentNode.removeChild(script);
    delete (window as unknown as Record<string, unknown>)[callbackName];
  };

  script.src = url;
  document.body.appendChild(script);
}

interface Plan {
  name: string;
  stripeUrl: string;
}

interface EmailCaptureModalProps {
  isOpen: boolean;
  plan: Plan | null;
  onClose: () => void;
}

export const EmailCaptureModal = ({
  isOpen,
  plan,
  onClose,
}: EmailCaptureModalProps) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const redirectToStripe = (emailValue: string) => {
    if (!plan) return;
    const url = emailValue
      ? `${plan.stripeUrl}?prefilled_email=${encodeURIComponent(emailValue)}`
      : plan.stripeUrl;
    window.open(url, "_blank", "noopener,noreferrer");
    onClose();
    setEmail("");
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();

    if (!trimmed) {
      setError("Please enter your email address.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    setError("");

    // Subscribe to Mailchimp in background (JSONP, no server needed)
    subscribeToMailchimp(trimmed, plan?.name ?? "");

    // Redirect immediately, email capture is fire-and-forget
    redirectToStripe(trimmed);
    setLoading(false);
  };

  const handleSkip = () => {
    redirectToStripe("");
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
      setEmail("");
      setError("");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl px-8 py-8">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-2xl font-bold text-center">
            One step before checkout
          </DialogTitle>
          <DialogDescription className="text-center text-base text-muted-foreground mt-2">
            {plan
              ? `You picked the ${plan.name}. Enter your email and we'll send order updates and delivery info.`
              : "Enter your email to continue to checkout."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email-capture" className="font-medium">
              Email address
            </Label>
            <Input
              id="email-capture"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError("");
              }}
              className="h-12 text-base rounded-xl"
              autoFocus
              autoComplete="email"
              disabled={loading}
            />
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full h-12 text-base font-semibold rounded-xl"
            disabled={loading}
          >
            {loading ? "Continuing..." : "Continue to Checkout"}
          </Button>

          <button
            type="button"
            onClick={handleSkip}
            className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors text-center py-1"
            disabled={loading}
          >
            Skip, take me to checkout
          </button>
        </form>

        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border/50">
          <ShieldCheck className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <p className="text-xs text-muted-foreground">
            Checkout handled securely through Stripe. We'll only send order updates, no spam.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
