import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import { writeFile } from 'fs/promises';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { email, type, title, content } = body;
    if (!email || !type || !title || !content) {
      return NextResponse.json({ message: 'اطلاعات پیام ناقص است.' }, { status: 400 });
    }

    const timestamp = new Date().toISOString();
    const safeEmail = email.replace(/[@.]/g, '_');
    const messageId = Math.floor(Math.random() * 100000);
    const fileName = `${timestamp}-${type}-${messageId}.json`;

    const messageDir = path.join(process.cwd(), 'public', 'messages', safeEmail);
    if (!fs.existsSync(messageDir)) {
      fs.mkdirSync(messageDir, { recursive: true });
    }

    const messageData = {
      id: messageId,
      type,
      title,
      content,
      read: false,
      timestamp,
    };

    const filePath = path.join(messageDir, fileName);
    await writeFile(filePath, JSON.stringify(messageData, null, 2), 'utf-8');

    return NextResponse.json({ message: 'پیام با موفقیت ذخیره شد.' });
  } catch (error) {
    console.error('Message error:', error);
    return NextResponse.json({ message: 'خطا در ذخیره پیام.' }, { status: 500 });
  }
}
