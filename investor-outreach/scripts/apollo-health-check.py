#!/usr/bin/env python3
"""
Apollo Infrastructure Health Check

Monitors Apollo email accounts and campaigns for OAuth failures,
unlinking, and delivery problems. Use for daily monitoring or
post-rebuild validation.

Usage:
  python3 apollo-health-check.py                # Quick status
  python3 apollo-health-check.py --detailed     # Full account details
  python3 apollo-health-check.py --campaigns    # Campaign linking status
  python3 apollo-health-check.py --daily-report # Full daily report

Exit codes:
  0 = All healthy
  1 = Warnings found (degraded but functional)
  2 = Critical failures (system non-functional)

Author: CIO
Issue: UNC-243
"""

import json
import urllib.request
import os
import sys
import io
from datetime import datetime, timedelta
from typing import Dict, List, Tuple

# Fix Windows console encoding for emojis
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# Load Apollo config
CONFIG_PATH = os.path.expanduser('~/.claude/apollo-config.json')
config = json.load(open(CONFIG_PATH))
APOLLO_KEY = config['api_key']
APOLLO_URL = config['base_url']

# Campaign IDs and names
CAMPAIGNS = [
    ('69d2a0b2c2e0c6000d1608d4', 'Tier 1 - Thesis Aligned', 'anthony@unclemays.com'),
    ('69d7dc2bf18bda002233eb04', 'Tier 2A - Warm Investors (Denise)', 'denise@unclemays.com'),
    ('69d7dc492a222a0019913520', 'Tier 2B - Warm Investors (Rosalind)', 'rosalind@unclemays.com'),
    ('69d7dc68457595000d6b285d', 'Tier 2C - Warm Investors (Invest)', 'invest@unclemays.com'),
    ('69d7dc86cfcc9800152117b7', 'Tier 2D - Warm Investors (TimJ)', 'timj@unclemays.com'),
    ('69d9670d516fcc0011c0ee34', 'CRE & HNW v2', 'investmentrelations@unclemays.com'),
]

EXPECTED_ACCOUNTS = [
    'anthony@unclemays.com',
    'rosalind@unclemays.com',
    'denise@unclemays.com',
    'invest@unclemays.com',
    'timj@unclemays.com',
    'investmentrelations@unclemays.com',
]


def apollo_get(endpoint: str) -> Dict:
    """Make GET request to Apollo API."""
    req = urllib.request.Request(
        f'{APOLLO_URL}/{endpoint}',
        headers={
            'X-Api-Key': APOLLO_KEY,
            'User-Agent': 'curl/8.0'  # Required to avoid Cloudflare 403
        }
    )
    try:
        resp = urllib.request.urlopen(req, timeout=30)
        return json.loads(resp.read())
    except urllib.error.HTTPError as e:
        print(f"❌ API Error: {e.code} {e.reason}")
        sys.exit(2)
    except Exception as e:
        print(f"❌ Request failed: {str(e)}")
        sys.exit(2)


def get_email_accounts() -> List[Dict]:
    """Fetch all email accounts."""
    data = apollo_get('email_accounts')
    return data.get('email_accounts', [])


def get_campaign(campaign_id: str) -> Dict:
    """Fetch single campaign details."""
    data = apollo_get(f'emailer_campaigns/{campaign_id}')
    return data.get('emailer_campaign', {})


def check_account_health(account: Dict) -> Tuple[str, List[str]]:
    """
    Check single account health.
    Returns: (status, [issues])
    Status: 'healthy', 'warning', 'critical'
    """
    issues = []
    email = account.get('email', 'unknown')

    # Check daily limit
    daily_limit = account.get('daily_email_sending_limit', 0)
    if daily_limit == 0:
        issues.append(f"Daily limit is 0 (cannot send)")
        status = 'critical'
    elif daily_limit < 10:
        issues.append(f"Daily limit very low ({daily_limit})")
        status = 'warning'
    else:
        status = 'healthy'

    # Check OAuth revocation
    revoked_at = account.get('revoked_at')
    if revoked_at:
        revoked_date = datetime.fromisoformat(revoked_at.replace('Z', '+00:00'))
        hours_since_revoke = (datetime.now(revoked_date.tzinfo) - revoked_date).total_seconds() / 3600

        if hours_since_revoke < 24:
            issues.append(f"OAuth revoked {hours_since_revoke:.1f}h ago")
            status = 'critical'
        elif hours_since_revoke < 168:  # 7 days
            issues.append(f"OAuth revoked {hours_since_revoke/24:.1f}d ago")
            if status != 'critical':
                status = 'warning'

    # Check active status
    if not account.get('active', False):
        issues.append("Account inactive")
        status = 'critical'

    return (status, issues)


def check_campaign_health(campaign: Dict, expected_email: str) -> Tuple[str, List[str]]:
    """
    Check single campaign health.
    Returns: (status, [issues])
    """
    issues = []

    # Check if campaign is active
    if not campaign.get('active', False):
        issues.append("Campaign inactive")
        status = 'warning'
    else:
        status = 'healthy'

    # Check email account linking
    email_account = campaign.get('emailer_campaign_email_account', {})
    if not email_account:
        issues.append("NO ACCOUNT LINKED")
        status = 'critical'
    elif email_account.get('email') != expected_email:
        actual = email_account.get('email', 'unknown')
        issues.append(f"Wrong account: {actual} (expected {expected_email})")
        status = 'warning'

    # Check scheduling
    num_scheduled = campaign.get('num_scheduled_contacts', 0)
    num_contacted = campaign.get('num_contacted', 0)

    if num_scheduled == 0 and num_contacted == 0:
        issues.append("No contacts scheduled or sent")
        if status != 'critical':
            status = 'warning'

    return (status, issues)


