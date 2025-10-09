'use client';

import { useRouter } from 'next/navigation';
import { useUser } from '@/context/UserContext';

export default function ProfilePage() {
  const { user } = useUser();
  const router = useRouter();

  if (user === null) {
    return (
      <main dir="rtl" className="min-h-screen flex items-center justify-center bg-black text-white p-6">
        <p className="text-yellow-400 animate-pulse">در حال بارگذاری اطلاعات کاربر...</p>
      </main>
    );
  }

  if (!user?.phone) {
    return (
      <main dir="rtl" className="min-h-screen flex items-center justify-center bg-black text-white p-6">
        <div className="bg-red-900 bg-opacity-60 backdrop-blur-md p-6 rounded-xl shadow-xl text-center">
          <h2 className="text-xl font-bold mb-4 text-yellow-400">خطا</h2>
          <p>شماره همراه کاربر یافت نشد. لطفاً ابتدا وارد شوید.</p>
        </div>
      </main>
    );
  }

  const documentPath = user.documentFileName
    ? `/users/${user.phone}/documents/${user.documentFileName}`
    : null;
  return (
    <main dir="rtl" className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-6 flex flex-col items-center justify-center">
      <div className="bg-white/10 backdrop-blur-md rounded-xl shadow-xl p-8 w-full max-w-2xl mb-6">
        <h2 className="text-2xl font-bold text-yellow-400 mb-6 text-center">مشخصات کاربر</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-right">
          <Info label="نام" value={user.firstName} />
          <Info label="نام خانوادگی" value={user.lastName} />
          <Info label="ایمیل" value={user.email} />
          <Info label="شماره همراه" value={user.phone} />
          {user.joinedAtJalali && <Info label="تاریخ عضویت" value={user.joinedAtJalali} wide />}
          {user.accountNumber && <Info label="شماره حساب" value={user.accountNumber} />}
          {user.nationalCode && <Info label="کد ملی" value={user.nationalCode} />}
          {user.address && <Info label="آدرس" value={user.address} wide />}
          {user.role && <Info label="نقش کاربری" value={user.role} />}
          {user.verified !== undefined && (
            <Info label="وضعیت احراز هویت" value={user.verified ? 'تأیید شده' : 'در انتظار'} />
          )}
        </div>

        {documentPath && (
          <div className="mt-10 text-center">
            <h3 className="text-lg font-bold text-yellow-400 mb-4">مدرک شناسایی</h3>
            <img
              src={documentPath}
              alt="مدرک شناسایی"
              className="mx-auto rounded-lg border border-gray-700 shadow-md max-w-xs mb-4"
            />
            <div className="flex justify-center gap-4">
              <a
                href={documentPath}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
              >
                مشاهده در اندازه کامل
              </a>
              <a
                href={documentPath}
                download={user.documentFileName}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
              >
                دانلود تصویر
              </a>
            </div>
          </div>
        )}
      </div>

      <button
        onClick={() => router.push('/dashboard')}
        className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-6 rounded-full transition"
      >
        بازگشت به داشبورد
      </button>
    </main>
  );
}

function Info({
  label,
  value,
  wide = false,
}: {
  label: string;
  value?: string;
  wide?: boolean;
}) {
  return (
    <div className={wide ? 'md:col-span-2' : ''}>
      <label className="block text-sm text-gray-300 mb-1">{label}</label>
      <div className="bg-gray-800 rounded-md p-3">{value || 'نامشخص'}</div>
    </div>
  );
}
