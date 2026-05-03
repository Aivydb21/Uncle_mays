import json
import urllib.request
import os

# Get agent IDs
COMPANY_ID = "4feca4d1-108b-4905-b16a-ed9538c6f9ef"
GOAL_ID = "d45fd7bc-5453-409a-85d8-4c2a92bc0b98"
PARENT_ID = "b7223c72-1717-46f8-abaf-3802dd667e25"  # UNC-224
RUN_ID = os.environ.get("PAPERCLIP_RUN_ID")

# Get agents list to find RevOps, CTO, Advertising Creative
req = urllib.request.Request(f"http://localhost:3100/api/companies/{COMPANY_ID}/agents")
resp = urllib.request.urlopen(req, timeout=30)
agents = json.loads(resp.read())

agent_map = {}
for agent in agents:
    if agent["title"] in ["RevOps", "CTO", "Advertising Creative"]:
        agent_map[agent["title"]] = agent["id"]

print("Agent IDs:")
for title, aid in agent_map.items():
    print(f"  {title}: {aid}")

# Create tasks
tasks = [
    {
        "title": "Audit Stripe checkout flow for friction points (Phase 1)",
        "description": """## Context

From [UNC-224](/UNC/issues/UNC-224) strategic analysis: current checkout completion rate is 7.7% (3 of 39 starters). Industry average is 30-40%. We're losing 36 ready-to-buy customers every month.

## Task

Audit the full Stripe checkout flow and document all friction points:

1. **Flow analysis:**
   - How many steps from "Start Checkout" to "Order Confirmed"?
   - What info is required at each step?
   - Mobile vs. desktop experience differences?
   - Guest checkout available?

2. **Transparency check:**
   - Are shipping costs shown upfront (before checkout)?
   - Is delivery date/window clear before purchase?
   - Are there any surprise fees at checkout?
   - Is the total price visible throughout?

3. **Trust signals:**
   - Is "Powered by Stripe" visible?
   - Security badges present?
   - Any social proof on checkout page?

4. **Performance:**
   - Page load time on mobile?
   - Any technical errors or broken flows?

## Deliverable

Document with:
- Screenshot of each checkout step
- List of friction points ranked by severity
- Recommended fixes (prioritized)

## Success Criteria

Clear roadmap of checkout improvements that will increase completion rate from 7.7% to 30%+.

**Related:** [UNC-224](/UNC/issues/UNC-224) Phase 1, Week 1 priority""",
        "assignee": "RevOps",
        "priority": "critical",
    },
    {
        "title": "Deploy abandoned checkout email recovery automation (Phase 1)",
        "description": """## Context

From [UNC-224](/UNC/issues/UNC-224): 36 people started checkout in last 30 days but abandoned (92% abandonment). Industry recovery rate is 10-15%, which would add 3-5 orders/month.

## Task

Deploy abandoned checkout email recovery using existing Trigger.dev infrastructure:

1. **Verify Stripe webhook:**
   - Confirm `checkout.session.created` webhook is firing
   - Confirm customer email is captured in checkout-store
   - Test webhook to checkout-store flow

2. **Email sequence (coordinate with Advertising Creative for copy):**
   - Email 1 (1 hour): "You left items in your cart" + direct link to complete
   - Email 2 (24 hours): Reminder + "Order by Thursday for Sunday delivery" urgency
   - Email 3 (48 hours): Final urgency + scarcity ("Limited boxes left this week")

3. **Mailchimp automation:**
   - Create Mailchimp automation workflow
   - Trigger from checkout-store data
   - Include UTM parameters for tracking
   - A/B test subject lines

4. **Conversion tracking:**
   - Track opens, clicks, and completed purchases from recovery emails
   - Report weekly on recovery rate

## Existing Infrastructure

- Stripe webhook configured
- Trigger.dev scripts exist
- Checkout store logic exists but may need activation

## Success Criteria

- 10-15% recovery rate (3-5 orders/month from 36 abandoners)
- Email automation running automatically within 1 hour of abandonment
- Weekly reporting on recovery performance

**Related:** [UNC-224](/UNC/issues/UNC-224) Phase 1, Week 1 priority""",
        "assignee": "RevOps",
        "priority": "critical",
    },
    {
        "title": "Add trust signals and urgency to Stripe checkout page (Phase 1)",
        "description": """## Context

From [UNC-224](/UNC/issues/UNC-224): 92% checkout abandonment (36 of 39) suggests trust issues or lack of urgency. Adding trust signals and urgency messaging at checkout can improve completion rate from 7.7% to 30%+.

## Task

Modify the Stripe checkout page to include:

1. **Trust signals:**
   - "Secure checkout powered by Stripe" badge
   - SSL/security icon
   - "Your payment info is encrypted and secure" message
   - Social proof: "89% of customers refer friends to Uncle May's"

2. **Urgency messaging:**
   - "Order by Thursday 11:59pm for Sunday delivery"
   - Countdown timer to Thursday cutoff (if dynamic)
   - "Limited boxes available this week" (if true)

3. **Value reinforcement:**
   - Brief reminder of what's in the box
   - Price breakdown ($30 box = ~$3-5 per meal)
   - "Free delivery on orders over $X" (if applicable)

4. **Mobile optimization:**
   - Ensure all elements are thumb-friendly
   - Fast load time (<2 seconds)
   - Single-column layout on mobile

## Technical Notes

- Stripe Checkout is hosted by Stripe, so customization is limited
- Use checkout session metadata to pass messaging
- Consider Stripe Checkout custom success page for trust signals
- Alternatively, add trust signals to the product page BEFORE checkout

## Success Criteria

- Checkout completion rate increases from 7.7% to 20%+ (conservative target)
- Mobile checkout experience is optimized
- Trust and urgency signals are visible on all devices

**Related:** [UNC-224](/UNC/issues/UNC-224) Phase 1, Week 1 priority""",
        "assignee": "CTO",
        "priority": "critical",
    },
    {
        "title": "Draft abandoned checkout email sequence (3 emails, Phase 1)",
        "description": """## Context

From [UNC-224](/UNC/issues/UNC-224): 36 people abandoned checkout in last 30 days. Email recovery can convert 10-15% (3-5 orders/month). Need compelling copy for 3-email sequence.

## Task

Write copy for 3 abandoned checkout emails:

**Email 1 (1 hour after abandonment):**
- Subject line (A/B test 2-3 variants)
- Body: "You left items in your cart" + product reminder
- Clear CTA: "Complete Your Order" (direct link to checkout)
- Keep it short (max 2 paragraphs)

**Email 2 (24 hours):**
- Subject line (urgency-focused)
- Body: Reminder + "Order by Thursday for Sunday delivery"
- Add social proof: "89% of customers refer friends"
- CTA: "Order Now for This Week's Delivery"

**Email 3 (48 hours, final):**
- Subject line (scarcity + urgency)
- Body: "Last chance" + "Limited boxes left this week"
- Add testimonial or value prop
- Strong final CTA

## Style Guidelines

- No em dashes (use commas, periods, or colons)
- Max 2 paragraphs per email body
- Community-focused tone (culturally specific, not generic e-commerce)
- Lead with value/benefit, not feature
- Include phone number: (312) 972-2595

## Deliverable

- 3 complete email drafts (HTML-ready for Mailchimp)
- 2-3 subject line variants per email for A/B testing
- Preview text for each email

## Success Criteria

- Copy is ready for RevOps to deploy in Mailchimp
- Emails test the right recovery levers (urgency, social proof, scarcity)
- Tone aligns with Uncle May's brand voice

**Related:** [UNC-224](/UNC/issues/UNC-224) Phase 1, coordinate with RevOps for deployment""",
        "assignee": "Advertising Creative",
        "priority": "high",
    },
]

created = []
for task in tasks:
    payload = {
        "title": task["title"],
        "description": task["description"],
        "status": "todo",
        "priority": task["priority"],
        "assigneeAgentId": agent_map.get(task["assignee"]),
        "parentId": PARENT_ID,
        "goalId": GOAL_ID,
    }

    req = urllib.request.Request(
        f"http://localhost:3100/api/companies/{COMPANY_ID}/issues",
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Content-Type": "application/json",
            "X-Paperclip-Run-Id": RUN_ID,
        },
        method="POST",
    )

    try:
        resp = urllib.request.urlopen(req, timeout=30)
        result = json.loads(resp.read())
        created.append({
            "identifier": result["identifier"],
            "title": task["title"],
            "assignee": task["assignee"],
        })
        print(f"Created {result['identifier']}: {task['title'][:50]}...")
    except Exception as e:
        print(f"Failed to create task for {task['assignee']}: {e}")

print(f"\n{len(created)} tasks created successfully")
