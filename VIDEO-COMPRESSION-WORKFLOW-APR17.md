# Video Compression Workflow — Meta Upload Prep

**Issue:** Meta requires videos <4MB; current videos are 29-82MB  
**Owner:** Advertising Creative (with CRO coordination)  
**Timeline:** Week 2 creative refresh (April 21-24)  
**Time required:** 30-45 minutes total

---

## PROBLEM STATEMENT

**Current state:**
- 3 video files ready: `01- Don Johnson Sample.mp4` (76MB), `Don Johnson Sample (a).mp4` (29MB), `Don Johnson Sample (b).mp4` (82MB)
- Location: `ad-exports/subscription-launch-apr17/video-ads/final-renders/meta/`

**Meta requirements:**
- Maximum file size: **4MB per video**
- Format: MP4 (H.264 codec)
- Recommended resolution: 1080x1920 (Stories/Reels) or 1080x1080 (Feed)
- Duration: 15-60 seconds ideal

**Current blocker:**
- Videos are 7-20x over the size limit
- Cannot upload to Meta until compressed

---

## SOLUTION: FFMPEG COMPRESSION

ffmpeg is the industry-standard tool for video compression. It's free, open-source, and can reduce file size by 80-95% with minimal quality loss.

### Option A: Install ffmpeg on Windows (Recommended)

**Method 1: Chocolatey (Fastest, 2 minutes)**
```bash
# Open PowerShell as Administrator
choco install ffmpeg

# Verify installation
ffmpeg -version
```

**Method 2: Direct download (5 minutes)**
1. Go to: https://ffmpeg.org/download.html#build-windows
2. Click "Windows builds from gyan.dev"
3. Download: `ffmpeg-release-essentials.zip`
4. Extract to `C:\ffmpeg\`
5. Add to PATH:
   - Right-click "This PC" > Properties > Advanced system settings
   - Environment Variables > System variables > Path > Edit
   - Add: `C:\ffmpeg\bin`
6. Restart terminal, run `ffmpeg -version` to verify

### Option B: Use Online Compressor (No install, 10 minutes)

**Tools:**
- https://www.freeconvert.com/video-compressor (free, 1GB limit)
- https://www.veed.io/tools/video-compressor (free, watermark on free tier)
- https://clideo.com/compress-video (free, 500MB limit)

**Process:**
1. Upload video
2. Set target size: 3.5MB (stay under 4MB)
3. Download compressed version
4. Repeat for all 3 videos

**Pros:** No installation, works immediately  
**Cons:** Slower, less control over quality, file size limits

---

## COMPRESSION COMMANDS (FFMPEG)

### Basic Compression (Target: <4MB)

```bash
# Navigate to video directory
cd C:/Users/Anthony/Desktop/business/ad-exports/subscription-launch-apr17/video-ads/final-renders/meta

# Compress Video 1 (76MB → ~3.5MB)
ffmpeg -i "01- Don Johnson Sample.mp4" \
  -c:v libx264 -crf 28 -preset slow \
  -vf "scale=1080:1920" \
  -b:v 700k -maxrate 900k -bufsize 1800k \
  -c:a aac -b:a 96k \
  "01-don-johnson-meta-compressed.mp4"

# Compress Video 2 (29MB → ~3.5MB)
ffmpeg -i "Don Johnson Sample (a).mp4" \
  -c:v libx264 -crf 28 -preset slow \
  -vf "scale=1080:1920" \
  -b:v 700k -maxrate 900k -bufsize 1800k \
  -c:a aac -b:a 96k \
  "don-johnson-a-meta-compressed.mp4"

# Compress Video 3 (82MB → ~3.5MB)
ffmpeg -i "Don Johnson Sample (b).mp4" \
  -c:v libx264 -crf 28 -preset slow \
  -vf "scale=1080:1920" \
  -b:v 700k -maxrate 900k -bufsize 1800k \
  -c:a aac -b:a 96k \
  "don-johnson-b-meta-compressed.mp4"
```

**Explanation of flags:**
- `-c:v libx264`: H.264 video codec (Meta-compatible)
- `-crf 28`: Constant rate factor (18-28 = good quality, higher = smaller file)
- `-preset slow`: Better compression (slower encoding, smaller file)
- `-vf "scale=1080:1920"`: Resize to 1080x1920 (Stories/Reels format)
- `-b:v 700k`: Target video bitrate of 700 kbps
- `-maxrate 900k`: Max bitrate of 900 kbps
- `-bufsize 1800k`: Buffer size (2x maxrate)
- `-c:a aac`: AAC audio codec
- `-b:a 96k`: Audio bitrate of 96 kbps (lower = smaller file, still good quality)

### If Videos Are Still >4MB: Aggressive Compression

```bash
# Increase CRF (lower quality but smaller file)
ffmpeg -i "01- Don Johnson Sample.mp4" \
  -c:v libx264 -crf 30 -preset slow \
  -vf "scale=1080:1920" \
  -b:v 500k -maxrate 700k -bufsize 1400k \
  -c:a aac -b:a 64k \
  "01-don-johnson-meta-compressed.mp4"
