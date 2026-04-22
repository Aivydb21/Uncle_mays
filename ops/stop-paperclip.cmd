@echo off
REM Stop the Paperclip server (kills node process on port 3100).
REM Double-click to run, or call from a scheduler.
REM Owner: CIO agent. See ops/paperclip-remote-access.md.

title Stop Paperclip

setlocal enabledelayedexpansion
set "PID="
for /f "tokens=5" %%a in ('netstat -ano ^| findstr LISTENING ^| findstr ":3100 "') do (
  set "PID=%%a"
)

if "%PID%"=="" (
  echo Paperclip is not running on port 3100.
  timeout /t 3
  exit /b 0
)

echo Stopping Paperclip PID %PID% ...
taskkill /F /PID %PID%

REM Verify it actually stopped
timeout /t 2 >nul
netstat -ano | findstr LISTENING | findstr ":3100 " >nul
if %errorlevel% equ 0 (
  echo WARNING: port 3100 is still listening. A second process may have taken it.
  exit /b 1
) else (
  echo Paperclip stopped. All agent heartbeats paused. No Claude usage.
  timeout /t 3
)
