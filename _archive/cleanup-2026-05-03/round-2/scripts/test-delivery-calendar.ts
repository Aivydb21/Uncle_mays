/**
 * Test script to verify delivery date and time window are captured in checkout sessions
 */

import { createSession } from "../src/lib/checkout-store";

console.log("Testing delivery calendar data capture...\n");

// Create a test session with delivery date and window
const testSession = createSession({
  product: "starter",
  price: 30,
  productName: "Starter Box",
  email: "test@example.com",
  firstName: "Test",
  lastName: "User",
  phone: "312-555-0100",
  address: {
    street: "123 Test St",
    city: "Chicago",
    state: "IL",
    zip: "60601",
  },
  deliveryDate: "2026-04-23",
  deliveryWindow: "12pm-3pm",
  deliveryNotes: "Leave at front door",
});

console.log("✓ Session created successfully!\n");
console.log("Session ID:", testSession.id);
console.log("\n📅 Delivery Information:");
console.log("  Date:", testSession.deliveryDate || "❌ NOT CAPTURED");
console.log("  Window:", testSession.deliveryWindow || "❌ NOT CAPTURED");
console.log("\n📦 Order Details:");
console.log("  Product:", testSession.productName);
console.log("  Price:", `$${testSession.price}`);
console.log("  Customer:", `${testSession.firstName} ${testSession.lastName}`);
console.log("  Email:", testSession.email);
console.log("  Address:", `${testSession.address.street}, ${testSession.address.city}, ${testSession.address.state} ${testSession.address.zip}`);
console.log("  Notes:", testSession.deliveryNotes || "None");

// Verify the critical fields are present
const hasDeliveryDate = !!testSession.deliveryDate;
const hasDeliveryWindow = !!testSession.deliveryWindow;

console.log("\n" + "=".repeat(50));
if (hasDeliveryDate && hasDeliveryWindow) {
  console.log("✅ TEST PASSED: Delivery date and window are being captured!");
} else {
  console.log("❌ TEST FAILED: Missing delivery information");
  if (!hasDeliveryDate) console.log("  - deliveryDate is missing");
  if (!hasDeliveryWindow) console.log("  - deliveryWindow is missing");
}
console.log("=".repeat(50));

// Show where the data is stored
console.log("\n💾 Data stored in: data/checkout-sessions.json");
console.log("\nTo view the raw data:");
console.log("  cat data/checkout-sessions.json | jq '.sessions[-1]'");
