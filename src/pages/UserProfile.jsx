import React, { useEffect, useState } from 'react';
import userData from '../../users/mehdi.json'; // مسیر واقعی فایل

const UserProfile = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // چون فایل لوکال هست، مستقیم ایمپورت شده
    setUser(userData);
  }, []);

  if (!user) return <div>در حال بارگذاری...</div>;

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">مشخصات کاربر</h2>
      <div className="bg-white/30 backdrop-blur-md rounded-xl p-6 shadow-lg grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">نام</label>
          <input type="text" value={user.name} disabled className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">ایمیل</label>
          <input type="email" value={user.email} disabled className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">شماره موبایل</label>
          <input type="text" value={user.phone} disabled className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">نقش کاربری</label>
          <input type="text" value={user.role} disabled className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">تاریخ عضویت</label>
          <input type="text" value={user.joinedAt} disabled className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
