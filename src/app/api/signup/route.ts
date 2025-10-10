import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcrypt';
import { toJalaali } from 'jalaali-js';

function generateUserId() {
  const random = Math.floor(100000 + Math.random() * 900000);
  return `PG-${random}`;
}

function normalizePhone(phone: string): string {
  let cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('00')) return cleaned;
  if (cleaned.startsWith('0')) return '0098' + cleaned.slice(1);
  if (cleaned.length === 10) return '0098' + cleaned;
  return '00' + cleaned;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { firstName, lastName, email = '', phone, password } = body;

    if (!firstName || !lastName || !phone || !password) {
      return NextResponse.json({ message: 'همه فیلدهای ضروری باید پر شوند.' }, { status: 400 });
    }

    const normalizedPhone = normalizePhone(phone);
    const usersRoot = path.join(process.cwd(), 'public', 'users');
    const identifiersPath = path.join(usersRoot, 'identifiers.json');

    if (!fs.existsSync(usersRoot)) fs.mkdirSync(usersRoot, { recursive: true });

    let identifiersData: Record<string, any> = {};
    if (fs.existsSync(identifiersPath)) {
      try {
        identifiersData = JSON.parse(fs.readFileSync(identifiersPath, 'utf-8'));
      } catch {
        identifiersData = {};
      }
    }

    if (identifiersData[normalizedPhone]) {
      return NextResponse.json({ message: 'شماره همراه قبلاً ثبت شده است.' }, { status: 409 });
    }

    const userId = generateUserId();
    const hashedPassword = await bcrypt.hash(password, 10);

    const now = new Date();
    const joinedAtGregorian = now.toISOString().split('T')[0];
    const { jy, jm, jd } = toJalaali(now);
    const joinedAtJalali = `${jy}/${String(jm).padStart(2, '0')}/${String(jd).padStart(2, '0')}`;

    const userDir = path.join(usersRoot, normalizedPhone);
    fs.mkdirSync(userDir, { recursive: true });

    const profileData = {
      userId,
      firstName,
      lastName,
      email,
      phone: normalizedPhone,
      password: hashedPassword,
      joinedAtGregorian,
      joinedAtJalali,
    };

    fs.writeFileSync(path.join(userDir, 'profile.json'), JSON.stringify(profileData, null, 2), 'utf-8');

    const settings = { language: 'fa', theme: 'dark', notifications: true };
    fs.writeFileSync(path.join(userDir, 'settings.json'), JSON.stringify(settings, null, 2), 'utf-8');

    identifiersData[normalizedPhone] = {
      userId,
      email,
      phone: normalizedPhone,
      joinedAtGregorian,
      joinedAtJalali,
    };

    fs.writeFileSync(identifiersPath, JSON.stringify(identifiersData, null, 2), 'utf-8');

    const subfolders = ['messages', 'transactions', 'trading', 'documents', 'chart-layouts'];
    for (const folder of subfolders) {
      fs.mkdirSync(path.join(userDir, folder), { recursive: true });
    }

    return NextResponse.json({
      message: 'ثبت‌نام با موفقیت انجام شد.',
      phone: normalizedPhone,
      userId,
      firstName,
      lastName,
      email,
    });
  } catch (error: any) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { message: `خطا در ثبت‌نام: ${error.message || 'مشکلی پیش آمد.'}` },
      { status: 500 }
    );
  }
}
