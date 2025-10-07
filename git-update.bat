@echo off
set /p msg=Enter commit message: 
git add .
pause
git commit -m "%msg%"
pause
git push
pause