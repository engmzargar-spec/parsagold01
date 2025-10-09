'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import LivePrices from '@/components/LivePrices';

export default function Home() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const buttonStyle =
    'px-4 py-1 border border-[#FFD700] text-[#FFD700] font-semibold rounded-full shadow-sm transition-transform duration-200 hover:scale-105 active:scale-95 hover:bg-gradient-to-r hover:from-[#FFE066] hover:to-[#FFD700] hover:text-black text-sm';

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-800 to-gray-900 text-white flex flex-col items-center p-4">
      {/* نوار بالا */}
      <div className="w-full flex flex-wrap justify-between items-center py-2 gap-2 text-sm">
        {/* دکمه‌های ورود و عضویت سمت چپ */}
        <div className="flex flex-wrap gap-2">
          <button onClick={() => router.push('/login')} className={buttonStyle}>
            ورود
          </button>
          <button onClick={() => router.push('/signup')} className={buttonStyle}>
            عضویت
          </button>
        </div>

        {/* منوی همبرگری در موبایل */}
        <div className="sm:hidden">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-[#FFD700] border border-[#FFD700] px-3 py-1 rounded-full"
          >
            ☰ منو
          </button>
        </div>

        {/* لینک‌ها در دسکتاپ */}
        <div className="hidden sm:flex flex-wrap gap-2 justify-end">
          <a href="/rules"><button className={buttonStyle}>قوانین و مقررات</button></a>
          <a href="/faq"><button className={buttonStyle}>سئوالات متداول</button></a>
          <a href="/about"><button className={buttonStyle}>درباره ما</button></a>
          <a href="/contact"><button className={buttonStyle}>تماس با ما</button></a>
        </div>
      </div>

      {/* منوی کشویی موبایل */}
      {menuOpen && (
        <div className="w-full flex flex-col items-start gap-2 mt-2 sm:hidden text-[#FFD700] text-sm">
          <a href="/rules">قوانین و مقررات</a>
          <a href="/faq">سئوالات متداول</a>
          <a href="/about">درباره ما</a>
          <a href="/contact">تماس با ما</a>
        </div>
      )}

      {/* خط طلایی زیر نوار */}
      <hr className="w-full border-[#FFD700] my-2" />

      {/* قیمت‌های زنده به‌صورت کارت */}
      <div className="w-full flex flex-wrap justify-center gap-4 mb-6">
        <LivePrices />
      </div>

      {/* لوگو و خوش‌آمدگویی */}
      <Image
        src="/Parsagold-logo-03.png"
        alt="Parsagold Logo"
        width={250}
        height={250}
        className="mb-4"
      />
      <h1 className="text-2xl sm:text-3xl font-bold text-[#FFD700] mb-2 text-center">
        به اتاق معاملات اُنس و نفت پارسا گلد خوش آمدید
      </h1>
      <p className="text-center text-gray-300 mb-4 max-w-xl text-sm sm:text-base">
        خرید و فروش امن طلا، نقره و نفت با سرعت و شفافیت. تجربه‌ای نو از معاملات دیجیتال
      </p>
      <p className="text-lg sm:text-2xl text-gray-300 mb-8 max-w-xl text-center">
        اولین اتاق معامله آنلاین نفت ایران
      </p>

      {/* ویژگی‌های تبلیغاتی */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8 text-center">
        {[
          { icon: '/icons/fasttrading.png', text: 'اجرای معاملات با سرعت بالا' },
          { icon: '/icons/lowerfees.png', text: 'کمترین کارمزد ممکن' },
          { icon: '/icons/security.png', text: 'امنیت و شفافیت کامل' },
          { icon: '/icons/perfectsupport.png', text: 'پشتیبانی حرفه‌ای و سریع' },
        ].map((item, index) => (
          <div key={index} className="flex flex-col items-center">
            <Image src={item.icon} alt="ویژگی" width={200} height={200} />
            <p className="mt-2 text-gray-200 text-sm">{item.text}</p>
          </div>
        ))}
      </div>

      {/* خط جداکننده */}
      <hr className="w-full border-[#FFD700] my-2" />

      {/* فوتر */}
      <div className="w-full flex flex-col sm:flex-row justify-between items-center text-sm text-gray-300 gap-4 mt-4">
        {/* سمت راست: پشتیبانی با آیکون */}
        <div className="flex items-center gap-2">
          <Image src="/icons/support2.png" alt="پشتیبانی" width={60} height={60} />
          <span>09163028498</span>
        </div>

        {/* سمت چپ: آیکون‌های شبکه اجتماعی */}
        <div className="flex gap-4">
          {[
            { name: 'اینستاگرام', icon: '/icons/instagram1.png', link: '#' },
            { name: 'واتس‌اپ', icon: '/icons/whatsapp1.png', link: '#' },
            { name: 'تلگرام', icon: '/icons/telegram1.png', link: '#' },
            { name: 'فیسبوک', icon: '/icons/facebook1.png', link: '#' },
          ].map((item, index) => (
            <a key={index} href={item.link} title={item.name}>
              <Image
                src={item.icon}
                alt={item.name}
                width={24}
                height={24}
                className="hover:scale-110 transition-transform"
              />
            </a>
          ))}
        </div>
      </div>
    </main>
  );
}
