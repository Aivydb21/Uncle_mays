import { NextRequest, NextResponse } from "next/server";
import { sendTransactional, sendInternalAlert } from "@/lib/email/resend";

// Vendor self-onboarding submission handler. Writes a new row to the
// Suppliers table in Airtable, sends a branded thank-you email via Resend,
// and fires an internal alert to anthony@unclemays.com. Field name choices
// here MUST match the Suppliers schema in base appm6F6H9obydzAM2 exactly,
// otherwise Airtable silently drops the value (the same failure mode the
// product mix reset is trying to avoid).
//
// Run audit trail and full field spec:
//   research/product-mix-2026-05-16/07-vendor-onboarding-form.md
//   research/product-mix-2026-05-16/08-operating-model-15k-budget.md

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const AIRTABLE_BASE_ID = "appm6F6H9obydzAM2";
const AIRTABLE_SUPPLIERS_TABLE = "Suppliers";

interface SubmissionBody {
  businessName?: string;
  blackOwnedStatus?: string;
  supplierType?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  city?: string;
  state?: string;
  website?: string;
  categories?: string[];
  productsOffered?: string;
  certifications?: string[];
  seasonality?: string;
  seasonMonths?: string[];
  leadTimeDays?: string;
  orderBatchingCadence?: string;
  minOrderQty?: string;
  coldChainRequired?: boolean;
  dropShipCapable?: boolean;
  retailPricePerUnit?: string;
  caseSize?: string;
  caseWholesalePrice?: string;
  pricingNegotiable?: boolean;
  wholesalePricingNotes?: string;
  paymentTerms?: string;
  scaleCapacityNotes?: string;
  sampleAvailable?: boolean;
  transportationMethods?: string[];
  pickupAddress?: string;
  transportationNotes?: string;
  additionalNotes?: string;
}

function clean(s: string | undefined): string {
  return (s ?? "").trim();
}

const BLACK_OWNED_ANSWERS = ["Yes", "No", "Prefer not to say"] as const;

function validate(body: SubmissionBody): string | null {
  if (!clean(body.businessName)) return "Missing business name.";
  const blackOwned = clean(body.blackOwnedStatus);
  if (!blackOwned) return "Missing Black-owned answer.";
  if (!BLACK_OWNED_ANSWERS.includes(blackOwned as (typeof BLACK_OWNED_ANSWERS)[number]))
    return "Invalid Black-owned answer.";
  if (!clean(body.supplierType)) return "Missing supplier type.";
  if (!clean(body.firstName)) return "Missing first name.";
  if (!clean(body.lastName)) return "Missing last name.";
  const email = clean(body.email);
  if (!EMAIL_RE.test(email)) return "Invalid email.";
  if (!clean(body.city)) return "Missing city.";
  if (!clean(body.state)) return "Missing state.";
  if (!body.categories || body.categories.length === 0)
    return "Pick at least one category.";
  if (!clean(body.productsOffered)) return "Missing products list.";
  const lt = Number(body.leadTimeDays);
  if (!Number.isFinite(lt) || lt < 0) return "Invalid lead time.";
  if (!clean(body.orderBatchingCadence)) return "Missing batching cadence.";
  if (!clean(body.minOrderQty)) return "Missing minimum order quantity.";
  if (!clean(body.seasonality)) return "Missing seasonality.";
  if (
    body.seasonality === "Seasonal" &&
    (!body.seasonMonths || body.seasonMonths.length === 0)
  )
    return "Missing season months for seasonal vendor.";
  if (!clean(body.caseSize)) return "Missing case size.";
  const cwp = Number(body.caseWholesalePrice);
  if (!Number.isFinite(cwp) || cwp < 0) return "Invalid wholesale case price.";
  if (!clean(body.wholesalePricingNotes)) return "Missing wholesale pricing notes.";
  if (!clean(body.paymentTerms)) return "Missing payment terms.";
  if (!clean(body.scaleCapacityNotes)) return "Missing scale capacity notes.";
  if (!body.transportationMethods || body.transportationMethods.length === 0)
    return "Missing transportation methods.";
  if (
    body.transportationMethods.includes("We pick up at their location") &&
    !clean(body.pickupAddress)
  )
    return "Missing pickup address.";
  return null;
}

function dollarsToCents(dollars: string | undefined): number | undefined {
  const s = clean(dollars);
  if (!s) return undefined;
  const n = Number(s);
  if (!Number.isFinite(n) || n < 0) return undefined;
  return Math.round(n * 100);
}

