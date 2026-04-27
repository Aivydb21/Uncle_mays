// Service area for Uncle May's Wednesday delivery route. Single source of
// truth for both checkout validation and ad-targeting ZIP lists. Update
// here ONLY when expanding or contracting delivery; the validators on the
// delivery pages and the customer-facts.md "Service area" line both
// derive from this list.
//
// Geography: south + southeast Chicago (606xx) plus south-suburban cluster
// (604xx, 608xx). Expanded 2026-04-26 from city-only (606xx) to the full
// Chicagoland metro south region to capture the historical Black-household
// target demographic in suburbs like Olympia Fields, Matteson, Flossmoor,
// and South Holland.
//
// Operational note: the suburban cluster adds ~30 miles of additional
// driving from the Hyde Park dispatch point. The Wednesday 5pm-8pm
// delivery window may need to be revisited if route times exceed
// available driver hours.

export const SERVICE_AREA_ZIPS: readonly string[] = [
  // South + Southeast Chicago city (all 606xx)
  "60605", // Near South Side
  "60607", // Near South Side (partial)
  "60609", // Fuller Park, Washington Park
  "60615", // Hyde Park, Kenwood
  "60616", // Bronzeville, South Loop
  "60617", // South Chicago, Calumet Heights, Pill Hill
  "60619", // Chatham, Greater Grand Crossing, Pill Hill
  "60620", // Auburn Gresham, Washington Heights
  "60621", // Englewood
  "60628", // Roseland, Pullman
  "60633", // Hegewisch
  "60636", // West Englewood
  "60637", // Woodlawn, parts of South Shore
  "60643", // Morgan Park
  "60649", // South Shore
  "60653", // Bronzeville, Oakland
  "60655", // Beverly

  // South suburbs (604xx and 608xx)
  "60406", // Blue Island
  "60409", // Calumet City
  "60411", // Chicago Heights
  "60419", // Dolton
  "60422", // Flossmoor
  "60426", // Harvey
  "60428", // Markham
  "60429", // Hazel Crest
  "60430", // Homewood
  "60438", // Lansing
  "60443", // Matteson
  "60461", // Olympia Fields
  "60469", // Posen
  "60471", // Richton Park
  "60473", // South Holland
  "60827", // Riverdale
] as const;

const ZIP_SET = new Set<string>(SERVICE_AREA_ZIPS);

// Service-area gating is currently OPEN: any 5-digit US ZIP is accepted at
// checkout. The SERVICE_AREA_ZIPS list above is retained for ad-targeting
// and for any future re-tightening, but is no longer enforced at the
// validator. Re-introduce the state/ZIP_SET check here to re-gate.
export function isInServiceArea(_state: string, zip: string): boolean {
  return /^\d{5}(-\d{4})?$/.test(zip.trim());
}

export const OUT_OF_AREA_MESSAGE =
  "Please enter a valid 5-digit ZIP code.";