```

**Changes:**
- CRF 28 → 30 (slightly lower quality, significantly smaller)
- Video bitrate 700k → 500k
- Audio bitrate 96k → 64k
- **Expected result:** 2-3MB per video

### If You Need Square Videos (1080x1080 for Feed)

```bash
# Center-crop to square
ffmpeg -i "01- Don Johnson Sample.mp4" \
  -c:v libx264 -crf 28 -preset slow \
  -vf "crop=ih:ih,scale=1080:1080" \
  -b:v 700k -maxrate 900k -bufsize 1800k \
  -c:a aac -b:a 96k \
  "01-don-johnson-feed-compressed.mp4"
```

**This creates 2 versions per video:**
- `*-meta-compressed.mp4` (1080x1920, Stories/Reels)
- `*-feed-compressed.mp4` (1080x1080, Feed)

---

## BATCH COMPRESSION SCRIPT

Save this as `compress-videos.sh` in the video directory:

```bash
#!/bin/bash
# Compress all 3 videos for Meta upload

INPUT_DIR="C:/Users/Anthony/Desktop/business/ad-exports/subscription-launch-apr17/video-ads/final-renders/meta"
OUTPUT_DIR="$INPUT_DIR/compressed"

mkdir -p "$OUTPUT_DIR"

# Video 1
ffmpeg -i "$INPUT_DIR/01- Don Johnson Sample.mp4" \
  -c:v libx264 -crf 28 -preset slow \
  -vf "scale=1080:1920" \
  -b:v 700k -maxrate 900k -bufsize 1800k \
  -c:a aac -b:a 96k \
  "$OUTPUT_DIR/01-don-johnson-stories.mp4"

# Video 2
ffmpeg -i "$INPUT_DIR/Don Johnson Sample (a).mp4" \
  -c:v libx264 -crf 28 -preset slow \
  -vf "scale=1080:1920" \
  -b:v 700k -maxrate 900k -bufsize 1800k \
  -c:a aac -b:a 96k \
  "$OUTPUT_DIR/don-johnson-a-stories.mp4"

# Video 3
ffmpeg -i "$INPUT_DIR/Don Johnson Sample (b).mp4" \
  -c:v libx264 -crf 28 -preset slow \
  -vf "scale=1080:1920" \
  -b:v 700k -maxrate 900k -bufsize 1800k \
  -c:a aac -b:a 96k \
  "$OUTPUT_DIR/don-johnson-b-stories.mp4"

