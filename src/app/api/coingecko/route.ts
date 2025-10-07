import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol')?.toUpperCase() ?? 'BTC';

  // تبدیل نماد به نماد Binance
  const binanceMap: Record<string, string> = {
    BTC: 'BTCUSDT',
    ETH: 'ETHUSDT',
    BNB: 'BNBUSDT',
    XRP: 'XRPUSDT',
    // ارزهای دیگر را هم می‌توان اضافه کرد
  };

  const binanceSymbol = binanceMap[symbol] ?? 'BTCUSDT';

  console.log('Requested symbol:', symbol);
  console.log('Resolved Binance symbol:', binanceSymbol);

  try {
    const res = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${binanceSymbol}`, {
      cache: 'no-store',
    });

    const data = await res.json();
    const price = parseFloat(data?.price) ?? null;

    return NextResponse.json({ price });
  } catch (error) {
    console.error('Error fetching price from Binance:', error);
    return NextResponse.json({ price: null });
  }
}
