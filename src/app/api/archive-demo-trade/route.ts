import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import dayjs from 'dayjs';
import jalali from 'dayjs/plugin/jalali';

dayjs.extend(jalali);

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      userId,
      mobile,
      tradeId,
      volume,
      entryPrice,
      exitPrice,
      takeProfit,
      stopLoss,
      positionType, // 'buy' | 'sell'
    } = body;

    const now = dayjs();
    const dateGregorian = now.format('YYYY-MM-DDTHH-mm-ss');
    const datePersian = now.calendar('jalali').format('YYYY-MM-DD HH:mm:ss');

    const profitOrLoss = (exitPrice - entryPrice) * volume;
    const result = profitOrLoss >= 0 ? 'win' : 'loss';

    const fileName = `${datePersian.split(' ')[0]}_${dateGregorian}_${positionType}_${result}_${userId}_${mobile}.json`;
    const filePath = path.join(
      process.cwd(),
      'public',
      'users',
      mobile,
      'trade-demo',
      'archive',
      fileName
    );

    const archiveData = {
      userId,
      mobile,
      tradeId,
      dateGregorian,
      datePersian,
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
      notes: 'بسته‌شده توسط کاربر از پنل معاملات',
    };

    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(archiveData, null, 2));

    return NextResponse.json({ success: true, message: 'معامله با موفقیت ذخیره شد' });
  } catch (err) {
    console.error('خطا در ذخیره معامله:', err);
    return NextResponse.json({ success: false, message: 'خطا در ذخیره معامله' }, { status: 500 });
  }
}
