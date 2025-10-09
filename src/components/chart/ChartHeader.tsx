'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const marketSessions = [
  { name: 'Sydney', openUTC: 22, closeUTC: 6 },
  { name: 'Tokyo', openUTC: 0, closeUTC: 8 },
  { name: 'London', openUTC: 7, closeUTC: 15 },
  { name: 'New York', openUTC: 12, closeUTC: 20 },
];

const getMarketProgress = (openUTC: number, closeUTC: number) => {
  const nowUTC = new Date().getUTCHours();
  const duration = (closeUTC + 24 - openUTC) % 24;
  const elapsed = (nowUTC + 24 - openUTC) % 24;
  if (elapsed < 0 || elapsed >= duration) return 0;
  return Math.min(1, elapsed / duration);
};

const getMarketDirection = (openUTC: number, closeUTC: number) => {
  const nowUTC = new Date().getUTCHours();
  const duration = (closeUTC + 24 - openUTC) % 24;
  const elapsed = (nowUTC + 24 - openUTC) % 24;
  if (elapsed <= 0) return 'pre';
  if (elapsed >= duration) return 'post';
  return 'active';
};

export default function ChartHeader({ onSave }: { onSave: () => void }) {
  const router = useRouter();
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTick((prev) => prev + 1); // فقط برای رفرش کامپوننت
    }, 60000); // هر 60 ثانیه

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center justify-between mb-2">
      <span className="text-white font-bold text-right">XAUUSD - PARSAGOLD</span>
      <div className="flex-1 flex justify-center gap-3 text-[10px] items-center">
        {marketSessions.map((session) => {
          const progress = getMarketProgress(session.openUTC, session.closeUTC);
          const direction = getMarketDirection(session.openUTC, session.closeUTC);
          const greenWidth = `${Math.round(progress * 100)}%`;
          const redWidth = `${100 - Math.round(progress * 100)}%`;

          return (
            <div key={session.name} className="flex flex-col items-center w-24">
              <div className="text-white mb-0.5">{session.name}</div>
              <div className="w-full h-2 flex rounded overflow-hidden border border-gray-600">
                {direction === 'pre' && (
                  <>
                    <div style={{ width: greenWidth }} className="bg-green-600"></div>
                    <div style={{ width: redWidth }} className="bg-red-700"></div>
                  </>
                )}
                {direction === 'post' && (
                  <>
                    <div style={{ width: redWidth }} className="bg-red-700"></div>
                    <div style={{ width: greenWidth }} className="bg-green-600"></div>
                  </>
                )}
                {direction === 'active' && (
                  <>
                    <div style={{ width: redWidth }} className="bg-red-700"></div>
                    <div style={{ width: greenWidth }} className="bg-green-600"></div>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex gap-2">
        <button
          onClick={onSave}
          className="px-3 py-1 bg-yellow-500 text-black rounded-md shadow hover:bg-yellow-400"
        >
          ذخیره تغییرات
        </button>
        <button
          onClick={() => router.push('/dashboard')}
          className="px-3 py-1 bg-gray-700 text-white rounded-md shadow hover:bg-gray-600"
        >
          بازگشت
        </button>
      </div>
    </div>
  );
}
