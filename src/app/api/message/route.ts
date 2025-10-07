import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import { writeFile } from 'fs/promises';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log('📥 پیام دریافتی از کلاینت:', body);

    const { phone, type, title, content, metadata = {}, read = false } = body;

    // بررسی کامل بودن اطلاعات
    if (!phone || !type || !title || !content) {
      console.warn('⚠️ اطلاعات ناقص:', { phone, type, title, content });
      return NextResponse.json({ message: 'اطلاعات پیام ناقص است.' }, { status: 400 });
    }

    // زمان و شناسه یکتا
    const timestamp = new Date().toISOString();
    const messageId = Date.now();

    // امن‌سازی نوع پیام برای نام فایل
    const safeType = type.replace(/[^a-zA-Z0-9_-]/g, '');
    const fileName = `${timestamp}-${safeType}-${messageId}.json`;

    // مسیر ذخیره‌سازی پیام
    const messageDir = path.join(process.cwd(), 'public', 'users', phone, 'messages');
    const filePath = path.join(messageDir, fileName);

    // ساخت پوشه اگر وجود نداشت
    try {
      if (!fs.existsSync(messageDir)) {
        fs.mkdirSync(messageDir, { recursive: true });
        console.log('📁 پوشه ساخته شد:', messageDir);
      }
    } catch (mkdirError) {
      console.error('❌ خطا در ساخت پوشه:', mkdirError);
      return NextResponse.json({ message: 'خطا در ساخت پوشه پیام.' }, { status: 500 });
    }

    // ساختار پیام
    const messageData = {
      id: messageId,
      type,
      title,
      content,
      read,
      timestamp,
      metadata,
    };

    // ذخیره فایل
    try {
      await writeFile(filePath, JSON.stringify(messageData, null, 2), 'utf-8');
      console.log('✅ فایل پیام ذخیره شد:', filePath);
    } catch (writeError) {
      console.error('❌ خطا در ذخیره فایل پیام:', writeError);
      return NextResponse.json({ message: 'خطا در ذخیره فایل پیام.' }, { status: 500 });
    }

    return NextResponse.json({ message: '✅ پیام با موفقیت ذخیره شد.', file: fileName });
  } catch (error) {
    console.error('❌ خطای کلی در پردازش پیام:', error);
    return NextResponse.json({ message: 'خطا در پردازش پیام.' }, { status: 500 });
  }
}
