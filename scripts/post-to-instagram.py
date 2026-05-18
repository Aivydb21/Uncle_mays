"""
Post to @unclemaysproduce on Instagram via the Instagram API with Instagram Login.

Usage:
    py scripts/post-to-instagram.py --image-url https://... --caption "..."
    py scripts/post-to-instagram.py --carousel url1 url2 url3 --caption "..."
    py scripts/post-to-instagram.py --reel-url https://...mp4 --caption "..."
    py scripts/post-to-instagram.py --refresh-token           # extend token 60d
    py scripts/post-to-instagram.py --whoami                  # verify token

Requires:
    ~/.claude/instagram-config.json with access_token, ig_user_id, app_secret.

Image / video must be at a public HTTPS URL. Instagram's servers pull the media;
this script does NOT upload binary. Use Vercel Blob or any HTTPS host.
"""

import argparse
import json
import os
import sys
import time
import urllib.parse
import urllib.request
import urllib.error

CONFIG_PATH = os.path.expanduser("~/.claude/instagram-config.json")
META_CONFIG_PATH = os.path.expanduser("~/.claude/meta-config.json")


def load_config():
    with open(CONFIG_PATH) as f:
        return json.load(f)


def save_config(cfg):
    with open(CONFIG_PATH, "w") as f:
        json.dump(cfg, f, indent=2)


def api_get(path, params, base_url):
    qs = urllib.parse.urlencode(params)
    url = f"{base_url}{path}?{qs}"
    req = urllib.request.Request(url, headers={"User-Agent": "curl/8.0"})
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        print(f"HTTP {e.code}: {e.read().decode('utf-8', errors='replace')}", file=sys.stderr)
        sys.exit(1)


