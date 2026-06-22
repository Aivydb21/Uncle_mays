"""Extract an independent Census ACS demographic anchor for the Hyde Park flagship
trade area, written to ../data/census_anchor.csv for the Quarto report.

This corroborates the Placer.ai trade-area demographics with a fully independent
source (U.S. Census ACS 5-year estimates), reading the parquet already ingested by
ml/ingest/census.py. The site ZIP is 60615; the adjacent ZIPs feed the Placer True
Trade Area and explain its higher Black-household share.

Run once before rendering the report:
    py scripts/extract_census_anchor.py
"""

from __future__ import annotations

import sys
from pathlib import Path

import duckdb

# Site ZIP first, then adjacent ZIPs that feed the Placer trade area.
SITE_ZIP = "60615"
TRADE_AREA_ZIPS = [SITE_ZIP, "60637", "60649", "60653", "60616"]

# Pin the snapshot used in the report for reproducibility; fall back to the latest.
PINNED_PARQUET = "census_acs_zip_20260530T135331Z.parquet"


def find_parquet() -> Path:
    script_dir = Path(__file__).resolve().parent
    repo_root = script_dir.parents[3]  # market-validation-2026-06 -> diligence -> investor-outreach -> um_website
    raw_dir = repo_root / "ml" / "data" / "raw"
    pinned = raw_dir / PINNED_PARQUET
    if pinned.exists():
        return pinned
    candidates = sorted(raw_dir.glob("census_acs_zip_*.parquet"))
    if not candidates:
        sys.exit(f"No census_acs_zip_*.parquet found under {raw_dir}")
    return candidates[-1]


def main() -> None:
    script_dir = Path(__file__).resolve().parent
    out_path = script_dir.parent / "data" / "census_anchor.csv"
    parquet = find_parquet()

    zip_list = ", ".join(f"'{z}'" for z in TRADE_AREA_ZIPS)
    order = ", ".join(f"'{z}'" for z in TRADE_AREA_ZIPS)

    query = f"""
        SELECT
            CAST(zip AS VARCHAR)                                            AS zip,
            CAST(median_household_income AS BIGINT)                         AS median_household_income,
            CAST(total_population AS BIGINT)                                AS total_population,
            ROUND(median_household_size, 2)                                AS median_household_size,
            CAST(ROUND(total_population / median_household_size) AS BIGINT) AS implied_households,
            ROUND(pct_black_households * 100, 1)                            AS pct_black_households,
            CASE WHEN CAST(zip AS VARCHAR) = '{SITE_ZIP}' THEN TRUE ELSE FALSE END AS is_site
        FROM read_parquet('{parquet.as_posix()}')
        WHERE CAST(zip AS VARCHAR) IN ({zip_list})
        ORDER BY array_position([{order}], CAST(zip AS VARCHAR))
    """

    con = duckdb.connect()
    df = con.execute(query).df()
    if df.empty:
        sys.exit("Query returned no rows. Check ZIP codes and parquet schema.")

    out_path.parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(out_path, index=False)

    print(f"Source parquet : {parquet}")
    print(f"Wrote          : {out_path}  ({len(df)} rows)")
    print(df.to_string(index=False))


if __name__ == "__main__":
    main()
