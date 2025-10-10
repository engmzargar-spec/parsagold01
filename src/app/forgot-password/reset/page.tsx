'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const phone = searchParams.get('phone') || '';

  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      const res = await fetch('/api/forgot-password/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, newPassword }),
      });

      const result = await res.json();
      if (!res.ok) {
        setError(result.message || 'خطا در تغییر رمز.');
        return;
      }

      setMessage(result.message || 'رمز جدید ثبت شد.');
      setTimeout(() => {
        router.push('/login');
      }, 1000);
    } catch {
      setError('ارتباط با سرور برقرار نشد.');
    }
  };

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-gray-900 p-6 rounded-xl shadow-lg">
        <h2 className="text-xl font-bold text-yellow-400 mb-4 text-center">تعیین رمز جدید</h2>
        <form onSubmit={handleReset} className="space-y-4">
          <input
            type="password"
            placeholder="رمز عبور جدید"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-md bg-gray-800 text-white placeholder-gray-400 text-right"
          />
          <button
            type="submit"
            className="w-full py-3 bg-yellow-500 text-black font-semibold rounded-md shadow-md hover:bg-yellow-400 transition"
          >
            ثبت رمز جدید
          </button>
          {error && <p className="text-red-400 text-sm text-right">{error}</p>}
          {message && <p className="text-green-400 text-sm text-right">{message}</p>}
        </form>
      </div>
    </main>
  );
}
