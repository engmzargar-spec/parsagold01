'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';

type MenuItem = {
  label: string;
  href?: string;
};

const MenuSection = ({
  title,
  items,
}: {
  title: string;
  items: MenuItem[];
}) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="mb-8">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex flex-row-reverse justify-between items-center text-right text-white font-semibold hover:text-yellow-400 transition"
      >
        {open ? <ChevronUpIcon className="w-5 h-5" /> : <ChevronDownIcon className="w-5 h-5" />}
        <span>{title}</span>
      </button>

      {open && (
        <ul className="mt-2 mr-2 space-y-2 text-sm text-gray-300 text-right">
          {items.map((item, index) => (
            <li key={index}>
              {item.href ? (
                <Link
                  href={item.href}
                  className="block hover:text-yellow-400 cursor-pointer transition"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="block hover:text-yellow-400 cursor-pointer transition">
                  {item.label}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default function Sidebar({ user }: { user: any }) {
  return (
    <aside className="w-64 bg-gray-900 text-white p-6 h-screen overflow-y-auto">
      <h2 className="text-xl font-bold mb-6 text-right">داشبورد</h2>

      <MenuSection
        title="💰 کیف پول"
        items={[
          { label: 'شماره کیف پول' },
          { label: 'نمایش موجودی' },
          { label: 'واریز' },
          { label: 'برداشت' },
          { label: 'تاریخچه تراکنش‌ها' },
        ]}
      />

      <MenuSection
        title="📊 معاملات"
        items={[
          { label: 'معاملات بازار' },
          { label: 'حساب دمو' },
        ]}
      />

      <MenuSection
        title="📈 پورتفوی معاملات"
        items={[
          { label: 'ایجاد پورتفو' },
          { label: 'بستن پورتفو' },
          { label: 'تاریخچه پورتفوها' },
        ]}
      />

      <MenuSection
        title="🛠 خدمات"
        items={[
          { label: 'دانلودها' },
          { label: 'اخبار و اطلاعات بازار' },
          { label: 'سیگنال' },
        ]}
      />

      <MenuSection
        title="👤 حساب کاربری"
        items={[
          { label: 'احراز هویت', href: '/verify' },
          { label: 'مشخصات کاربر', href: '/profile' }, // ✅ مسیر فعال
          { label: 'تغییر رمز عبور', href: '/change-password' },
          { label: 'فعالسازی رمز دوعاملی', href: '/2fa' },
          { label: 'دعوت از دوستان', href: '/invite' },
        ]}
      />
    </aside>
  );
}
