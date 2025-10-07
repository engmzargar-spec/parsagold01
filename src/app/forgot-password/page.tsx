'use client';

import Link from 'next/link';
import { useState } from 'react';
import { HomeIcon } from '@heroicons/react/24/outline';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // اینجا می‌تونی API ارسال لینک بازیابی رو صدا بزنی
    setSubmitted(true);
  };

  return (
    <main dir="rtl" className="relative min-h-screen bg-gradient-to-br from-gray-900 to-black text-white flex items-center justify-center px-4 py-10">

      {/* آیکون خانه */}
      <Link href="/" className="absolute top-6 right-6 text-yellow-400 hover:text-yellow-300 flex items-center gap-2">
        <HomeIcon className="w-6 h-6" />
        <span className="hidden md:inline text-sm">صفحه اصلی</span>
      </Link>

      <div className="w-full max-w-md bg-gray-900 bg-opacity-70 backdrop-blur-md rounded-xl shadow-xl p-8">

        <h2 className="text-2xl font-bold text-yellow-400 mb-6 text-center">فراموشی رمز عبور</h2>

        {submitted ? (
          <div className="text-center text-green-400 font-semibold">
            لینک بازیابی رمز عبور به ایمیل شما ارسال شد.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              name="email"
              placeholder="ایمیل خود را وارد کنید"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-md bg-gray-800 text-white placeholder-gray-400 text-right focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />

            <button
              type="submit"
              className="w-full py-3 bg-yellow-500 text-black font-semibold rounded-md shadow-md hover:bg-yellow-400 transition duration-300 ease-in-out"
            >
              ارسال لینک بازیابی
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
