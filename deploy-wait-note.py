import json, urllib.request, os

comment_text = """## Build Fix Pushed — Awaiting Vercel Deployment

**Status:** All 3 commits on origin/main, build passes locally, Vercel deploying.

Production still serving old code after ~6 min. Vercel can take up to 10 min for full deployment.

**If still not deployed in 10 minutes:** Anthony can manually trigger a redeploy in the Vercel dashboard (Deployments tab > redeploy latest).

Monitoring in background. Will post confirmation once `/products/weekly-produce-box` redirects to `/checkout/starter`.
"""

url = 'http://localhost:3100/api/issues/71fa1423-e38e-4657-97cb-75f4fa2f5ef0'
api_key = os.environ.get('PAPERCLIP_API_KEY')
run_id = os.environ.get('PAPERCLIP_RUN_ID')

payload = json.dumps({'comment': comment_text}).encode('utf-8')
req = urllib.request.Request(url, data=payload, headers={'Authorization': f'Bearer {api_key}', 'X-Paperclip-Run-Id': run_id, 'Content-Type': 'application/json'}, method='PATCH')
try:
    urllib.request.urlopen(req)
    print('Posted')
except urllib.error.HTTPError as e:
    print(f'Error: {e.read().decode()}')
