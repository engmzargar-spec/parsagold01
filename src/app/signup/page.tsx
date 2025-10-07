'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { HomeIcon } from '@heroicons/react/24/solid';
import { useRouter } from 'next/navigation';
import { toJalaali } from 'jalaali-js';

export default function SignupPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    acceptedTerms: false,
  });

  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const sanitize = (value: string) => value.replace(/[<>"]/g, '').trim();
  const isValidPhone = (value: string) => /^09\d{9}$/.test(value);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    for (const key in form) {
      if (key !== 'acceptedTerms' && form[key as keyof typeof form].toString().trim() === '') {
        setError(`لطفاً فیلد "${key}" را کامل کنید.`);
        return;
      }
    }

    if (!isValidPhone(form.phone)) {
      setError('شماره موبایل معتبر نیست. لطفاً با فرمت 09xxxxxxxxx وارد کنید.');
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    if (!passwordRegex.test(form.password)) {
      setError('رمز عبور باید شامل حداقل ۸ کاراکتر، حروف بزرگ، حروف کوچک، عدد و علامت خاص باشد.');
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError('رمز عبور و تکرار آن یکسان نیستند.');
      return;
    }

    if (!form.acceptedTerms) {
      setError('برای ادامه، باید قوانین و مقررات را بپذیرید.');
      return;
    }

    const now = new Date();
    const joinedAtGregorian = now.toISOString().split('T')[0];
    const { jy, jm, jd } = toJalaali(now);
    const joinedAtJalali = `${jy}/${String(jm).padStart(2, '0')}/${String(jd).padStart(2, '0')}`;

    const payload = {
      firstName: sanitize(form.firstName),
      lastName: sanitize(form.lastName),
      email: sanitize(form.email),
      phone: sanitize(form.phone),
      password: form.password,
      joinedAtGregorian,
      joinedAtJalali,
    };

    try {
      const res = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok) {
        setError(result.message || 'خطا در ثبت‌نام. لطفاً دوباره تلاش کنید.');
        return;
      }

      localStorage.setItem('userPhone', payload.phone);

      setTimeout(async () => {
        try {
          const messageRes = await fetch('/api/message', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              phone: payload.phone,
              type: 'signup',
              title: `خوش آمدید ${payload.firstName} ${payload.lastName} عزیز`,
              content: `ثبت‌نام شما با موفقیت انجام شد. لطفاً برای تکمیل مراحل احراز هویت اقدام کنید. در صورت نیاز به راهنمایی، از طریق پشتیبانی با ما در تماس باشید.\n\nموفق و پرسود باشید 🌟`,
              timestamp: new Date().toISOString(),
              read: false,
            }),
          });

          const messageResult = await messageRes.json();
          console.log('📨 نتیجه ارسال پیام:', messageResult);
        } catch (err) {
          console.error('❌ خطا در ارسال پیام خوش‌آمدگویی:', err);
        } finally {
          router.push('/dashboard');
        }
      }, 3000);
    } catch (err) {
      setError('ارتباط با سرور برقرار نشد.');
    }
  };
  return (
    <main dir="rtl" className="relative min-h-screen bg-gradient-to-br from-gray-900 to-black text-white flex items-center justify-center px-4 py-10">
      <Link href="/" className="absolute top-6 right-6 text-yellow-400 hover:text-yellow-300 flex items-center gap-2">
        <HomeIcon className="w-6 h-6" />
      </Link>

      <div className="w-full max-w-5xl bg-gray-900 bg-opacity-70 backdrop-blur-md rounded-xl shadow-xl flex flex-col md:flex-row overflow-hidden">
        <div className="md:w-1/2 w-full p-8 flex flex-col justify-center">
          <h2 className="text-2xl font-bold text-yellow-400 mb-6 text-center">ثبت‌نام</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="text" name="firstName" placeholder="نام: *" value={form.firstName} onChange={handleChange} required className="w-full px-4 py-3 rounded-md bg-gray-800 text-white placeholder-gray-400 text-right focus:outline-none focus:ring-2 focus:ring-yellow-500" />
            <input type="text" name="lastName" placeholder="نام خانوادگی: *" value={form.lastName} onChange={handleChange} required className="w-full px-4 py-3 rounded-md bg-gray-800 text-white placeholder-gray-400 text-right focus:outline-none focus:ring-2 focus:ring-yellow-500" />
            <input type="email" name="email" placeholder="ایمیل: *" value={form.email} onChange={handleChange} required className="w-full px-4 py-3 rounded-md bg-gray-800 text-white placeholder-gray-400 text-right focus:outline-none focus:ring-2 focus:ring-yellow-500" />
            <input type="tel" name="phone" placeholder="شماره همراه: *" value={form.phone} onChange={handleChange} required className="w-full px-4 py-3 rounded-md bg-gray-800 text-white placeholder-gray-400 text-right focus:outline-none focus:ring-2 focus:ring-yellow-500" />
            <input type="password" name="password" placeholder="رمز عبور: *" value={form.password} onChange={handleChange} required className="w-full px-4 py-3 rounded-md bg-gray-800 text-white placeholder-gray-400 text-right focus:outline-none focus:ring-2 focus:ring-yellow-500" />
            <p className="text-xs text-gray-400 text-right">
              رمز عبور باید شامل حداقل ۸ کاراکتر، حروف بزرگ، حروف کوچک، عدد و علامت خاص باشد.
            </p>
            <input type="password" name="confirmPassword" placeholder="تکرار رمز عبور: *" value={form.confirmPassword} onChange={handleChange} required className="w-full px-4 py-3 rounded-md bg-gray-800 text-white placeholder-gray-400 text-right focus:outline-none focus:ring-2 focus:ring-yellow-500" />

            <label className="flex flex-row-reverse items-center justify-end gap-x-2 text-sm text-gray-300 text-right">
              <input type="checkbox" name="acceptedTerms" checked={form.acceptedTerms} onChange={handleChange} className="accent-yellow-500" />
              <Link href="/terms" className="text-yellow-400 underline hover:text-yellow-300">
                قوانین و مقررات را مطالعه کرده‌ام و می‌پذیرم
              </Link>
            </label>

            <button type="submit" className="w-full py-3 bg-yellow-500 text-black font-semibold rounded-md shadow-md hover:bg-yellow-400 transition duration-300 ease-in-out">
              ثبت‌نام
            </button>

            {error && <p className="text-red-400 text-sm text-right mt-2">{error}</p>}
          </form>
        </div>

        <div className="hidden md:block w-[2px] bg-yellow-500"></div>

        <div className="md:w-1/2 flex items-center justify-center p-8 bg-gray-800">
          <div className="animate-slide-in-right">
            <Image src="/handshake.png" alt="Handshake Logo" width={240} height={240} className="drop-shadow-lg" />
          </div>
        </div>
      </div>
    </main>
  );
}
