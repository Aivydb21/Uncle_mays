#!/usr/bin/env python3
"""Update the April 2026 Mailchimp newsletter with new copy and Calendly link."""

import json
import urllib.request
import os
import base64

config = json.load(open(os.path.expanduser("~/.claude/mailchimp-config.json")))
API_KEY = config["api_key"]
BASE_URL = config["base_url"]
auth = base64.b64encode(("any:" + API_KEY).encode()).decode()

campaign_id = "f2138eee92"

new_html = """<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>*|MC:SUBJECT|*</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="">
<!--[if !mso]><!--><link rel="stylesheet" type="text/css" href="https://fonts.googleapis.com/css?family=Playfair+Display:400,400i,700,700i,900,900i"><!--<![endif]-->
<style type="text/css">
body{margin:0;padding:0;background-color:rgb(234,236,226);font-family:Arial,'Helvetica Neue',Helvetica,sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;}
table{border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;}
img{border:0;height:auto;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic;}
p{margin:0;padding:0;font-size:16px;line-height:1.5;color:rgb(0,0,0);text-align:left;}
h3{font-family:'Playfair Display',Georgia,'Times New Roman',serif;font-size:20px;font-weight:bold;line-height:1.5;color:rgb(0,0,0);text-align:left;margin:0;padding:0;}
a{color:rgb(0,108,115);text-decoration:underline;}
@media only screen and (max-width:480px){
  .wrapper{width:100%!important;max-width:100%!important;}
  .content-padding{padding-left:16px!important;padding-right:16px!important;}
}
</style>
</head>
<body style="margin:0;padding:0;background-color:rgb(234,236,226);">

<!-- Page background -->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:rgb(234,236,226);">
<tr><td align="center" style="padding:20px 10px;">

<!-- Main container 660px -->
<table role="presentation" class="wrapper" width="660" cellpadding="0" cellspacing="0" style="max-width:660px;width:100%;background-color:rgb(234,236,226);">

<!-- Header: Tan bar -->
<tr>
<td style="background-color:#d2c3b1;padding:32px 24px;text-align:center;">
<h1 style="margin:0;font-family:'Playfair Display',Georgia,'Times New Roman',serif;font-size:28px;font-weight:700;color:rgb(0,0,0);letter-spacing:0.5px;">Uncle May&#8217;s Produce</h1>
</td>
</tr>

<!-- White divider -->
<tr><td style="background-color:transparent;padding:12px 24px;"><table width="100%" cellpadding="0" cellspacing="0" role="presentation"><tr><td style="border-top:2px solid #ffffff;line-height:0;font-size:0;">&#160;</td></tr></table></td></tr>

<!-- Intro -->
<tr>
<td class="content-padding" style="padding:12px 24px 12px 24px;">
<p style="margin:0 0 16px 0;">Hi *|FNAME:everyone|*,</p>
<p style="margin:0 0 16px 0;">I wanted to share a quick update as we continue building Uncle May&#8217;s Produce.</p>
<p style="margin:0 0 16px 0;"><strong>Black consumers are not disloyal shoppers. They are underserved.</strong></p>
<p style="margin:0 0 16px 0;">Recent data continues to reinforce a core insight:</p>
<table align="center" cellpadding="0" cellspacing="0" role="presentation"><tr><td style="text-align:left;font-size:16px;line-height:1.5;color:rgb(0,0,0);">
<ul style="margin:0 0 16px 0;padding-left:20px;">
<li style="margin-bottom:8px;">Black households shop at 3&#8211;4 grocery stores per month vs. 2&#8211;3 for the general population</li>
<li style="margin-bottom:8px;">67% of Black shoppers visit 3+ stores monthly vs. 43% of white shoppers</li>
<li style="margin-bottom:8px;">McKinsey &amp; Company found Black consumers are 1.5x more likely to switch stores based on product availability than price</li>
</ul>
</td></tr></table>
<p style="margin:0 0 16px 0;">This isn&#8217;t irrational behavior. It&#8217;s a structural market failure.</p>
<p style="margin:0 0 0 0;">No single retailer is meeting the full set of needs.</p>
</td>
</tr>

<!-- White divider -->
<tr><td style="background-color:transparent;padding:20px 24px;"><table width="100%" cellpadding="0" cellspacing="0" role="presentation"><tr><td style="border-top:2px solid #ffffff;line-height:0;font-size:0;">&#160;</td></tr></table></td></tr>

<!-- The opportunity -->
<tr>
<td class="content-padding" style="padding:12px 24px 12px 24px;">
<h3 style="margin:0 0 16px 0;">The opportunity: reduce the cost of shopping</h3>
<p style="margin:0 0 16px 0;">Economist William Coase demonstrated that transaction costs, the friction of search, time, and substitution, shape how markets organize. When a retailer reduces total shopping friction, it captures disproportionate share of wallet.</p>
<p style="margin:0 0 0 0;">This is the foundation of what we&#8217;re building.</p>
</td>
</tr>

<!-- White divider -->
<tr><td style="background-color:transparent;padding:20px 24px;"><table width="100%" cellpadding="0" cellspacing="0" role="presentation"><tr><td style="border-top:2px solid #ffffff;line-height:0;font-size:0;">&#160;</td></tr></table></td></tr>

<!-- Early signal -->
<tr>
<td class="content-padding" style="padding:12px 24px 12px 24px;">
<h3 style="margin:0 0 16px 0;">Early signal from customer acquisition</h3>
<p style="margin:0 0 16px 0;">We&#8217;ve begun testing paid acquisition through Meta channels (Facebook &amp; Instagram):</p>
<table align="center" cellpadding="0" cellspacing="0" role="presentation"><tr><td style="text-align:left;font-size:16px;line-height:1.5;color:rgb(0,0,0);">
<ul style="margin:0 0 16px 0;padding-left:20px;">
<li style="margin-bottom:8px;"><strong>~$10 customer acquisition cost</strong> in early testing</li>
<li style="margin-bottom:8px;">No structured funnel, no retargeting, no optimization yet</li>
</ul>
</td></tr></table>
<p style="margin:0 0 16px 0;">Even at this early stage, we&#8217;re seeing clear conversion behavior.</p>
<p style="margin:0 0 0 0;">At the same time, we encountered platform constraints when marketing culturally specific products and messaging. An important signal that digital acquisition alone may not be the most efficient wedge.</p>
</td>
</tr>

<!-- White divider -->
<tr><td style="background-color:transparent;padding:20px 24px;"><table width="100%" cellpadding="0" cellspacing="0" role="presentation"><tr><td style="border-top:2px solid #ffffff;line-height:0;font-size:0;">&#160;</td></tr></table></td></tr>

<!-- Real-world demand -->
<tr>
<td class="content-padding" style="padding:12px 24px 12px 24px;">
<h3 style="margin:0 0 16px 0;">Real-world demand is showing up</h3>
<p style="margin:0 0 16px 0;">Chicago recently hosted a large-scale Buy Black market with strong turnout and vendor participation.</p>
<p style="margin:0 0 20px 0;">When the right environment exists, demand is not the issue. Access is.</p>

<!-- YouTube Video Thumbnail Embed -->
<table align="center" cellpadding="0" cellspacing="0" role="presentation" style="margin:0 auto;">
<tr>
<td align="center">
<a href="https://www.youtube.com/watch?v=MrdEzRUdaeA" target="_blank" style="display:block;text-decoration:none;">
<img src="https://img.youtube.com/vi/MrdEzRUdaeA/hqdefault.jpg" alt="Watch: Chicago Buy Black Market Event" width="560" style="width:100%;max-width:560px;height:auto;border-radius:6px;display:block;">
</a>
</td>
</tr>
<tr>
<td align="center" style="padding-top:12px;">
<a href="https://www.youtube.com/watch?v=MrdEzRUdaeA" target="_blank" style="color:rgb(0,108,115);font-size:14px;font-weight:bold;text-decoration:underline;">&#9654; Watch the event video</a>
</td>
</tr>
</table>
</td>
</tr>

<!-- White divider -->
<tr><td style="background-color:transparent;padding:20px 24px;"><table width="100%" cellpadding="0" cellspacing="0" role="presentation"><tr><td style="border-top:2px solid #ffffff;line-height:0;font-size:0;">&#160;</td></tr></table></td></tr>

<!-- What this means -->
<tr>
<td class="content-padding" style="padding:12px 24px 12px 24px;">
<h3 style="margin:0 0 16px 0;">What this means</h3>
<p style="margin:0 0 16px 0;">Uncle May&#8217;s is evolving beyond a retail concept into:</p>
<p style="margin:0 0 8px 0;">&#8594; A demand aggregation engine</p>
<p style="margin:0 0 8px 0;">&#8594; A distribution layer for culturally specific products</p>
<p style="margin:0 0 0 0;">&#8594; A data platform built on real consumer behavior</p>
</td>
</tr>

<!-- White divider -->
<tr><td style="background-color:transparent;padding:20px 24px;"><table width="100%" cellpadding="0" cellspacing="0" role="presentation"><tr><td style="border-top:2px solid #ffffff;line-height:0;font-size:0;">&#160;</td></tr></table></td></tr>

<!-- Where we could use help -->
<tr>
<td class="content-padding" style="padding:12px 24px 12px 24px;">
<h3 style="margin:0 0 16px 0;">Where we could use help</h3>
<p style="margin:0 0 12px 0;">We&#8217;re actively looking to connect with people who have experience in:</p>
<table align="center" cellpadding="0" cellspacing="0" role="presentation"><tr><td style="text-align:left;font-size:16px;line-height:1.5;color:rgb(0,0,0);">
<ul style="margin:0 0 16px 0;padding-left:20px;">
<li style="margin-bottom:6px;">Digital customer acquisition (especially paid social, growth loops, or marketplace scaling)</li>
<li style="margin-bottom:6px;">Grocery / food retail operations</li>
<li style="margin-bottom:6px;">Community-driven distribution models</li>
</ul>
</td></tr></table>
<p style="margin:0 0 0 0;">If that&#8217;s you, or someone in your network, I&#8217;d greatly appreciate an introduction.</p>
</td>
</tr>

<!-- White divider -->
<tr><td style="background-color:transparent;padding:20px 24px;"><table width="100%" cellpadding="0" cellspacing="0" role="presentation"><tr><td style="border-top:2px solid #ffffff;line-height:0;font-size:0;">&#160;</td></tr></table></td></tr>

<!-- Closing -->
<tr>
<td class="content-padding" style="padding:12px 24px 12px 24px;">
<p style="margin:0 0 16px 0;">We&#8217;re continuing to make progress on site and capital strategy and will share more soon.</p>
<p style="margin:0 0 16px 0;">Appreciate the continued support.</p>
</td>
</tr>

<!-- White divider -->
<tr><td style="background-color:transparent;padding:12px 24px;"><table width="100%" cellpadding="0" cellspacing="0" role="presentation"><tr><td style="border-top:2px solid #ffffff;line-height:0;font-size:0;">&#160;</td></tr></table></td></tr>

<!-- Sign-off -->
<tr>
<td class="content-padding" style="padding:12px 24px 24px 24px;">
<p style="margin:0 0 4px 0;">Best,</p>
<p style="margin:0 0 4px 0;"><strong>Anthony Ivy</strong></p>
<p style="margin:0 0 4px 0;font-size:14px;color:rgb(77,77,77);">Founder &amp; CEO, Uncle May&#8217;s Produce</p>
<p style="margin:0 0 4px 0;font-size:14px;color:rgb(77,77,77);"><a href="mailto:anthony@unclemays.com" style="color:rgb(0,108,115);">anthony@unclemays.com</a> | (312) 972-2595</p>
<p style="margin:0 0 0 0;font-size:14px;color:rgb(77,77,77);"><a href="https://calendly.com/anthony-unclemays/30min" style="color:rgb(0,108,115);">Schedule a meeting</a></p>
</td>
</tr>

<!-- Footer tan bar -->
<tr>
<td style="background-color:#d2c3b1;padding:20px 24px;text-align:center;">
<p style="margin:0 0 8px 0;font-size:12px;color:rgb(77,77,77);text-align:center;">Uncle May&#8217;s Produce | 1452 E 53rd St, Chicago, IL 60615</p>
<p style="margin:0;font-size:12px;color:rgb(77,77,77);text-align:center;"><a href="*|UNSUB|*" style="color:rgb(77,77,77);text-decoration:underline;">Unsubscribe</a>&#160;&#160;|&#160;&#160;<a href="*|ARCHIVE|*" style="color:rgb(77,77,77);text-decoration:underline;">View in browser</a></p>
</td>
</tr>

</table>
<!-- /Main container -->

</td></tr>
</table>
<!-- /Page background -->

</body>
</html>"""

payload = json.dumps({"html": new_html}).encode("utf-8")

req = urllib.request.Request(
    f"{BASE_URL}/campaigns/{campaign_id}/content",
    data=payload,
    headers={"Authorization": f"Basic {auth}", "Content-Type": "application/json"},
    method="PUT",
)

try:
    resp = urllib.request.urlopen(req, timeout=30)
    result = json.loads(resp.read())
    print(f"Content updated successfully")
    print(f"HTML length: {len(result.get('html', ''))}")
except urllib.error.HTTPError as e:
    body = e.read().decode()
    print(f"HTTP {e.code}: {body[:500]}")
