@echo off
REM Start Paperclip server. Double-click to run, or call from a scheduler.
REM Owner: CIO agent. See ops/paperclip-remote-access.md.

title Paperclip Server

REM Check if already running
netstat -ano | findstr LISTENING | findstr ":3100 " >nul
if %errorlevel% equ 0 (
  echo Paperclip is already running on port 3100.
  echo UI: https://paperclip.taila8b3ff.ts.net
  timeout /t 5
  exit /b 0
)

cd /d C:\Users\Anthony\Desktop\um_website
echo Starting Paperclip...
npx paperclipai run
