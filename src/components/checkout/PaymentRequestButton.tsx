"use client";

import { useEffect, useState } from "react";
import {
  PaymentRequestButtonElement,
  useStripe,
} from "@stripe/react-stripe-js";
import type { PaymentRequest } from "@stripe/stripe-js";

interface PaymentRequestButtonProps {
  amount: number; // Amount in cents
  onSuccess: (paymentMethodId: string) => void;
  onError: (error: string) => void;
}

/**
 * Apple Pay / Google Pay Payment Request Button
 *
 * Shows a native wallet button (Apple Pay on Apple devices, Google Pay on
 * Android/Chrome) that allows one-tap checkout. Falls back gracefully if
 * the user's device doesn't support wallet payments.
 *
 * This is the "treatment" variant for Test 1 (UNC-1024): faster checkout
 * via wallet payment methods.
 */
export function PaymentRequestButton({
  amount,
  onSuccess,
  onError,
}: PaymentRequestButtonProps) {
  const stripe = useStripe();
  const [paymentRequest, setPaymentRequest] = useState<PaymentRequest | null>(
    null
  );
  const [canMakePayment, setCanMakePayment] = useState(false);

  useEffect(() => {
    if (!stripe || amount <= 0) return;

    // Create a PaymentRequest object
    const pr = stripe.paymentRequest({
      country: "US",
      currency: "usd",
      total: {
        label: "Uncle May's Produce",
        amount,
      },
      requestPayerName: true,
      requestPayerEmail: true,
      requestPayerPhone: true,
    });

    // Check if the browser supports Apple Pay, Google Pay, etc.
    pr.canMakePayment().then((result) => {
      if (result) {
        setPaymentRequest(pr);
        setCanMakePayment(true);
      }
    });

    // Handle payment method created event
    pr.on("paymentmethod", async (event) => {
      try {
        // Payment method was successfully created by the wallet
        // The parent component will confirm the payment
        onSuccess(event.paymentMethod.id);

        // Complete the payment request (show success state in wallet UI)
        event.complete("success");
      } catch (err) {
        const message = err instanceof Error ? err.message : "Payment failed";
        onError(message);
        event.complete("fail");
      }
    });

    return () => {
      // Cleanup
      pr.off("paymentmethod");
    };
  }, [stripe, amount, onSuccess, onError]);

  if (!canMakePayment || !paymentRequest) {
    // Wallet payment not available on this device/browser
    return null;
  }

  return (
    <div className="mb-6">
      <div className="mb-3">
        <p className="text-sm font-semibold text-foreground">
          Express checkout
        </p>
        <p className="text-xs text-muted-foreground">
          Pay with Apple Pay, Google Pay, or other saved payment methods
        </p>
      </div>
      <PaymentRequestButtonElement
        options={{
          paymentRequest,
          style: {
            paymentRequestButton: {
              type: "default", // or "buy", "donate"
              theme: "dark", // or "light", "light-outline"
              height: "48px",
            },
          },
        }}
      />
      <div className="mt-4 flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs uppercase tracking-wide text-muted-foreground">
          Or pay with card
        </span>
        <div className="h-px flex-1 bg-border" />
      </div>
    </div>
  );
}