function buildAirtableFields(body: SubmissionBody): Record<string, unknown> {
  // Append the "anything else" notes to Products Offered so the operator
  // sees them in the same field at review time. Keeps the Suppliers schema
  // minimal — no separate "notes" field needed.
  const productsBlock = clean(body.productsOffered);
  const notesBlock = clean(body.additionalNotes);
  const productsOffered = notesBlock
    ? `${productsBlock}\n\nAdditional notes:\n${notesBlock}`
    : productsBlock;

  const retailCents = dollarsToCents(body.retailPricePerUnit);
  const caseCents = dollarsToCents(body.caseWholesalePrice);
  const seasonality = clean(body.seasonality);
  const seasonMonths =
    seasonality === "Seasonal" ? body.seasonMonths ?? [] : [];
  const blackOwnedAnswer = clean(body.blackOwnedStatus);
  const blackOwnedSelfAttested = blackOwnedAnswer === "Yes";

  return {
    "Business Name": clean(body.businessName),
    "Supplier Type": clean(body.supplierType),
    "First Name": clean(body.firstName),
    "Last Name": clean(body.lastName),
    Email: clean(body.email).toLowerCase(),
    Phone: clean(body.phone) || undefined,
    City: clean(body.city),
    State: [clean(body.state)],
    Category: body.categories ?? [],
    "Products Offered": productsOffered,
    Certifications: body.certifications ?? [],
    "Min Order Qty": clean(body.minOrderQty),
    Website: clean(body.website) || undefined,
    "Black-owned": blackOwnedSelfAttested,
    BlackOwnedSelfAttested: blackOwnedSelfAttested,
    BlackOwnedAttestation: blackOwnedAnswer || undefined,
    LeadTimeDays: Number(body.leadTimeDays),
    PaymentTerms: clean(body.paymentTerms),
    OrderBatchingCadence: clean(body.orderBatchingCadence),
    DropShipCapable: Boolean(body.dropShipCapable),
    ColdChainRequired: Boolean(body.coldChainRequired),
    SampleAvailable: Boolean(body.sampleAvailable),
    Seasonality: seasonality || undefined,
    SeasonMonths: seasonMonths,
    CaseSize: clean(body.caseSize) || undefined,
    RetailPricePerUnitCents: retailCents,
    CaseWholesalePriceCents: caseCents,
    PricingNegotiable: Boolean(body.pricingNegotiable),
    WholesalePricingNotes: clean(body.wholesalePricingNotes),
    TransportationMethods: body.transportationMethods ?? [],
    PickupAddress: clean(body.pickupAddress) || undefined,
    ScaleCapacityNotes:
      clean(body.scaleCapacityNotes) +
      (clean(body.transportationNotes)
        ? `\n\nLogistics notes: ${clean(body.transportationNotes)}`
        : ""),
    OnboardingStatus: "Form returned",
  };
}

async function writeToAirtable(fields: Record<string, unknown>): Promise<{
  ok: boolean;
  recordId?: string;
  error?: string;
}> {
  const pat = process.env.AIRTABLE_PAT;
  if (!pat) {
    return { ok: false, error: "AIRTABLE_PAT not configured" };
  }
  // Strip undefined values so Airtable doesn't reject the payload.
  const cleaned: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(fields)) {
    if (v !== undefined) cleaned[k] = v;
  }
  const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(
    AIRTABLE_SUPPLIERS_TABLE
  )}`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${pat}`,
        "Content-Type": "application/json",
      },
      // typecast: true lets Airtable accept new singleSelect option values
      // it hasn't seen before (rare, but helpful for free-text-becoming-tag).
      body: JSON.stringify({
        records: [{ fields: cleaned }],
        typecast: true,
      }),
    });
    const json = (await res.json()) as { records?: { id: string }[]; error?: unknown };
    if (!res.ok) {
      return {
        ok: false,
        error: `Airtable ${res.status}: ${JSON.stringify(json.error || json)}`,
      };
    }
    return { ok: true, recordId: json.records?.[0]?.id };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, error: msg };
  }
}

function thankYouHtml(body: SubmissionBody): string {
  const firstName = clean(body.firstName) || "there";
  return `
    <div style="font-family:-apple-system,Segoe UI,system-ui,sans-serif;max-width:560px;margin:0 auto;color:#1a1a1a">
      <p style="font-size:16px;line-height:1.5">${firstName},</p>
      <p style="font-size:16px;line-height:1.5">Thanks for sending through your application to stock products at Uncle May's. I've got it.</p>
      <p style="font-size:16px;line-height:1.5">Here's what happens next: within 5 business days, either I or my COO Zoe Rowell will reach out with a next step. Usually that's a small sample order so we can photograph your product and add it to the catalog. If we're not a fit right now, we'll tell you that directly so you can move on.</p>
      <p style="font-size:16px;line-height:1.5">We keep your profile on file either way. If anything about your business changes &mdash; new products, new capacity, new certifications &mdash; let us know and we'll update the record.</p>
      <p style="font-size:16px;line-height:1.5">Questions in the meantime: just reply to this email, or call me at (312) 972-2595.</p>
      <p style="font-size:16px;line-height:1.5;margin-top:24px">Anthony Ivy<br/>Founder, Uncle May's Produce</p>
      <hr style="border:none;border-top:1px solid #eee;margin:24px 0"/>
      <p style="font-size:12px;color:#888">Uncle May's Produce &middot; Hyde Park, Chicago, IL &middot; anthony@unclemays.com &middot; (312) 972-2595</p>
    </div>
  `;
}

