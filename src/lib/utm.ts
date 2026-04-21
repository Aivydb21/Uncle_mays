/**
 * UTM Parameter Utilities for Campaign Tracking
 * Captures UTM parameters from URL and persists them for attribution
 */

export interface UTMParams {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  gclid?: string;
}

const UTM_STORAGE_KEY = "unclemays_utm";

/**
 * Extracts UTM parameters from current URL
 */
export function getUTMFromURL(): UTMParams {
  if (typeof window === "undefined") return {};

  const params = new URLSearchParams(window.location.search);
  const utm: UTMParams = {};

  const utmKeys: (keyof UTMParams)[] = [
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_content",
    "utm_term",
  ];

  utmKeys.forEach((key) => {
    const value = params.get(key);
    if (value) {
      utm[key] = value;
    }
  });

  const gclid = params.get("gclid");
  if (gclid) {
    utm.gclid = gclid;
  }

  return utm;
}

/**
 * Saves UTM parameters to sessionStorage
 */
export function saveUTMParams(utm: UTMParams): void {
  if (typeof window === "undefined") return;
  if (Object.keys(utm).length === 0) return;

  try {
    sessionStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(utm));
  } catch (error) {
    console.error("Failed to save UTM params:", error);
  }
}

/**
 * Retrieves saved UTM parameters from sessionStorage
 */
export function getSavedUTMParams(): UTMParams {
  if (typeof window === "undefined") return {};

  try {
    const saved = sessionStorage.getItem(UTM_STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved) as UTMParams;
    }
  } catch (error) {
    console.error("Failed to retrieve UTM params:", error);
  }

  return {};
}

/**
 * Captures UTM parameters from URL and saves them to sessionStorage.
 * Also persists gclid to localStorage for cross-session Google Ads attribution.
 * Call this on initial page load.
 */
export function captureUTMParams(): UTMParams {
  const utm = getUTMFromURL();
  if (Object.keys(utm).length > 0) {
    saveUTMParams(utm);
  }
  // Persist gclid to localStorage separately so it survives Stripe redirect
  if (utm.gclid) {
    try {
      localStorage.setItem("unc-gclid", utm.gclid);
    } catch {
      // Ignore storage errors
    }
  }
  return utm;
}

/**
 * Gets UTM params (either from URL or saved in session)
 */
export function getUTMParams(): UTMParams {
  // First try URL
  const urlUTM = getUTMFromURL();
  if (Object.keys(urlUTM).length > 0) {
    return urlUTM;
  }

  // Fallback to saved
  return getSavedUTMParams();
}
