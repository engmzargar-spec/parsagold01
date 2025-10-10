'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function VerifyCodePage() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      const res = await fetch('/api/forgot-password/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, code }),
      });

      const result = await res.json();
      if (!res.ok) {
        setError(result.message || 'کد اشتباه است.');
        return;
      }

      setMessage(result.message || 'کد تأیید شد.');
      setTimeout(() => {
        router.push('/forgot-password/reset?phone=' + encodeURIComponent(phone));
      }, 1000);
    } catch {
      setError('ارتباط با سرور برقرار نشد.');
    }
  };

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-gray-900 p-6 rounded-xl shadow-lg">
        <h2 className="text-xl font-bold text-yellow-400 mb-4 text-center">تأیید کد بازیابی</h2>
        <form onSubmit={handleVerify} className="space-y-4">
          <input
            type="text"
            placeholder="شماره همراه"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-md bg-gray-800 text-white placeholder-gray-400 text-right"
          />
          <input
            type="text"
            placeholder="کد بازیابی"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-md bg-gray-800 text-white placeholder-gray-400 text-right"
          />
          <button
            type="submit"
            className="w-full py-3 bg-yellow-500 text-black font-semibold rounded-md shadow-md hover:bg-yellow-400 transition"
          >
            تأیید کد
          </button>
          {error && <p className="text-red-400 text-sm text-right">{error}</p>}
          {message && <p className="text-green-400 text-sm text-right">{message}</p>}
        </form>
      </div>
    </main>
  );
}
