import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcrypt';

export async function POST(request: Request) {
  try {
    const { identifier, password } = await request.json();

    if (!identifier || !password) {
      return NextResponse.json({ message: 'ایمیل یا شماره همراه و رمز عبور الزامی هستند.' }, { status: 400 });
    }

    const usersRoot = path.join(process.cwd(), 'public', 'users');
    const userFolders = fs.readdirSync(usersRoot);

    let matchedPhone: string | null = null;

    for (const folder of userFolders) {
      const identifiersPath = path.join(usersRoot, folder, 'identifiers.json');
      if (fs.existsSync(identifiersPath)) {
        const identifiers = JSON.parse(fs.readFileSync(identifiersPath, 'utf-8'));
        if (identifiers.email === identifier || identifiers.phone === identifier) {
          matchedPhone = folder;
          break;
        }
      }
    }

    if (!matchedPhone) {
      return NextResponse.json({ message: 'کاربری با این مشخصات یافت نشد.' }, { status: 404 });
    }

    const profilePath = path.join(usersRoot, matchedPhone, 'profile.json');
    if (!fs.existsSync(profilePath)) {
      return NextResponse.json({ message: 'فایل مشخصات کاربر یافت نشد.' }, { status: 500 });
    }

    const userData = JSON.parse(fs.readFileSync(profilePath, 'utf-8'));
    const isPasswordValid = await bcrypt.compare(password, userData.password);

    if (!isPasswordValid) {
      return NextResponse.json({ message: 'رمز عبور اشتباه است.' }, { status: 401 });
    }

    const { password: _, ...safeUserData } = userData;
    return NextResponse.json(safeUserData);
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ message: 'خطا در پردازش ورود.' }, { status: 500 });
  }
}
