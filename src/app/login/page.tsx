'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import { HomeIcon } from '@heroicons/react/24/solid';

function generateCaptcha() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export default function LoginPage() {
  const router = useRouter();

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaCode, setCaptchaCode] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setCaptchaCode(generateCaptcha());
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (captchaInput.toLowerCase() !== captchaCode.toLowerCase()) {
      setError('کد کپچا اشتباه است.');
      setCaptchaCode(generateCaptcha());
      return;
    }

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password }),
      });

      const result = await res.json();

      if (!res.ok) {
        setError(result.message || 'ورود ناموفق بود.');
        setCaptchaCode(generateCaptcha());
        return;
      }

      // ذخیره شماره موبایل در sessionStorage برای استفاده در UserContext
      sessionStorage.setItem('loginPhone', result.phone);

      // هدایت به داشبورد بعد از تأخیر کوتاه تا UserContext مقداردهی شود
      setTimeout(() => {
        router.push('/dashboard');
      }, 300);
    } catch (err) {
      setError('ارتباط با سرور برقرار نشد.');
      setCaptchaCode(generateCaptcha());
    }
  };

  return (
    <main dir="rtl" className="relative min-h-screen bg-gradient-to-br from-gray-900 to-black text-white flex items-center justify-center px-4 py-10">
      <Link href="/" className="absolute top-6 right-6 text-yellow-400 hover:text-yellow-300 flex items-center gap-2">
        <HomeIcon className="w-6 h-6" />
        <span className="hidden md:inline text-sm">خانه</span>
      </Link>

      <div className="w-full max-w-5xl bg-gray-900 bg-opacity-70 backdrop-blur-md rounded-xl shadow-xl flex flex-col md:flex-row overflow-hidden">
        <div className="md:w-1/2 w-full p-8 flex flex-col justify-center">
          <h2 className="text-2xl font-bold text-yellow-400 mb-6 text-center">ورود با شماره همراه</h2>

          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="text"
              placeholder="شماره همراه"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-md bg-gray-800 text-white placeholder-gray-400 text-right focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
            <input
              type="password"
              placeholder="رمز عبور"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-md bg-gray-800 text-white placeholder-gray-400 text-right focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="کد کپچا"
                value={captchaInput}
                onChange={(e) => setCaptchaInput(e.target.value)}
                required
                className="flex-1 px-4 py-2 rounded-md bg-gray-800 text-white placeholder-gray-400 text-right focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
              <span className="text-lg font-mono bg-gray-700 px-4 py-2 rounded-md tracking-widest text-yellow-400">
                {captchaCode}
              </span>
              <button
                type="button"
                onClick={() => setCaptchaCode(generateCaptcha())}
                className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 transition"
                title="تغییر کپچا"
              >
                <ArrowPathIcon className="w-5 h-5 text-yellow-400" />
              </button>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-yellow-500 text-black font-semibold rounded-md shadow-md hover:bg-yellow-400 transition duration-300 ease-in-out"
            >
              ورود
            </button>

            {error && <p className="text-red-400 text-sm text-right mt-2">{error}</p>}
          </form>
        </div>

        <div className="hidden md:block w-[2px] bg-yellow-500"></div>

        <div className="md:w-1/2 flex items-center justify-center p-8 bg-gray-800">
          <div className="animate-slide-in-right">
            <Image src="/parsagold-logo-03.png" alt="Logo" width={240} height={240} className="drop-shadow-lg" />
          </div>
        </div>
      </div>
    </main>
  );
}
