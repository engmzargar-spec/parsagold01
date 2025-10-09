'use client';

import { useEffect, useState, useRef } from 'react';

type PriceData = {
  symbol: string;
  label: string;
  url: string;
  source: 'yahoo';
};

type PriceState = {
  value: number | null;
  color: string;
  flash: boolean;
};

const prices: PriceData[] = [
  { symbol: 'GC=F', label: 'انس طلا', url: '/icons/gold.png', source: 'yahoo' },
  { symbol: 'SI=F', label: 'انس نقره', url: '/icons/Silver.png', source: 'yahoo' },
  { symbol: 'BZ=F', label: 'نفت برنت', url: '/icons/brentoil.png', source: 'yahoo' },
  { symbol: 'BTC-USD', label: 'بیت کوین', url: '/icons/btc.png', source: 'yahoo' },
];

export default function LivePrices() {
  const [priceMap, setPriceMap] = useState<Record<string, PriceState>>({});
  const initialized = useRef(false);

  useEffect(() => {
    const fetchPrices = async () => {
      const updated: Record<string, PriceState> = { ...priceMap };

      for (const { symbol } of prices) {
        try {
          const res = await fetch(`/api/price?symbol=${symbol}`);
          if (!res.ok) throw new Error('Fetch failed');
          const data = await res.json();
          const price = data?.price ?? null;

          const prev = priceMap[symbol]?.value;
          let color = priceMap[symbol]?.color ?? 'text-white';
          let flash = false;

          if (typeof price === 'number' && typeof prev === 'number') {
            if (price > prev) { color = 'text-green-400'; flash = true; }
            else if (price < prev) { color = 'text-red-400'; flash = true; }
          } else if (!initialized.current) {
            color = 'text-white';
          }

          updated[symbol] = { value: price, color, flash };
        } catch (error) {
          console.warn(`Cannot fetch price for ${symbol}:`, error);
          // اگر fetch شکست خورد، مقدار قبلی را نگه دار یا null
          updated[symbol] = priceMap[symbol] ?? { value: null, color: 'text-white', flash: false };
        }
      }

      initialized.current = true;
      setPriceMap(updated);

      // خاموش کردن flash بعد از 500ms
      setTimeout(() => {
        const reset: Record<string, PriceState> = { ...updated };
        Object.keys(reset).forEach((key) => (reset[key].flash = false));
        setPriceMap(reset);
      }, 500);
    };

    fetchPrices();
    const interval = setInterval(fetchPrices, 5000);
    return () => clearInterval(interval);
  }, [priceMap]);

  const renderCard = (symbol: string, label: string, url: string, isMobile: boolean) => {
    const state = priceMap[symbol];
    const current = state?.value;
    const color = state?.color ?? 'text-white';
    const flash = state?.flash;

    return (
      <div
        key={symbol}
        className={`
          bg-gray-800 rounded-xl
          ${isMobile ? 'p-3 flex flex-row items-center gap-3 w-full' : 'p-6 flex flex-col items-center w-full max-w-[200px]'}
          shadow-md md:shadow-lg
          transition-transform duration-200 hover:scale-105 hover:shadow-xl
        `}
      >
        <img
          src={url}
          alt={label}
          className={`${isMobile ? 'w-8 h-8' : 'w-12 h-12 mb-3'}`}
        />
        <div className={`${isMobile ? 'flex flex-col items-start text-right' : 'flex flex-col items-center text-center'}`}>
          <span className={`text-sm ${isMobile ? '' : 'text-base'} text-gray-300 truncate w-full`}>{label}</span>
          <span
            className={`font-bold ${isMobile ? 'text-lg' : 'text-2xl'} ${color} transition-colors duration-500 ${flash ? 'animate-pulse' : ''}`}
          >
            {typeof current === 'number' ? `$${current.toFixed(2)}` : '—'}
          </span>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* موبایل */}
      <div className="grid grid-cols-2 gap-4 my-6 md:hidden">
        {prices.map(({ symbol, label, url }) => renderCard(symbol, label, url, true))}
      </div>

      {/* دسکتاپ */}
      <div className="hidden md:grid grid-cols-4 gap-6 my-6 justify-items-center">
        {prices.map(({ symbol, label, url }) => renderCard(symbol, label, url, false))}
      </div>
    </>
  );
}
