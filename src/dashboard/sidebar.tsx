'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDownIcon, ChevronUpIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { useUser } from '@/context/UserContext';

type MenuItem = {
  label: string;
  href?: string;
};

const MenuSection = ({
  title,
  items,
  onItemClick,
}: {
  title: string;
  items: MenuItem[];
  onItemClick?: () => void;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="mb-6">
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
                  onClick={onItemClick}
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

export default function Sidebar() {
  const { user } = useUser();
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <>
      {/* دکمه موبایل */}
      <div className="md:hidden fixed top-4 right-4 z-50">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="bg-gray-800 text-white p-2 rounded-full shadow-lg"
        >
          {mobileOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
        </button>
      </div>

      {/* سایدبار اصلی */}
      <aside
        className={`fixed top-0 right-0 h-screen w-64 bg-gray-900 text-white p-6 overflow-y-auto z-40 transition-transform duration-300 ${
          mobileOpen ? 'translate-x-0' : 'translate-x-full'
        } md:translate-x-0 md:static md:block`}
      >
        <h2 className="text-xl font-bold mb-2 text-right">داشبورد</h2>
        <div className="h-1 w-full bg-yellow-400 rounded mb-6"></div>
        
        <MenuSection
          title="💰 کیف پول"
          items={[
            { label: 'شماره کیف پول' },
            { label: 'نمایش موجودی' },
            { label: 'واریز' },
            { label: 'برداشت' },
            { label: 'تاریخچه تراکنش‌ها' },
          ]}
          onItemClick={() => setMobileOpen(false)}
        />

        <MenuSection
          title="📊 معاملات"
          items={[
            { label: 'معاملات بازار', href: '/trade' },
            { label: 'حساب دمو', href: '/trade-demo' },
          ]}
          onItemClick={() => setMobileOpen(false)}
        />
        <MenuSection
          title="📈 پورتفوی معاملات"
          items={[
            { label: 'ایجاد پورتفو' },
            { label: 'بستن پورتفو' },
            { label: 'تاریخچه پورتفوها' },
          ]}
          onItemClick={() => setMobileOpen(false)}
        />

        <MenuSection
          title="🛠 خدمات"
          items={[
            { label: 'دانلودها' },
            { label: 'اخبار و اطلاعات بازار' },
            { label: 'سیگنال' },
          ]}
          onItemClick={() => setMobileOpen(false)}
        />

        <MenuSection
          title="👤 حساب کاربری"
          items={[
            { label: 'احراز هویت', href: '/verify' },
            { label: 'مشخصات کاربر', href: '/profile' },
            { label: 'تغییر رمز عبور', href: '/change-password' },
            { label: 'فعالسازی رمز دوعاملی', href: '/2fa' },
            { label: 'دعوت از دوستان', href: '/invite' },
          ]}
          onItemClick={() => setMobileOpen(false)}
        />
      </aside>
    </>
  );
}
