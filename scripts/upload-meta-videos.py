#!/usr/bin/env python3
"""
Upload video assets to Meta ad sets
Attempts upload even if videos exceed 4MB limit (Meta may accept up to ~10MB in practice)
"""

import json
import os
import sys
import urllib.request
import urllib.parse
from pathlib import Path

# Load Meta config
config_path = os.path.expanduser("~/.claude/meta-config.json")
with open(config_path) as f:
    config = json.load(f)

ACCESS_TOKEN = config["access_token"]
AD_ACCOUNT_ID = config["ad_account_id"]
BASE_URL = "https://graph.facebook.com/v21.0"

# Video files
VIDEO_DIR = Path("C:/Users/Anthony/Desktop/business/ad-exports/subscription-launch-apr17/video-ads/final-renders/meta")
VIDEOS = [
    VIDEO_DIR / "smaller a.mp4",
    VIDEO_DIR / "smaller b video.mp4"
]

# Ad sets to upload to
AD_SETS = {
    "Instagram Feed": "120243219914430762",
    "Instagram Stories": "120243219918030762",
    "Facebook Feed": "120243219919870762"
}

def upload_video(video_path):
    """Upload video to Meta and return video ID"""
    print(f"\nUploading {video_path.name}...")

    # Check file size
    size_mb = video_path.stat().st_size / (1024 * 1024)
    print(f"  Size: {size_mb:.1f}MB")

    if size_mb > 4:
        print(f"  WARNING: Exceeds 4MB limit, attempting anyway...")

    # Step 1: Initialize upload session
    url = f"{BASE_URL}/{AD_ACCOUNT_ID}/advideos"

    params = {
        "access_token": ACCESS_TOKEN,
        "upload_phase": "start",
        "file_size": video_path.stat().st_size
    }

    req = urllib.request.Request(
        f"{url}?{urllib.parse.urlencode(params)}",
        method="POST"
    )

    try:
        with urllib.request.urlopen(req) as response:
            result = json.loads(response.read().decode())
            upload_session_id = result.get("upload_session_id")
            video_id = result.get("video_id")
            print(f"  Upload session: {upload_session_id}")
            print(f"  Video ID: {video_id}")
    except urllib.error.HTTPError as e:
        error_body = e.read().decode()
        print(f"  ERROR initializing upload: {e.code}")
        print(f"  {error_body}")
        return None

    # Step 2: Upload video file
    print(f"  Uploading file...")

    with open(video_path, 'rb') as video_file:
        video_data = video_file.read()

    params = {
        "access_token": ACCESS_TOKEN,
        "upload_phase": "transfer",
        "upload_session_id": upload_session_id,
        "start_offset": 0,
        "video_file_chunk": video_data
    }

    # For file upload, we need multipart/form-data
    # Using requests library would be cleaner, but sticking with urllib
    boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW'
    body = []

    # Add regular params
    for key, value in params.items():
        if key != 'video_file_chunk':
            body.append(f'--{boundary}'.encode())
            body.append(f'Content-Disposition: form-data; name="{key}"'.encode())
            body.append(b'')
            body.append(str(value).encode())

    # Add video file
    body.append(f'--{boundary}'.encode())
    body.append(f'Content-Disposition: form-data; name="video_file_chunk"; filename="{video_path.name}"'.encode())
    body.append(b'Content-Type: video/mp4')
    body.append(b'')
    body.append(video_data)
    body.append(f'--{boundary}--'.encode())
    body.append(b'')

    body_bytes = b'\r\n'.join(body)

    req = urllib.request.Request(
        url,
        data=body_bytes,
        headers={
            'Content-Type': f'multipart/form-data; boundary={boundary}',
            'Content-Length': str(len(body_bytes))
        },
        method="POST"
    )

    try:
        with urllib.request.urlopen(req) as response:
            result = json.loads(response.read().decode())
            print(f"  Upload successful!")
    except urllib.error.HTTPError as e:
        error_body = e.read().decode()
        print(f"  ERROR uploading file: {e.code}")
        print(f"  {error_body}")
        return None

    # Step 3: Finalize upload
    print(f"  Finalizing...")

    params = {
        "access_token": ACCESS_TOKEN,
        "upload_phase": "finish",
        "upload_session_id": upload_session_id
    }

    req = urllib.request.Request(
        f"{url}?{urllib.parse.urlencode(params)}",
        method="POST"
    )

    try:
        with urllib.request.urlopen(req) as response:
            result = json.loads(response.read().decode())
            print(f"  ✓ Video uploaded successfully: {video_id}")
            return video_id
    except urllib.error.HTTPError as e:
        error_body = e.read().decode()
        print(f"  ERROR finalizing upload: {e.code}")
        print(f"  {error_body}")
        return None

