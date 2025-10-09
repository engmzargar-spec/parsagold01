'use client';

import { useState, useEffect } from 'react';
import { FaArrowUp, FaArrowDown } from 'react-icons/fa';

type Order = {
  price: number;
  type: 'buy' | 'sell';
  count?: number; // تعداد سفارش برای هر قیمت
};

export default function TradeSidebar() {
  const [balance, setBalance] = useState(1000000);
  const [volume, setVolume] = useState('');
  const [entryPrice, setEntryPrice] = useState('');
  const [takeProfit, setTakeProfit] = useState('');
  const [stopLoss, setStopLoss] = useState('');
  const [message, setMessage] = useState('');
  const [buyOrders, setBuyOrders] = useState<Order[]>([]);
  const [sellOrders, setSellOrders] = useState<Order[]>([]);

  const handleTrade = async (type: 'buy' | 'sell') => {
    const res = await fetch('/api/trade-demo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: Number(volume), type }),
    });
    const result = await res.json();
    setMessage(result.message);
    setBalance(result.newBalance);
  };

  const handleSelectPrice = (price: number) => {
    setEntryPrice(price.toString());
  };

  // شبیه‌سازی دریافت سفارشات لحظه‌ای با تعداد
  useEffect(() => {
    const updateOrders = () => {
      const buys = Array.from({ length: 10 }, (_, i) => ({
        price: 2470000 - i * 5000,
        type: 'buy',
        count: Math.floor(Math.random() * 20) + 1, // تعداد تصادفی 1 تا 20
      }));
      const sells = Array.from({ length: 10 }, (_, i) => ({
        price: 2410000 + i * 5000,
        type: 'sell',
        count: Math.floor(Math.random() * 20) + 1,
      }));
      setBuyOrders(buys);
      setSellOrders(sells);
    };

    updateOrders();
    const interval = setInterval(updateOrders, 5000);

    return () => clearInterval(interval);
  }, []);

  // محاسبه بیشترین تعداد برای تعیین طول نوار
  const maxBuyCount = Math.max(...buyOrders.map(o => o.count || 0), 1);
  const maxSellCount = Math.max(...sellOrders.map(o => o.count || 0), 1);

  return (
    <div className="space-y-6 text-left text-sm">
      {/* موجودی تستی */}
      <div className="bg-gray-800 rounded-lg px-4 py-2 shadow-md flex justify-between items-center">
        <span className="text-yellow-400 font-semibold">موجودی تستی:</span>
        <span className="text-green-400 font-bold text-sm">{balance.toLocaleString()} تومان</span>
      </div>

      {/* فرم معامله */}
      <div className="space-y-3">
        <div className="flex items-center gap-x-3">
          <label className="text-yellow-400 font-medium w-24">حجم معامله:</label>
          <div className="flex items-center space-x-2 w-full">
            <input
              type="number"
              value={volume}
              onChange={(e) => setVolume(e.target.value)}
              placeholder="مثلاً 2"
              className="w-full p-1 rounded bg-gray-800 text-white text-left text-sm"
            />
            <span className="text-gray-400 text-xs">خط</span>
          </div>
        </div>

        <div className="flex items-center gap-x-3">
          <label className="text-yellow-400 font-medium w-24">قیمت ورود:</label>
          <input
            type="number"
            value={entryPrice}
            onChange={(e) => setEntryPrice(e.target.value)}
            placeholder="مثلاً 2450000"
            className="w-full p-1 rounded bg-gray-800 text-white text-left text-sm"
          />
        </div>

        <div className="flex items-center gap-x-3">
          <label className="text-yellow-400 font-medium w-24">حد سود:</label>
          <input
            type="number"
            value={takeProfit}
            onChange={(e) => setTakeProfit(e.target.value)}
            placeholder="مثلاً 2500000"
            className="w-full p-1 rounded bg-gray-800 text-white text-left text-sm"
          />
        </div>

        <div className="flex items-center gap-x-3">
          <label className="text-yellow-400 font-medium w-24">حد ضرر:</label>
          <input
            type="number"
            value={stopLoss}
            onChange={(e) => setStopLoss(e.target.value)}
            placeholder="مثلاً 2400000"
            className="w-full p-1 rounded bg-gray-800 text-white text-left text-sm"
          />
        </div>

        <div className="flex justify-between space-x-2 mt-2">
          <button
            onClick={() => handleTrade('buy')}
            className="flex items-center justify-center bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded w-full space-x-2"
          >
            <FaArrowUp />
            <span>خرید</span>
          </button>
          <button
            onClick={() => handleTrade('sell')}
            className="flex items-center justify-center bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded w-full space-x-2"
          >
            <FaArrowDown />
            <span>فروش</span>
          </button>
        </div>

        {message && <p className="text-green-400 mt-2 text-xs">{message}</p>}
      </div>

      {/* پنجره سفارشات فعال */}
      <div className="bg-gray-900 rounded-lg p-1 mt-4 shadow-md">
        <h3 className="text-yellow-400 font-bold mb-1 text-sm">سفارشات فعال</h3>
        <div className="grid grid-cols-2 gap-1 text-xs">
          {/* ستون خرید */}
          <div>
            <h4 className="text-green-400 font-semibold mb-1">خریدارها</h4>
            <ul className="space-y-1">
              {buyOrders
                .sort((a, b) => b.price - a.price)
                .map((order, index) => {
                  const widthPercent = ((order.count || 0) / maxBuyCount) * 100;
                  return (
                    <li
                      key={index}
                      onClick={() => handleSelectPrice(order.price)}
                      className="relative bg-gray-800 rounded px-2 py-1 flex justify-between cursor-pointer hover:bg-green-700 overflow-hidden"
                    >
                      <div
                        className="absolute top-0 left-0 h-full bg-green-600 opacity-30"
                        style={{ width: `${widthPercent}%` }}
                      ></div>
                      <span className="relative z-10">{index + 1}</span>
                      <span className="relative z-10">{order.price.toLocaleString()}</span>
                    </li>
                  );
                })}
            </ul>
          </div>

          {/* ستون فروش */}
          <div>
            <h4 className="text-red-400 font-semibold mb-1">فروشنده‌ها</h4>
            <ul className="space-y-1">
              {sellOrders
                .sort((a, b) => a.price - b.price)
                .map((order, index) => {
                  const widthPercent = ((order.count || 0) / maxSellCount) * 100;
                  return (
                    <li
                      key={index}
                      onClick={() => handleSelectPrice(order.price)}
                      className="relative bg-gray-800 rounded px-2 py-1 flex justify-between cursor-pointer hover:bg-red-700 overflow-hidden"
                    >
                      <div
                        className="absolute top-0 left-0 h-full bg-red-600 opacity-30"
                        style={{ width: `${widthPercent}%` }}
                      ></div>
                      <span className="relative z-10">{sellOrders.length - index}</span>
                      <span className="relative z-10">{order.price.toLocaleString()}</span>
                    </li>
                  );
                })}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
