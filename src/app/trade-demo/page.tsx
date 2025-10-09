'use client';

import TradeSidebar from './components/TradeSidebar';
import TradeChart from './components/TradeChart';
import TradePanel from './components/TradePanel';

export default function TradeDemoPage() {
  return (
    <main className="flex flex-col min-h-screen bg-black text-white">
      <div className="flex flex-1 flex-col md:flex-row">
        {/* Sidebar */}
        <aside className="w-full md:w-64 bg-gray-900 p-4">
          <TradeSidebar />
        </aside>

        {/* Chart Area */}
        <section className="flex-1 p-4">
          <TradeChart />
        </section>
      </div>

      {/* Bottom Panel */}
      <footer className="bg-gray-950 p-4 border-t border-gray-800">
        <TradePanel />
      </footer>
    </main>
  );
}
