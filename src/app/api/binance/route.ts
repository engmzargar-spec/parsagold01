import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcrypt';

export async function POST(request: Request) {
  try {
    const { firstName, lastName, email, phone, password } = await request.json();

    if (!firstName || !lastName || !email || !phone || !password) {
      return NextResponse.json({ message: 'همه فیلدها الزامی هستند.' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const userData = {
      firstName,
      lastName,
      email,
      phone,
      password: hashedPassword,
      createdAt: new Date().toISOString(),
    };

    const usersDir = path.join(process.cwd(), 'users');
    if (!fs.existsSync(usersDir)) {
      fs.mkdirSync(usersDir);
    }

    const fileName = `${userData.phone}.json`;
    const filePath = path.join(usersDir, fileName);

    if (fs.existsSync(filePath)) {
      return NextResponse.json({ message: 'کاربری با این ایمیل قبلاً ثبت‌نام کرده است.' }, { status: 409 });
    }

    fs.writeFileSync(filePath, JSON.stringify(userData, null, 2), 'utf-8');

    return NextResponse.json({ message: 'ثبت‌نام با موفقیت انجام شد.' });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ message: 'خطا در پردازش ثبت‌نام.' }, { status: 500 });
  }
}
