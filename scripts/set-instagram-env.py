"""
Push Instagram + Facebook env vars to Vercel (Production + Preview).
Prints the values to paste into the Trigger.dev dashboard env vars.

Pulls live values from ~/.claude/instagram-config.json and ~/.claude/meta-config.json
so this can be re-run after every monthly token rotation.

Usage:
    py scripts/set-instagram-env.py              # writes to Vercel, prints Trigger.dev values
    py scripts/set-instagram-env.py --print-only # prints all values, writes nothing
"""

import argparse
import json
import os
import shutil
import subprocess
import sys

VERCEL_BIN = shutil.which("vercel") or shutil.which("vercel.cmd") or "vercel"

IG_CONFIG = os.path.expanduser("~/.claude/instagram-config.json")
META_CONFIG = os.path.expanduser("~/.claude/meta-config.json")

VARS = [
    ("INSTAGRAM_ACCESS_TOKEN", "ig", "access_token"),
    ("INSTAGRAM_USER_ID", "ig", "ig_user_id"),
    ("INSTAGRAM_APP_ID", "ig", "app_id"),
    ("INSTAGRAM_APP_SECRET", "ig", "app_secret"),
    ("FACEBOOK_PAGE_ID", "meta", "page_id"),
    ("FACEBOOK_PAGE_ACCESS_TOKEN", "meta", "page_access_token"),
]


def load_configs():
    if not os.path.exists(IG_CONFIG):
        print(f"Missing {IG_CONFIG}", file=sys.stderr)
        sys.exit(1)
    if not os.path.exists(META_CONFIG):
        print(f"Missing {META_CONFIG}", file=sys.stderr)
        sys.exit(1)
    with open(IG_CONFIG) as f:
        ig = json.load(f)
    with open(META_CONFIG) as f:
        meta = json.load(f)
    return ig, meta


def collect_values(ig, meta):
    values = {}
    for name, source, key in VARS:
        cfg = ig if source == "ig" else meta
        if key not in cfg:
            print(f"WARNING: {key} not in {source} config; skipping {name}", file=sys.stderr)
            continue
        values[name] = cfg[key]
    return values


def vercel_set(name, value, env):
    """Set a Vercel env var via the CLI. Uses stdin to avoid newline-bake.

    `echo` appends a trailing newline that breaks NEXT_PUBLIC_* SDKs (LogRocket
    incident 2026-05-15). We pass the value through stdin with no terminator.
    """
    try:
        subprocess.run(
            [VERCEL_BIN, "env", "rm", name, env, "--yes"],
            capture_output=True,
            text=True,
            timeout=30,
        )
    except Exception:
        pass

    result = subprocess.run(
        [VERCEL_BIN, "env", "add", name, env],
        input=value,
        capture_output=True,
        text=True,
        timeout=30,
    )
    if result.returncode != 0:
        print(f"  FAILED {name} ({env}): {result.stderr.strip()}", file=sys.stderr)
        return False
    return True


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--print-only", action="store_true", help="Print values, do not write to Vercel")
    args = p.parse_args()

    ig, meta = load_configs()
    values = collect_values(ig, meta)

    if not args.print_only:
        print("=== Writing to Vercel (uncle-mays project, Production + Preview) ===")
        for env in ("production", "preview"):
            print(f"  [{env}]")
            for name, value in values.items():
                ok = vercel_set(name, value, env)
                print(f"    {'OK' if ok else 'FAIL'}  {name}")
        print()

    print("=== Paste into Trigger.dev dashboard env vars ===")
    print("    https://cloud.trigger.dev/  ->  uncle-mays project  ->  Environment Variables  ->  Production")
    print()
    for name, value in values.items():
        print(f"  {name}={value}")
    print()
    print("After Trigger.dev env vars are set, redeploy:")
    print("    npx trigger.dev@latest deploy")


if __name__ == "__main__":
    main()
