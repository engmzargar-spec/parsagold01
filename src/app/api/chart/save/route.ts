import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    const { phone, symbol, layout } = await request.json();

    if (!phone || !symbol || !layout) {
      return NextResponse.json({ message: 'پارامترهای phone، symbol و layout الزامی هستند.' }, { status: 400 });
    }

    // جلوگیری از path traversal
    const safePhone = path.basename(phone);
    const safeSymbol = path.basename(symbol);

    // مسیر درست فولدر chart-layouts
    const userDir = path.join(process.cwd(), 'public', 'users', safePhone, 'chart-layouts');

    if (!fs.existsSync(userDir)) {
      fs.mkdirSync(userDir, { recursive: true });
      console.log('Created directory:', userDir);
    }

    const filePath = path.join(userDir, `${safeSymbol}.json`);

    console.log('Saving layout for user:', safePhone);
    console.log('Symbol:', safeSymbol);
    console.log('File path:', filePath);
    console.log('Layout keys:', Object.keys(layout));

    fs.writeFileSync(filePath, JSON.stringify(layout, null, 2), 'utf-8');

    console.log('Layout saved successfully!');
    return NextResponse.json({ message: 'Layout با موفقیت ذخیره شد.' });
  } catch (error) {
    console.error('Save chart error:', error);
    return NextResponse.json({ message: 'خطا در ذخیره layout نمودار.' }, { status: 500 });
  }
}
