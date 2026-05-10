#!/usr/bin/env python3
"""Generate per-customer recovery + interview emails from the email universe.

Buckets:
  A — repeat customers (paid 2+)         — founder thank-you + interview ask
  B — one-time paid customers            — "what made you try, why haven't you been back"
  C — high-intent abandoners             — "saw it didn't go through, three ways forward"

Excludes anything already personally drafted (alisia, linda, lia).
"""
import json
import os
import re

ROOT = os.path.dirname(__file__)
UNIVERSE = os.path.join(ROOT, "email-universe.json")
OUT_DIR = os.path.join(ROOT, "..", "recovery-emails")

CALENDLY = "https://calendly.com/anthony-unclemays/uncle-may-s-quick-interview"
SHOP = "https://unclemays.com/shop"
PHONE = "(312) 972-2595"
ANTHONY_EMAIL = "anthony@unclemays.com"

# Already personally drafted — skip
ALREADY_DONE = {"alisia_walton@yahoo.com", "bartoli.linda@gmail.com"}
# Lia Terrell has no email captured but has a personal draft
SKIP_NO_EMAIL = {"lia"}
# Test/internal emails to never touch
EXCLUDE = {"audit-noop@example.com"}

NEIGHBORHOOD = {
    "60619": "Chatham", "60617": "South Shore", "60615": "Hyde Park",
    "60620": "Auburn Gresham", "60409": "Calumet City", "60411": "Chicago Heights",
    "60515": "Downers Grove", "60659": "West Ridge",
    "60601": "downtown Chicago", "60602": "downtown Chicago",
}


def first_name(full_name: str | None, email: str) -> str:
    if full_name:
        parts = full_name.strip().split()
        if parts:
            return parts[0].title()
    # fallback from email local-part
    local = email.split("@")[0]
    local = re.split(r"[._\d]", local)[0]
    return local.capitalize() if local else "there"


