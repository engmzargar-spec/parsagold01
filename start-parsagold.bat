@echo off
echo در حال اجرای پروژه Parsagold...

REM اجرای سرور توسعه
start cmd /k "npm run dev"

REM صبر برای بالا آمدن سرور (مثلاً 5 ثانیه)
timeout /t 10 /nobreak >nul

REM باز کردن مرورگر پیش‌فرض روی localhost
start http://localhost:3000

echo پروژه اجرا شد و مرورگر باز شد.
