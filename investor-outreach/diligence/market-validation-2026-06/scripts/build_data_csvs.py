"""Transcribe the Placer.ai report figures and the triangulation inputs into tidy
CSVs under ../data/ for the Quarto report. Every table cites the Placer page or the
external source it came from, so each number in the report is auditable.

Run once before rendering:
    py scripts/build_data_csvs.py

Source key:
  Placer venue  = store-level visits to Hyde Park Produce (the building).
  Placer ring   = "Nearby Activity 1000 ft" visits to the surrounding node.
  Placer TTA    = Placer "True Trade Area capturing 70% of visits" summary.
  Placer tables = the 30% / 50% / 70% of-visits demographic tables (pp. 3-17).
"""

from __future__ import annotations

from pathlib import Path

import pandas as pd

DATA = Path(__file__).resolve().parent.parent / "data"
DATA.mkdir(parents=True, exist_ok=True)


def w(name: str, df: pd.DataFrame) -> None:
    path = DATA / name
    df.to_csv(path, index=False)
    print(f"wrote {path}  ({len(df)} rows)")


# 1. Triangulation summary (Fig: convergence). Revenue figures in USD millions.
#    Roles: anchor / floor / independent confirm / ceiling. See report Section "Synthesis".
methods_summary = pd.DataFrame(
    [
        # method, role, low_musd, high_musd, marker_musd, note
        ("Proven site baseline", "Floor (realized)", 8.0, 8.0, 8.0,
         "Three years of realized revenue at 1226 E 53rd St"),
        ("Sales per square foot", "Anchor", 6.3, 9.6, 6.3,
         "Plan 629 to U.S. supermarket 965 dollars per sq ft of selling area"),
        ("Trade area spend capture", "Independent confirm", 6.4, 12.9, None,
         "2 to 4 percent capture of the core (50 percent) trade area"),
        ("Foot traffic capacity", "Ceiling (headroom)", 11.2, 19.2, None,
         "458K store visits at curated format basket sizes"),
    ],
    columns=["method", "role", "low_musd", "high_musd", "marker_musd", "note"],
)
w("methods_summary.csv", methods_summary)


# 2. Proven vs projected (Fig: 79 percent bar).
baseline = pd.DataFrame(
    [
        ("Year-1 projection", 6.3, "plan"),
        ("Proven site baseline (3-yr)", 8.0, "proven"),
    ],
    columns=["scenario", "revenue_musd", "kind"],
)
w("baseline.csv", baseline)


# 3. Sales per square foot benchmark (Fig). All on a SELLING-AREA basis for an
#    apples-to-apples comparison with Uncle May's 10,000 sq ft of selling area.
#    FMI 2024: 18.55 dollars/wk/sq ft selling x 52 = ~965 dollars/yr. Trader Joe's
#    >2,000 (curated format). Site proven = 8.0M / 10,000 = 800.
sqft_benchmark = pd.DataFrame(
    [
        ("Uncle May's Year-1 plan", 629, "plan"),
        ("Site proven (3-yr)", 800, "proven"),
        ("U.S. supermarket avg (FMI 2024)", 965, "benchmark"),
        ("Trader Joe's (curated format)", 2100, "context"),
    ],
    columns=["entity", "dollars_per_sqft", "kind"],
)
w("sqft_benchmark.csv", sqft_benchmark)


# 4. Trade-area spend capture (Fig). households from Placer 30/50/70 tables (p.3);
#    fafh_usd = BLS CES 2023 food-at-home per consumer unit. R computes potential and
#    the capture required to reach 6.3M.
trade_area = pd.DataFrame(
    [
        ("Inner (30% of visits)", 30, 24360, 6053),
        ("Core (50% of visits)", 50, 53197, 6053),
        ("Broad (70% of visits)", 70, 155534, 6053),
    ],
    columns=["ring_label", "visit_capture_pct", "households", "fafh_usd"],
)
w("trade_area.csv", trade_area)


# 5. Ethnicity composition (Fig). Placer TTA summary chart (p.19/21), percent.
ethnicity = pd.DataFrame(
    [
        ("Black", 62.8),
        ("White", 19.2),
        ("Asian", 7.0),
        ("Hispanic or Latino", 5.7),
        ("Two or more races", 4.4),
        ("Other", 0.8),
        ("American Indian / Alaska Native", 0.1),
        ("Native Hawaiian / Pacific Islander", 0.0),
    ],
    columns=["group", "pct"],
)
w("ethnicity.csv", ethnicity)


# 6. Household income tiers (Fig). Placer 50% TTA income table (pp.9-10), percent.
income_tiers = pd.DataFrame(
    [
        ("Under $25K", 30.9),
        ("$25K to $50K", 17.7),
        ("$50K to $100K", 24.5),
        ("$100K and over", 26.7),
    ],
    columns=["tier", "pct"],
)
w("income_tiers.csv", income_tiers)


# 7. Footfall by day of week (Fig). Placer ring "Daily Visits" (p.31), thousands.
footfall_dow = pd.DataFrame(
    [
        ("Mon", 340), ("Tue", 350), ("Wed", 355), ("Thu", 360),
        ("Fri", 450), ("Sat", 430), ("Sun", 330),
    ],
    columns=["day", "visits_k"],
)
w("footfall_dow.csv", footfall_dow)


# 8. Footfall by hour (Fig). Placer ring "Hourly Visits" (p.30/33), thousands.
footfall_hour = pd.DataFrame(
    [
        (0, 65), (1, 45), (2, 30), (3, 22), (4, 20), (5, 25),
        (6, 30), (7, 55), (8, 110), (9, 155), (10, 205), (11, 260),
        (12, 315), (13, 335), (14, 335), (15, 360), (16, 405), (17, 415),
        (18, 410), (19, 380), (20, 325), (21, 250), (22, 150), (23, 105),
    ],
    columns=["hour", "visits_k"],
)
w("footfall_hour.csv", footfall_hour)


# 9. Visit duration distribution (Fig). Placer ring "Visit Duration" (p.27), thousands.
#    Average stay 46 min, median stay 19 min.
visit_duration = pd.DataFrame(
    [
        ("<5", 190), ("5-9", 540), ("10-14", 360), ("15-29", 620),
        ("30-44", 290), ("45-59", 160), ("60-74", 110), ("75-89", 90),
        ("90-104", 70), ("105-119", 50), ("120-134", 40), ("135-149", 30),
        (">150", 140),
    ],
    columns=["bucket_min", "visits_k"],
)
w("visit_duration.csv", visit_duration)


# 10. Visitor journey (Fig). Placer "Visitor Journey" (p.35), percent of visits.
journey = pd.DataFrame(
    [
        ("prior", "Home", 36.7), ("prior", "Work", 10.0), ("prior", "Other", 3.5),
        ("prior", "Trader Joe's", 1.4), ("prior", "Walgreens", 1.2),
        ("post", "Home", 45.6), ("post", "Work", 4.9), ("post", "Other", 3.0),
        ("post", "Trader Joe's", 1.4), ("post", "Walgreens", 1.0),
    ],
    columns=["direction", "place", "pct"],
)
w("journey.csv", journey)


# 11. Annual visits trend (Fig: stability). Placer ring "Visits Trend" (p.25), millions.
visits_trend = pd.DataFrame(
    [
        (2023, 2.6), (2024, 2.5), (2025, 2.7),
    ],
    columns=["year", "visits_m"],
)
w("visits_trend.csv", visits_trend)


if __name__ == "__main__":
    print(f"data dir: {DATA}")
