#!/usr/bin/env python3
"""
DocuSign JWT Grant auth helper for Uncle May's.

Reads ~/.claude/docusign-config.json, signs a JWT assertion with the RSA
private key, exchanges it for an access token, and (with --userinfo) looks up
the account id and REST base URI and writes them back to the config.

Usage:
  python ds_token.py                 # print an access token
  python ds_token.py --userinfo      # token + account id + base uri (writes to config)
  python ds_token.py --consent-url   # print the consent URL to grant in a browser
"""
import json
import os
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

try:
    import jwt  # PyJWT
except ImportError:
    sys.exit("PyJWT not installed. Run: py -m pip install 'pyjwt[crypto]'")

CONFIG_PATH = os.path.expanduser("~/.claude/docusign-config.json")


def load_config():
    with open(CONFIG_PATH) as f:
        return json.load(f)


def consent_url(cfg):
    params = {
        "response_type": "code",
        "scope": cfg.get("scopes", "signature impersonation"),
        "client_id": cfg["integration_key"],
        "redirect_uri": cfg.get("redirect_uri", "http://localhost"),
    }
    return f"https://{cfg['auth_server']}/oauth/auth?" + urllib.parse.urlencode(params)


def get_token(cfg):
    key_path = os.path.expanduser(cfg["private_key_path"])
    with open(key_path, "rb") as f:
        private_key = f.read()
    now = int(time.time())
    payload = {
        "iss": cfg["integration_key"],
        "sub": cfg["user_id"],
        "aud": cfg["auth_server"],
        "iat": now,
        "exp": now + 3600,
        "scope": cfg.get("scopes", "signature impersonation"),
    }
    assertion = jwt.encode(payload, private_key, algorithm="RS256")
    data = urllib.parse.urlencode(
        {
            "grant_type": "urn:ietf:params:oauth:grant-type:jwt-bearer",
            "assertion": assertion,
        }
    ).encode()
    url = f"https://{cfg['auth_server']}/oauth/token"
    req = urllib.request.Request(
        url,
        data=data,
        headers={
            "Content-Type": "application/x-www-form-urlencoded",
            "User-Agent": "curl/8.0",
        },
    )
    try:
        with urllib.request.urlopen(req) as resp:
            return json.load(resp)["access_token"]
    except urllib.error.HTTPError as e:
        body = e.read().decode()
        if "consent_required" in body:
            print("\nConsent required. Open this URL in a browser, sign in, click Accept:\n")
            print(consent_url(cfg) + "\n")
        sys.exit(f"Token request failed ({e.code}): {body}")


def userinfo(cfg, token):
    url = f"https://{cfg['auth_server']}/oauth/userinfo"
    req = urllib.request.Request(
        url, headers={"Authorization": f"Bearer {token}", "User-Agent": "curl/8.0"}
    )
    with urllib.request.urlopen(req) as resp:
        return json.load(resp)


def main():
    cfg = load_config()
    if "--consent-url" in sys.argv:
        print(consent_url(cfg))
        return
    token = get_token(cfg)
    if "--userinfo" in sys.argv:
        info = userinfo(cfg, token)
        accounts = info.get("accounts", [])
        default = next(
            (a for a in accounts if a.get("is_default")),
            accounts[0] if accounts else None,
        )
        print("Access token acquired.")
        print(f"Name: {info.get('name')}  Email: {info.get('email')}")
        if default:
            cfg["account_id"] = default["account_id"]
            cfg["base_uri"] = default["base_uri"] + "/restapi"
            with open(CONFIG_PATH, "w") as f:
                json.dump(cfg, f, indent=2)
            print(f"Account: {default.get('account_name')}  ID: {cfg['account_id']}")
            print(f"Base URI: {cfg['base_uri']}")
            print(f"Wrote account_id and base_uri to {CONFIG_PATH}")
    else:
        print(token)


if __name__ == "__main__":
    main()
