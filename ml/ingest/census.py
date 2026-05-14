"""Pull US Census Bureau ACS 5-year demographics by ZCTA (ZIP code).

The Census Data API requires a free API key for all requests as of 2025.
Register at https://api.census.gov/data/key_signup.html and set
CENSUS_API_KEY in your .env file.

Pulls:
  - median_household_income     B19013_001E
  - total_population            B01003_001E
  - median_age                  B01002_001E
  - median_household_size       B25010_001E (avg per occupied unit)
  - black_pop                   B02001_003E (Black or African American alone)
  - white_pop                   B02001_002E
  - hispanic_pop                B03003_003E (Hispanic or Latino)

Computes:
  - pct_black_households (black_pop / total_population)
  - pct_white_households
  - pct_hispanic_households

Pulls one shot for all ZCTAs that ever appear in our data (Stripe shipping
ZIPs + Stripe customer ZIPs + service-area ZIPs). ACS is annual data —
re-pull yearly, not weekly.
"""

from __future__ import annotations

import os
from pathlib import Path

import httpx
import polars as pl

from ._common import latest_raw, load_dotenv_if_present, raw_path

CENSUS_API = "https://api.census.gov/data"

# ACS 5-year vintages roll forward each year. Hardcoded to the most-recent
# tested vintage at time of writing; bump when a newer one ships.
ACS_VINTAGE = "2022"

VARIABLES = {
    "B19013_001E": "median_household_income",
    "B01003_001E": "total_population",
    "B01002_001E": "median_age",
    "B25010_001E": "median_household_size",
    "B02001_003E": "black_pop",
    "B02001_002E": "white_pop",
    "B03003_003E": "hispanic_pop",
}


def _service_area_zips() -> list[str]:
    """ZIPs we know we deliver to, from src/lib/service-area.ts."""
    return [
        # Chicago city
        "60605", "60607", "60609", "60615", "60616", "60617", "60619",
        "60620", "60621", "60628", "60633", "60636", "60637", "60643",
        "60649", "60653", "60655",
        # South suburbs
        "60406", "60409", "60411", "60419", "60422", "60426", "60428",
        "60429", "60430", "60438", "60443", "60461", "60469", "60471",
        "60473", "60827",
    ]


def _zips_from_stripe_extracts() -> list[str]:
    """Pull additional ZIPs that have appeared in Stripe extracts."""
    out: set[str] = set()
    for src in ("stripe_payment_intents", "stripe_customers", "stripe_checkout_sessions"):
        p = latest_raw(src)
        if not p:
            continue
        df = pl.read_parquet(p)
        for col in ("shipping_zip", "zip"):
            if col in df.columns:
                vals = df[col].drop_nulls().to_list()
                for v in vals:
                    s = str(v).strip().split("-")[0]
                    if len(s) == 5 and s.isdigit():
                        out.add(s)
    return sorted(out)


def extract() -> Path:
    load_dotenv_if_present()
    api_key = os.environ.get("CENSUS_API_KEY")
    if not api_key:
        raise EnvironmentError(
            "[census] CENSUS_API_KEY is not set. "
            "Register for a free key at https://api.census.gov/data/key_signup.html "
            "and set it in your .env file."
        )

    zips = sorted(set(_service_area_zips() + _zips_from_stripe_extracts()))
    print(f"[census] pulling ACS for {len(zips)} ZIPs")

    var_codes = list(VARIABLES.keys())
    get_clause = ",".join(["NAME"] + var_codes)

    rows: list[dict] = []
    with httpx.Client(timeout=60.0) as cli:
        # The Census API caps "for=zip code tabulation area:..." lists. Batch.
        BATCH = 50
        for i in range(0, len(zips), BATCH):
            batch = zips[i : i + BATCH]
            params = {
                "get": get_clause,
                "for": f"zip code tabulation area:{','.join(batch)}",
                "key": api_key,
            }
            url = f"{CENSUS_API}/{ACS_VINTAGE}/acs/acs5"
            r = cli.get(url, params=params, follow_redirects=False)
            # Census returns 302 -> missing_key.html when the key is invalid/missing
            if r.status_code == 302 or "missing_key" in r.headers.get("location", ""):
                raise EnvironmentError(
                    f"[census] Census API rejected the key (302 redirect). "
                    f"Check CENSUS_API_KEY is valid. Location: {r.headers.get('location')}"
                )
            if r.status_code != 200:
                print(f"[census] batch {i//BATCH} returned {r.status_code}: {r.text[:200]}")
                continue
            try:
                data = r.json()
            except Exception as exc:
                print(f"[census] batch {i//BATCH} JSON parse failed: {exc}; body: {r.text[:200]}")
                continue
            if not data or len(data) < 2:
                continue
            header = data[0]
            for row in data[1:]:
                rec = dict(zip(header, row))
                d: dict = {"zip": rec.get("zip code tabulation area")}
                for code, label in VARIABLES.items():
                    raw = rec.get(code)
                    try:
                        d[label] = float(raw) if raw is not None and raw != "" else None
                    except (TypeError, ValueError):
                        d[label] = None
                # Census uses sentinel -666666666 for missing-data on income etc.
                for k, v in list(d.items()):
                    if isinstance(v, float) and v < -1_000_000:
                        d[k] = None
                pop = d.get("total_population") or 0
                d["pct_black_households"] = (
                    (d.get("black_pop") or 0) / pop if pop else None
                )
                d["pct_white_households"] = (
                    (d.get("white_pop") or 0) / pop if pop else None
                )
                d["pct_hispanic_households"] = (
                    (d.get("hispanic_pop") or 0) / pop if pop else None
                )
                rows.append(d)

    df = pl.from_dicts(rows, infer_schema_length=None) if rows else pl.DataFrame(schema={"zip": pl.Utf8})
    out = raw_path("census_acs_zip")
    df.write_parquet(out)
    print(f"[census] {len(rows)} ZIPs -> {out}")
    return out


if __name__ == "__main__":
    extract()
