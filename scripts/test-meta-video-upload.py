#!/usr/bin/env python3
"""
Test Meta video upload to check file size limits
"""

import json
import os
import sys
from pathlib import Path

# Load Meta config
config_path = os.path.expanduser("~/.claude/meta-config.json")
with open(config_path) as f:
    config = json.load(f)

ACCESS_TOKEN = config["access_token"]
AD_ACCOUNT_ID = config["ad_account_id"]

# Test video
VIDEO_PATH = Path("C:/Users/Anthony/Desktop/business/ad-exports/subscription-launch-apr17/video-ads/final-renders/meta/smaller a.mp4")

# Check file size
size_mb = VIDEO_PATH.stat().st_size / (1024 * 1024)
print(f"Video: {VIDEO_PATH.name}")
print(f"Size: {size_mb:.1f}MB")

if size_mb > 4:
    print(f"\nWARNING: File exceeds Meta's documented 4MB limit")
    print(f"However, attempting upload to test actual enforcement...")

# Try using curl for simpler upload test
import subprocess

print(f"\nAttempting upload via Meta API...")

# Use Meta's resumable upload API
cmd = [
    "curl", "-X", "POST",
    f"https://graph.facebook.com/v21.0/{AD_ACCOUNT_ID}/advideos",
    "-F", f"access_token={ACCESS_TOKEN}",
    "-F", f"source=@{VIDEO_PATH}"
]

try:
    result = subprocess.run(cmd, capture_output=True, text=True, check=True)
    print(f"\nUPLOAD SUCCEEDED!")
    print(f"Response: {result.stdout}")

    # Parse video ID
    response_data = json.loads(result.stdout)
    video_id = response_data.get("id")
    print(f"\nVideo ID: {video_id}")
    print(f"\nSave this ID - you can use it to create ads in Meta Ads Manager")

except subprocess.CalledProcessError as e:
    print(f"\nUPLOAD FAILED")
    print(f"Error: {e.stderr}")

    # Check if it's a size limit error
    if "size" in e.stderr.lower() or "large" in e.stderr.lower():
        print(f"\nConfirmed: Meta enforces the 4MB limit")
        print(f"\nNext steps:")
        print(f"1. Install ffmpeg: https://ffmpeg.org/download.html")
        print(f"2. Compress video with command:")
        print(f"   ffmpeg -i 'smaller a.mp4' -b:v 800k -maxrate 800k -bufsize 1600k -vf 'scale=1080:-2' -an compressed.mp4")
    else:
        print(f"\nDifferent error - see details above")
