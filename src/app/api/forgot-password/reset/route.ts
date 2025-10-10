import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcrypt';

function normalizePhone(phone: string): string {
  let cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('0')) return '0098' + cleaned.slice(1);
  if (cleaned.length === 10) return '0098' + cleaned;
  return cleaned;
}

export async function POST(request: Request) {
  try {
    const { phone, newPassword } = await request.json();
    if (!phone || !newPassword) {
      return NextResponse.json({ message: 'شماره و رمز جدید الزامی هستند.' }, { status: 400 });
    }

    const normalizedPhone = normalizePhone(phone);
    const profilePath = path.join(process.cwd(), 'public', 'users', normalizedPhone, 'profile.json');

    if (!fs.existsSync(profilePath)) {
      return NextResponse.json({ message: 'کاربری با این شماره یافت نشد.' }, { status: 404 });
    }

    const userData = JSON.parse(fs.readFileSync(profilePath, 'utf-8'));
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    userData.password = hashedPassword;

    fs.writeFileSync(profilePath, JSON.stringify(userData, null, 2), 'utf-8');

    return NextResponse.json({ message: 'رمز جدید با موفقیت ثبت شد.' });
  } catch (error) {
    console.error('❌ Reset password error:', error);
    return NextResponse.json({ message: 'خطا در ثبت رمز جدید.' }, { status: 500 });
  }
}
