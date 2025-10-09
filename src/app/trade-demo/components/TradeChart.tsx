'use client';
import { useEffect, useRef, useState } from 'react';
import { useUser } from '@/context/UserContext';
import ChartHeader from '@/components/chart/ChartHeader';

export default function TradeChart() {
  const { user } = useUser();
  const userPhone = user?.phone;

  const desktopChartRef = useRef<HTMLDivElement>(null);
  const mobileChartRef = useRef<HTMLDivElement>(null);
  const [chartInstance, setChartInstance] = useState<any>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!userPhone) return;

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;
    script.onload = async () => {
      let savedLayout: any = null;
      try {
        const res = await fetch(`/api/chart/load?phone=${userPhone}`);
        if (res.ok) {
          const data = await res.json();
          savedLayout = data.layout;
        }
      } catch (err) {
        console.error('خطا در بارگذاری Layout:', err);
      }

      const widgetOptions = {
        symbol: 'XAUUSD',
        interval: '15',
        width: '100%',
        height: desktopChartRef.current?.clientHeight || 500,
        locale: 'en',
        theme: 'dark',
        allow_symbol_change: false,
        hide_side_toolbar: false,
        hide_top_toolbar: false,
        hide_legend: false,
        onChartReady: function (chart: any) {
          setChartInstance(chart);
          if (savedLayout) chart.load(savedLayout);

          chart.onIntervalChanged?.(() => triggerAutoSave());
          chart.onSymbolChanged?.(() => triggerAutoSave());
          chart.onStudyAdded?.(() => triggerAutoSave());
          chart.onDrawingAdded?.(() => triggerAutoSave());
        },
      };

      if (desktopChartRef.current) {
        new (window as any).TradingView.widget({
          ...widgetOptions,
          container_id: desktopChartRef.current.id,
        });
      }

      if (mobileChartRef.current) {
        new (window as any).TradingView.widget({
          ...widgetOptions,
          container_id: mobileChartRef.current.id,
          height: 300,
        });
      }

      setTimeout(() => {
        const labels = document.querySelectorAll('.tv-header__symbol-name');
        labels.forEach(label => {
          if ((label as HTMLElement).innerText.includes('OANDA')) {
            (label as HTMLElement).innerText = 'PARSAGOLD';
          }
        });
      }, 1000);
    };

    document.body.appendChild(script);
  }, [userPhone]);

  const saveLayout = async () => {
    if (!chartInstance || !userPhone) return;
    try {
      const layout = chartInstance.save();
      await fetch('/api/chart/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: userPhone, symbol: 'XAUUSD', layout }),
      });
    } catch (err) {
      console.error('❌ خطا در ذخیره Layout:', err);
    }
  };

  const triggerAutoSave = () => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      saveLayout();
    }, 30000);
  };

  if (!userPhone) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-800 text-gray-400 rounded-lg">
        لطفاً وارد شوید تا نمودار را مشاهده کنید
      </div>
    );
  }

  return (
    <>
      <div className="hidden md:flex flex-col flex-1 h-full">
        <ChartHeader onSave={saveLayout} />
        <div
          ref={desktopChartRef}
          id="desktop-chart"
          className="flex-1 w-full rounded-lg shadow-md bg-gray-800"
        ></div>
      </div>

      <div className="md:hidden flex flex-col w-full">
        <ChartHeader onSave={saveLayout} />
        <div
          ref={mobileChartRef}
          id="mobile-chart"
          className="w-full h-72 rounded-lg shadow-md bg-gray-800"
        ></div>
      </div>
    </>
  );
}
