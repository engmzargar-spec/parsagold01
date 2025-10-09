import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

export async function POST(req: Request) {
  try {
    const { phone, id } = await req.json();

    if (!phone || !id) {
      return NextResponse.json({ message: 'شناسه و شماره همراه الزامی است.' }, { status: 400 });
    }

    const messagesDir = path.join(process.cwd(), 'public', 'users', phone, 'messages');
    const files = fs.readdirSync(messagesDir).filter((f) => f.endsWith('.json'));

    for (const file of files) {
      const filePath = path.join(messagesDir, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      const msg = JSON.parse(content);

      if (msg.id === id) {
        msg.archived = true;
        fs.writeFileSync(filePath, JSON.stringify(msg, null, 2), 'utf-8');
        return NextResponse.json({ message: '✅ پیام آرشیوشده شد.' });
      }
    }

    return NextResponse.json({ message: 'پیام یافت نشد.' }, { status: 404 });
  } catch (error) {
    console.error('❌ خطا در آرشیو پیام:', error);
    return NextResponse.json({ message: 'خطا در آرشیو پیام.' }, { status: 500 });
  }
}
