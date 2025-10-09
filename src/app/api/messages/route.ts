import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import { writeFile } from 'fs/promises';
import jalaali from 'jalaali-js';

const getMessagesDir = (phone: string) =>
  path.join(process.cwd(), 'public', 'users', phone, 'messages');

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { phone, type, title, content, metadata = {}, read = false } = body;

    if (!phone || !type || !title || !content) {
      return NextResponse.json({ message: 'اطلاعات پیام ناقص است.' }, { status: 400 });
    }

    const now = new Date();
    const { jy, jm, jd } = jalaali.toJalaali(now);
    const jalaliDate = `${jy}${String(jm).padStart(2, '0')}${String(jd).padStart(2, '0')}`;
    const time = `${now.getHours()}-${now.getMinutes()}-${now.getSeconds()}`;
    const safeType = type.replace(/[^a-zA-Z0-9_-]/g, '');
    const uniqueId = Date.now();
    const fileName = `${safeType}-${jalaliDate}-${time}-${uniqueId}.json`;

    const messageDir = getMessagesDir(phone);
    const filePath = path.join(messageDir, fileName);

    if (!fs.existsSync(messageDir)) {
      fs.mkdirSync(messageDir, { recursive: true });
    }

    const messageData = {
      id: uniqueId,
      type,
      title,
      content,
      read,
      timestamp: now.toISOString(),
      metadata,
    };

    await writeFile(filePath, JSON.stringify(messageData, null, 2), 'utf-8');

    return NextResponse.json({
      message: '✅ پیام با موفقیت ذخیره شد.',
      file: fileName,
      timestamp: messageData.timestamp,
    });
  } catch (error) {
    console.error('❌ خطا در ذخیره پیام:', error);
    return NextResponse.json({ message: 'خطا در ذخیره پیام.' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const phone = searchParams.get('phone');

    if (!phone) {
      return NextResponse.json({ message: 'شماره همراه الزامی است.' }, { status: 400 });
    }

    const messagesDir = getMessagesDir(phone);

    if (!fs.existsSync(messagesDir)) {
      return NextResponse.json({ messages: [] }, { status: 200 });
    }

    const files = fs.readdirSync(messagesDir).filter((f) => f.endsWith('.json'));
    const messages = [];

    for (const file of files) {
      try {
        const content = fs.readFileSync(path.join(messagesDir, file), 'utf-8');
        const msg = JSON.parse(content);
        messages.push(msg);
      } catch (err) {
        console.error(`❌ خطا در خواندن فایل پیام ${file}:`, err);
      }
    }

    const sorted = messages
      .filter((m) => m && m.title && m.content)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return NextResponse.json({ messages: sorted }, { status: 200 });
  } catch (error) {
    console.error('❌ خطا در دریافت پیام‌ها:', error);
    return NextResponse.json({ message: 'خطا در دریافت پیام‌ها.' }, { status: 500 });
  }
}
