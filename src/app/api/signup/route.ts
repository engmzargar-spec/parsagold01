import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcrypt';
import { toJalaali } from 'jalaali-js';

function generateUserId(): string {
  const random = Math.floor(100000 + Math.random() * 900000);
  return `PG-${random}`;
}

function detectOS(userAgent: string): string {
  if (!userAgent) return 'نامشخص';
  if (/windows/i.test(userAgent)) return 'Windows';
  if (/android/i.test(userAgent)) return 'Android';
  if (/iphone|ipad|ios/i.test(userAgent)) return 'iOS';
  if (/macintosh|mac os/i.test(userAgent)) return 'MacOS';
  if (/linux/i.test(userAgent)) return 'Linux';
  return 'نامشخص';
}

function formatJalali(date: Date): string {
  const { gy, gm, gd } = {
    gy: date.getFullYear(),
    gm: date.getMonth() + 1,
    gd: date.getDate(),
  };
  const { jy, jm, jd } = toJalaali(gy, gm, gd);
  const hh = date.getHours().toString().padStart(2, '0');
  const mm = date.getMinutes().toString().padStart(2, '0');
  return `${jy}/${jm.toString().padStart(2, '0')}/${jd.toString().padStart(2, '0')} - ${hh}:${mm}`;
}

export async function POST(request: Request) {
  try {
    console.log('📥 API /signup triggered');

    const body = await request.json();
    const { firstName, lastName, email, phone, password, os: rawOS, location } = body;

    if (!phone || !/^00\d{10,15}$/.test(phone)) {
      console.warn('⚠️ شماره معتبر نیست یا ارسال نشده:', phone);
      return NextResponse.json({ message: 'شماره بین‌المللی معتبر ارسال نشده.' }, { status: 400 });
    }

    if (!password || password.length < 8) {
      return NextResponse.json({ message: 'رمز عبور معتبر ارسال نشده.' }, { status: 400 });
    }

    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'ناشناخته';

    const os = detectOS(rawOS);
    const userId = generateUserId();

    const usersRoot = path.join(process.cwd(), 'public', 'users');
    const userDir = path.join(usersRoot, phone);

    try {
      if (!fs.existsSync(usersRoot)) fs.mkdirSync(usersRoot, { recursive: true });
      if (!fs.existsSync(userDir)) fs.mkdirSync(userDir, { recursive: true });
    } catch (err) {
      console.error('❌ خطا در ساخت پوشه‌های کاربر:', err);
      return NextResponse.json({ message: 'خطا در ساخت پوشه‌های کاربر' }, { status: 500 });
    }

    let hashedPassword = '';
    try {
      hashedPassword = await bcrypt.hash(password, 10);
    } catch (err) {
      console.error('❌ خطا در هش رمز عبور:', err);
      return NextResponse.json({ message: 'خطا در رمزگذاری رمز عبور' }, { status: 500 });
    }

    const now = new Date();
    const profile = {
      userId,
      firstName: firstName || '',
      lastName: lastName || '',
      email: email || '',
      phone,
      createdAt: now.toISOString(),
      createdAtJalali: formatJalali(now),
      ip,
      os,
      location: location || null,
    };

    const settings = {
      language: 'fa',
      theme: 'dark',
      notifications: true,
    };

    const identifiers = {
      userId,
      password: hashedPassword,
      verified: false,
      lastLogin: null,
      ip,
      os,
    };

    try {
      fs.writeFileSync(path.join(userDir, 'profile.json'), JSON.stringify(profile, null, 2), 'utf-8');
      fs.writeFileSync(path.join(userDir, 'settings.json'), JSON.stringify(settings, null, 2), 'utf-8');
      fs.writeFileSync(path.join(userDir, 'identifiers.json'), JSON.stringify(identifiers, null, 2), 'utf-8');
      const subDirs = ['messages', 'transactions', 'trades', 'logs', 'wallets'];

     subDirs.forEach((dir) => {
      const fullPath = path.join(userDir, dir);
      if (!fs.existsSync(fullPath)) fs.mkdirSync(fullPath);
     });
      
    } catch (err) {
      console.error('❌ خطا در ذخیره فایل‌های کاربر:', err);
      return NextResponse.json({ message: 'خطا در ذخیره اطلاعات کاربر' }, { status: 500 });
    }

    console.log(`✅ ثبت‌نام کاربر ${phone} با شناسه ${userId} انجام شد`);

    return NextResponse.json({ message: 'ثبت‌نام با موفقیت انجام شد', phone, userId }, { status: 200 });
  } catch (error: any) {
    console.error('❌ خطای کلی در اجرای API /signup:', error);
    return NextResponse.json({ message: '❌ خطا در اجرای ثبت‌نام' }, { status: 500 });
  }
}
