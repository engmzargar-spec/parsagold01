import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcrypt';

export async function POST(request: Request) {
  try {
    const { phone, password } = await request.json();

    if (!phone || !password) {
      return NextResponse.json({ message: 'شماره همراه و رمز عبور الزامی هستند.' }, { status: 400 });
    }

    const usersDir = path.join(process.cwd(), 'users');
    const filePath = path.join(usersDir, `${phone}.json`);

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ message: 'کاربری با این شماره همراه یافت نشد.' }, { status: 404 });
    }

    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const userData = JSON.parse(fileContent);

    const isPasswordValid = await bcrypt.compare(password, userData.password);
    if (!isPasswordValid) {
      return NextResponse.json({ message: 'رمز عبور اشتباه است.' }, { status: 401 });
    }

    // حذف رمز عبور از پاسخ
    const { password: _, ...safeUserData } = userData;

    return NextResponse.json(safeUserData);
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ message: 'خطا در پردازش ورود.' }, { status: 500 });
  }
}
