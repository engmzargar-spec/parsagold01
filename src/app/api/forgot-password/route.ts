import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

function normalizePhone(phone: string): string {
  let cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('0')) return '0098' + cleaned.slice(1);
  if (cleaned.length === 10) return '0098' + cleaned;
  return cleaned;
}

function generateRecoveryCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: Request) {
  try {
    const { phone } = await request.json();
    if (!phone || typeof phone !== 'string') {
      return NextResponse.json({ message: 'شماره همراه الزامی است.' }, { status: 400 });
    }

    const normalizedPhone = normalizePhone(phone);
    const userDir = path.join(process.cwd(), 'public', 'users', normalizedPhone);
    const profilePath = path.join(userDir, 'profile.json');

    if (!fs.existsSync(profilePath)) {
      return NextResponse.json({ message: 'کاربری با این شماره یافت نشد.' }, { status: 404 });
    }

    const messagesDir = path.join(userDir, 'messages');
    if (!fs.existsSync(messagesDir)) {
      fs.mkdirSync(messagesDir, { recursive: true });
    }

    const code = generateRecoveryCode();
    const filePath = path.join(messagesDir, `recovery-${Date.now()}.json`);
    const recoveryMessage = {
      id: Date.now(),
      type: 'recovery',
      title: 'کد بازیابی رمز عبور',
      content: `کد بازیابی شما: ${code}`,
      code,
      timestamp: new Date().toISOString(),
      read: false,
    };

    fs.writeFileSync(filePath, JSON.stringify(recoveryMessage, null, 2), 'utf-8');

    return NextResponse.json({ message: 'کد بازیابی ارسال شد.' });
  } catch (error) {
    console.error('❌ Forgot password error:', error);
    return NextResponse.json({ message: 'خطا در پردازش درخواست.' }, { status: 500 });
  }
}
