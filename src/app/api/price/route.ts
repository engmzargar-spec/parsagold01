import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol');

  try {
    const res = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`, {
      cache: 'no-store',
    });

    const data = await res.json();
    const price = data?.chart?.result?.[0]?.meta?.regularMarketPrice ?? null;

    return NextResponse.json({ price });
  } catch (error) {
    console.error(`Error fetching Yahoo price for ${symbol}:`, error);
    return NextResponse.json({ price: null });
  }
}
