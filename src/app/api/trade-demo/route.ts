import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { toJalaali } from 'jalaali-js';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      userId,         // مثل PG-9123456789
      mobile,         // مثل 09123456789
      tradeId,        // مثل TD-00123
      volume,
      entryPrice,
      exitPrice,
      takeProfit,
      stopLoss,
      positionType    // 'buy' یا 'sell'
    } = body;

    // تاریخ فعلی
    const now = new Date();
    const gregorianDate = now.toISOString().replace(/:/g, '-'); // برای نام فایل
    const { jy, jm, jd } = toJalaali(now);
    const persianDate = `${jy}-${String(jm).padStart(2, '0')}-${String(jd).padStart(2, '0')} ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;

    // محاسبه سود یا ضرر
    const profitOrLoss = (exitPrice - entryPrice) * volume;
    const result = profitOrLoss >= 0 ? 'win' : 'loss';

    // نام فایل
    const fileName = `${persianDate.split(' ')[0]}_${gregorianDate}_${positionType}_${result}_${userId}_${mobile}.json`;

    // مسیر ذخیره‌سازی
    const filePath = path.join(
      process.cwd(),
      'public',
      'users',
      mobile,
      'trade-demo',
      'archive',
      fileName
    );

    // داده‌های معامله
    const archiveData = {
      userId,
      mobile,
      tradeId,
      dateGregorian: gregorianDate,
      datePersian: persianDate,
      positionType,
      result,
      volume,
      entryPrice,
      exitPrice,
      totalAmount: entryPrice * volume,
      profitOrLoss,
      takeProfit,
      stopLoss,
      status: 'closed',
      closedBy: 'user',
      notes: 'بسته‌شده توسط کاربر از پنل معاملات'
    };

    // ذخیره فایل
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(archiveData, null, 2));

    return NextResponse.json({ success: true, message: 'معامله با موفقیت ذخیره شد' });
  } catch (err) {
    console.error('❌ خطا در ذخیره معامله:', err);
    return NextResponse.json({ success: false, message: 'خطا در ذخیره معامله' }, { status: 500 });
  }
}