def filename_from_email(email: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", email.split("@")[0].lower()).strip("-") + ".md"


def bucket(u: dict) -> str:
    if u["pi_succeeded"] + u["sess_succeeded"] >= 2:
        return "A"
    if u["pi_succeeded"] + u["sess_succeeded"] >= 1:
        return "B"
    return "C"


def email_template_A(name: str, u: dict) -> str:
    """Repeat customer — founder thank-you + interview ask."""
    n_orders = u["pi_succeeded"] + u["sess_succeeded"]
    n_attempts = u["pi_attempts"] + u["sess_attempts"]
    zip_ = u.get("shipping_zip") or ""
    nb = NEIGHBORHOOD.get(zip_[:5]) if zip_ else None
    nb_line = f" out to {nb}" if nb else ""
    return f"""# Recovery / interview email — {name} ({u['email']})

**Bucket:** A — repeat customer ({n_orders} paid orders / {n_attempts} total attempts)
**To:** {u['email']}
**Send from:** {ANTHONY_EMAIL}
**Subject:** {name.split()[0]} — thank you for being one of our most loyal customers

---

Hi {first_name(name, u['email'])},

I'm Anthony, the founder of Uncle May's Produce. I was going through our customer data this week and realized you've ordered from us **{n_orders} times** — that puts you in a tiny group of customers who've actually given us a second and third try{nb_line}. I wanted to reach out personally and say thank you. We're a small operation a few weeks into the Chicago delivery side of the business, and customers like you are the reason this is going to work.

Two things I'd love your help with:

1. **15 minutes on the phone** — I'm trying to understand what made you keep coming back, what almost stopped you the second time, and what you'd want us to do next. Your perspective is more valuable than any survey: [{CALENDLY}]({CALENDLY}). Pick any time that works.

2. **A standing offer.** As a thank you, the next box you order is **on me up to $50** — just reply to this email and tell me which Wednesday and I'll comp it. No promo code games, no minimum cart shenanigans. You earned it.

If now isn't the right time, no pressure — but I'd really value hearing from you whenever you have a few minutes. Reply, call/text {PHONE}, or grab a slot on my calendar.

Thank you for trusting us with your grocery order.

Anthony Ivy
Founder, Uncle May's Produce
{PHONE}
{ANTHONY_EMAIL}

---

## Notes for sending
- Highest-value single conversation in the entire customer base. Take the call yourself; do not delegate.
- If she takes the credit, log the comp in Stripe + tag her in Mailchimp as `loyalty_comp_2026_05`.
- Bring up: what would have made the 4th order easier? Did anything about the catalog launch (April 30) change her experience?
- This conversation is **interview #1 priority** for the JTBD memo (rubric dim 1) AND the cleanest possible solution-validation data point (rubric dim 4).
"""


def email_template_B(name: str, u: dict) -> str:
    """One-time paid customer — what made you try, why haven't you been back."""
    n_attempts = u["pi_attempts"] + u["sess_attempts"]
    zip_ = u.get("shipping_zip") or ""
    nb = NEIGHBORHOOD.get(zip_[:5]) if zip_ else None
    nb_line = f" up your way in {nb}" if nb else ""
    return f"""# Recovery / interview email — {name} ({u['email']})

**Bucket:** B — one-time paid customer ({u['pi_succeeded']+u['sess_succeeded']} paid / {n_attempts} total attempts)
**To:** {u['email']}
**Send from:** {ANTHONY_EMAIL}
**Subject:** {first_name(name, u['email'])} — quick question from Uncle May's

---

Hi {first_name(name, u['email'])},

I'm Anthony, the founder of Uncle May's Produce. I was looking through our records this week and saw you ordered from us once but haven't been back. I'm not writing to push you to order again — I'm writing because I'd really like to know **why**.

We're a few weeks into the Chicago delivery side of the business, and we just relaunched as a build-your-own catalog (you can pick exactly what goes in your order, no fixed boxes). Before we put more money into ads or new products, I'd rather hear from the people who already tried us:

- What made you try us in the first place?
- What about the experience didn't quite work?
- What would have to be true for you to come back?

If you have **15 minutes** in the next week or two, I'd be genuinely grateful for a quick phone call: [{CALENDLY}]({CALENDLY}). I'll send you a $20 Uncle May's credit as a thank you for the time, no strings, you can use it{nb_line} or share it with someone.

You can also just reply to this email with a sentence or two if a call isn't possible. Either way, the honest answer is more useful to me than a polite one.

Thank you for trying us.

Anthony Ivy
Founder, Uncle May's Produce
{PHONE}
{ANTHONY_EMAIL}

---

## Notes for sending
- One-time customer who churned — among the most informative interviews available.
- The $20 credit is intentional: low enough to not feel transactional, high enough to make the response math work.
- If they reply by email, log the response in this same file and treat it as a (compressed) interview for JTBD synthesis.
"""


def email_template_C(name: str, u: dict) -> str:
    """High-intent abandoner — three ways forward + interview ask."""
    n_attempts = u["pi_attempts"] + u["sess_attempts"]
    zip_ = u.get("shipping_zip") or ""
    nb = NEIGHBORHOOD.get(zip_[:5]) if zip_ else None
    nb_line = f" — we deliver in {nb}" if nb else ""
    cart = u.get("last_cart") or ""
    cart_line = f"You were looking at the {cart} — " if cart and "custom" not in cart.lower() else ""
    plural = "s" if n_attempts > 1 else ""
    attempts_line = (
        f"You tried to place an order with us {n_attempts} times and it never quite went through."
        if n_attempts > 1 else
        "You started an order with us but it never quite went through."
    )
    return f"""# Recovery email — {name} ({u['email']})

**Bucket:** C — high-intent abandoner ({n_attempts} attempt{plural}, 0 paid)
**To:** {u['email']}
**Send from:** {ANTHONY_EMAIL}
**Subject:** {first_name(name, u['email'])} — was there an issue with your Uncle May's order?

---

Hi {first_name(name, u['email'])},

I'm Anthony, the founder of Uncle May's Produce. {attempts_line} I wanted to reach out personally rather than have you get an automated reminder. {cart_line}I'm guessing it was either a payment hiccup, a browser issue, or you just got pulled away. We pushed several fixes to the checkout this week so it should behave better than it did then.

If you still want to give us a try{nb_line}, three ways forward — pick whichever is easiest:

1. **Try checkout again** at [{SHOP}]({SHOP}) — code **FRESH10** for $10 off your first order ($25 minimum).
2. **Call/text me at {PHONE}** and I'll take the order in 5 minutes.
3. **Grab 10 minutes on my calendar** so I can walk you through it AND hear what happened on your end: [{CALENDLY}]({CALENDLY}).

Honestly, option 3 is the one I'd value most. We're a small team a few weeks into testing this, and feedback from someone who almost ordered tells us more than feedback from someone who already did.

Thank you for trying us — and sorry it didn't work the first time.

Anthony Ivy
Founder, Uncle May's Produce
{PHONE}
{ANTHONY_EMAIL}

---

## Notes for sending
- {n_attempts} attempt{plural} = real intent. This person wanted to buy; something blocked them.
- If they reply, ask specifically: which step did the order fall apart on? Their answer points at the next checkout fix.
- Cart context: `{cart or "no cart summary in metadata"}`
- UTM source: `{u.get("utm_source") or "—"}` | campaign: `{u.get("utm_campaign") or "—"}`
"""


# Test-account heuristic — exclude
def is_test(email: str, name: str | None) -> bool:
    e = email.lower()
    if any(t in e for t in ["@test.com", "@example.com", "test+", "test_"]):
        return True
    if name and name.lower() in {"test user", "test webhook", "verify test", "final check", "test cto", "f c", "jane smith"}:
        return True
    return False


def main():
    universe = json.load(open(UNIVERSE))
    written = []
    skipped = []

    # Reserve names: alisia, linda, lia already done
    for u in universe:
        email = u["email"]
        name = u.get("name") or ""

        if email in ALREADY_DONE:
            skipped.append((email, "already personally drafted"))
            continue
        if email in EXCLUDE:
            skipped.append((email, "excluded"))
            continue
        if is_test(email, name):
            skipped.append((email, "test account"))
            continue
        # Doina is a special case — grandfathered $55/wk subscription, do NOT
        # send a B-bucket "why haven't you been back" since she's still active.
        if email == "doina.romanciuc.dr@gmail.com":
            skipped.append((email, "grandfathered active subscription — handle separately"))
            continue

        b = bucket(u)
        if b == "A":
            body = email_template_A(name, u)
        elif b == "B":
            body = email_template_B(name, u)
        else:
            body = email_template_C(name, u)

        path = os.path.join(OUT_DIR, f"{b.lower()}-{filename_from_email(email)}")
        with open(path, "w", encoding="utf-8") as f:
            f.write(body)
        written.append((b, email, os.path.basename(path)))

    print(f"\nWritten: {len(written)}")
    for b, e, p in sorted(written):
        print(f"  [{b}] {p:50s} -> {e}")
    print(f"\nSkipped: {len(skipped)}")
    for e, why in skipped:
        print(f"  - {e}: {why}")


if __name__ == "__main__":
    main()