def print_accounts_detailed(accounts: List[Dict]):
    """Print detailed account status."""
    print("\n📧 Email Account Status")
    print("=" * 80)

    critical_count = 0
    warning_count = 0

    for acc in accounts:
        email = acc.get('email', 'unknown')
        if email not in EXPECTED_ACCOUNTS:
            continue

        status, issues = check_account_health(acc)

        # Status emoji
        if status == 'healthy':
            emoji = "✅"
        elif status == 'warning':
            emoji = "⚠️"
            warning_count += 1
        else:
            emoji = "❌"
            critical_count += 1

        print(f"\n{emoji} {email}")
        print(f"   Active: {acc.get('active', False)}")
        print(f"   Daily limit: {acc.get('daily_email_sending_limit', 0)}")
        print(f"   Revoked at: {acc.get('revoked_at', 'Never')}")

        if issues:
            print(f"   Issues:")
            for issue in issues:
                print(f"     - {issue}")

    print(f"\n{'=' * 80}")
    print(f"Accounts: {len([a for a in accounts if a.get('email') in EXPECTED_ACCOUNTS])}/6 found")
    print(f"Status: {critical_count} critical, {warning_count} warnings")

    return critical_count, warning_count


def print_campaigns_status(campaigns_data: List[Tuple]):
    """Print campaign linking and delivery status."""
    print("\n📨 Campaign Status")
    print("=" * 80)

    critical_count = 0
    warning_count = 0

    for campaign_id, name, expected_email in campaigns_data:
        try:
            campaign = get_campaign(campaign_id)
            status, issues = check_campaign_health(campaign, expected_email)

            if status == 'healthy':
                emoji = "✅"
            elif status == 'warning':
                emoji = "⚠️"
                warning_count += 1
            else:
                emoji = "❌"
                critical_count += 1

            print(f"\n{emoji} {name}")
            print(f"   ID: {campaign_id}")
            print(f"   Active: {campaign.get('active', False)}")

            email_account = campaign.get('emailer_campaign_email_account', {})
            if email_account:
                print(f"   Email: {email_account.get('email', 'None')}")
            else:
                print(f"   Email: NO ACCOUNT LINKED")

            print(f"   Contacted: {campaign.get('num_contacted', 0)}")
            print(f"   Scheduled: {campaign.get('num_scheduled_contacts', 0)}")

            if issues:
                print(f"   Issues:")
                for issue in issues:
                    print(f"     - {issue}")

        except Exception as e:
            print(f"\n❌ {name}")
            print(f"   Error: {str(e)}")
            critical_count += 1

    print(f"\n{'=' * 80}")
    print(f"Campaigns: {len(campaigns_data)} checked")
    print(f"Status: {critical_count} critical, {warning_count} warnings")

    return critical_count, warning_count


def print_quick_status(accounts: List[Dict]):
    """Print quick one-line status summary."""
    healthy = 0
    warning = 0
    critical = 0

    for acc in accounts:
        if acc.get('email') not in EXPECTED_ACCOUNTS:
            continue

        status, _ = check_account_health(acc)
        if status == 'healthy':
            healthy += 1
        elif status == 'warning':
            warning += 1
        else:
            critical += 1

    total = len([a for a in accounts if a.get('email') in EXPECTED_ACCOUNTS])

    if critical > 0:
        emoji = "❌"
        msg = "CRITICAL FAILURES"
    elif warning > 0:
        emoji = "⚠️"
        msg = "WARNINGS"
    else:
        emoji = "✅"
        msg = "ALL HEALTHY"

    print(f"\n{emoji} Apollo Health: {msg}")
    print(f"   Accounts: {healthy} healthy, {warning} warnings, {critical} critical (of {total})")

    return critical, warning


def daily_report():
    """Generate full daily health report."""
    print(f"\n{'=' * 80}")
    print(f"Apollo Infrastructure Health Report")
    print(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"{'=' * 80}")

    accounts = get_email_accounts()

    # Accounts
    acct_critical, acct_warning = print_accounts_detailed(accounts)

    # Campaigns
    camp_critical, camp_warning = print_campaigns_status(CAMPAIGNS)

    # Overall summary
    print(f"\n{'=' * 80}")
    print(f"OVERALL SUMMARY")
    print(f"{'=' * 80}")

    total_critical = acct_critical + camp_critical
    total_warning = acct_warning + camp_warning

    if total_critical > 0:
        print(f"❌ CRITICAL: {total_critical} critical issues found")
        print(f"   System is NON-FUNCTIONAL. Apollo cannot send emails.")
        exit_code = 2
    elif total_warning > 0:
        print(f"⚠️  WARNING: {total_warning} warnings found")
        print(f"   System is DEGRADED. Some functionality may be impaired.")
        exit_code = 1
    else:
        print(f"✅ ALL HEALTHY")
        print(f"   System is OPERATIONAL. All accounts and campaigns functioning.")
        exit_code = 0

    print(f"\nExit code: {exit_code}")
    return exit_code


def main():
    """Main entry point."""
    args = sys.argv[1:]

    if '--daily-report' in args:
        sys.exit(daily_report())

    # Fetch accounts
    accounts = get_email_accounts()

    if '--detailed' in args:
        critical, warning = print_accounts_detailed(accounts)
        sys.exit(2 if critical > 0 else (1 if warning > 0 else 0))

    elif '--campaigns' in args:
        critical, warning = print_campaigns_status(CAMPAIGNS)
        sys.exit(2 if critical > 0 else (1 if warning > 0 else 0))

    else:
        # Quick status (default)
        critical, warning = print_quick_status(accounts)
        sys.exit(2 if critical > 0 else (1 if warning > 0 else 0))


if __name__ == '__main__':
    main()