echo "Compression complete! Check $OUTPUT_DIR for compressed videos."
```

**Run:**
```bash
bash compress-videos.sh
```

**Expected output:**
- 3 compressed videos in `compressed/` folder
- Each <4MB, 1080x1920, ready for Meta upload

---

## QUALITY CHECK BEFORE UPLOAD

After compression, verify quality:

1. **Check file size:**
   ```bash
   ls -lh compressed/
   ```
   All files should show <4MB (e.g., "3.2M", "3.7M")

2. **Play videos locally:**
   - Open each compressed video in VLC or Windows Media Player
   - Check for:
     - ✅ Video plays smoothly (no stuttering)
     - ✅ Audio is clear (no distortion)
     - ✅ Text overlays are legible (if any)
     - ✅ Colors look good (not overly pixelated)

3. **Compare side-by-side:**
   - Play original video
   - Play compressed video
   - Acceptable quality loss: slight softness, minor color shift
   - Unacceptable quality loss: heavy pixelation, blurry text, audio crackle

**If quality is too low:** Re-compress with CRF 26 or video bitrate 900k.

**If file size is still >4MB:** Re-compress with CRF 30 or video bitrate 500k.

---

## UPLOAD TO META

Once compressed:

1. Go to Meta Ads Manager: https://business.facebook.com/adsmanager

2. Navigate to the ad set where you want to add videos (e.g., "IG Stories - Women 25-35 - Hyde Park")

3. Click **Create Ad**

4. **Ad format:** Single video

5. **Upload video:** Select compressed file (e.g., `01-don-johnson-stories.mp4`)

6. **Primary text, headline, CTA:** Use same copy as static image ads

7. **Destination URL:** Use UTM-tagged URL:
   ```
   https://unclemays.com?utm_source=instagram&utm_medium=paid_social_stories&utm_campaign=subscription_launch_apr2026&utm_content=video_don_johnson_01&promo=FREESHIP
   ```

8. **Publish ad** (will start in "In Review" status for 15 min - 24 hours)

Repeat for all 3 videos across IG Stories, IG Reels, FB Feed placements.

---

## TIMELINE & DELEGATION

### Week 1 (Apr 17-20): SKIP VIDEOS
- Launch with static images only (25 images ready)
- Meta and Google Ads go live with static creative
- Collect performance data on static variants

### Week 2 (Apr 21-24): ADD VIDEOS

**Monday April 21 (Morning):**
- **Advertising Creative:** Install ffmpeg (10 min)
- **Advertising Creative:** Run batch compression script (15 min)
- **Advertising Creative:** Quality check all 3 videos (10 min)

**Monday April 21 (Afternoon):**
- **Advertising Creative:** Upload compressed videos to Meta (3 new ads in IG Stories ad set)
- **Advertising Creative:** Upload original videos to Google YouTube campaign (already <100MB, no compression needed)
- **RevOps:** Verify video ads appear in Ads Manager and are "Active"

**Tuesday April 22 - Friday April 25:**
- **RevOps:** Track video ad performance separately (CTR, 3-second play rate, CPC)
- **CRO:** Compare video vs static performance
- **CRO:** Decide Week 3 creative mix based on data

---

## TROUBLESHOOTING

### "ffmpeg: command not found"
**Reason:** ffmpeg not installed or not in PATH.

**Fix:**
- Windows: Re-run Chocolatey install or add `C:\ffmpeg\bin` to PATH
- Verify with: `ffmpeg -version`

### "Error: invalid bitrate"
**Reason:** Syntax error in command (missing space, wrong flag).

**Fix:**
- Copy command exactly as written above
- Use PowerShell or Git Bash (not CMD, which has different syntax)

### Compressed video is still >4MB
**Reason:** Source video is very high resolution or long duration.

**Fix:**
1. Increase CRF to 30 (lower quality)
2. Reduce video bitrate to 500k
3. Trim video duration (if >30 seconds):
   ```bash
   ffmpeg -i "input.mp4" -ss 0 -t 30 -c:v libx264 -crf 28 ... "output.mp4"
   ```
   (This trims to first 30 seconds with `-t 30`)

### Compressed video looks pixelated/blurry
**Reason:** Bitrate too low or CRF too high.

**Fix:**
1. Reduce CRF to 26 (higher quality)
2. Increase video bitrate to 900k-1200k
3. Accept larger file size (3.5-3.9MB is OK, just stay under 4MB)

### Meta rejects video upload
**Reason:** Codec incompatibility, file corruption, or policy violation.

**Fix:**
- Re-encode with explicit codec: `-c:v libx264 -pix_fmt yuv420p`
- Check Meta's video specs: https://www.facebook.com/business/help/1038656909667505
- If policy violation: Check for prohibited content (no health claims, no before/after)

---

## EXPECTED RESULTS (WEEK 2)

**After adding 3 compressed videos to Meta:**
- Total Meta creatives: 10 static images + 3 videos = **13 variants**
- Expected video CTR: 1.5-2.5% (higher than static's 1.0-1.5%)
- Expected video CPC: $1.50-$2.50 (similar to static)
- Expected 3-second play rate: 40-50% (good engagement)

**If videos outperform static:**
- Week 3: Shift 60% of budget to video placements
- Week 3: Compress and upload 5-7 more videos (customer testimonials, product b-roll)

**If videos underperform static:**
- Week 3: Kill video ads, double down on top 5 static images
- Revisit video strategy (different hooks, UGC testimonials, AI-generated)

---

## FILES & RESOURCES

**Current video location:**
- Original (29-82MB): `ad-exports/subscription-launch-apr17/video-ads/final-renders/meta/`
- Google Ads (same files, OK to upload): `ad-exports/subscription-launch-apr17/video-ads/final-renders/google-ads/`

**Output after compression:**
- Compressed (<4MB): `ad-exports/subscription-launch-apr17/video-ads/final-renders/meta/compressed/`

**ffmpeg resources:**
- Download: https://ffmpeg.org/download.html
- Docs: https://ffmpeg.org/ffmpeg.html
- H.264 encoding guide: https://trac.ffmpeg.org/wiki/Encode/H.264

**Meta video specs:**
- https://www.facebook.com/business/help/1038656909667505 (Feed)
- https://www.facebook.com/business/help/1631821640426723 (Stories)
- https://www.facebook.com/business/help/430385790564920 (Reels)

---

## NEXT STEPS

### Immediate (Today, April 17):
- **Skip video compression** — launch with static images only
- 25 static images are ready and properly sized for both Meta and Google

### Week 2 (Monday April 21):
- **Advertising Creative:** Install ffmpeg and run compression workflow
- **Target:** 3 compressed videos uploaded to Meta by EOD Monday

### Week 3 (April 28+):
- **CRO + Advertising Creative:** Review Week 2 video performance
- **Decision:** Scale video production OR pivot back to static-only strategy

---

**Prepared by:** CRO  
**Date:** 2026-04-17  
**Status:** DOCUMENTED, READY FOR WEEK 2 EXECUTION  
**Owner:** Advertising Creative (with CRO coordination)