function internalAlertHtml(
  body: SubmissionBody,
  recordId: string | undefined
): string {
  const link = recordId
    ? `https://airtable.com/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_SUPPLIERS_TABLE)}/${recordId}`
    : `https://airtable.com/${AIRTABLE_BASE_ID}`;
  const cats = (body.categories ?? []).join(", ") || "(none picked)";
  const transport = (body.transportationMethods ?? []).join(", ") || "(none picked)";
  const months = (body.seasonMonths ?? []).join(", ");
  const seasonality = clean(body.seasonality);
  const seasonalityDisplay =
    seasonality === "Seasonal" && months ? `Seasonal (${months})` : seasonality || "(not set)";
  const retail = clean(body.retailPricePerUnit) ? `$${clean(body.retailPricePerUnit)}` : "(not given)";
  const caseWholesale = clean(body.caseWholesalePrice) ? `$${clean(body.caseWholesalePrice)}` : "(not given)";
  const caseSize = clean(body.caseSize) || "(not given)";
  return `
    <div style="font-family:-apple-system,Segoe UI,sans-serif;max-width:600px">
      <h2 style="margin:0 0 8px">New vendor application</h2>
      <p style="margin:0 0 16px;color:#666">A vendor just submitted the onboarding form on unclemays.com/vendor-onboarding.</p>
      <table style="border-collapse:collapse;font-size:14px">
        <tr><td style="padding:4px 8px;color:#666">Business</td><td style="padding:4px 8px"><strong>${escapeHtml(clean(body.businessName))}</strong></td></tr>
        <tr><td style="padding:4px 8px;color:#666">Type</td><td style="padding:4px 8px">${escapeHtml(clean(body.supplierType))}</td></tr>
        <tr><td style="padding:4px 8px;color:#666">Contact</td><td style="padding:4px 8px">${escapeHtml(clean(body.firstName))} ${escapeHtml(clean(body.lastName))} &middot; ${escapeHtml(clean(body.email))}${body.phone ? " &middot; " + escapeHtml(clean(body.phone)) : ""}</td></tr>
        <tr><td style="padding:4px 8px;color:#666">Location</td><td style="padding:4px 8px">${escapeHtml(clean(body.city))}, ${escapeHtml(clean(body.state))}</td></tr>
        <tr><td style="padding:4px 8px;color:#666">Categories</td><td style="padding:4px 8px">${escapeHtml(cats)}</td></tr>
        <tr><td style="padding:4px 8px;color:#666">Availability</td><td style="padding:4px 8px">${escapeHtml(seasonalityDisplay)}</td></tr>
        <tr><td style="padding:4px 8px;color:#666">Black-owned (self-attested)</td><td style="padding:4px 8px">${escapeHtml(clean(body.blackOwnedStatus) || "(not answered)")}</td></tr>
        <tr><td style="padding:4px 8px;color:#666">Lead time</td><td style="padding:4px 8px">${escapeHtml(clean(body.leadTimeDays))} business days</td></tr>
        <tr><td style="padding:4px 8px;color:#666">Cadence</td><td style="padding:4px 8px">${escapeHtml(clean(body.orderBatchingCadence))}</td></tr>
        <tr><td style="padding:4px 8px;color:#666">Min order</td><td style="padding:4px 8px">${escapeHtml(clean(body.minOrderQty))}</td></tr>
        <tr><td style="padding:4px 8px;color:#666">Case size</td><td style="padding:4px 8px">${escapeHtml(caseSize)}</td></tr>
        <tr><td style="padding:4px 8px;color:#666">Retail / unit</td><td style="padding:4px 8px">${escapeHtml(retail)}</td></tr>
        <tr><td style="padding:4px 8px;color:#666">Wholesale / case</td><td style="padding:4px 8px"><strong>${escapeHtml(caseWholesale)}</strong>${body.pricingNegotiable ? " &middot; negotiable on volume" : ""}</td></tr>
        <tr><td style="padding:4px 8px;color:#666">Payment terms</td><td style="padding:4px 8px">${escapeHtml(clean(body.paymentTerms))}</td></tr>
        <tr><td style="padding:4px 8px;color:#666">Transportation</td><td style="padding:4px 8px">${escapeHtml(transport)}</td></tr>
        ${
          clean(body.pickupAddress)
            ? `<tr><td style="padding:4px 8px;color:#666">Pickup address</td><td style="padding:4px 8px">${escapeHtml(clean(body.pickupAddress))}</td></tr>`
            : ""
        }
        <tr><td style="padding:4px 8px;color:#666">Drop-ship</td><td style="padding:4px 8px">${body.dropShipCapable ? "Yes" : "No"}</td></tr>
        <tr><td style="padding:4px 8px;color:#666">Cold chain</td><td style="padding:4px 8px">${body.coldChainRequired ? "Required" : "Shelf-stable"}</td></tr>
        <tr><td style="padding:4px 8px;color:#666">Sample available</td><td style="padding:4px 8px">${body.sampleAvailable ? "Yes" : "No"}</td></tr>
      </table>
      <h3 style="margin:20px 0 4px;font-size:13px;color:#666">Products offered</h3>
      <pre style="white-space:pre-wrap;background:#f6f3ec;padding:10px;border-radius:6px;font-size:13px;font-family:inherit">${escapeHtml(clean(body.productsOffered))}</pre>
      <h3 style="margin:16px 0 4px;font-size:13px;color:#666">Wholesale pricing</h3>
      <pre style="white-space:pre-wrap;background:#f6f3ec;padding:10px;border-radius:6px;font-size:13px;font-family:inherit">${escapeHtml(clean(body.wholesalePricingNotes))}</pre>
      <h3 style="margin:16px 0 4px;font-size:13px;color:#666">Scale capacity</h3>
      <pre style="white-space:pre-wrap;background:#f6f3ec;padding:10px;border-radius:6px;font-size:13px;font-family:inherit">${escapeHtml(clean(body.scaleCapacityNotes))}</pre>
      <p style="margin-top:20px"><a href="${link}" style="color:#2563eb;font-weight:600">Open the row in Airtable</a></p>
    </div>
  `;
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (ch) =>
    ch === "&" ? "&amp;" : ch === "<" ? "&lt;" : ch === ">" ? "&gt;" : ch === '"' ? "&quot;" : "&#39;"
  );
}

