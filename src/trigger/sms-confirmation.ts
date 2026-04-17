import { task, wait } from "@trigger.dev/sdk/v3";
import twilio from "twilio";

const SITE_BASE_URL = process.env.SITE_BASE_URL || "https://unclemays.com";

interface LocalCheckoutSession {
  id: string;
  product: string;
  price: number;
  productName: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address: {
    street: string;
    apt?: string;
    city: string;
    state: string;
    zip: string;
  };
  paymentIntentId?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  recoveryEmailSent?: boolean;
  deliveryDate?: string;
  deliveryWindow?: string;
  smsConfirmationSent?: boolean;
  smsConfirmationResponse?: "pending" | "confirmed" | "declined" | null;
  smsConfirmationSentAt?: string;
  smsConfirmationRespondedAt?: string;
}

// Mark SMS as sent in the local checkout-store
async function markSmsConfirmationSent(sessionId: string): Promise<void> {
  await fetch(`${SITE_BASE_URL}/api/checkout/session`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sessionId,
      smsConfirmationSent: true,
      smsConfirmationResponse: "pending",
      smsConfirmationSentAt: new Date().toISOString(),
    }),
  });
}

// Send SMS confirmation on delivery day
export const sendDeliveryConfirmationSMS = task({
  id: "send-delivery-confirmation-sms",
  maxDuration: 300,
  run: async (payload: {
    sessionId: string;
    phone: string;
    firstName: string;
    deliveryDate: string;
    deliveryWindow?: string;
    productName: string;
  }) => {
    const { sessionId, phone, firstName, deliveryDate, deliveryWindow, productName } = payload;

    // Calculate time to wait until delivery day
    const deliveryDateTime = new Date(deliveryDate);
    const now = new Date();

    // Send SMS 2 hours before delivery window (or 8am on delivery day if no window specified)
    let targetTime: Date;
    if (deliveryWindow) {
      // Parse delivery window like "2:00 PM - 4:00 PM" and send 2 hours before start
      const startTime = deliveryWindow.split("-")[0].trim();
      targetTime = new Date(deliveryDate + " " + startTime);
      targetTime.setHours(targetTime.getHours() - 2);
    } else {
      // Default to 8am on delivery day
      targetTime = new Date(deliveryDate);
      targetTime.setHours(8, 0, 0, 0);
    }

    // Wait until target time (Trigger.dev automatically checkpoints this)
    if (targetTime > now) {
      await wait.until({ date: targetTime });
    }

    // Initialize Twilio client
    const accountSid = process.env.TWILIO_ACCOUNT_SID!;
    const authToken = process.env.TWILIO_AUTH_TOKEN!;
    const twilioPhone = process.env.TWILIO_PHONE_NUMBER!;
    const client = twilio(accountSid, authToken);

    // Format delivery time for message
    const timeInfo = deliveryWindow
      ? `between ${deliveryWindow}`
      : `today`;

    // Compose SMS message
    const message = `Hi ${firstName}! Your ${productName} from Uncle May's Produce will be delivered ${timeInfo}. Reply YES to confirm you'll be home, or NO if you need to reschedule. Questions? Call (312) 972-2595.`;

    try {
      // Send SMS via Twilio
      const smsResult = await client.messages.create({
        body: message,
        from: twilioPhone,
        to: phone,
      });

      console.log(
        `Delivery confirmation SMS sent | session=${sessionId} phone=${phone} sid=${smsResult.sid}`
      );

      // Mark SMS as sent in checkout-store
      await markSmsConfirmationSent(sessionId).catch((e) =>
        console.warn("markSmsConfirmationSent error:", e.message)
      );

      return {
        sent: true,
        sessionId,
        phone,
        messageSid: smsResult.sid,
        status: smsResult.status,
      };
    } catch (error: any) {
      console.error(`Failed to send SMS for session ${sessionId}:`, error.message);
      throw error;
    }
  },
});
