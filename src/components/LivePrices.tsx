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
};

const prices: PriceData[] = [
  { symbol: 'BTC-USD', label: 'بیت‌کوین', url: '/icons/btc.png', source: 'yahoo' },
  { symbol: 'BZ', label: 'نفت برنت', url: '/icons/brentoil.png', source: 'yahoo' },
  { symbol: 'SI=F', label: 'انس نقره', url: '/icons/silver.png', source: 'yahoo' },
  { symbol: 'GC=F', label: 'انس طلا', url: '/icons/gold.png', source: 'yahoo' },
];

export default function LivePrices() {
  const [priceMap, setPriceMap] = useState<Record<string, PriceState>>({});
  const initialized = useRef(false);

  useEffect(() => {
    const fetchPrices = async () => {
      const responses = await Promise.all(
        prices.map(async ({ symbol }) => {
          try {
            const endpoint = `/api/price?symbol=${symbol}`;
            const res = await fetch(endpoint);
            const data = await res.json();
            const price = data?.price ?? null;
            return { symbol, price };
          } catch (error) {
            console.error(`Error fetching price for ${symbol}:`, error);
            return { symbol, price: null };
          }
        })
      );

      const updated: Record<string, PriceState> = { ...priceMap };

      responses.forEach(({ symbol, price }) => {
        const prev = priceMap[symbol]?.value;

        let color = priceMap[symbol]?.color ?? 'text-white';

        if (typeof price === 'number' && typeof prev === 'number') {
          if (price > prev) color = 'text-green-400';
          else if (price < prev) color = 'text-red-400';
          // اگر برابر بود، رنگ قبلی حفظ می‌شه
        } else if (!initialized.current) {
          color = 'text-white'; // بار اول
        }

        updated[symbol] = { value: price, color };
      });

      initialized.current = true;
      setPriceMap(updated);
    };

    fetchPrices();
    const interval = setInterval(fetchPrices, 5000);
    return () => clearInterval(interval);
  }, [priceMap]);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 my-6">
      {prices.map(({ symbol, label, url }) => {
        const state = priceMap[symbol];
        const current = state?.value;
        const color = state?.color ?? 'text-white';

        return (
          <div
            key={symbol}
            className="bg-gray-800 rounded-xl p-6 flex flex-col items-center shadow-lg transition-transform duration-200 hover:scale-105 hover:shadow-xl"
          >
            <img src={url} alt={label} className="w-12 h-12 mb-3" />
            <span className="text-base text-gray-300">{label}</span>
            <span className={`text-2xl font-bold ${color}`}>
              {typeof current === 'number' ? `$${current.toFixed(2)}` : '—'}
            </span>
          </div>
        );
      })}
    </div>
  );
}
