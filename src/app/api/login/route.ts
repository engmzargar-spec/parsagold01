import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcrypt';
import moment from 'moment-jalaali';

function normalizePhone(phone: string): string {
  let cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('0')) return '0098' + cleaned.slice(1);
  if (cleaned.length === 10) return '0098' + cleaned;
  return cleaned;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phone, password, captchaInput, captchaCode } = body;

    // بررسی کامل بودن فیلدها
    if (
      typeof phone !== 'string' ||
      typeof password !== 'string' ||
      typeof captchaInput !== 'string' ||
      typeof captchaCode !== 'string' ||
      !phone.trim() ||
      !password.trim() ||
      !captchaInput.trim() ||
      !captchaCode.trim()
    ) {
      return NextResponse.json(
        { message: 'همه فیلدها از جمله کد امنیتی الزامی هستند.' },
        { status: 400 }
      );
    }

    // بررسی کپچا بدون حساسیت به حروف
    if (captchaInput.trim().toLowerCase() !== captchaCode.trim().toLowerCase()) {
      return NextResponse.json(
        { message: 'کد امنیتی اشتباه است.' },
        { status: 403 }
      );
    }

    // تبدیل شماره داخلی به بین‌المللی
    const normalizedPhone = normalizePhone(phone);

    const usersRoot = path.join(process.cwd(), 'public', 'users');
    const userDir = path.join(usersRoot, normalizedPhone);
    const profilePath = path.join(userDir, 'profile.json');

    if (!fs.existsSync(profilePath)) {
      return NextResponse.json(
        { message: 'کاربری با این شماره همراه یافت نشد.' },
        { status: 404 }
      );
    }

    const userData = JSON.parse(fs.readFileSync(profilePath, 'utf-8'));
    const isPasswordValid = await bcrypt.compare(password, userData.password);
    if (!isPasswordValid) {
      return NextResponse.json({ message: 'رمز عبور اشتباه است.' }, { status: 401 });
    }

    delete userData.password;

    const safeUserData = {
      phone: userData.phone,
      firstName: userData.firstName || '',
      lastName: userData.lastName || '',
      email: userData.email || '',
      userId: userData.userId || '',
    };

    // ذخیره پیام ورود
    const messagesDir = path.join(userDir, 'messages');
    if (!fs.existsSync(messagesDir)) {
      fs.mkdirSync(messagesDir, { recursive: true });
    }

    const now = moment();
    const jalaliDate = now.format('jYYYYjMMjDD');
    const time = now.format('HH-mm-ss');
    const filename = `login-${jalaliDate}-${time}-${Date.now()}.json`;
    const filePath = path.join(messagesDir, filename);

    const loginMessage = {
      id: Date.now(),
      type: 'login',
      title: 'ورود موفق',
      content: `کاربر ${safeUserData.firstName} ${safeUserData.lastName} با شناسه ${safeUserData.userId} وارد شد.`,
      timestamp: now.toISOString(),
      read: false,
    };

    try {
      fs.writeFileSync(filePath, JSON.stringify(loginMessage, null, 2), 'utf-8');
    } catch (err) {
      console.error('❌ خطا در ذخیره پیام ورود:', err);
    }

    return NextResponse.json(
      {
        message: 'ورود موفقیت‌آمیز بود',
        user: safeUserData,
        phone: safeUserData.phone,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ Login error:', error);
    return NextResponse.json(
      { message: 'خطا در پردازش ورود.' },
      { status: 500 }
    );
  }
}
