# Video Asset Storage & Naming Guidelines

**Campaign:** Subscription Launch April 2026  
**Owner:** CEO (Anthony)  
**Prepared:** 2026-04-17  
**Status:** ACTIVE

---

## Directory Structure

```
ad-exports/subscription-launch-apr17/video-ads/
├── raw-footage/              # Source files, B-roll, unedited clips
├── final-renders/
│   ├── meta/                 # Meta-ready exports (Instagram/Facebook)
│   └── google-ads/           # Google Ads-ready exports (YouTube, Performance Max)
└── thumbnails/               # Video thumbnail images for upload interfaces
```

---

## File Naming Convention

### Meta (Instagram/Facebook) Videos

**Format:** `meta_{hook}_{format}_{duration}s_{version}.mp4`

**Examples:**
- `meta_quality_vertical_30s_v1.mp4` — Quality Hook, 9:16 vertical (Stories/Reels), 30 seconds, version 1
- `meta_quality_square_25s_v1.mp4` — Quality Hook, 1:1 square (Feed), 25 seconds, version 1
- `meta_culture_vertical_20s_v1.mp4` — Culture Hook, 9:16 vertical, 20 seconds, version 1
- `meta_convenience_square_30s_v2.mp4` — Convenience Hook, 1:1 square, 30 seconds, version 2

**Hook types:** `quality`, `culture`, `convenience`  
**Formats:** `vertical` (9:16), `square` (1:1)

### Google Ads Videos

**Format:** `gads_{campaign-type}_{duration}s_{version}.mp4`

**Examples:**
- `gads_youtube-bumper_15s_v1.mp4` — YouTube non-skippable bumper (15 seconds max)
- `gads_youtube-skippable_30s_v1.mp4` — YouTube skippable in-stream (30 seconds)
- `gads_pmax_30s_v1.mp4` — Performance Max asset (30 seconds, square or 16:9)

**Campaign types:** `youtube-bumper`, `youtube-skippable`, `pmax` (Performance Max)

---

## Technical Specifications

### Meta Video Specs

| Placement | Aspect Ratio | Resolution | Duration | File Size | Codec |
|-----------|--------------|------------|----------|-----------|-------|
| Instagram/Facebook Feed | 1:1 (square) | 1080x1080 | 15-30s | <4MB | H.264 |
| Instagram/Facebook Stories | 9:16 (vertical) | 1080x1920 | 15-30s | <4MB | H.264 |
| Instagram Reels | 9:16 (vertical) | 1080x1920 | 15-30s | <4MB | H.264 |

**Required for ALL Meta videos:**
- MP4 format, H.264 codec
- Frame rate: 30fps minimum
- Audio: AAC codec, 128kbps minimum
- File size: <4MB (Meta recommendation for fast load)

### Google Ads Video Specs

| Campaign Type | Aspect Ratio | Resolution | Duration | Codec |
|---------------|--------------|------------|----------|-------|
| YouTube Bumper (non-skippable) | 16:9 or 1:1 | 1920x1080 or 1080x1080 | 6-15s | H.264 |
| YouTube Skippable | 16:9 | 1920x1080 | 12s-6min | H.264 |
| Performance Max | 16:9 or 1:1 | 1920x1080 or 1080x1080 | 10s-30s | H.264 |

**Required for ALL Google Ads videos:**
- MP4 format, H.264 codec
- Frame rate: 24fps, 25fps, or 30fps
- Audio: AAC codec

---

## Upload Checklist

Before uploading to Meta or Google Ads, verify each video meets:

- [ ] Correct file naming convention (see above)
- [ ] Correct aspect ratio for placement (9:16 vertical, 1:1 square, or 16:9 horizontal)
- [ ] File size <4MB for Meta, <100MB for Google Ads
- [ ] Video duration matches ad platform limits (15-30s Meta, 6-15s YouTube bumper, etc.)
- [ ] Audio is clear and balanced (not too quiet, no clipping)
- [ ] Uncle May's logo visible in final 3 seconds or CTA screen
- [ ] CTA text is legible on mobile (test on phone screen)
- [ ] Video plays smoothly on mobile (no stuttering, fast load)

---

## Where to Store Completed Videos

### For Videos YOU Just Finished Editing (Anthony)

**Store in:** `ad-exports/subscription-launch-apr17/video-ads/final-renders/`

**Subdirectories:**
- **Meta-ready videos** → `final-renders/meta/`
- **Google Ads-ready videos** → `final-renders/google-ads/`

**Example file structure after upload:**

```
final-renders/
├── meta/
│   ├── meta_quality_vertical_30s_v1.mp4
│   ├── meta_quality_square_25s_v1.mp4
│   ├── meta_culture_vertical_20s_v1.mp4
│   ├── meta_culture_square_20s_v1.mp4
│   ├── meta_convenience_vertical_30s_v1.mp4
│   └── meta_convenience_square_30s_v1.mp4
└── google-ads/
    ├── gads_youtube-bumper_15s_v1.mp4
    ├── gads_youtube-skippable_30s_v1.mp4
    └── gads_pmax_30s_v1.mp4
```

---

## Next Steps After You Upload Videos

1. **Place videos in the correct directory** (see above)
2. **Create a manifest file** listing what you uploaded (see template below)
3. **Comment on UNC-277** to notify CEO that videos are ready
4. **CEO will delegate** to CRO and Advertising Creative for campaign upload

### Manifest Template

Create a file: `ad-exports/subscription-launch-apr17/video-ads/VIDEO-MANIFEST.md`

```markdown
# Video Asset Manifest — Subscription Launch April 2026

**Prepared by:** Anthony  
**Date:** 2026-04-17  
**Status:** Ready for Campaign Upload

---

## Meta Videos (Ready for Upload)

| File Name | Hook | Format | Duration | File Size | Status |
|-----------|------|--------|----------|-----------|--------|
| meta_quality_vertical_30s_v1.mp4 | Quality | 9:16 vertical | 30s | 3.2MB | ✅ Ready |
| meta_quality_square_25s_v1.mp4 | Quality | 1:1 square | 25s | 2.8MB | ✅ Ready |
| meta_culture_vertical_20s_v1.mp4 | Culture | 9:16 vertical | 20s | 2.5MB | ✅ Ready |

## Google Ads Videos (Ready for Upload)

| File Name | Campaign Type | Duration | File Size | Status |
|-----------|---------------|----------|-----------|--------|
| gads_youtube-bumper_15s_v1.mp4 | YouTube Bumper | 15s | 2.1MB | ✅ Ready |
| gads_pmax_30s_v1.mp4 | Performance Max | 30s | 3.5MB | ✅ Ready |

---

## Notes

- All videos tested on mobile (iPhone 13) — load fast, play smoothly
- CTA text legible on small screens
- Audio balanced, no clipping
- Uncle May's logo visible in final frames

**Handoff to:** CRO (campaign upload coordination), Advertising Creative (ad copy + UTM tagging)
```

---

## Questions or Issues?

**If you need:**
- **Technical help with video export settings** — Ask CTO
- **Feedback on video content before upload** — Tag CEO + CRO on UNC-277
- **Campaign upload coordination** — CRO owns the handoff to Meta/Google Ads
- **UTM tagging for video ad links** — RevOps has the standards doc

**Next sync:** After manifest is posted, CEO will coordinate campaign upload timing with CRO.

---

**Last Updated:** 2026-04-17  
**Status:** ✅ Ready for video uploads
