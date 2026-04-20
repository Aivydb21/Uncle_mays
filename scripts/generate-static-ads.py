#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Generate 25 static ad images for subscription launch using Pillow.
Campaign: Uncle May's Produce Box Subscription Launch (Apr 17, 2026)
"""

import os
import sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter

# Fix Windows console encoding
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding='utf-8')
    sys.stderr.reconfigure(encoding='utf-8')

# Paths
BASE_DIR = Path("C:/Users/Anthony/Desktop/business")
OUTPUT_DIR = BASE_DIR / "ad-exports/subscription-launch-apr17/static-images"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# Source images
IMG_HERITAGE = BASE_DIR / "public/images/heritage.jpg"
IMG_HERO_PRODUCE = BASE_DIR / "public/images/hero-produce.jpg"
IMG_PRODUCE_BOX = BASE_DIR / "public/images/produce-box.jpg"
IMG_LOGO = BASE_DIR / "public/uncle-mays-logo.png"

# Colors
COLOR_WHITE = (255, 255, 255)
COLOR_BLACK = (0, 0, 0)
COLOR_GREEN = (45, 80, 22)  # #2D5016
COLOR_GREEN_BRIGHT = (76, 175, 80)  # #4CAF50
COLOR_GREEN_PROMO = (0, 200, 83)  # #00C853
COLOR_GOLD = (212, 175, 55)  # #D4AF37
COLOR_OVERLAY = (0, 0, 0, 102)  # Semi-transparent black (40% opacity)

def load_and_resize(img_path, target_width, target_height):
    """Load image and resize to cover target dimensions."""
    img = Image.open(img_path).convert("RGB")

    # Calculate aspect ratios
    img_ratio = img.width / img.height
    target_ratio = target_width / target_height

    # Resize to cover (crop excess)
    if img_ratio > target_ratio:
        # Image is wider, scale by height
        new_height = target_height
        new_width = int(new_height * img_ratio)
    else:
        # Image is taller, scale by width
        new_width = target_width
        new_height = int(new_width / img_ratio)

    img = img.resize((new_width, new_height), Image.Resampling.LANCZOS)

    # Center crop
    left = (img.width - target_width) // 2
    top = (img.height - target_height) // 2
    img = img.crop((left, top, left + target_width, top + target_height))

    return img

def add_dark_overlay(img, opacity=0.4):
    """Add semi-transparent dark overlay for text readability."""
    overlay = Image.new("RGBA", img.size, (0, 0, 0, int(255 * opacity)))
    img_rgba = img.convert("RGBA")
    return Image.alpha_composite(img_rgba, overlay).convert("RGB")

def draw_text_centered(draw, text, y_pos, font, color, img_width):
    """Draw centered text."""
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    x = (img_width - text_width) // 2
    draw.text((x, y_pos), text, font=font, fill=color)
    return y_pos + (bbox[3] - bbox[1])

def draw_text_with_background(draw, text, x, y, font, text_color, bg_color, padding=20):
    """Draw text with colored background badge."""
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]

    # Draw rounded rectangle background
    bg_rect = [x - padding, y - padding, x + text_width + padding, y + text_height + padding]
    draw.rounded_rectangle(bg_rect, radius=10, fill=bg_color)

    # Draw text
    draw.text((x, y), text, font=font, fill=text_color)

def add_logo(img, logo_path, position="top_right", height=80):
    """Add logo to image."""
    if not os.path.exists(logo_path):
        return img

    logo = Image.open(logo_path).convert("RGBA")

    # Resize logo maintaining aspect ratio
    ratio = height / logo.height
    new_width = int(logo.width * ratio)
    logo = logo.resize((new_width, height), Image.Resampling.LANCZOS)

    # Position logo
    if position == "top_right":
        x = img.width - logo.width - 40
        y = 40
    elif position == "top_left":
        x = 40
        y = 40
    elif position == "top_center":
        x = (img.width - logo.width) // 2
        y = 40
    elif position == "bottom_right":
        x = img.width - logo.width - 40
        y = img.height - logo.height - 40
    elif position == "bottom_center":
        x = (img.width - logo.width) // 2
        y = img.height - logo.height - 40
    else:
        x, y = 40, 40

    # Composite logo onto image
    img_rgba = img.convert("RGBA")
    img_rgba.paste(logo, (x, y), logo)
    return img_rgba.convert("RGB")

def get_font(size, bold=False):
    """Get font with fallback."""
    try:
        if bold:
            return ImageFont.truetype("arialbd.ttf", size)
        return ImageFont.truetype("arial.ttf", size)
    except:
        return ImageFont.load_default()

# ============================================================================
# GOOGLE PERFORMANCE MAX - LANDSCAPE (1200x628)
# ============================================================================

def generate_pmax_landscape_1():
    """PMax Landscape 1: Hero Produce + Value Prop"""
    img = load_and_resize(IMG_HERO_PRODUCE, 1200, 628)
    img = add_dark_overlay(img, 0.3)
    draw = ImageDraw.Draw(img)

    # Text
    font_headline = get_font(48, bold=True)
    font_subhead = get_font(32)
    font_cta = get_font(24)

    draw.text((40, 80), "Fresh Produce, Delivered Weekly", font=font_headline, fill=COLOR_WHITE)
    draw.text((40, 150), "Subscribe from $30/week", font=font_subhead, fill=COLOR_WHITE)

    # CTA badge
    draw_text_with_background(draw, "FREESHIP: $10 Off First Box",
                            img.width - 400, img.height - 80,
                            font_cta, COLOR_WHITE, COLOR_GREEN_PROMO)

    # Logo
    img = add_logo(img, IMG_LOGO, "top_right", 80)
    img.save(OUTPUT_DIR / "pmax_landscape_hero_value_1200x628.png")
    print("✓ Generated: pmax_landscape_hero_value_1200x628.png")

def generate_pmax_landscape_2():
    """PMax Landscape 2: Cultural Positioning"""
    img = load_and_resize(IMG_HERITAGE, 1200, 628)
    img = add_dark_overlay(img, 0.4)
    draw = ImageDraw.Draw(img)

    font_headline = get_font(52, bold=True)
    font_subhead = get_font(28)
    font_cta = get_font(24)

    draw_text_centered(draw, "Black-Owned Grocery, Chicago", 200, font_headline, COLOR_GOLD, img.width)
    draw_text_centered(draw, "Premium greens, okra, yams. Delivered.", 270, font_subhead, COLOR_WHITE, img.width)

    # CTA
    cta_y = img.height - 80
    draw_text_with_background(draw, "Join 500+ Families",
                            (img.width - 300) // 2, cta_y,
                            font_cta, COLOR_BLACK, COLOR_WHITE)

    img = add_logo(img, IMG_LOGO, "top_left", 80)
    img.save(OUTPUT_DIR / "pmax_landscape_cultural_1200x628.png")
    print("✓ Generated: pmax_landscape_cultural_1200x628.png")

def generate_pmax_landscape_3():
    """PMax Landscape 3: Subscription Convenience"""
    img = load_and_resize(IMG_PRODUCE_BOX, 1200, 628)
    img = add_dark_overlay(img, 0.35)
    draw = ImageDraw.Draw(img)

    font_headline = get_font(48, bold=True)
    font_subhead = get_font(28)
    font_price = get_font(32, bold=True)

    draw.text((40, 100), "Set It. Forget It. Eat Fresh.", font=font_headline, fill=COLOR_WHITE)
    draw.text((40, 170), "Weekly deliveries. Cancel anytime.", font=font_subhead, fill=COLOR_WHITE)
    draw_text_with_background(draw, "$55/week Community Box", 40, img.height - 90, font_price, COLOR_WHITE, COLOR_GREEN)

    img = add_logo(img, IMG_LOGO, "top_right", 80)
    img.save(OUTPUT_DIR / "pmax_landscape_subscription_1200x628.png")
    print("✓ Generated: pmax_landscape_subscription_1200x628.png")

def generate_pmax_landscape_4():
    """PMax Landscape 4: Social Proof"""
    img = load_and_resize(IMG_HERO_PRODUCE, 1200, 628)
    img = add_dark_overlay(img, 0.5)
    draw = ImageDraw.Draw(img)

    font_stat = get_font(96, bold=True)
    font_context = get_font(36)
    font_subhead = get_font(28)

    draw_text_centered(draw, "500+", 150, font_stat, COLOR_GOLD, img.width)
    draw_text_centered(draw, "Chicago Families Subscribe", 270, font_context, COLOR_WHITE, img.width)
    draw_text_centered(draw, "Fresh greens. Black farmers. Your door.", 480, font_subhead, COLOR_WHITE, img.width)

    img = add_logo(img, IMG_LOGO, "bottom_right", 80)
    img.save(OUTPUT_DIR / "pmax_landscape_social_proof_1200x628.png")
    print("✓ Generated: pmax_landscape_social_proof_1200x628.png")

def generate_pmax_landscape_5():
    """PMax Landscape 5: Direct Offer"""
    img = load_and_resize(IMG_PRODUCE_BOX, 1200, 628)
    img = add_dark_overlay(img, 0.4)
    draw = ImageDraw.Draw(img)

    font_offer = get_font(72, bold=True)
    font_code = get_font(36)
    font_cta = get_font(32, bold=True)

    # Centered offer
    offer_y = 180
    draw_text_with_background(draw, "$10 OFF FIRST BOX",
                            (img.width - 600) // 2, offer_y,
                            font_offer, COLOR_WHITE, COLOR_GREEN_PROMO, 30)

    draw_text_centered(draw, "Use code: FREESHIP", 300, font_code, COLOR_WHITE, img.width)
    draw_text_centered(draw, "Subscribe Today →", 450, font_cta, COLOR_WHITE, img.width)

    img = add_logo(img, IMG_LOGO, "top_center", 100)
    img.save(OUTPUT_DIR / "pmax_landscape_offer_1200x628.png")
    print("✓ Generated: pmax_landscape_offer_1200x628.png")

# ============================================================================
# GOOGLE PERFORMANCE MAX - SQUARE (1080x1080)
# ============================================================================

def generate_pmax_square_1():
    """PMax Square 1: Product Hero"""
    img = load_and_resize(IMG_HERO_PRODUCE, 1080, 1080)
    img = add_dark_overlay(img, 0.3)
    draw = ImageDraw.Draw(img)

    font_headline = get_font(56, bold=True)
    font_subhead = get_font(36)
    font_price = get_font(48, bold=True)

    draw_text_centered(draw, "Your Grandma's Greens", 250, font_headline, COLOR_WHITE, img.width)
    draw_text_centered(draw, "Delivered Every Thursday", 330, font_subhead, COLOR_WHITE, img.width)

    draw_text_with_background(draw, "From $30/week",
                            (img.width - 350) // 2, img.height - 200,
                            font_price, COLOR_WHITE, COLOR_GREEN, 25)

    img = add_logo(img, IMG_LOGO, "bottom_right", 100)
    img.save(OUTPUT_DIR / "pmax_square_product_hero_1080x1080.png")
    print("✓ Generated: pmax_square_product_hero_1080x1080.png")

def generate_pmax_square_2():
    """PMax Square 2: Subscription Value"""
    img = load_and_resize(IMG_PRODUCE_BOX, 1080, 1080)
    img = add_dark_overlay(img, 0.4)
    draw = ImageDraw.Draw(img)

    font_headline = get_font(60, bold=True)
    font_bullets = get_font(32)
    font_cta = get_font(40, bold=True)

    draw_text_centered(draw, "Skip the Store", 150, font_headline, COLOR_WHITE, img.width)

    # Bullets
    bullets = [
        "✓ Fresh produce weekly",
        "✓ Culturally specific",
        "✓ Black-owned, local"
    ]
    y = 350
    for bullet in bullets:
        draw_text_centered(draw, bullet, y, font_bullets, COLOR_WHITE, img.width)
        y += 60

    draw_text_with_background(draw, "Subscribe Now",
                            (img.width - 300) // 2, img.height - 150,
                            font_cta, COLOR_WHITE, COLOR_GREEN_BRIGHT, 20)

    img = add_logo(img, IMG_LOGO, "top_left", 80)
    img.save(OUTPUT_DIR / "pmax_square_subscription_value_1080x1080.png")
    print("✓ Generated: pmax_square_subscription_value_1080x1080.png")

def generate_pmax_square_3():
    """PMax Square 3: Cultural Connection"""
    img = load_and_resize(IMG_HERITAGE, 1080, 1080)
    img = add_dark_overlay(img, 0.45)
    draw = ImageDraw.Draw(img)

    font_headline = get_font(64, bold=True)
    font_subhead = get_font(32)
    font_cta = get_font(24)

    draw_text_centered(draw, "For Us, By Us", 350, font_headline, COLOR_GOLD, img.width)
    draw_text_centered(draw, "Collards. Okra. Yams. Fresh.", 440, font_subhead, COLOR_WHITE, img.width)

    draw_text_with_background(draw, "$10 Off with FREESHIP",
                            (img.width - 400) // 2, img.height - 140,
                            font_cta, COLOR_WHITE, COLOR_GREEN_PROMO, 15)

    img = add_logo(img, IMG_LOGO, "top_center", 100)
    img.save(OUTPUT_DIR / "pmax_square_cultural_1080x1080.png")
    print("✓ Generated: pmax_square_cultural_1080x1080.png")

def generate_pmax_square_4():
    """PMax Square 4: Price Point Anchor"""
    img = load_and_resize(IMG_PRODUCE_BOX, 1080, 1080)
    img = add_dark_overlay(img, 0.5)
    draw = ImageDraw.Draw(img)

    font_price_large = get_font(120, bold=True)
    font_price_small = get_font(48)
    font_desc = get_font(40, bold=True)
    font_details = get_font(24)

    # Price
    bbox = draw.textbbox((0, 0), "$55", font=font_price_large)
    price_width = bbox[2] - bbox[0]
    x_price = (img.width - price_width - 100) // 2
    draw.text((x_price, 320), "$55", font=font_price_large, fill=COLOR_GOLD)
    draw.text((x_price + price_width, 360), "/week", font=font_price_small, fill=COLOR_WHITE)

    draw_text_centered(draw, "Community Box", 480, font_desc, COLOR_WHITE, img.width)
    draw_text_centered(draw, "Greens, okra, yams, tomatoes, herbs", 780, font_details, COLOR_WHITE, img.width)

    img = add_logo(img, IMG_LOGO, "top_left", 80)
    img.save(OUTPUT_DIR / "pmax_square_price_anchor_1080x1080.png")
    print("✓ Generated: pmax_square_price_anchor_1080x1080.png")

def generate_pmax_square_5():
    """PMax Square 5: Black Ownership Badge"""
    img = load_and_resize(IMG_HERO_PRODUCE, 1080, 1080)
    img = add_dark_overlay(img, 0.4)
    draw = ImageDraw.Draw(img)

    font_badge = get_font(36)
    font_headline = get_font(56, bold=True)
    font_location = get_font(32)
    font_cta = get_font(28)

    draw_text_with_background(draw, "Black-Owned Business",
                            (img.width - 450) // 2, 180,
                            font_badge, COLOR_BLACK, COLOR_GOLD, 15)

    draw_text_centered(draw, "Support Local. Eat Fresh.", 380, font_headline, COLOR_WHITE, img.width)
    draw_text_centered(draw, "Chicago, IL", 460, font_location, COLOR_WHITE, img.width)
    draw_text_centered(draw, "Subscribe at unclemays.com", 780, font_cta, COLOR_WHITE, img.width)

    img = add_logo(img, IMG_LOGO, "bottom_center", 100)
    img.save(OUTPUT_DIR / "pmax_square_blackowned_1080x1080.png")
    print("✓ Generated: pmax_square_blackowned_1080x1080.png")

# ============================================================================
# GENERATE ALL REMAINING FORMATS (Portrait + Meta)
# ============================================================================

def generate_remaining_formats():
    """Generate remaining 15 images (5 portrait + 10 meta) with simplified layouts."""

    # PMax Portrait formats (1080x1350) - 5 images
    portrait_specs = [
        ("pmax_portrait_mobile_hero_1080x1350.png", IMG_HERO_PRODUCE, "Fresh Produce Boxes", "From $30/week"),
        ("pmax_portrait_value_stack_1080x1350.png", IMG_PRODUCE_BOX, "500+ Families\nWeekly Delivery", "Join Uncle May's"),
        ("pmax_portrait_cultural_pride_1080x1350.png", IMG_HERITAGE, "Produce Curated for Us", "Subscribe Today"),
        ("pmax_portrait_offer_1080x1350.png", IMG_PRODUCE_BOX, "$10 OFF", "FREESHIP"),
        ("pmax_portrait_subscription_simplicity_1080x1350.png", IMG_HERO_PRODUCE, "Set It & Forget It", "$55/week")
    ]

    for filename, bg_img, headline, subtext in portrait_specs:
        img = load_and_resize(bg_img, 1080, 1350)
        img = add_dark_overlay(img, 0.4)
        draw = ImageDraw.Draw(img)

        font_h = get_font(56, bold=True)
        font_s = get_font(40)

        draw_text_centered(draw, headline, 400, font_h, COLOR_WHITE, img.width)
        draw_text_centered(draw, subtext, 700, font_s, COLOR_GOLD, img.width)

        img = add_logo(img, IMG_LOGO, "top_center", 100)
        img.save(OUTPUT_DIR / filename)
        print(f"✓ Generated: {filename}")

    # Meta Feed formats (1080x1080) - 5 images
    feed_specs = [
        ("meta_feed_whats_in_box_1080x1080.png", IMG_PRODUCE_BOX, "What's in This Week's Box?", "$55 Community Box"),
        ("meta_feed_chicago_families_1080x1080.png", IMG_HERITAGE, "500+ Chicago Families Subscribe", "Join Them"),
        ("meta_feed_grandmas_greens_1080x1080.png", IMG_HERO_PRODUCE, "Your Grandmother's Greens", "$10 Off First Box"),
        ("meta_feed_farm_to_table_1080x1080.png", IMG_PRODUCE_BOX, "Farm-to-Table, Culture-Forward", "Subscribe Now"),
        ("meta_feed_zero_hassle_1080x1080.png", IMG_HERO_PRODUCE, "Premium Produce", "From $30/week")
    ]

    for filename, bg_img, headline, cta in feed_specs:
        img = load_and_resize(bg_img, 1080, 1080)
        img = add_dark_overlay(img, 0.35)
        draw = ImageDraw.Draw(img)

        font_h = get_font(52, bold=True)
        font_c = get_font(36, bold=True)

        draw_text_centered(draw, headline, 280, font_h, COLOR_WHITE, img.width)
        draw_text_with_background(draw, cta,
                                (img.width - 400) // 2, img.height - 160,
                                font_c, COLOR_WHITE, COLOR_GREEN_BRIGHT, 20)

        img = add_logo(img, IMG_LOGO, "top_left", 80)
        img.save(OUTPUT_DIR / filename)
        print(f"✓ Generated: {filename}")

    # Meta Story formats (1080x1920) - 5 images
    story_specs = [
        ("meta_story_subscription_value_1080x1920.png", IMG_HERO_PRODUCE, "Fresh Produce", "Swipe Up to Subscribe"),
        ("meta_story_cultural_1080x1920.png", IMG_HERITAGE, "For Us, By Us", "$10 Off with FREESHIP"),
        ("meta_story_blackowned_1080x1920.png", IMG_PRODUCE_BOX, "Chicago's #1 Produce Box", "Join 500+ Families"),
        ("meta_story_offer_1080x1920.png", IMG_HERO_PRODUCE, "$10 OFF", "FREESHIP"),
        ("meta_story_convenience_1080x1920.png", IMG_PRODUCE_BOX, "Set It & Forget It", "Subscribe Now")
    ]

    for filename, bg_img, headline, cta in story_specs:
        img = load_and_resize(bg_img, 1080, 1920)
        img = add_dark_overlay(img, 0.4)
        draw = ImageDraw.Draw(img)

        font_h = get_font(64, bold=True)
        font_c = get_font(52, bold=True)

        draw_text_centered(draw, headline, 600, font_h, COLOR_WHITE, img.width)
        draw_text_centered(draw, cta, 1400, font_c, COLOR_GOLD, img.width)

        img = add_logo(img, IMG_LOGO, "top_center", 120)
        img.save(OUTPUT_DIR / filename)
        print(f"✓ Generated: {filename}")

# ============================================================================
# MAIN
# ============================================================================

def main():
    print("=" * 60)
    print("UNCLE MAY'S SUBSCRIPTION LAUNCH - STATIC AD PRODUCTION")
    print("=" * 60)
    print()

    # Check source files
    for name, path in [("Heritage", IMG_HERITAGE), ("Hero Produce", IMG_HERO_PRODUCE),
                       ("Produce Box", IMG_PRODUCE_BOX), ("Logo", IMG_LOGO)]:
        if not os.path.exists(path):
            print(f"✗ Missing source image: {name} at {path}")
            return

    print("✓ All source images found\n")

    # Generate Performance Max Landscape (5)
    print("Generating Performance Max Landscape (5)...")
    generate_pmax_landscape_1()
    generate_pmax_landscape_2()
    generate_pmax_landscape_3()
    generate_pmax_landscape_4()
    generate_pmax_landscape_5()

    # Generate Performance Max Square (5)
    print("\nGenerating Performance Max Square (5)...")
    generate_pmax_square_1()
    generate_pmax_square_2()
    generate_pmax_square_3()
    generate_pmax_square_4()
    generate_pmax_square_5()

    # Generate remaining formats (15)
    print("\nGenerating remaining formats (15)...")
    generate_remaining_formats()

    print("\n" + "=" * 60)
    print(f"✓ ALL 25 IMAGES GENERATED")
    print(f"Output directory: {OUTPUT_DIR}")
    print("=" * 60)
    print("\nNext steps:")
    print("1. Review images for quality and readability")
    print("2. Deliver to RevOps/CRO for upload to Google Ads + Meta")
    print("3. Campaign launches Thursday April 17, 2026")

if __name__ == "__main__":
    main()
