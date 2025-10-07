'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import LivePrices from '@/components/LivePrices';

export default function Home() {
  const router = useRouter();

  const buttonStyle =
    'px-4 py-1 border border-[#FFD700] text-[#FFD700] font-semibold rounded-full shadow-sm transition-transform duration-200 hover:scale-105 active:scale-95 hover:bg-gradient-to-r hover:from-[#FFE066] hover:to-[#FFD700] hover:text-black';

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-800 to-gray-900 text-white flex flex-col items-center p-4">
      {/* نوار بالا */}
      <div className="w-full flex justify-between items-center py-2 text-sm">
        {/* دکمه‌های ورود و عضویت سمت چپ */}
        <div className="flex gap-2">
          <button onClick={() => router.push('/login')} className={buttonStyle}>
            ورود
          </button>
          <button onClick={() => router.push('/signup')} className={buttonStyle}>
            عضویت
          </button>
        </div>

        {/* لینک‌ها به‌صورت دکمه سمت راست */}
        <div className="flex gap-2">
          <a href="/rules">
            <button className={buttonStyle}>تماس با ما</button>
          </a>
          <a href="/faq">
            <button className={buttonStyle}>درباره ما</button>
          </a>
          <a href="/about">
            <button className={buttonStyle}>سئوالات متداول</button>
          </a>
          <a href="/contact">
            <button className={buttonStyle}>قوانین و مقررات</button>
          </a>
        </div>
      </div>

      {/* خط طلایی زیر نوار */}
      <hr className="w-full border-[#FFD700] my-2" />

      {/* قیمت‌های زنده به‌صورت کارت */}
      <LivePrices />

      {/* لوگو و خوش‌آمدگویی */}
      <Image
        src="/Parsagold-logo-03.png"
        alt="Parsagold Logo"
        width={400}
        height={400}
        className="mb-4"
      />
      <h1 className="text-3xl font-bold text-[#FFD700] mb-2 text-center">
        به اتاق معاملات طلای پارسا گلد خوش آمدید
      </h1>
      <p className="text-center text-gray-300 mb-8 max-w-xl">
        خرید و فروش امن طلا، با سرعت و شفافیت. تجربه‌ای نو از معاملات دیجیتال شمش و سکه.
      </p>

      {/* ویژگی‌های تبلیغاتی */}
     <div className="grid grid-cols-2 gap-6 mb-8 text-center">
       {[
         { icon: '/icons/fasttrading.png', text: 'اجرای معاملات با سرعت بالا' },
         { icon: '/icons/lowerfees.png', text: 'کمترین کارمزد ممکن' },
         { icon: '/icons/security.png', text: 'امنیت و شفافیت کامل' },
         { icon: '/icons/perfectsupport.png', text: 'پشتیبانی حرفه‌ای و سریع' },
       ].map((item, index) => (
         <div key={index}>
          <Image src={item.icon} alt="ویژگی" width={300} height={300} />
          <p className="mt-2 text-gray-200">{item.text}</p>
         </div>
       ))}
      </div>


      {/* خط جداکننده */}
      <hr className="w-full border-[#FFD700] my-2" />

    {/* فوتر */}
<div className="w-full flex justify-between items-center text-sm text-gray-300">
  {/* سمت راست: پشتیبانی با آیکون */}
  <div className="flex items-center gap-2">
    <Image src="/icons/support2.png" alt="پشتیبانی" width={80} height={80} />
    <span> 09163028498 </span>
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
