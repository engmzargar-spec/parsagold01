'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type User = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
};

export default function VerifyPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    emailCode: '',
    phoneCode: '',
    gender: '',
    address: '',
    birthDate: '',
    documentFile: null as File | null,
  });

  useEffect(() => {
    const phone = localStorage.getItem('userPhone');
    if (!phone) {
      setError('شماره همراه کاربر یافت نشد.');
      return;
    }

    fetch(`/users/${phone}/profile.json`)
      .then((res) => {
        if (!res.ok) throw new Error('فایل کاربر یافت نشد.');
        return res.json();
      })
      .then((data) => setUser(data))
      .catch((err) => setError(err.message));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, files } = e.target as HTMLInputElement;
    if (name === 'documentFile' && files) {
      setForm({ ...form, documentFile: files[0] });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSendCode = async (type: 'email' | 'phone') => {
    if (!user) return;

    try {
      const res = await fetch(`/api/send-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: user.phone,
          email: user.email,
          type,
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message);

      alert(`کد تأیید ${type === 'email' ? 'ایمیل' : 'موبایل'} ارسال شد.`);
    } catch (err) {
      setError(`ارسال کد تأیید ${type} با خطا مواجه شد.`);
    }
  };

  const handleSubmit = async () => {
    if (!user) return;

    const requiredFields = [
      form.emailCode,
      form.phoneCode,
      form.gender,
      form.address,
      form.birthDate,
      form.documentFile,
    ];

    if (requiredFields.some((field) => !field || (typeof field === 'string' && field.trim() === ''))) {
      setError('لطفاً همه فیلدها را کامل کنید.');
      return;
    }

    if (form.documentFile.size > 2 * 1024 * 1024) {
      setError('حجم فایل نباید بیشتر از ۲ مگابایت باشد.');
      return;
    }

    if (form.documentFile.type !== 'image/jpeg') {
      setError('فقط فایل با فرمت JPEG قابل قبول است.');
      return;
    }

    const formData = new FormData();
    formData.append('phone', user.phone);
    formData.append('verifiedEmail', form.emailCode === '123456' ? 'true' : 'false');
    formData.append('verifiedPhone', form.phoneCode === '123456' ? 'true' : 'false');
    formData.append('gender', form.gender);
    formData.append('address', form.address);
    formData.append('birthDate', form.birthDate);
    formData.append('documentFile', form.documentFile);

    try {
      const res = await fetch('/api/verify', {
        method: 'POST',
        body: formData,
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message);

      await fetch('/api/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: user.phone,
          type: 'verify',
          title: 'ثبت احراز هویت',
          content: 'احراز هویت شما با موفقیت ثبت شد. منتظر بررسی کارشناس باشید.',
        }),
      });

      router.push('/profile');
    } catch (err) {
      setError('خطا در ذخیره اطلاعات.');
    }
  };

  if (error) {
    return <div className="text-red-500 p-6">{error}</div>;
  }

  if (!user) {
    return <div className="text-yellow-400 p-6">در حال بارگذاری...</div>;
  }

  return (
    <main dir="rtl" className="min-h-screen bg-black text-white p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-yellow-400">احراز هویت</h2>
        <button
          onClick={() => router.push('/dashboard')}
          className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded text-sm"
        >
          بازگشت به داشبورد
        </button>
      </div>

      <div className="space-y-4 max-w-xl mx-auto">
        <Info label="نام" value={user.firstName} />
        <Info label="نام خانوادگی" value={user.lastName} />
        <Info label="ایمیل" value={user.email} />
        <button onClick={() => handleSendCode('email')} className="bg-yellow-500 px-4 py-2 rounded">ارسال کد تأیید ایمیل</button>
        <input name="emailCode" value={form.emailCode} onChange={handleChange} placeholder="کد تأیید ایمیل" className="w-full p-2 bg-gray-800 rounded" />

        <Info label="شماره همراه" value={user.phone} />
        <button onClick={() => handleSendCode('phone')} className="bg-yellow-500 px-4 py-2 rounded">ارسال کد تأیید موبایل</button>
        <input name="phoneCode" value={form.phoneCode} onChange={handleChange} placeholder="کد تأیید موبایل" className="w-full p-2 bg-gray-800 rounded" />

        <select name="gender" value={form.gender} onChange={handleChange} className="w-full p-2 bg-gray-800 rounded">
          <option value="">انتخاب جنسیت</option>
          <option value="male">مرد</option>
          <option value="female">زن</option>
        </select>

        <input name="address" value={form.address} onChange={handleChange} placeholder="آدرس" className="w-full p-2 bg-gray-800 rounded" />
        <input name="birthDate" value={form.birthDate} onChange={handleChange} placeholder="تاریخ تولد (مثلاً 1400/01/01)" className="w-full p-2 bg-gray-800 rounded" />

        <div>
          <p className="text-sm text-gray-300 mb-2">
            لطفاً یکی از مدارک شناسایی معتبر را بارگذاری کنید (کارت ملی، شناسنامه یا گواهینامه). فقط فایل با فرمت <span className="text-yellow-400 font-semibold">JPEG</span> قابل قبول است و حداکثر حجم باید کمتر از <span className="text-yellow-400 font-semibold">۲ مگابایت</span> باشد.
          </p>

          <div className="flex items-center gap-4">
            <label htmlFor="documentFile" className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-4 py-2 rounded cursor-pointer">
              انتخاب فایل
            </label>
            <span className="text-gray-300 text-sm">
              {form.documentFile?.name || 'فایلی انتخاب نشده'}
            </span>
          </div>

          <input
            type="file"
            id="documentFile"
            name="documentFile"
            onChange={handleChange}
            className="hidden"
            accept=".jpeg"
          />
        </div>

        <button onClick={handleSubmit} className="bg-green-500 px-6 py-3 rounded font-bold mt-4">ثبت اطلاعات</button>
      </div>
    </main>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <label className="block text-sm text-gray-300 mb-1">{label}</label>
      <div className="bg-gray-800 rounded-md p-3">{value}</div>
    </div>
  );
}