def api_post(path, params, base_url):
    qs = urllib.parse.urlencode(params).encode("utf-8")
    url = f"{base_url}{path}"
    req = urllib.request.Request(url, data=qs, headers={"User-Agent": "curl/8.0"}, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        print(f"HTTP {e.code}: {e.read().decode('utf-8', errors='replace')}", file=sys.stderr)
        sys.exit(1)


def whoami(cfg):
    base = cfg["api"]["base_url"]
    result = api_get("/me", {"fields": "id,username,account_type,user_id", "access_token": cfg["access_token"]}, base)
    print(json.dumps(result, indent=2))


def refresh_token(cfg):
    base = cfg["api"]["base_url"].rsplit("/v", 1)[0]  # /refresh_access_token is not versioned
    result = api_get("/refresh_access_token", {"grant_type": "ig_refresh_token", "access_token": cfg["access_token"]}, base)
    cfg["access_token"] = result["access_token"]
    cfg["token_issued_at"] = time.strftime("%Y-%m-%d")
    cfg["token_expires_at"] = time.strftime("%Y-%m-%d", time.localtime(time.time() + int(result["expires_in"])))
    save_config(cfg)
    print(f"Token refreshed. Expires {cfg['token_expires_at']} ({result['expires_in']} seconds).")


def wait_for_container_ready(container_id, cfg, max_wait=120):
    base = cfg["api"]["base_url"]
    for i in range(max_wait // 3):
        result = api_get(f"/{container_id}", {"fields": "status_code,status", "access_token": cfg["access_token"]}, base)
        status = result.get("status_code", "UNKNOWN")
        if status == "FINISHED":
            return
        if status in ("ERROR", "EXPIRED"):
            print(f"Container failed: {result}", file=sys.stderr)
            sys.exit(1)
        print(f"  container status: {status} (poll {i+1})")
        time.sleep(3)
    print("Timed out waiting for container readiness.", file=sys.stderr)
    sys.exit(1)


def post_single_image(image_url, caption, cfg):
    base = cfg["api"]["base_url"]
    ig_user = cfg["ig_user_id"]

    print(f"Creating image container for {image_url}...")
    container = api_post(f"/{ig_user}/media", {"image_url": image_url, "caption": caption, "access_token": cfg["access_token"]}, base)
    container_id = container["id"]
    print(f"Container ID: {container_id}")

    wait_for_container_ready(container_id, cfg)

    print("Publishing...")
    result = api_post(f"/{ig_user}/media_publish", {"creation_id": container_id, "access_token": cfg["access_token"]}, base)
    print(f"PUBLISHED to Instagram. Media ID: {result['id']}")
    return result["id"]


def post_to_facebook_page(image_url, caption):
    if not os.path.exists(META_CONFIG_PATH):
        print(f"Meta config not found at {META_CONFIG_PATH}; skipping FB cross-post.", file=sys.stderr)
        return None
    with open(META_CONFIG_PATH) as f:
        meta = json.load(f)
    page_id = meta.get("page_id")
    page_token = meta.get("page_access_token")
    if not page_id or not page_token:
        print("meta-config.json missing page_id or page_access_token; skipping FB cross-post.", file=sys.stderr)
        return None
    print(f"Cross-posting to Facebook page {page_id}...")
    result = api_post(f"/{page_id}/photos", {"url": image_url, "caption": caption, "access_token": page_token}, "https://graph.facebook.com/v21.0")
    post_id = result.get("post_id") or result.get("id")
    print(f"PUBLISHED to Facebook. Post ID: {post_id}")
    return post_id


def post_carousel(image_urls, caption, cfg):
    base = cfg["api"]["base_url"]
    ig_user = cfg["ig_user_id"]

    child_ids = []
    for i, url in enumerate(image_urls):
        print(f"Creating carousel item {i+1}/{len(image_urls)}: {url}")
        item = api_post(f"/{ig_user}/media", {"image_url": url, "is_carousel_item": "true", "access_token": cfg["access_token"]}, base)
        child_ids.append(item["id"])
        wait_for_container_ready(item["id"], cfg)

    print("Creating carousel container...")
    container = api_post(f"/{ig_user}/media", {"media_type": "CAROUSEL", "children": ",".join(child_ids), "caption": caption, "access_token": cfg["access_token"]}, base)
    wait_for_container_ready(container["id"], cfg)

    print("Publishing carousel...")
    result = api_post(f"/{ig_user}/media_publish", {"creation_id": container["id"], "access_token": cfg["access_token"]}, base)
    print(f"PUBLISHED. Media ID: {result['id']}")


def post_reel(video_url, caption, cfg):
    base = cfg["api"]["base_url"]
    ig_user = cfg["ig_user_id"]

    print(f"Creating reel container for {video_url}...")
    container = api_post(f"/{ig_user}/media", {"media_type": "REELS", "video_url": video_url, "caption": caption, "access_token": cfg["access_token"]}, base)
    wait_for_container_ready(container["id"], cfg, max_wait=300)

    print("Publishing reel...")
    result = api_post(f"/{ig_user}/media_publish", {"creation_id": container["id"], "access_token": cfg["access_token"]}, base)
    print(f"PUBLISHED. Media ID: {result['id']}")


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--whoami", action="store_true")
    p.add_argument("--refresh-token", action="store_true")
    p.add_argument("--image-url")
    p.add_argument("--carousel", nargs="+")
    p.add_argument("--reel-url")
    p.add_argument("--caption", default="")
    p.add_argument("--also-facebook", action="store_true", help="Cross-post image + caption to Facebook page after IG publish")
    args = p.parse_args()

    cfg = load_config()

    if args.whoami:
        whoami(cfg)
    elif args.refresh_token:
        refresh_token(cfg)
    elif args.image_url:
        post_single_image(args.image_url, args.caption, cfg)
        if args.also_facebook:
            post_to_facebook_page(args.image_url, args.caption)
    elif args.carousel:
        post_carousel(args.carousel, args.caption, cfg)
        if args.also_facebook:
            print("Note: --also-facebook with --carousel posts only the first image to Facebook.")
            post_to_facebook_page(args.carousel[0], args.caption)
    elif args.reel_url:
        post_reel(args.reel_url, args.caption, cfg)
        if args.also_facebook:
            print("Note: --also-facebook does not support reels; skipping FB cross-post.")
    else:
        p.print_help()
        sys.exit(1)


if __name__ == "__main__":
    main()
