// Service area for Uncle May's delivery. Single source of truth for both
// checkout validation (cart pricing) and ad-targeting ZIP lists. Update
// here ONLY when expanding or contracting delivery; the validators on the
// delivery pages and the customer-facts.md "Service area" line both
// derive from this list.
//
// Coverage as of 2026-05-09: every Chicago city ZIP in the 606xx range,
// plus the special-case Chicago ZIPs (60290 PO Box, 60707 Galewood/Mont
// Clare), plus the south-suburban cluster (604xx, 608xx) added in the
// 2026-04-26 expansion. Earlier this list was south-side only; we
// discovered during the EXP-002 painted-door rollout that customers in
// north-side ZIPs (e.g. 60614 Lincoln Park, 60622 Wicker Park) were
// getting "out_of_zone" at checkout because the pricing engine still
// gated on this list. Expanded to all-Chicago to match the painted door's
// "citywide, every day" promise.
//
// Operational note: the painted door does not commit us to fulfilling
// every ZIP on Wednesday. Real driver routing still operates against
// whichever subset the team can actually serve in any given week. The
// honest-reveal copy in the order-confirmation email handles the
// expectation gap.

export const SERVICE_AREA_ZIPS: readonly string[] = [
  // Chicago city — Loop / Near North / River North
  "60601", // The Loop, New East Side
  "60602", // The Loop
  "60603", // The Loop
  "60604", // The Loop
  "60605", // South Loop, Near South Side, Museum Campus
  "60606", // The Loop, Greektown (west)
  "60607", // West Loop, University Village, Little Italy
  "60611", // Streeterville, Magnificent Mile, River North (east)
  "60654", // River North (north of the Chicago River)
  "60661", // West Loop, Greektown
  "60610", // Old Town, Near North, Cabrini
  "60642", // West Town, Noble Square

  // Chicago city — North side
  "60613", // Lakeview, Wrigleyville
  "60614", // Lincoln Park
  "60618", // North Center, Roscoe Village, Avondale
  "60622", // Wicker Park, Bucktown, Ukrainian Village
  "60625", // Lincoln Square, Albany Park, Ravenswood
  "60626", // Rogers Park
  "60630", // Jefferson Park, Forest Glen, Norwood Park East
  "60631", // Edison Park, Norwood Park, O'Hare
  "60634", // Belmont Cragin, Dunning, Portage Park
  "60639", // Belmont Cragin, Hermosa
  "60640", // Uptown, Sheridan Park
  "60641", // Hermosa, Logan Square, Belmont Cragin
  "60645", // West Ridge, West Rogers Park
  "60646", // Forest Glen, Sauganash, North Park
  "60647", // Logan Square, Bucktown
  "60656", // Norwood Park, O'Hare
  "60657", // Lakeview, Boystown
  "60659", // West Ridge, North Park
  "60660", // Edgewater, Andersonville

  // Chicago city — West side
  "60608", // Pilsen, Heart of Chicago, Lower West Side
  "60612", // East / West Garfield Park, West Town
  "60623", // Little Village, North Lawndale
  "60624", // West Garfield Park, East Garfield Park
  "60644", // Austin
  "60651", // Humboldt Park, Austin
  "60707", // Galewood, Mont Clare

  // Chicago city — South + Southeast (all 606xx)
  "60609", // Fuller Park, Washington Park, Back of the Yards
  "60615", // Hyde Park, Kenwood
  "60616", // Bronzeville, South Loop, Chinatown
  "60617", // South Chicago, Calumet Heights, Pill Hill, South Deering
  "60619", // Chatham, Greater Grand Crossing, Avalon Park
  "60620", // Auburn Gresham, Washington Heights
  "60621", // Englewood
  "60628", // Roseland, Pullman
  "60629", // Chicago Lawn, West Lawn, Marquette Park, Gage Park
  "60632", // Brighton Park, Archer Heights
  "60633", // Hegewisch, East Side
  "60636", // West Englewood
  "60637", // Woodlawn, parts of South Shore
  "60638", // Garfield Ridge, Clearing
  "60643", // Morgan Park, Beverly (south)
  "60649", // South Shore
  "60652", // Ashburn, Wrightwood
  "60653", // Bronzeville, Oakland, Grand Boulevard
  "60655", // Beverly, Mount Greenwood

  // Chicago general PO box
  "60290",

  // South suburbs (604xx, 608xx) — added 2026-04-26
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

// Service-area gating is OPEN at the address validator (any 5-digit US
// ZIP passes). The cart pricing engine still uses ZIP_SET to gate the
// `out_of_zone` error; expanding the set above is what actually keeps
// Chicago customers from being turned away.
export function isInServiceArea(_state: string, zip: string): boolean {
  return /^\d{5}(-\d{4})?$/.test(zip.trim());
}

// Cart-pricing engine calls this to decide whether to charge shipping
// or return out_of_zone. Re-export ZIP_SET via this helper so callers
// don't need to construct their own Set.
export function isWithinDeliveryZone(zip: string): boolean {
  return ZIP_SET.has(zip.trim().slice(0, 5));
}

export const OUT_OF_AREA_MESSAGE =
  "Please enter a valid 5-digit ZIP code.";
