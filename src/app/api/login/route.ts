import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcrypt';

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

    // حذف رمز از حافظه برای امنیت بیشتر
    delete userData.password;

    // ارسال اطلاعات کامل برای Context
    const safeUserData = {
      phone: userData.phone,
      firstName: userData.firstName || '',
      lastName: userData.lastName || '',
      email: userData.email || '',
      userId: userData.userId || '', // اضافه شد برای هماهنگی با UserContext
    };

    return NextResponse.json(safeUserData);
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: 'خطا در پردازش ورود.' },
      { status: 500 }
    );
  }
}