def create_ad_creative(video_id, ad_set_id, placement_name):
    """Create ad creative with video"""
    print(f"\nCreating ad creative for {placement_name}...")

    # Create creative
    url = f"{BASE_URL}/{AD_ACCOUNT_ID}/adcreatives"

    creative_data = {
        "name": f"Subscription Launch - {placement_name} - Video",
        "object_story_spec": {
            "page_id": "YOUR_PAGE_ID",  # TODO: Get this from config
            "video_data": {
                "video_id": video_id,
                "title": "Fresh Produce Delivered Weekly",
                "message": "Get farm-fresh produce boxes delivered to your door. Join our community today! 🥬🍅",
                "call_to_action": {
                    "type": "SHOP_NOW",
                    "value": {
                        "link": "https://unclemays.com/products/weekly-produce-box?utm_source=facebook&utm_medium=video&utm_campaign=subscription_launch_apr2026"
                    }
                }
            }
        }
    }

    params = {
        "access_token": ACCESS_TOKEN,
        **creative_data
    }

    req = urllib.request.Request(
        url,
        data=json.dumps(params).encode(),
        headers={'Content-Type': 'application/json'},
        method="POST"
    )

    try:
        with urllib.request.urlopen(req) as response:
            result = json.loads(response.read().decode())
            creative_id = result.get("id")
            print(f"  ✓ Creative created: {creative_id}")
            return creative_id
    except urllib.error.HTTPError as e:
        error_body = e.read().decode()
        print(f"  ERROR creating creative: {e.code}")
        print(f"  {error_body}")
        return None

def main():
    print("=" * 60)
    print("Meta Video Upload Tool")
    print("=" * 60)

    # Upload videos
    video_ids = []
    for video_path in VIDEOS:
        if not video_path.exists():
            print(f"\nERROR: Video not found: {video_path}")
            continue

        video_id = upload_video(video_path)
        if video_id:
            video_ids.append(video_id)

    if not video_ids:
        print("\n✗ No videos uploaded successfully")
        print("\nREASON: Videos likely exceed Meta's file size limit")
        print("\nSOLUTION: Compress videos to under 4MB using ffmpeg:")
        print("  1. Install ffmpeg: https://ffmpeg.org/download.html")
        print("  2. Run compression script (I'll create one)")
        sys.exit(1)

    print(f"\n✓ Uploaded {len(video_ids)} video(s)")
    print(f"  Video IDs: {video_ids}")

    # Note: Creating ads requires Page ID which we don't have in config yet
    print("\n" + "=" * 60)
    print("Next Steps:")
    print("=" * 60)
    print("1. Get your Facebook Page ID and add to meta-config.json")
    print("2. Create ad creatives linking videos to ad sets")
    print("3. Create ads from the creatives")
    print("\nFor now, you can manually create ads in Meta Ads Manager:")
    print("  - Use uploaded video IDs above")
    print("  - Link to ad sets: IG Feed, IG Stories, FB Feed")
    print("  - Add CTA: Shop Now → https://unclemays.com/products/weekly-produce-box")

if __name__ == "__main__":
    main()
