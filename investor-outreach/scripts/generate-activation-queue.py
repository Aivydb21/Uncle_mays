#!/usr/bin/env python3
"""
generate-activation-queue.py — Day 1 kickoff script.

Creates:
  1. Stub contact files for all S3-S6 seed targets and active pipeline contacts
  2. segments/activation-queue.csv (120+ rows, S3-S6 + active S1/S2 pipeline)

Run from Desktop/um_website/investor-outreach/:
    python scripts/generate-activation-queue.py
"""

from __future__ import annotations

import csv
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CONTACTS_DIR = os.path.join(ROOT, "contacts")
SEGMENTS_DIR = os.path.join(ROOT, "segments")
TODAY = "2026-04-19"

# ---------------------------------------------------------------------------
# Contact data
# Each entry: (segment, email, name, firm, check_range, geography, status,
#              entry_path, warm_path, thesis_one_liner, score,
#              days_since_touch, next_action, extra_frontmatter_dict)
# ---------------------------------------------------------------------------

CONTACTS = [
    # -----------------------------------------------------------------------
    # S1 — Active pipeline (VC, thesis-aligned) — 12 contacts
    # -----------------------------------------------------------------------
    ("S1", "tony@macarthurcapital.com", "Tony Bash", "MacArthur Strategic Capital",
     "$250K-$2M", "Chicago", "in-dd",
     "IN DD — maintain momentum",
     "Peter Braxton intro",
     "Chicago-anchored impact capital; co-invest capacity check in progress",
     95, 2, "Send follow-up draft (ready at drafts/macarthur-followup-2026-04-17.md)",
     {}),

    ("S1", "peter@macarthurcapital.com", "Peter Braxton", "MacArthur Strategic Capital",
     "$250K-$2M", "Chicago", "in-dd",
     "IN DD — maintain momentum",
     "Direct — introduced via Tony Bash",
     "HNW connector; bridge to Pritzker family; MacArthur co-invest track",
     92, 2, "CC on MacArthur follow-up; ask about AHA Social Impact Fund intro follow-through",
     {}),

    ("S1", "tyler@mannatreepartners.com", "Tyler Mayoras", "Manna Tree",
     "$50K-$250K", "National", "active",
     "Gmail sent 2026-04-04; LI connected 2026-04-08",
     "LinkedIn connected",
     "Food & Beverage MD; portfolio overlaps with produce-adjacent investments",
     72, 11, "Send LinkedIn DM1 (draft ready at drafts/mayoras-linkedin-dm1-2026-04-17.md)",
     {}),

    ("S1", "james@blackopsvc.com", "James Norman", "Black Operator Ventures",
     "$50K-$250K", "National", "active",
     "Gmail sent 2026-04-04; LI requested 2026-04-06",
     "LI connection pending",
     "Black-led operator-focused fund; directly thesis-aligned",
     78, 13, "Send follow-up email (draft ready at drafts/norman-followup-2026-04-17.md)",
     {}),

    ("S1", "jordan@afventures.vc", "Jordan Gaspar", "AF Ventures",
     "$50K-$250K", "National", "active",
     "Gmail sent 2026-04-04; LI requested 2026-04-06",
     "LI connection pending",
     "Food/ag VC GP; produce supply chain thesis fit",
     70, 13, "Send follow-up email (draft ready at drafts/gaspar-followup-2026-04-17.md)",
     {}),

    ("S1", "sonia@snak.vc", "Sonia Nagar", "SNAK Venture Partners",
     "$50K-$250K", "National", "active",
     "Gmail sent 2026-04-04; LI requested 2026-04-06",
     "LI connection pending",
     "Founder & MP; food-focused VC; strong sector alignment",
     68, 13, "Await reply; send LI DM if connected",
     {}),

    ("S1", "corey@radicleimpact.com", "Corey Vernon", "Radicle Impact Partners",
     "$50K-$250K", "National", "active",
     "Gmail sent 2026-04-04; LI requested 2026-04-06",
     "LI connection pending",
     "Impact investor; food systems + racial equity thesis",
     65, 13, "Await reply; send LI DM if connected",
     {}),

    ("S1", "rclark@aspectconsumer.com", "Rodney Clark", "Aspect Consumer Partners",
     "$50K-$250K", "National", "active",
     "Gmail sent 2026-04-04; LI requested 2026-04-06",
     "LI connection pending",
     "MP & Co-Founder; consumer-focused fund; urban retail adjacency",
     62, 13, "Await reply; send LI DM if connected",
     {}),

    ("S1", "devon@forwardconsumer.com", "Devon Roshankish", "Forward Consumer Partners",
     "$50K-$250K", "National", "passed",
     "Gmail sent 2026-04-04; replied not a fit 2026-04-08",
     "",
     "Consumer-focused; replied not a fit",
     0, 11, "No further automated outreach; close file",
     {}),

    ("S1", "michael@simafunds.com", "Michael Rauenhorst", "SIMA Funds",
     "$50K-$250K", "National", "active",
     "Gmail sent 2026-04-04; LI requested 2026-04-06",
     "LI connection pending",
     "Managing Partner; social impact fund; ESG-aligned consumer investments",
     63, 13, "Await reply; send LI DM if connected",
     {}),

    ("S1", "tim.kramer@chicagocap.com", "Tim Kramer", "Chicago Capital Partners",
     "$50K-$250K", "Chicago", "active",
     "Gmail sent 2026-04-04; LI requested 2026-04-06",
     "LI connection pending",
     "Chicago-based MD; community-facing capital deployment",
     70, 13, "Await reply; send LI DM if connected",
     {}),

    ("S1", "hannahs@dwmarkets.com", "Hannah Schiff", "DWM",
     "$50K-$250K", "National", "active",
     "Gmail sent 2026-04-04; LI requested 2026-04-06",
     "LI connection pending",
     "MD Impact; impact-aligned fixed income + equities crossover",
     60, 13, "Await reply; send LI DM if connected",
     {}),

    # -----------------------------------------------------------------------
    # S3 — Philanthropic / Mission-Aligned (25 entries)
    # -----------------------------------------------------------------------
    ("S3", "programs@chicagoclf.org", "Bob Tucker", "Chicago Community Loan Fund",
     "$50K-$500K", "Chicago", "dormant",
     "Direct + Benefit Chicago ref",
     "Benefit Chicago referral channel",
     "CDFI; food retail lending; Black-led borrowers; Chicago anchor",
     88, 999, "Build warm intro via Benefit Chicago; send thesis-led intro email",
     {"pri_mri": "PRI / senior debt"}),

    ("S3", "impact@macfound.org", "MacArthur Foundation Impact", "MacArthur Foundation",
     "$250K-$2M", "Chicago", "in-dd",
     "IN DD — coordinate via Jua (CFO)",
     "Tony Bash / Peter Braxton (in flight)",
     "PRI/MRI capacity; Chicago community wealth; co-invest track active",
     95, 2, "Coordinate diligence responses with Jua; do not cold-outreach",
     {"pri_mri": "PRI / MRI"}),

    ("S3", "info@cct.org", "Chicago Community Trust", "Chicago Community Trust",
     "$25K-$250K", "Chicago", "dormant",
     "Field Foundation referral",
     "Field Foundation ref (ask after Field intro)",
     "Chicago-only; food access; community development grants and PRIs",
     85, 999, "Secure Field Foundation intro first; then approach CCT program officer",
     {"pri_mri": "Grant + PRI"}),

    ("S3", "grants@polkbrosfdn.org", "Polk Bros Foundation", "Polk Bros Foundation",
     "$25K-$100K", "Chicago", "dormant",
     "Board intro via Dee Robinson",
     "Dee Robinson (flagship board member)",
     "Chicago-only grant funder; Black-serving organizations; civic community",
     80, 999, "Ask Dee Robinson for warm intro to Polk Bros program officer",
     {"pri_mri": "Grant"}),

    ("S3", "programstaff@joycefdn.org", "Joyce Foundation", "Joyce Foundation",
     "$50K-$250K", "Chicago", "dormant",
     "Program officer (food access portfolio)",
     "Via Joyce food-access program portfolio",
     "Chicago; food access; policy-adjacent; open to PRI for enterprise models",
     82, 999, "Research current food-access program officer; cold outreach with thesis letter",
     {"pri_mri": "Grant / PRI"}),

    ("S3", "info@buildersinitiative.org", "Builders Initiative", "Builders Initiative (Walton family)",
     "$100K-$1M", "National", "dormant",
     "Cold + warm via Polk Bros",
     "Polk Bros introduction (secondary)",
     "Food system; ag; Walton family impact vehicle; PRI/MRI capacity",
     72, 999, "Cold outreach after Polk Bros engagement; emphasize food-system mission",
     {"pri_mri": "PRI / MRI"}),

    ("S3", "lending@iff.org", "IFF (Illinois Facilities Fund)", "IFF",
     "$100K-$1M", "Chicago", "dormant",
     "Direct CDFI application",
     "",
     "CDFI; commercial real estate + food retail; Hyde Park store alignment",
     83, 999, "Direct outreach to IFF lending team; submit narrative on Hyde Park location",
     {"pri_mri": "Senior / sub debt"}),

    ("S3", "chicago@lisc.org", "LISC Chicago", "LISC Chicago",
     "$25K-$500K", "Chicago", "dormant",
     "Direct; Polk Bros referral as secondary",
     "Polk Bros referral",
     "Community dev grants and PRIs; Black neighborhoods; grocery access",
     81, 999, "Direct outreach to LISC Chicago program director; Polk Bros ref if available",
     {"pri_mri": "Grant + PRI"}),

    ("S3", "info@fieldfoundation.org", "Field Foundation of Illinois", "Field Foundation",
     "$25K-$100K", "Chicago", "dormant",
     "Direct",
     "",
     "Chicago leadership + media + community; food access adjacent",
     68, 999, "Cold outreach with Chicago-specific narrative; Field is community-leadership focused",
     {"pri_mri": "Grant"}),

    ("S3", "info@woodsfund.org", "Woods Fund Chicago", "Woods Fund Chicago",
     "$25K-$100K", "Chicago", "dormant",
     "Direct",
     "",
     "Racial equity; small grants; Chicago-only; Black-led org alignment",
     70, 999, "Cold outreach with racial equity and food-access framing",
     {"pri_mri": "Grant"}),

    ("S3", "grants@driehaus.org", "Driehaus Foundation", "Driehaus Foundation",
     "$50K-$250K", "Chicago", "dormant",
     "Direct",
     "",
     "Arts + community; long-shot for food; worth a thesis-letter pitch",
     55, 999, "Cold outreach; lower priority; frame food access as community development",
     {"pri_mri": "Grant"}),

    ("S3", "grants@grandvictoria.org", "Grand Victoria Foundation", "Grand Victoria Foundation",
     "$25K-$150K", "Chicago", "dormant",
     "Direct",
     "",
     "Economic vitality + community; Midwest anchor; food access adjacency",
     65, 999, "Cold outreach with economic vitality + produce access framing",
     {"pri_mri": "Grant"}),

    ("S3", "grants@mccormickfoundation.org", "McCormick Foundation", "Robert R McCormick Foundation",
     "$100K-$500K", "Chicago", "dormant",
     "Direct; Polk Bros ref as secondary",
     "Polk Bros referral",
     "Chicago civic; food access portfolio; journalism/democracy mission adjacency",
     75, 999, "Cold outreach to McCormick program officer; Polk Bros ref if timing aligns",
     {"pri_mri": "Grant + PRI"}),

    ("S3", "grants@conantfamilyfoundation.org", "Conant Family Foundation", "Conant Family Foundation",
     "$25K-$100K", "Chicago", "dormant",
     "Direct",
     "",
     "Small Chicago funder; food entrepreneurs; local business focus",
     62, 999, "Cold outreach with Chicago food entrepreneur narrative",
     {"pri_mri": "Grant"}),

    ("S3", "socialinvestments@kresge.org", "Kresge Foundation", "Kresge Foundation",
     "$250K-$2M", "National", "dormant",
     "Cold pitch to Social Investment Practice",
     "",
     "PRI/MRI capacity; food systems; financial inclusion; Detroit-HQ but national",
     73, 999, "Cold pitch to Social Investment Practice; emphasize SBA-backed model + food access",
     {"pri_mri": "PRI / MRI"}),

    ("S3", "programinfo@wkkf.org", "W.K. Kellogg Foundation", "W.K. Kellogg Foundation",
     "$100K-$500K", "National", "dormant",
     "Warm via food-system grantees",
     "Food-system grantee network",
     "Food systems; Black-led organizations; PRI capacity confirmed nationally",
     74, 999, "Identify food-system grantees in Kellogg portfolio who could intro Uncle May's",
     {"pri_mri": "PRI / Grant"}),

    ("S3", "grants@surdna.org", "Surdna Foundation", "Surdna Foundation",
     "$50K-$250K", "National", "dormant",
     "Cold",
     "",
     "Sustainable communities; racial equity; food systems adjacent",
     63, 999, "Cold outreach; sustainable communities + food access framing",
     {"pri_mri": "Grant + PRI"}),

    ("S3", "healthyfood@reinvestment.com", "Reinvestment Fund", "Reinvestment Fund",
     "$100K-$2M", "National", "dormant",
     "Direct application",
     "",
     "Healthy food access CDFI; produce retail explicitly in portfolio",
     78, 999, "Direct application to Healthy Food Financing Initiative program",
     {"pri_mri": "CDFI senior debt"}),

    ("S3", "info@enterprisecommunity.org", "Enterprise Community Partners", "Enterprise Community Partners",
     "$250K-$1M", "National", "dormant",
     "Direct",
     "",
     "Community dev; housing + food; PRI + CDFI vehicle; equity-adjacent",
     70, 999, "Direct outreach to Enterprise food access program; DC-HQ but Chicago presence",
     {"pri_mri": "PRI + CDFI"}),

    ("S3", "info@livingcities.org", "Living Cities", "Living Cities",
     "$100K-$500K", "National", "dormant",
     "Cold",
     "",
     "Financial inclusion; BIPOC community wealth; PRI/grant vehicle",
     67, 999, "Cold outreach to Living Cities; financial inclusion + produce access narrative",
     {"pri_mri": "PRI / grant"}),

    ("S3", "brandon@kaporcapital.com", "Brandon Boros", "Kapor Capital",
     "$50K-$250K", "National", "active",
     "Brandon Boros intro in flight (per UNC-126)",
     "Brandon Boros (in flight)",
     "Gap-closing; Black founders; equity-impact alignment; already in flight",
     80, 14, "Follow up on UNC-126 Kapor intro status; do not cold-outreach Apollo duplicate",
     {"pri_mri": "Equity (impact)"}),

    ("S3", "info@ahasocialimpact.org", "AHA Social Impact Fund", "AHA Social Impact Fund",
     "$25K-$100K", "National", "active",
     "In flight via UNC-135 (Peter Braxton intro)",
     "Peter Braxton intro (in flight UNC-135)",
     "Health-aligned food; grant + equity vehicle; already engaged",
     77, 14, "Follow up on UNC-135 AHA intro; coordinate with Peter Braxton",
     {"pri_mri": "Grant / equity"}),

    ("S3", "info@nextstreet.com", "Next Street", "Next Street",
     "$25K-$500K", "National", "dormant",
     "Cold",
     "",
     "BIPOC SMB pipeline advisory + PRI; food retail growth advisory",
     60, 999, "Cold outreach; advisory + PRI framing for Uncle May's growth capital",
     {"pri_mri": "Advisory + PRI"}),

    ("S3", "info@benefitchicago.org", "Benefit Chicago", "Benefit Chicago (CCT + MacArthur JV)",
     "$100K-$1M", "Chicago", "dormant",
     "Direct; CCT channel",
     "CCT + MacArthur JV (both in flight)",
     "Chicago social enterprise PRI; highest check range for S3 Chicago",
     84, 999, "Direct application once CCT or MacArthur engages; channel through those relationships",
     {"pri_mri": "PRI"}),

    ("S3", "info@ofn.org", "Opportunity Finance Network", "Opportunity Finance Network",
     "$0", "National", "dormant",
     "Cold referral",
     "",
     "CDFI ecosystem connector; referral vehicle to member CDFIs",
     45, 999, "Cold outreach for CDFI referral; low direct-check probability but network value",
     {"pri_mri": "CDFI network"}),

    # -----------------------------------------------------------------------
    # S4 — HNW / Family Offices (Chicago-first) — 24 contacts
    # -----------------------------------------------------------------------
    ("S4", "dee.robinson@unclemays.com", "Dee Robinson", "Chicago Board Network",
     "$25K-$100K", "Chicago", "active",
     "Direct — already warm; flagship board advisor",
     "Direct — flagship advisor, board-warm",
     "Chicago retail ops; Black consumer; HNW connector to Polk Bros and Pritzker",
     90, 5, "Leverage Dee for Polk Bros intro and Pritzker Traubert warm path",
     {"warm_path": "Direct -- already warm flagship advisor"}),

    ("S4", "peter@macarthurcapital.com", "Peter Braxton", "MacArthur / HNW connector",
     "$25K-$250K", "Chicago", "active",
     "Direct — already engaged in DD",
     "Direct -- MacArthur DD in progress",
     "HNW connector; bridge to Pritzker family; Ariel alumni network",
     88, 2, "Ask for Pritzker Traubert intro once MacArthur position clarifies",
     {"warm_path": "Direct -- MacArthur DD in progress, UNC-129"}),

    ("S4", "jb@pritzkertraubert.com", "JB Pritzker", "Pritzker Traubert Foundation",
     "$100K-$500K", "Chicago", "dormant",
     "Warm path via Dee Robinson + Peter Braxton",
     "Dee Robinson (flagship board) + Peter Braxton (UNC-129)",
     "Chicago anchor; Black consumer; SBA-backed business champion",
     78, 999, "Dee Robinson or Peter Braxton intro request; do not cold-contact",
     {"warm_path": "Dee Robinson intro + Peter Braxton (UNC-129)"}),

    ("S4", "mellody.hobson@arielinvestments.com", "Mellody Hobson", "Ariel Investments",
     "$100K-$500K", "Chicago", "dormant",
     "Ariel alumni + board networks",
     "Ariel alumni network; board connections",
     "Black-led capital; consumer retail; Chicago anchor investor",
     80, 999, "Identify Ariel alumni in Anthony's network; warm intro required",
     {"warm_path": "Ariel alumni network -- identify connector"}),

    ("S4", "john.rogers@arielinvestments.com", "John Rogers", "Ariel Investments",
     "$100K-$500K", "Chicago", "dormant",
     "Ariel alumni + board networks",
     "Ariel alumni network; board connections",
     "Black-led consumer investing pioneer; same network node as Mellody",
     78, 999, "Pair intro request with Mellody; same network channel",
     {"warm_path": "Ariel alumni network -- same node as Mellody Hobson"}),

    ("S4", "jim.reynolds@loopcapital.com", "Jim Reynolds", "Loop Capital",
     "$50K-$250K", "Chicago", "dormant",
     "Loop alumni + WBC civic connections",
     "WBC / Loop alumni network",
     "Black-led public finance; Chicago anchor; community investment track record",
     75, 999, "WBC or Loop alumni warm intro; Black Chicago business network",
     {"warm_path": "WBC / Loop Capital alumni -- identify connector"}),

    ("S4", "janon@setoholdings.com", "Janon Costley", "SETO Holdings",
     "$25K-$100K", "Chicago", "active",
     "In flight (UNC-125)",
     "Direct -- in flight UNC-125",
     "Black-led retail-adjacent operator; SETO Holdings portfolio synergy",
     77, 14, "Follow up on UNC-125 Janon Costley status",
     {"warm_path": "Direct -- in flight UNC-125"}),

    ("S4", "desiree@vcf.vc", "Desiree Vargas Wrigley", "VCF / HNW Scout",
     "$25K-$100K", "Chicago", "active",
     "In flight (UNC-127)",
     "Direct -- in flight UNC-127",
     "Chicago tech; scout network; HNW connector to angel pool",
     72, 14, "Follow up on UNC-127 Desiree status",
     {"warm_path": "Direct -- in flight UNC-127"}),

    ("S4", "spencer.tucker@greenwoodarcher.com", "Spencer Tucker", "Greenwood Archer Capital",
     "$25K-$100K", "Chicago", "dormant",
     "Dormant thread revival -- 120+ days",
     "Dormant thread -- SBA-adjacent relationship",
     "SBA lender; deep Chicago Black business network; food retail operator financing",
     73, 180, "Revive dormant Gmail thread; SBA lender with Black food biz network",
     {"warm_path": "Dormant thread -- needs revival (120+ days dormant)"}),

    ("S4", "don@clevelandavegp.com", "Don Thompson", "Cleveland Avenue",
     "$100K-$500K", "Chicago", "dormant",
     "Cleveland Ave channel (already VC Tier 1 target)",
     "Cleveland Ave network -- already in Apollo Tier 1",
     "Former McD CEO; food operator lens; Black-led investor; Chicago anchor",
     79, 999, "Check if Cleveland Ave Apollo touch landed; if yes, coordinate S1/S4 approach",
     {"warm_path": "Cleveland Avenue VC channel -- coordinate with S1 outreach"}),

    ("S4", "linda@johnsonpublishing.com", "Linda Johnson Rice", "Johnson Publishing Legacy",
     "$25K-$100K", "Chicago", "dormant",
     "Dee Robinson network",
     "Dee Robinson -- Black Chicago civic network",
     "Black consumer media legacy; Chicago anchor; community wealth alignment",
     68, 999, "Dee Robinson warm intro request",
     {"warm_path": "Dee Robinson -- Black Chicago civic network"}),

    ("S4", "joseph.mansueto@morningstar.com", "Joseph Mansueto", "Morningstar / Family Office",
     "$100K-$500K", "Chicago", "dormant",
     "Chicago Booth alumni; 1871 network",
     "Chicago Booth / 1871 alumni channel",
     "Chicago data business investor; Morningstar LP network; CPG data thesis adjacency",
     71, 999, "Booth alumni warm intro; data business angle strongest hook",
     {"warm_path": "Chicago Booth / 1871 alumni -- identify connector"}),

    ("S4", "glen.tullman@transcarent.com", "Glen Tullman", "7wire Ventures / Transcarent",
     "$50K-$250K", "Chicago", "dormant",
     "Chicago Booth; Livongo alumni network",
     "Chicago Booth / Livongo alumni",
     "Consumer health; CPG data; Chicago operator; proven check-writer",
     72, 999, "Booth or Livongo alumni warm intro",
     {"warm_path": "Chicago Booth / Livongo alumni -- identify connector"}),

    ("S4", "lester@crownestate.com", "Lester Crown", "Henry Crown & Co",
     "$100K-$500K", "Chicago", "dormant",
     "Board networks; WBC civic channel",
     "WBC / civic board network",
     "Chicago civic; retail real estate; community wealth; long-horizon capital",
     67, 999, "WBC civic board channel for warm intro; long-shot but high-value",
     {"warm_path": "WBC / civic board -- identify connector"}),

    ("S4", "don.peebles@peeblescompany.com", "Don Peebles", "Peebles Corp",
     "$100K-$500K", "National", "dormant",
     "CRE channel (Apollo CRE list)",
     "Apollo CRE list -- activate via invest@ re-auth",
     "Retail CRE + HNW; Black-led real estate developer; Chicago market interest",
     65, 999, "Activate via Apollo CRE campaign once invest@ OAuth restored",
     {"warm_path": "Apollo CRE campaign -- requires invest@ OAuth re-auth"}),

    # -----------------------------------------------------------------------
    # S5 — Angel Syndicates (21 entries)
    # -----------------------------------------------------------------------
    ("S5", "apply@hydeparkangels.com", "Hyde Park Angels", "Hyde Park Angels",
     "$25K-$250K", "Chicago", "dormant",
     "Direct application; Chicago Booth alumni intros",
     "Booth alumni warm intro to member",
     "Chicago anchor; Midwest consumer; formal pitch process; highest-probability near-term",
     85, 999, "Submit formal application to HPA; apply now -- highest priority S5",
     {}),

    ("S5", "info@boothangels.uchicago.edu", "Chicago Booth Angels Network", "Chicago Booth Angels",
     "$25K-$100K", "Chicago", "dormant",
     "Booth alumni warm intro",
     "Booth alumni network",
     "Consumer data + retail; alumni syndicate; member-vote model",
     78, 999, "Identify Booth alumni in Anthony's network; warm intro to network coordinator",
     {}),

    ("S5", "info@cornerstoneangels.com", "Cornerstone Angels", "Cornerstone Angels",
     "$25K-$150K", "Chicago", "dormant",
     "Direct application",
     "",
     "Midwest small biz; formal pitch process; Chicago-adjacent",
     68, 999, "Direct application to Cornerstone; confirm application window open",
     {}),

    ("S5", "apply@impactengine.vc", "Impact Engine", "Impact Engine",
     "$50K-$250K", "Chicago", "dormant",
     "Open pitch + application",
     "",
     "Chicago impact investing; food + community alignment; formal application",
     75, 999, "Submit pitch application to Impact Engine; impact framing strongest hook",
     {}),

    ("S5", "membership@1871.com", "1871 Member Network", "1871",
     "$25K-$100K", "Chicago", "dormant",
     "1871 membership + events",
     "1871 membership network",
     "Chicago tech angel pool; event-driven deal flow; warm via 1871 membership",
     62, 999, "Engage 1871 community events; identify angel members in food/retail",
     {}),

    ("S5", "info@p33chicago.com", "P33 / World Business Chicago", "P33 / WBC",
     "$25K-$100K", "Chicago", "dormant",
     "Civic intro via Anthony contacts",
     "Anthony civic contacts via WBC",
     "Chicago anchor; civic network; angel pool within WBC ecosystem",
     65, 999, "Anthony civic network intro; WBC connection for angel referrals",
     {}),

    ("S5", "info@harlemcapital.co", "Harlem Capital Alumni Angels", "Harlem Capital",
     "$25K-$100K", "National", "dormant",
     "Henri Pierre-Jacques / Brandon Bryant intro",
     "Henri Pierre-Jacques or Brandon Bryant",
     "Black/Latino founders; diverse operator angels; high-velocity check-writers",
     78, 999, "Warm intro to Henri Pierre-Jacques or Brandon Bryant; Black founder thesis",
     {}),

    ("S5", "community@blckvc.com", "BLCK VC Community", "BLCK VC",
     "$25K-$100K", "National", "dormant",
     "Community intro",
     "BLCK VC community network",
     "Black founders; scout network; community-driven deal flow",
     70, 999, "Join BLCK VC community events; identify angel members for warm intro",
     {}),

    ("S5", "info@boldcapitalgroup.com", "BOLD Capital Group", "BOLD Capital Group",
     "$25K-$100K", "National", "dormant",
     "Cold + warm",
     "",
     "Black angel collective; operator-investor hybrid; food + retail adjacency",
     67, 999, "Cold outreach with Black operator + food retail narrative",
     {}),

    ("S5", "invest@gaingels.com", "Gaingels", "Gaingels",
     "$25K-$100K", "National", "dormant",
     "AngelList syndicate application",
     "",
     "LGBTQ+ syndicate; inclusion thesis; high-velocity check mechanism via AngelList",
     60, 999, "Submit AngelList syndicate application; inclusion + food access narrative",
     {}),

    ("S5", "apply@goldenseeds.com", "Golden Seeds", "Golden Seeds",
     "$50K-$250K", "National", "dormant",
     "Application",
     "",
     "Women-led syndicate; consumer + retail focus; formal application",
     58, 999, "Formal application; confirm eligibility criteria for non-women-led founders",
     {}),

    ("S5", "invest@bbgventures.com", "BBG Ventures", "BBG Ventures",
     "$50K-$250K", "National", "dormant",
     "Cold application",
     "",
     "Women consumer fund; food + retail overlap; check velocity high",
     55, 999, "Cold application; confirm thesis fit for male-led company",
     {}),

    ("S5", "info@lightshipcapital.com", "Lightship Capital", "Lightship Capital",
     "$50K-$250K", "National", "dormant",
     "Candice Matthews warm intro",
     "Candice Matthews -- Midwest diversity investor",
     "Midwest + Black founders; food + CPG thesis overlap; operator-investor focus",
     73, 999, "Warm intro to Candice Matthews; Midwest + Black operator narrative",
     {}),

    ("S5", "info@jumpstartfund.com", "Jumpstart Capital", "Jumpstart Capital",
     "$50K-$150K", "National", "dormant",
     "Midwest biz network",
     "Midwest business network",
     "Cincinnati angels; Midwest consumer; regional operator focus",
     60, 999, "Midwest business network warm intro; geographic + consumer thesis",
     {}),

    ("S5", "campaigns@wefunder.com", "WeFunder", "WeFunder",
     "$5K-$100K", "National", "dormant",
     "Application + campaign setup",
     "",
     "Reg CF crowdfunding; community capital + customer acquisition dual purpose",
     55, 999, "Evaluate Reg CF compliance costs before committing; coordinate with CFO",
     {}),

    ("S5", "issuer@republic.co", "Republic", "Republic",
     "$5K-$50K", "National", "dormant",
     "Application",
     "",
     "Reg CF / Reg A+; retail + food alignment; community investor pool",
     52, 999, "Evaluate alongside WeFunder; do not commit to both simultaneously",
     {}),

    ("S5", "info@mac-vc.com", "MAC VC Scouts", "MAC VC",
     "$25K-$100K", "National", "dormant",
     "Scout network intro",
     "MAC VC scout network",
     "Black-focused scout network; early-stage CPG + consumer coverage",
     65, 999, "Scout network introduction; Black CPG + food data narrative",
     {}),

    ("S5", "info@ivyplusangels.com", "Ivy Plus Angels", "Ivy Plus Angels",
     "$25K-$100K", "National", "dormant",
     "Alumni intro required",
     "Alumni member champion required",
     "School alumni; diverse operator angels; member-vote model",
     62, 999, "Identify Ivy Plus alumni in Anthony's network to champion application",
     {}),

    ("S5", "apply@seedinvest.com", "SeedInvest", "SeedInvest",
     "$10K-$100K", "National", "dormant",
     "Application",
     "",
     "Accredited crowdfunding; higher check range than Reg CF platforms",
     55, 999, "Application when ready; coordinate with CFO on accredited investor compliance",
     {}),

    # -----------------------------------------------------------------------
    # S6 — Grants / Non-Dilutive (30 entries)
    # -----------------------------------------------------------------------
    ("S6", "rd.usda@il.usda.gov", "USDA VAPG Program", "USDA Rural Development",
     "$75K-$250K", "National", "dormant",
     "RD state office + RFP application",
     "",
     "Value-added producer grants; working capital + planning; produce aggregator eligible",
     85, 999, "Confirm eligibility (producer status / aggregator variant); apply next RFP window",
     {}),

    ("S6", "ams.grants@usda.gov", "USDA LFPA Program", "USDA AMS",
     "$50K-$500K", "National", "dormant",
     "State pass-through application",
     "",
     "Local food purchase assistance; Uncle May's as local food aggregator fits eligibility",
     78, 999, "Research IL LFPA pass-through deadline; confirm Uncle May's aggregator eligibility",
     {}),

    ("S6", "fmpp@ams.usda.gov", "USDA Farmers Market Promotion Program", "USDA AMS",
     "$50K-$500K", "National", "dormant",
     "AMS grants.gov application",
     "",
     "Direct-to-consumer channels; farmers market + CSA models; produce retail fits",
     72, 999, "Check grants.gov for current FMPP cycle; strong produce retail fit",
     {}),

    ("S6", "scbgp@usda.gov", "USDA Specialty Crop Block Grant", "USDA AMS",
     "$50K-$250K", "National", "dormant",
     "State Dept of Ag application",
     "",
     "Specialty crops (produce!); aggregator + retail channel; Illinois DAVA route",
     80, 999, "Apply via Illinois Dept of Ag SCBGP office; produce focus is direct fit",
     {}),

    ("S6", "ssbci@illinois.gov", "SSBCI Illinois", "Illinois DCEO",
     "$25K-$250K", "Chicago", "dormant",
     "Illinois DCEO application",
     "",
     "Small biz credit initiative; equity component; SBA 7(a) already in place = synergy",
     70, 999, "DCEO application; coordinate with CFO on existing SBA interaction",
     {}),

    ("S6", "grants@kauffman.org", "Kauffman Foundation", "Kauffman Foundation",
     "$25K-$250K", "National", "dormant",
     "Open + RFP cycle application",
     "",
     "Entrepreneur grants; market innovation; food data + distribution thesis",
     68, 999, "Research current Kauffman RFP cycle; innovation + entrepreneurship framing",
     {}),

    ("S6", "grants@ffar.org", "FFAR Research Grants", "FFAR",
     "$100K-$1M", "National", "dormant",
     "Research-paired application",
     "",
     "Food + ag research; requires research partner; high potential but complex",
     60, 999, "Identify university research partner (U of Chicago, Northwestern) for joint application",
     {}),

    ("S6", "apply@backstagecapital.com", "Backstage Capital Grant", "Backstage Capital",
     "$25K-$100K", "National", "dormant",
     "Application",
     "",
     "Underrepresented founder grants; Black-led tech + food business fit",
     72, 999, "Direct application; Black-led + underrepresented founder narrative",
     {}),

    ("S6", "info@blackfoodfund.org", "Black Food Fund", "Black Food Fund",
     "$5K-$50K", "National", "dormant",
     "Application",
     "",
     "Black-owned food business; direct mission alignment; smaller check but fast",
     78, 999, "Apply now; Black-owned food business is exact target; fast decision cycle",
     {}),

    ("S6", "community@walmart.org", "Walmart.org Community Grants", "Walmart Foundation",
     "$25K-$250K", "National", "dormant",
     "Local community program application",
     "",
     "Community programs; food access; local economic development",
     62, 999, "Research current Walmart.org community grant cycle; food access + local jobs angle",
     {}),

    ("S6", "apply@ycombinator.com", "Y Combinator", "Y Combinator",
     "$500K+", "National", "dormant",
     "W/S batch application",
     "",
     "YC SAFE + network; long shot but highest-value accelerator; summer batch timing",
     58, 999, "Evaluate summer batch timing vs raise timeline; decide by end of April",
     {}),

    ("S6", "chicago@techstars.com", "Techstars Chicago", "Techstars",
     "$120K+", "Chicago", "dormant",
     "Accelerator application",
     "",
     "Chicago accelerator; $120K + network; retail + consumer track",
     68, 999, "Check Techstars Chicago cohort timeline; confirm current application cycle",
     {}),

    ("S6", "apply@goodfoodcatalyst.org", "Good Food Catalyst", "Good Food Catalyst (Chicago)",
     "$50K+", "Chicago", "dormant",
     "Application",
     "",
     "Chicago food catalyst; mentorship + capital; direct produce + food retail fit",
     80, 999, "Apply -- direct Chicago food business fit; confirm 2026 cohort window",
     {}),

    ("S6", "apply@chobaniincubator.com", "Chobani Incubator", "Chobani",
     "$25K-$150K", "National", "dormant",
     "Application",
     "",
     "Food incubator; mentorship + distribution; produce + healthy food adjacency",
     72, 999, "Apply -- food incubator with distribution angle; confirm cycle timing",
     {}),

    ("S6", "apply@foodsystem6.org", "Food System 6", "Food System 6",
     "$30K-$100K", "National", "dormant",
     "Application",
     "",
     "Food system accelerator; mentorship + capital; community food access focus",
     75, 999, "Apply -- direct food system mission alignment; confirm 2026 cohort",
     {}),

    ("S6", "apply@kroger.com", "Kroger + F3 Tech Accelerator", "Kroger",
     "$100K+", "National", "dormant",
     "Application",
     "",
     "Shelf path + $100K; food tech retail accelerator; highest strategic value in S6",
     82, 999, "Priority application -- Kroger shelf path directly advances BD strategy too",
     {}),

    ("S6", "apply@plugandplaytechcenter.com", "Plug and Play (Food)", "Plug and Play",
     "$50K-$250K", "National", "dormant",
     "Application",
     "",
     "Food + ag VC accelerator; rolling cohorts; produce + food tech fit",
     65, 999, "Rolling application -- submit when ready; no fixed deadline pressure",
     {}),

    ("S6", "takeoff@target.com", "Target Takeoff", "Target",
     "$0", "National", "dormant",
     "Application",
     "",
     "No capital but shelf path + credibility; coordinate with BD agent on timing",
     55, 999, "Coordinate with BD agent; shelf path more valuable than capital at this stage",
     {}),

    ("S6", "smallbiz@cityofchicago.org", "Chi Biz Hub", "City of Chicago",
     "$10K-$100K", "Chicago", "dormant",
     "Chicago small biz office application",
     "",
     "Chicago small biz grants + loans; local economic development; Black-owned",
     73, 999, "Direct application to Chicago SBIF program; confirm current cycle",
     {}),

    ("S6", "info@trendcorp.org", "Chicago TREND", "TREND Corp",
     "$25K-$100K", "Chicago", "dormant",
     "Direct",
     "",
     "Chicago equity + advisory; retail corridor focus; Black-led business support",
     76, 999, "Direct outreach to TREND Corp; Hyde Park retail corridor is direct fit",
     {}),

    ("S6", "grants@equityalliancechicago.org", "Equity Alliance Chicago", "Equity Alliance Chicago",
     "$5K-$50K", "Chicago", "dormant",
     "Application",
     "",
     "Racial equity grants; Chicago-only; smaller check but community signal",
     65, 999, "Application; racial equity + food access narrative; smaller check range",
     {}),

    ("S6", "vouchers@illinois.gov", "Illinois Innovation Voucher", "Illinois DCEO",
     "$20K-$75K", "Chicago", "dormant",
     "R&D match application via DCEO",
     "",
     "R&D matching grant; food data + analytics angle for Uncle May's platform",
     68, 999, "Apply with food data + analytics framing; R&D match for platform development",
     {}),

    ("S6", "apply@accion.org", "Accion Opportunity Fund", "Accion",
     "$5K-$250K", "National", "dormant",
     "Application",
     "",
     "CDFI loans + grants; community finance; customer acquisition signal",
     62, 999, "Application for CDFI loan component; community finance + customer signal",
     {}),

    ("S6", "chicago@kiva.org", "Kiva Chicago", "Kiva",
     "$5K-$15K", "Chicago", "dormant",
     "Application",
     "",
     "0% community loans; community signal + customer-as-investor narrative",
     55, 999, "Kiva application for community signal; coordinate with marketing on customer narrative",
     {}),

    ("S6", "usda.rural@il.usda.gov", "USDA Rural Business Development Grant", "USDA RD",
     "$50K-$500K", "National", "dormant",
     "RD state office application",
     "",
     "Rural dev grant; mixed eligibility fit (urban edge); worth exploring",
     50, 999, "Confirm eligibility for urban-edge food distribution model; apply if eligible",
     {}),

    ("S6", "terra@terraaccelerator.com", "Terra Food + Agtech", "Terra Accelerator",
     "$25K-$150K", "National", "dormant",
     "Application",
     "",
     "Food + agtech accelerator; rolling cohorts; produce + agtech adjacency",
     60, 999, "Rolling application; submit when Kroger + Good Food Catalyst are submitted",
     {}),

    ("S6", "info@newmarkets.iff.org", "IFF New Markets Tax Credit", "IFF",
     "$100K-$1M", "Chicago", "dormant",
     "Direct IFF application",
     "",
     "NMTC financing for commercial real estate; Hyde Park store directly eligible",
     79, 999, "Coordinate with CFO and real estate attorney; NMTC for Hyde Park location",
     {}),

    ("S6", "sbc504@sba.gov", "SBA 504 Program", "SBA",
     "$100K-$5M", "Chicago", "dormant",
     "Chicago CDC partners",
     "",
     "Real estate permanent financing; Hyde Park store post-build-out eligible",
     65, 999, "Coordinate with CFO; 504 loan for Hyde Park real estate post-SBA 7(a)",
     {}),

    ("S6", "apply@terraccelerator.com", "FFAR Early-Stage Agriculture Grant", "FFAR",
     "$50K-$500K", "National", "dormant",
     "Research-paired application",
     "",
     "Early-stage food + ag research; produce supply chain analytics eligible",
     58, 999, "Research partner required; identify U of Chicago or Northwestern partner",
     {}),
]


