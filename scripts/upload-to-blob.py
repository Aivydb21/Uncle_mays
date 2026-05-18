"""
Upload a local file to Vercel Blob and print the public HTTPS URL. Use this to
stage images and videos before calling post-to-instagram.py (Instagram requires
a publicly-reachable URL, not a binary upload).

Usage:
    py scripts/upload-to-blob.py path/to/image.jpg
    py scripts/upload-to-blob.py path/to/image.jpg --pathname social/2026-05-18/promo.jpg
    py scripts/upload-to-blob.py path/to/video.mp4 --pathname social/reels/may-promo.mp4

Setup (one-time):
    1. Create a Blob store at https://vercel.com/dashboard -> Storage -> Create -> Blob
    2. Connect it to the "uncle-mays" project
    3. Copy BLOB_READ_WRITE_TOKEN from the store's settings
    4. Add to .env:  BLOB_READ_WRITE_TOKEN=vercel_blob_rw_...
"""

import argparse
import json
import mimetypes
import os
import sys
import urllib.parse
import urllib.request
import urllib.error

ENV_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".env")


def load_token():
    if os.environ.get("BLOB_READ_WRITE_TOKEN"):
        return os.environ["BLOB_READ_WRITE_TOKEN"]
    if not os.path.exists(ENV_PATH):
        print(f"BLOB_READ_WRITE_TOKEN not set and {ENV_PATH} not found.", file=sys.stderr)
        sys.exit(1)
    with open(ENV_PATH) as f:
        for line in f:
            line = line.strip()
            if line.startswith("BLOB_READ_WRITE_TOKEN="):
                return line.split("=", 1)[1].strip().strip('"').strip("'")
    print("BLOB_READ_WRITE_TOKEN not found in environment or .env file.", file=sys.stderr)
    print("Set it up at https://vercel.com/dashboard -> Storage -> Create -> Blob.", file=sys.stderr)
    sys.exit(1)


def upload(file_path, pathname, token):
    if not os.path.exists(file_path):
        print(f"File not found: {file_path}", file=sys.stderr)
        sys.exit(1)

    content_type = mimetypes.guess_type(file_path)[0] or "application/octet-stream"

    with open(file_path, "rb") as f:
        data = f.read()

    encoded_pathname = urllib.parse.quote(pathname, safe="/")
    url = f"https://blob.vercel-storage.com/{encoded_pathname}"

    req = urllib.request.Request(
        url,
        data=data,
        method="PUT",
        headers={
            "Authorization": f"Bearer {token}",
            "x-content-type": content_type,
            "x-api-version": "7",
            "x-add-random-suffix": "0",
            "x-access": "public",
            "Content-Type": content_type,
        },
    )

    try:
        with urllib.request.urlopen(req, timeout=120) as resp:
            result = json.loads(resp.read().decode("utf-8"))
            return result
    except urllib.error.HTTPError as e:
        print(f"HTTP {e.code}: {e.read().decode('utf-8', errors='replace')}", file=sys.stderr)
        sys.exit(1)


def main():
    p = argparse.ArgumentParser()
    p.add_argument("file", help="Local file path to upload")
    p.add_argument("--pathname", help="Blob pathname (default: basename of file)")
    args = p.parse_args()

    pathname = args.pathname or os.path.basename(args.file)
    token = load_token()

    print(f"Uploading {args.file} -> {pathname}...")
    result = upload(args.file, pathname, token)

    public_url = result.get("url") or result.get("downloadUrl")
    print()
    print("=" * 70)
    print("UPLOADED")
    print("=" * 70)
    print(f"URL: {public_url}")
    print()
    print("Use this URL in post-to-instagram.py:")
    print(f"  py scripts/post-to-instagram.py --image-url {public_url} --caption \"...\"")


if __name__ == "__main__":
    main()
