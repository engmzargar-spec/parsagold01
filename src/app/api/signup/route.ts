import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcrypt';
import { toJalaali } from 'jalaali-js';

function generateUserId() {
  const random = Math.floor(100000 + Math.random() * 900000);
  return `PG-${random}`;
}

export async function POST(request: Request) {
  try {
    const { firstName, lastName, email, phone, password } = await request.json();

    if (!firstName || !lastName || !phone || !password) {
      return NextResponse.json({ message: 'همه فیلدهای ضروری باید پر شوند.' }, { status: 400 });
    }

    const usersRoot = path.join(process.cwd(), 'public', 'users');
    const identifiersPath = path.join(usersRoot, 'identifiers.json');

    // ساخت پوشه users در صورت نیاز
    if (!fs.existsSync(usersRoot)) {
      fs.mkdirSync(usersRoot, { recursive: true });
    }

    // خواندن فایل identifiers.json
    let identifiersData: Record<string, any> = {};
    if (fs.existsSync(identifiersPath)) {
      identifiersData = JSON.parse(fs.readFileSync(identifiersPath, 'utf-8'));
    }

    // بررسی تکراری بودن شماره موبایل
    if (identifiersData[phone]) {
      return NextResponse.json({ message: 'شماره همراه قبلاً ثبت شده است.' }, { status: 409 });
    }

    // تولید شناسه یکتا
    let userId = generateUserId();
    while (fs.existsSync(path.join(usersRoot, userId))) {
      userId = generateUserId();
    }

    // هش رمز عبور
    const hashedPassword = await bcrypt.hash(password, 10);

    // تاریخ عضویت
    const now = new Date();
    const joinedAtGregorian = now.toISOString().split('T')[0];
    const { jy, jm, jd } = toJalaali(now);
    const joinedAtJalali = `${jy}/${String(jm).padStart(2, '0')}/${String(jd).padStart(2, '0')}`;

    // ساخت پوشه اختصاصی کاربر با شماره موبایل
    const userDir = path.join(usersRoot, phone);
    fs.mkdirSync(userDir, { recursive: true });

    // ذخیره اطلاعات در profile.json
    const profileData = {
      userId,
      firstName,
      lastName,
      email,
      phone,
      password: hashedPassword,
      joinedAtGregorian,
      joinedAtJalali,
    };
    fs.writeFileSync(path.join(userDir, 'profile.json'), JSON.stringify(profileData, null, 2), 'utf-8');

    // ذخیره تنظیمات اولیه در settings.json
    const settings = {
      language: 'fa',
      theme: 'dark',
      notifications: true,
    };
    fs.writeFileSync(path.join(userDir, 'settings.json'), JSON.stringify(settings, null, 2), 'utf-8');

    // ذخیره شناسه‌ها در identifiers.json
    identifiersData[phone] = {
      userId,
      email,
      phone,
    };
    fs.writeFileSync(identifiersPath, JSON.stringify(identifiersData, null, 2), 'utf-8');

    // ساخت پوشه‌های جانبی
    const subfolders = ['messages', 'transactions', 'trading', 'documents'];
    for (const folder of subfolders) {
      fs.mkdirSync(path.join(userDir, folder), { recursive: true });
    }

    return NextResponse.json({ message: 'ثبت‌نام با موفقیت انجام شد.', phone });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ message: 'خطا در پردازش ثبت‌نام.' }, { status: 500 });
  }
}
