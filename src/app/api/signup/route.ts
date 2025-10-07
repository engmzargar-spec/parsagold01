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

    if (!firstName || !lastName || !email || !phone || !password) {
      return NextResponse.json({ message: 'همه فیلدها الزامی هستند.' }, { status: 400 });
    }

    const usersRoot = path.join(process.cwd(), 'public', 'users');
    const identifiersPath = path.join(usersRoot, 'identifiers.json');

    // بررسی وجود پوشه users و فایل identifiers.json
    if (!fs.existsSync(usersRoot)) {
      fs.mkdirSync(usersRoot, { recursive: true });
    }

    let identifiersData: Record<string, any> = {};
    if (fs.existsSync(identifiersPath)) {
      identifiersData = JSON.parse(fs.readFileSync(identifiersPath, 'utf-8'));
    }

    const safeEmail = email.replace(/[@.]/g, '_');
    if (identifiersData[safeEmail]) {
      return NextResponse.json({ message: 'ایمیل یا شماره همراه قبلاً ثبت شده است.' }, { status: 409 });
    }

    // تولید شناسه یکتا
    let userId = generateUserId();
    while (fs.existsSync(path.join(usersRoot, userId))) {
      userId = generateUserId(); // جلوگیری از تکرار
    }

    // هش رمز عبور
    const hashedPassword = await bcrypt.hash(password, 10);

    // تاریخ عضویت
    const now = new Date();
    const joinedAtGregorian = now.toISOString().split('T')[0];
    const { jy, jm, jd } = toJalaali(now);
    const joinedAtJalali = `${jy}/${String(jm).padStart(2, '0')}/${String(jd).padStart(2, '0')}`;

    // ساخت پوشه اختصاصی کاربر
    const userDir = path.join(usersRoot, userId);
    fs.mkdirSync(userDir, { recursive: true });

    // ذخیره اطلاعات کاربر در profile.json
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

    // به‌روزرسانی فایل مرکزی identifiers.json
    identifiersData[safeEmail] = {
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

    // تنظیمات اولیه
    const settings = {
      language: 'fa',
      theme: 'dark',
      notifications: true,
    };
    fs.writeFileSync(path.join(userDir, 'settings.json'), JSON.stringify(settings, null, 2), 'utf-8');

    return NextResponse.json({ message: 'ثبت‌نام با موفقیت انجام شد.', userId });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ message: 'خطا در پردازش ثبت‌نام.' }, { status: 500 });
  }
}
