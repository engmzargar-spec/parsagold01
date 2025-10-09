import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcrypt';
import moment from 'moment-jalaali';

export async function POST(request: Request) {
  try {
    const { phone, password } = await request.json();

    if (!phone || !password) {
      return NextResponse.json(
        { message: 'شماره همراه و رمز عبور الزامی هستند.' },
        { status: 400 }
      );
    }

    const usersRoot = path.join(process.cwd(), 'public', 'users');
    const userDir = path.join(usersRoot, phone);
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

    // حذف رمز عبور از داده‌های برگشتی
    delete userData.password;

    const safeUserData = {
      phone: userData.phone,
      firstName: userData.firstName || '',
      lastName: userData.lastName || '',
      email: userData.email || '',
      userId: userData.userId || '',
    };

    // ساخت پیام ورود
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
        phone: safeUserData.phone, // ✅ برای sessionStorage در کلاینت
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
