import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcrypt';
import moment from 'moment-jalaali';
import { getGeoInfo } from '@/utils/getGeoInfo';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phone, password, captchaInput, captchaCode } = body;

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

    if (captchaInput.trim().toLowerCase() !== captchaCode.trim().toLowerCase()) {
      return NextResponse.json({ message: 'کد امنیتی اشتباه است.' }, { status: 403 });
    }

    // تشخیص کشور از locale مرورگر یا آی‌پی
    const ip = request.headers.get('x-forwarded-for')?.toString() || request.socket.remoteAddress?.toString();
    const geo = getGeoInfo(ip);
    const countryCode = geo.country === 'IR' ? '0098' : '00' + geo.country; // پیش‌فرض ایران

    // ساخت شماره بین‌المللی
    const cleanedPhone = phone.replace(/\D/g, '').replace(/^0/, '');
    const fullPhone = countryCode + cleanedPhone;

    const usersRoot = path.join(process.cwd(), 'public', 'users');
    const userDir = path.join(usersRoot, fullPhone);
    const profilePath = path.join(userDir, 'profile.json');

    if (!fs.existsSync(profilePath)) {
      return NextResponse.json({ message: 'کاربری با این شماره همراه یافت نشد.' }, { status: 404 });
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
      ip: geo.ip,
      country: geo.country,
      city: geo.city,
      locale: geo.locale,
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
