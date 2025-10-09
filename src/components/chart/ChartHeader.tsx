'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const marketSessions = [
  { name: 'New York', openUTC: 12, closeUTC: 20 },
  { name: 'London', openUTC: 7, closeUTC: 15 },
  { name: 'Tokyo', openUTC: 0, closeUTC: 8 },
  { name: 'Sydney', openUTC: 22, closeUTC: 6 },
];

const getMarketProgress = (openUTC: number, closeUTC: number) => {
  const nowUTC = new Date().getUTCHours();
  const duration = (closeUTC + 24 - openUTC) % 24;
  const elapsed = (nowUTC + 24 - openUTC) % 24;
  if (elapsed < 0 || elapsed >= duration) return 1;
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

const formatTime = (hours: number) => {
  const rounded = Math.max(0, Math.round(hours * 60)); // تبدیل به دقیقه
  const h = Math.floor(rounded / 60);
  const m = rounded % 60;
  return `${h} ساعت و ${m} دقیقه`;
};

const getTimeUntilClose = (openUTC: number, closeUTC: number) => {
  const nowUTC = new Date().getUTCHours() + new Date().getMinutes() / 60;
  const duration = (closeUTC + 24 - openUTC) % 24;
  const elapsed = (nowUTC + 24 - openUTC) % 24;
  const remaining = duration - elapsed;
  return remaining <= 0 ? 0 : remaining;
};

const getTimeUntilOpen = (openUTC: number) => {
  const nowUTC = new Date().getUTCHours() + new Date().getMinutes() / 60;
  const hoursUntilOpen = (openUTC + 24 - nowUTC) % 24;
  return hoursUntilOpen;
};

export default function ChartHeader({ onSave }: { onSave: () => void }) {
  const router = useRouter();
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTick((prev) => prev + 1);
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center justify-between mb-2">
      <span className="text-white font-bold text-right">XAUUSD - PARSAGOLD</span>
      <div className="flex-1 flex justify-center gap-3 text-[10px] items-center">
        {marketSessions.map((session) => {
          const progress = getMarketProgress(session.openUTC, session.closeUTC);
          const direction = getMarketDirection(session.openUTC, session.closeUTC);
          const redWidth = `${Math.round(progress * 100)}%`;
          const greenWidth = `${100 - Math.round(progress * 100)}%`;
          const statusLabel = progress >= 1 ? 'closed' : 'open';

          let tooltip = '';
          if (direction === 'active') {
            const hoursLeft = getTimeUntilClose(session.openUTC, session.closeUTC);
            tooltip = `تا بسته شدن بازار: ${formatTime(hoursLeft)}`;
          } else {
            const hoursToOpen = getTimeUntilOpen(session.openUTC);
            tooltip = `تا باز شدن بازار: ${formatTime(hoursToOpen)}`;
          }

          return (
            <div key={session.name} className="flex flex-col items-center w-24">
              <div className="text-white mb-0.5">
                {session.name} <span className="text-gray-400">({statusLabel})</span>
              </div>
              <div
                className="w-full h-2 flex rounded overflow-hidden border border-gray-600"
                title={tooltip}
              >
                <div style={{ width: greenWidth }} className="bg-green-600"></div>
                <div style={{ width: redWidth }} className="bg-red-700"></div>
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
