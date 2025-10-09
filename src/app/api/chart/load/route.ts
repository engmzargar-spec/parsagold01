import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    const { phone, symbol } = await request.json();

    if (!phone || !symbol) {
      return NextResponse.json({ message: 'پارامترهای phone و symbol الزامی هستند.' }, { status: 400 });
    }

    // جلوگیری از path traversal
    const safePhone = path.basename(phone);
    const safeSymbol = path.basename(symbol);

    const filePath = path.join(process.cwd(), 'public', 'users', safePhone, 'chart-layouts', `${safeSymbol}.json`);
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ layout: null, message: 'هیچ layout ذخیره‌شده‌ای وجود ندارد.' });
    }

    const layoutData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    return NextResponse.json({ layout: layoutData });
  } catch (error) {
    console.error('Load chart error:', error);
    return NextResponse.json({ message: 'خطا در بارگذاری layout نمودار.' }, { status: 500 });
  }
}
