import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  const body = await req.json();
  const { email, phone, type } = body;

  if (!email || !phone || !type) {
    return NextResponse.json({ message: 'اطلاعات ناقص است.' }, { status: 400 });
  }

  const code = '123456';

  if (type === 'email') {
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USERNAME,
          pass: process.env.EMAIL_PASSWORD,
        },
      });

      await transporter.sendMail({
        from: `"Parsagold" <${process.env.EMAIL_USERNAME}>`,
        to: email,
        subject: 'کد تأیید ایمیل',
        html: `
          <div style="font-family: sans-serif; direction: rtl; text-align: right;">
            <h3>کد تأیید ایمیل شما:</h3>
            <p style="font-size: 20px; font-weight: bold; color: #d97706;">${code}</p>
            <p>لطفاً این کد را در فرم احراز هویت وارد کنید.</p>
          </div>
        `,
      });

      return NextResponse.json({ message: 'ایمیل ارسال شد.' }, { status: 200 });
    } catch (err) {
      console.error('❌ خطا در ارسال ایمیل:', err);
      return NextResponse.json({ message: 'ارسال ایمیل با خطا مواجه شد.' }, { status: 500 });
    }
  }

  if (type === 'phone') {
    console.log(`📱 ارسال کد تأیید به شماره ${phone}: ${code}`);
    return NextResponse.json({ message: 'کد پیامک شبیه‌سازی شد.' }, { status: 200 });
  }

  return NextResponse.json({ message: 'نوع ارسال نامعتبر است.' }, { status: 400 });
}
