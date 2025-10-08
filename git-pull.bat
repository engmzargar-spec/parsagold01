@echo off
setlocal

:: Goto file path
cd /d %~dp0

echo 🔄 Fetching latest changes from origin/main...
git pull origin main

echo ✅ Done. Your local project is now up to date.
pause
