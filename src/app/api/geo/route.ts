import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');

  if (!lat || !lng) {
    console.warn('⚠️ مختصات ارسال نشده یا ناقصه');
    return NextResponse.json({
      countryCode: 'IR',
      countryName: 'Iran',
      fallback: true,
    });
  }

  try {
    const res = await fetch(`https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lng}&key=YOUR_API_KEY`);
    const data = await res.json();

    const countryCode = data.results[0]?.components?.country_code?.toUpperCase();
    const countryName = data.results[0]?.components?.country;

    if (!countryCode || !countryName) {
      console.warn('⚠️ کشور قابل تشخیص نیست، استفاده از پیش‌فرض');
      return NextResponse.json({
        countryCode: 'IR',
        countryName: 'Iran',
        fallback: true,
      });
    }

    return NextResponse.json({
      countryCode,
      countryName,
      fallback: false,
    });
  } catch (err) {
    console.error('❌ خطا در دریافت کشور از مختصات:', err);
    return NextResponse.json({
      countryCode: 'IR',
      countryName: 'Iran',
      fallback: true,
    });
  }
}