def slugify_email(email: str) -> str:
    return email.lower().replace("@", "-").replace(".", "-")


CONTACT_TEMPLATE = """\
---
email: {email}
name: {name}
firm: {firm}
segment: {segment}
check_range: "{check_range}"
geography: {geography}
first_touch: {first_touch}
last_touch: {last_touch}
status: {status}
owner: anthony@unclemays.com
linkedin_url:
phone:
{extra_fm}---

## Thread Summary
{summary}

## Last Signal
{last_signal}

## Pending Ask
{pending_ask}

## Objections Raised
- none recorded

## Thesis Fit Notes
{thesis_notes}

## Touch Log
| Date | Channel | Direction | Summary | Next step |
| ---- | ------- | --------- | ------- | --------- |
{touch_log}

## Next Action
{next_action}
"""


def build_contact_file(entry: tuple) -> tuple[str, str]:
    (segment, email, name, firm, check_range, geography, status,
     entry_path, warm_path, thesis_one_liner, score,
     days_since_touch, next_action, extra) = entry

    slug = slugify_email(email)
    path = os.path.join(CONTACTS_DIR, slug + ".md")

    first_touch = extra.get("first_touch", TODAY)
    last_touch = extra.get("last_touch", TODAY if status == "active" else "2026-04-19")
    summary = extra.get("summary", f"Seed contact from {segment} segment list. First contact not yet established." if days_since_touch == 999 else f"Active {segment} contact. Entry path: {entry_path}.")
    last_signal = extra.get("last_signal", "No prior thread signal. New contact." if days_since_touch == 999 else f"Entry path: {entry_path}.")
    pending_ask = extra.get("pending_ask", "Identify correct program contact and warm intro path." if days_since_touch == 999 else "Await reply.")

    thesis_notes = f"{thesis_one_liner}"
    if extra.get("pri_mri"):
        thesis_notes += f"\nVehicle: {extra['pri_mri']}"

    touch_log = "| -- | -- | -- | No touch yet | " + next_action if days_since_touch == 999 else f"| 2026-04-{21 - days_since_touch if days_since_touch < 21 else '04'} | email | out | Initial outreach | Await reply |"

    # Build extra frontmatter lines
    extra_fm_lines = []
    if segment == "S4":
        wp = extra.get("warm_path", warm_path)
        extra_fm_lines.append(f"warm_path: {wp}")
    if extra.get("pri_mri"):
        extra_fm_lines.append(f"pri_mri: {extra['pri_mri']}")
    extra_fm_str = "\n".join(extra_fm_lines) + "\n" if extra_fm_lines else ""

    content = CONTACT_TEMPLATE.format(
        email=email, name=name, firm=firm, segment=segment,
        check_range=check_range, geography=geography,
        first_touch=first_touch, last_touch=last_touch,
        status=status, extra_fm=extra_fm_str,
        summary=summary, last_signal=last_signal,
        pending_ask=pending_ask, thesis_notes=thesis_notes,
        touch_log=touch_log, next_action=next_action,
    )
    return path, content


