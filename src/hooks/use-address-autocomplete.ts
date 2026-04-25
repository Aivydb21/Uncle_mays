"use client";

import { useEffect, useRef, useCallback } from "react";

export interface ParsedAddress {
  street: string;
  city: string;
  state: string;
  zip: string;
}

type AutocompleteCallback = (address: ParsedAddress) => void;

let scriptLoaded = false;
let scriptLoading = false;
const loadCallbacks: (() => void)[] = [];

function loadGoogleMapsScript(): Promise<void> {
  if (scriptLoaded) return Promise.resolve();

  return new Promise((resolve) => {
    if (scriptLoading) {
      loadCallbacks.push(resolve);
      return;
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      // No API key configured — resolve so the input still works without autocomplete
      resolve();
      return;
    }

    scriptLoading = true;
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      scriptLoaded = true;
      scriptLoading = false;
      resolve();
      loadCallbacks.forEach((cb) => cb());
      loadCallbacks.length = 0;
    };
    script.onerror = () => {
      scriptLoading = false;
      // Resolve anyway so the input remains usable as a plain text field
      resolve();
      loadCallbacks.forEach((cb) => cb());
      loadCallbacks.length = 0;
    };
    document.head.appendChild(script);
  });
}

function parsePlace(
  place: google.maps.places.PlaceResult
): ParsedAddress | null {
  if (!place.address_components) return null;

  let streetNumber = "";
  let route = "";
  let city = "";
  let state = "";
  let zip = "";

  for (const component of place.address_components) {
    const type = component.types[0];
    switch (type) {
      case "street_number":
        streetNumber = component.long_name;
        break;
      case "route":
        route = component.short_name;
        break;
      case "locality":
        city = component.long_name;
        break;
      case "sublocality_level_1":
        // Fallback for city in some areas
        if (!city) city = component.long_name;
        break;
      case "administrative_area_level_1":
        state = component.short_name;
        break;
      case "postal_code":
        zip = component.long_name;
        break;
    }
  }

  const street = streetNumber ? `${streetNumber} ${route}` : route;
  return { street, city, state, zip };
}

/**
 * Attaches Google Places Autocomplete to a street address input.
 * Returns a ref callback to attach to the input element.
 * When the user selects an address, `onSelect` fires with parsed fields.
 * Gracefully degrades (no autocomplete) if the API key is missing.
 */
export function useAddressAutocomplete(onSelect: AutocompleteCallback) {
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const callbackRef = useRef(onSelect);
  callbackRef.current = onSelect;

  const inputRef = useCallback((node: HTMLInputElement | null) => {
    if (!node) return;
    if (autocompleteRef.current) return; // already initialised

    loadGoogleMapsScript()
      .then(() => {
        if (!window.google?.maps?.places?.Autocomplete) {
          // Script didn't load or Places library missing — leave input as-is
          return;
        }

        try {
          const autocomplete = new google.maps.places.Autocomplete(node, {
            types: ["address"],
            componentRestrictions: { country: "us" },
            fields: ["address_components"],
          });

          autocomplete.setBounds(
            new google.maps.LatLngBounds(
              { lat: 41.6445, lng: -87.9401 },
              { lat: 42.0231, lng: -87.5237 }
            )
          );

          autocomplete.addListener("place_changed", () => {
            try {
              const place = autocomplete.getPlace();
              const parsed = parsePlace(place);
              if (parsed) callbackRef.current(parsed);
            } catch (err) {
              console.warn("[address-autocomplete] place_changed error:", err);
            }
          });

          autocompleteRef.current = autocomplete;
        } catch (err) {
          // Autocomplete init can throw if the API key is invalid, billing
          // is off, or referrer restrictions block the request. Logging here
          // so the failure is visible in DevTools instead of silently
          // poisoning the input element.
          console.warn("[address-autocomplete] init failed:", err);
        }
      })
      .catch((err) => {
        console.warn("[address-autocomplete] script load error:", err);
      });
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      try {
        if (autocompleteRef.current && window.google?.maps?.event) {
          google.maps.event.clearInstanceListeners(autocompleteRef.current);
        }
      } catch {
        // Ignore — Maps may not be loaded
      }
      autocompleteRef.current = null;
    };
  }, []);

  return inputRef;
}
