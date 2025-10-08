import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import { writeFile } from 'fs/promises';

const getMessagesDir = (phone: string) =>
  path.join(process.cwd(), 'public', 'users', phone, 'messages');

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { phone, type, title, content, metadata = {}, read = false } = body;

    if (!phone || !type || !title || !content) {
      return NextResponse.json({ message: 'اطلاعات پیام ناقص است.' }, { status: 400 });
    }

    const timestamp = new Date().toISOString();
    const messageId = Date.now();
    const safeType = type.replace(/[^a-zA-Z0-9_-]/g, '');
    const fileName = `${messageId}-${safeType}.json`;

    const messageDir = getMessagesDir(phone);
    const filePath = path.join(messageDir, fileName);

    if (!fs.existsSync(messageDir)) {
      fs.mkdirSync(messageDir, { recursive: true });
    }

    const messageData = {
      id: messageId,
      type,
      title,
      content,
      read,
      timestamp,
      metadata,
    };

    await writeFile(filePath, JSON.stringify(messageData, null, 2), 'utf-8');
    return NextResponse.json({ message: '✅ پیام با موفقیت ذخیره شد.', file: fileName });
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
      return NextResponse.json({ message: 'پوشه پیام‌ها یافت نشد.' }, { status: 404 });
    }

    const files = fs.readdirSync(messagesDir).filter((f) => f.endsWith('.json'));
    const messages = [];

    for (const file of files) {
      try {
        const content = fs.readFileSync(path.join(messagesDir, file), 'utf-8');
        const json = JSON.parse(content);
        messages.push(json);
      } catch (err) {
        console.error(`❌ خطا در خواندن پیام ${file}:`, err);
      }
    }

    const sorted = messages
      .filter((m) => m && m.title && m.content)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return NextResponse.json(sorted);
  } catch (error) {
    console.error('❌ خطا در دریافت پیام‌ها:', error);
    return NextResponse.json({ message: 'خطا در دریافت پیام‌ها.' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { phone, id } = body;

    if (!phone || !id) {
      return NextResponse.json({ message: 'شناسه و شماره همراه الزامی است.' }, { status: 400 });
    }

    const messagesDir = getMessagesDir(phone);
    const files = fs.readdirSync(messagesDir).filter((f) => f.endsWith('.json'));

    for (const file of files) {
      const filePath = path.join(messagesDir, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      const msg = JSON.parse(content);

      if (msg.id === id) {
        msg.read = true;
        await writeFile(filePath, JSON.stringify(msg, null, 2), 'utf-8');
        return NextResponse.json({ message: '✅ پیام خوانده شد.' });
      }
    }

    return NextResponse.json({ message: 'پیام یافت نشد.' }, { status: 404 });
  } catch (error) {
    console.error('❌ خطا در بروزرسانی پیام:', error);
    return NextResponse.json({ message: 'خطا در بروزرسانی پیام.' }, { status: 500 });
  }
}