def build_activation_queue() -> list[dict]:
    rows = []
    for entry in CONTACTS:
        (segment, email, name, firm, check_range, geography, status,
         entry_path, warm_path, thesis_one_liner, score,
         days_since_touch, next_action, extra) = entry
        if status in ("passed", "do-not-contact"):
            continue
        rows.append({
            "segment": segment,
            "email": email,
            "name": name,
            "firm": firm,
            "score": score,
            "check_range": check_range,
            "geography": geography,
            "entry_path": entry_path,
            "warm_path": warm_path,
            "thesis_one_liner": thesis_one_liner,
            "days_since_touch": days_since_touch,
            "next_action": next_action,
        })
    # Sort by score desc, then days_since_touch asc (dormant first if tied)
    rows.sort(key=lambda r: (-r["score"], r["days_since_touch"]))
    return rows


def main() -> int:
    os.makedirs(CONTACTS_DIR, exist_ok=True)

    created = 0
    skipped = 0
    for entry in CONTACTS:
        path, content = build_contact_file(entry)
        if os.path.exists(path):
            skipped += 1
            continue
        with open(path, "w", encoding="utf-8") as f:
            f.write(content)
        created += 1

    print(f"contact files: {created} created, {skipped} skipped (already existed)")

    rows = build_activation_queue()
    queue_path = os.path.join(SEGMENTS_DIR, "activation-queue.csv")
    fieldnames = ["segment", "email", "name", "firm", "score", "check_range",
                  "geography", "entry_path", "warm_path", "thesis_one_liner",
                  "days_since_touch", "next_action"]
    with open(queue_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)

    print(f"activation-queue.csv: {len(rows)} rows written to {queue_path}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
