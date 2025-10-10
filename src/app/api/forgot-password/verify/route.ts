import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

function normalizePhone(phone: string): string {
  let cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('0')) return '0098' + cleaned.slice(1);
  if (cleaned.length === 10) return '0098' + cleaned;
  return cleaned;
}

export async function POST(request: Request) {
  try {
    const { phone, code } = await request.json();
    if (!phone || !code) {
      return NextResponse.json({ message: 'شماره و کد الزامی هستند.' }, { status: 400 });
    }

    const normalizedPhone = normalizePhone(phone);
    const messagesDir = path.join(process.cwd(), 'public', 'users', normalizedPhone, 'messages');

    if (!fs.existsSync(messagesDir)) {
      return NextResponse.json({ message: 'کدی برای این شماره یافت نشد.' }, { status: 404 });
    }

    const files = fs.readdirSync(messagesDir).filter((f) => f.startsWith('recovery-'));
    const latestFile = files.sort().reverse()[0];
    if (!latestFile) {
      return NextResponse.json({ message: 'کدی ثبت نشده است.' }, { status: 404 });
    }

    const filePath = path.join(messagesDir, latestFile);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    if (data.code !== code.trim()) {
      return NextResponse.json({ message: 'کد اشتباه است.' }, { status: 403 });
    }

    return NextResponse.json({ message: 'کد تأیید شد.' });
  } catch (error) {
    console.error('❌ Verify code error:', error);
    return NextResponse.json({ message: 'خطا در بررسی کد.' }, { status: 500 });
  }
}