export async function POST(req: NextRequest) {
  let body: SubmissionBody;
  try {
    body = (await req.json()) as SubmissionBody;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const validationError = validate(body);
  if (validationError) {
    return NextResponse.json(
      { ok: false, error: validationError },
      { status: 400 }
    );
  }

  const fields = buildAirtableFields(body);
  const airtableResult = await writeToAirtable(fields);

  if (!airtableResult.ok) {
    // Airtable failed. Tell the user we hit a snag but still alert the
    // operator with the form payload so we don't lose the submission.
    console.error("[vendor-onboarding] Airtable write failed:", airtableResult.error);
    await sendInternalAlert({
      subject: "[ALERT] Vendor application failed to write to Airtable",
      html: `<p style="font-family:sans-serif">Vendor submission failed to save. Error: <code>${escapeHtml(airtableResult.error || "unknown")}</code>. Manually re-enter from this payload:</p><pre style="font-family:inherit;white-space:pre-wrap;background:#f6f3ec;padding:10px;border-radius:6px">${escapeHtml(JSON.stringify(body, null, 2))}</pre>`,
      tags: [{ name: "type", value: "vendor_onboarding_failure" }],
    });
    return NextResponse.json(
      { ok: false, error: "We hit a snag saving your application. Anthony has been notified and will follow up directly." },
      { status: 500 }
    );
  }

  // Best-effort: send thank-you to vendor + internal alert to Anthony.
  // Neither failure should block the API response — the row is saved.
  const email = clean(body.email);
  await Promise.all([
    sendTransactional({
      to: email,
      subject: "Thanks for your application to Uncle May's",
      html: thankYouHtml(body),
      tags: [{ name: "type", value: "vendor_onboarding_thanks" }],
    }).catch((e) => console.error("[vendor-onboarding] thank-you send error:", e)),
    sendInternalAlert({
      subject: `[Vendor application] ${clean(body.businessName)} — ${clean(body.city)}, ${clean(body.state)}`,
      html: internalAlertHtml(body, airtableResult.recordId),
      tags: [{ name: "type", value: "vendor_onboarding_alert" }],
    }).catch((e) => console.error("[vendor-onboarding] internal alert error:", e)),
  ]);

  return NextResponse.json({ ok: true, recordId: airtableResult.recordId });
}
