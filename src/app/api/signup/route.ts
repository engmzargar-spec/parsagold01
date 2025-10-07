import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcrypt';
import { toJalaali } from 'jalaali-js';

export async function POST(request: Request) {
  try {
    const { firstName, lastName, email, phone, password } = await request.json();

    if (!firstName || !lastName || !email || !phone || !password) {
      return NextResponse.json({ message: 'همه فیلدها الزامی هستند.' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // تاریخ عضویت
    const now = new Date();
    const joinedAtGregorian = now.toISOString().split('T')[0];
    const { jy, jm, jd } = toJalaali(now);
    const joinedAtJalali = `${jy}/${String(jm).padStart(2, '0')}/${String(jd).padStart(2, '0')}`;

    const userData = {
      firstName,
      lastName,
      email,
      phone,
      password: hashedPassword,
      joinedAtGregorian,
      joinedAtJalali,
    };

    // مسیر ذخیره فایل داخل public/users
    const usersDir = path.join(process.cwd(), 'public', 'users');
    if (!fs.existsSync(usersDir)) {
      fs.mkdirSync(usersDir, { recursive: true });
    }

    const fileName = `${email}.json`;
    const filePath = path.join(usersDir, fileName);

    if (fs.existsSync(filePath)) {
      return NextResponse.json({ message: 'این ایمیل قبلاً ثبت شده است.' }, { status: 409 });
    }

    fs.writeFileSync(filePath, JSON.stringify(userData, null, 2), 'utf-8');

    return NextResponse.json({ message: 'ثبت‌نام با موفقیت انجام شد.' });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ message: 'خطا در پردازش ثبت‌نام.' }, { status: 500 });
  }
}
