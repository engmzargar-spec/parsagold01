'use client';

import { useState } from 'react';

type Trade = {
  id: number;
  volume: number;
  entryPrice: number;
  exitPrice: number;
  takeProfit: number;
  stopLoss: number;
  currentPrice: number;
  positionType: 'buy' | 'sell';
  status: 'open' | 'closed';
};

export default function TradePanel() {
  const userId = 'PG-9123456789';
  const mobile = '09123456789';

  const [trades, setTrades] = useState<Trade[]>([
    {
      id: 1,
      volume: 2,
      entryPrice: 2450000,
      exitPrice: 2470000,
      takeProfit: 2500000,
      stopLoss: 2400000,
      currentPrice: 2470000,
      positionType: 'buy',
      status: 'open',
    },
  ]);

  const handleCloseTrade = async (trade: Trade) => {
    const res = await fetch('/api/archive-demo-trade', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        mobile,
        tradeId: `TD-${trade.id}`,
        volume: trade.volume,
        entryPrice: trade.entryPrice,
        exitPrice: trade.exitPrice,
        takeProfit: trade.takeProfit,
        stopLoss: trade.stopLoss,
        positionType: trade.positionType,
      }),
    });

    const result = await res.json();
    if (result.success) {
      setTrades((prev) =>
        prev.map((t) => (t.id === trade.id ? { ...t, status: 'closed' } : t))
      );
    } else {
      console.error('❌ خطا در ذخیره معامله:', result.message);
    }
  };

  return (
    <div className="space-y-6 text-left">
      <h2 className="text-yellow-400 font-bold text-lg mb-2">معاملات باز</h2>
      {trades.filter((t) => t.status === 'open').length === 0 ? (
        <p className="text-gray-400 text-sm">هیچ معامله بازی وجود ندارد</p>
      ) : (
        <div className="space-y-4">
          {trades
            .filter((t) => t.status === 'open')
            .map((trade) => {
              const profitLoss =
                (trade.currentPrice - trade.entryPrice) * trade.volume;

              return (
                <div
                  key={trade.id}
                  className="bg-gray-800 rounded-lg p-4 shadow-md space-y-2"
                >
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>حجم: {trade.volume} خط</div>
                    <div>قیمت ورود: {trade.entryPrice.toLocaleString()}</div>
                    <div>
                      مقدار معامله:{' '}
                      {(trade.entryPrice * trade.volume).toLocaleString()} تومان
                    </div>
                    <div>
                      سود/ضرر لحظه‌ای:{' '}
                      <span
                        className={
                          profitLoss >= 0 ? 'text-green-400' : 'text-red-400'
                        }
                      >
                        {profitLoss.toLocaleString()} تومان
                      </span>
                    </div>
                    <div>حد سود: {trade.takeProfit.toLocaleString()}</div>
                    <div>حد ضرر: {trade.stopLoss.toLocaleString()}</div>
                  </div>

                  <div className="flex space-x-2 mt-2">
                    <button className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-1 px-3 rounded text-sm">
                      ویرایش حد سود/ضرر
                    </button>
                    <button
                      onClick={() => handleCloseTrade(trade)}
                      className="bg-red-500 hover:bg-red-600 text-black font-bold py-1 px-3 rounded text-sm"
                    >
                      بستن معامله
                    </button>
                  </div>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}
