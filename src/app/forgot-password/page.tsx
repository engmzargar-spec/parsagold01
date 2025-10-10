'use client';

import { useState } from 'react';

export default function ForgotPasswordPage() {
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      const res = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });

      const result = await res.json();
      if (!res.ok) {
        setError(result.message || 'خطا در ارسال درخواست.');
        return;
      }

      setMessage(result.message || 'کد بازیابی ارسال شد.');
    } catch {
      setError('ارتباط با سرور برقرار نشد.');
    }
  };

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-gray-900 p-6 rounded-xl shadow-lg">
        <h2 className="text-xl font-bold text-yellow-400 mb-4 text-center">فراموشی رمز عبور</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="شماره همراه"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-md bg-gray-800 text-white placeholder-gray-400 text-right focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />
          <button
            type="submit"
            className="w-full py-3 bg-yellow-500 text-black font-semibold rounded-md shadow-md hover:bg-yellow-400 transition duration-300 ease-in-out"
          >
            ارسال کد بازیابی
          </button>
          {error && <p className="text-red-400 text-sm text-right">{error}</p>}
          {message && <p className="text-green-400 text-sm text-right">{message}</p>}
        </form>
      </div>
    </main>
  );
}
