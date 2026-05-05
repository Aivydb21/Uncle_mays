"""Loader + applier for the cross-platform campaign name map.

Map file at ml/configs/campaign_name_map.json. Three sections:

  meta_dashboard_to_slug    Meta API campaign_name  -> canonical slug
  gads_dashboard_to_slug    Google Ads campaign_name -> canonical slug
  stripe_legacy_slug_aliases  legacy Stripe utm_campaign value -> canonical slug
                              (collapses duplicate slugs that refer to the same campaign)

Public API:
  load_map()
  canonicalize_meta_name(name)   -> slug or None
  canonicalize_gads_name(name)   -> slug or None
  canonicalize_stripe_slug(slug) -> slug (returns input unchanged if no alias)
"""

from __future__ import annotations

import json
from functools import lru_cache
from pathlib import Path

MAP_PATH = Path(__file__).resolve().parent.parent / "configs" / "campaign_name_map.json"


@lru_cache(maxsize=1)
def load_map() -> dict:
    if not MAP_PATH.exists():
        return {
            "meta_dashboard_to_slug": {},
            "gads_dashboard_to_slug": {},
            "stripe_legacy_slug_aliases": {},
        }
    raw = json.loads(MAP_PATH.read_text())
    return {
        "meta_dashboard_to_slug": raw.get("meta_dashboard_to_slug", {}),
        "gads_dashboard_to_slug": raw.get("gads_dashboard_to_slug", {}),
        "stripe_legacy_slug_aliases": raw.get("stripe_legacy_slug_aliases", {}),
    }


def canonicalize_meta_name(name: str | None) -> str | None:
    if not name:
        return None
    return load_map()["meta_dashboard_to_slug"].get(name)


def canonicalize_gads_name(name: str | None) -> str | None:
    if not name:
        return None
    return load_map()["gads_dashboard_to_slug"].get(name)


def canonicalize_stripe_slug(slug: str | None) -> str | None:
    if not slug:
        return None
    return load_map()["stripe_legacy_slug_aliases"].get(slug, slug)
