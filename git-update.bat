@echo off
setlocal

:: Navigate to project folder (optional if already inside)
cd /d %~dp0

:: Prompt for commit message
set /p COMMIT_MSG=Enter your commit message: 

echo Adding all changes...
git add .

echo Committing with message: "%COMMIT_MSG%"
git commit -m "%COMMIT_MSG%"

echo Pushing to origin/main...
git push origin main

echo Done. Your changes have been pushed.
pause
