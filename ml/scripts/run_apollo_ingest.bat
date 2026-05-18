@echo off
REM UNC-1139: Apollo contacts 48h ingest
REM Scheduled via Windows Task Scheduler — runs every 2 days at 10:15 CDT
REM Freshness threshold: 60h (freshness_check.py:32)

cd /d "C:\Users\Anthony\Desktop\um_website"
py -m ml.ingest.apollo >> "C:\Users\Anthony\Desktop\um_website\ml\logs\apollo_ingest.log" 2>&1
