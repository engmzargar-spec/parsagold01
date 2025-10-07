'use client';

import Header from '@/dashboard/header';
import Sidebar from '@/dashboard/sidebar';
import Footer from '@/dashboard/footer';


export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-gray-950 text-white font-estedad flex flex-col">
      {/* هدر بالا */}
      <Header user={{ firstName: 'مهدی', phone: '0912xxxxxxx' }} />

      {/* محتوای اصلی با سایدبار راست */}
      <div className="flex flex-1 ">
        {/* سایدبار سمت راست */}
        <Sidebar />

        {/* محتوای مرکزی */}
        <section className="flex-1 px-6 py-8">
          <h1 className="text-2xl font-bold mb-4 text-yellow-400">داشبورد پارساگلد</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-gray-800 rounded-lg p-4 shadow-md hover:shadow-lg transition">
              <h2 className="text-lg font-semibold mb-2">موجودی کیف پول</h2>
              <p className="text-yellow-300 text-xl font-bold">۵,۰۰۰,۰۰۰ تومان</p>
            </div>

            <div className="bg-gray-800 rounded-lg p-4 shadow-md hover:shadow-lg transition">
              <h2 className="text-lg font-semibold mb-2">آخرین سیگنال</h2>
              <p className="text-green-400 text-sm">خرید در ۲,۳۰۰,۰۰۰ تومان</p>
            </div>

            <div className="bg-gray-800 rounded-lg p-4 shadow-md hover:shadow-lg transition">
              <h2 className="text-lg font-semibold mb-2">وضعیت بازار</h2>
              <p className="text-gray-300 text-sm">بازار در وضعیت نوسانی قرار دارد</p>
            </div>
          </div>
        </section>
      </div>

      {/* فوتر پایین */}
      <Footer />
    </main>
  );
}
