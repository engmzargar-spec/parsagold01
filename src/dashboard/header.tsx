'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BellIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { toJalaali } from 'jalaali-js';

export default function Header() {
  const router = useRouter();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAllMessages, setShowAllMessages] = useState(false);
  const [showArchivedMessages, setShowArchivedMessages] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>({});

  const unreadCount = messages.filter((msg) => !msg.read && !msg.archived).length;

  const handleLogout = () => {
    localStorage.removeItem('userPhone');
    router.push('/');
  };

  const handleMessageClick = async (msgId: number) => {
    const phone = localStorage.getItem('userPhone');
    if (!phone) return;

    try {
      await fetch('/api/message', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, id: msgId }),
      });
    } catch (err) {
      console.error('❌ خطا در بروزرسانی پیام:', err);
    }

    const updated = messages.map((msg) =>
      msg.id === msgId ? { ...msg, read: true } : msg
    );
    setMessages(updated);

    const selected = updated.find((msg) => msg.id === msgId);
    setSelectedMessage(selected || null);
    setShowAllMessages(false);
    setShowArchivedMessages(false);
  };

  const handleArchive = async (msgId: number) => {
    const phone = localStorage.getItem('userPhone');
    if (!phone) return;

    try {
      await fetch('/api/message/archive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, id: msgId }),
      });

      const updated = messages.map((msg) =>
        msg.id === msgId ? { ...msg, archived: true } : msg
      );
      setMessages(updated);
    } catch (err) {
      console.error('❌ خطا در آرشیو پیام:', err);
    }
  };
  const formatJalaliDate = (iso: string) => {
    const date = new Date(iso);
    const j = toJalaali(date);
    return `${j.jy}/${String(j.jm).padStart(2, '0')}/${String(j.jd).padStart(2, '0')}`;
  };

  const formatGregorianDate = (date: Date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}/${mm}/${dd}`;
  };

  const getTime = (tz: string) =>
    new Date().toLocaleTimeString('fa-IR', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: tz,
    });

  const filteredMessages = messages.filter((msg) => {
    const term = searchTerm.toLowerCase();
    return (
      !msg.archived &&
      (msg.title?.toLowerCase().includes(term) ||
        msg.content?.toLowerCase().includes(term) ||
        msg.id?.toString().includes(term) ||
        formatJalaliDate(msg.timestamp).includes(term))
    );
  });

  const filteredArchived = messages.filter((msg) => {
    const term = searchTerm.toLowerCase();
    return (
      msg.archived &&
      (msg.title?.toLowerCase().includes(term) ||
        msg.content?.toLowerCase().includes(term) ||
        msg.id?.toString().includes(term) ||
        formatJalaliDate(msg.timestamp).includes(term))
    );
  });

  useEffect(() => {
    const phone = localStorage.getItem('userPhone');
    if (!phone) return;

    const profilePath = `/users/${phone}/profile.json`;

    fetch(profilePath)
      .then((res) => res.json())
      .then((data) => {
        setProfile(data);
      });

    fetch(`/api/message?phone=${phone}`)
      .then((res) => res.json())
      .then((msgs) => {
        const validMessages = msgs.filter((m) => m && m.title && m.content);
        const sorted = validMessages.sort(
          (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        setMessages(sorted);
      })
      .catch((err) => {
        console.error('❌ خطا در دریافت پیام‌ها از API:', err);
      });
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const panel = document.getElementById('notification-panel');
      if (panel && !panel.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications]);
  return (
    <header className="bg-gray-900 text-white px-6 py-4 shadow-md flex relative">
      {/* 📱 دکمه خروج موبایل */}
      <button
        onClick={handleLogout}
        className="absolute top-4 left-4 md:hidden text-yellow-400 hover:text-yellow-300 transition"
        title="خروج"
      >
        <ArrowRightOnRectangleIcon className="w-6 h-6" />
      </button>

      {/* 🕒 تاریخ و ساعت جهانی */}
      <div className="w-1/3 flex justify-start items-center text-sm text-gray-200 font-medium gap-x-3 flex-wrap">
        <div>{formatJalaliDate(new Date().toISOString())}</div>
        <span className="text-gray-500">|</span>
        <div>{formatGregorianDate(new Date())}</div>
        <span className="text-gray-500">|</span>
        <div className="text-xs text-gray-300 flex gap-x-3 items-center">
          <div>تهران: {getTime('Asia/Tehran')}</div>
          <span className="text-gray-500">|</span>
          <div>توکیو: {getTime('Asia/Tokyo')}</div>
          <span className="text-gray-500">|</span>
          <div>لندن: {getTime('Europe/London')}</div>
          <span className="text-gray-500">|</span>
          <div>نیویورک: {getTime('America/New_York')}</div>
        </div>
      </div>

      {/* 🖼 لوگو */}
      <div className="w-1/3 flex justify-center">
        <img src="/parsagold-logo-03.png" alt="Parsagold Logo" className="h-20 w-auto" />
      </div>

      {/* 👤 نام، شناسه، زنگوله، خروج دسکتاپ */}
      <div className="w-1/3 hidden md:flex justify-between items-center flex-row-reverse pr-2 space-x-2">
        <button
          onClick={handleLogout}
          className="px-3 py-1 bg-yellow-500 text-black rounded-md hover:bg-yellow-400 transition"
        >
          خروج
        </button>

        {/* 🔔 زنگوله اعلان‌ها */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative text-gray-300 hover:text-yellow-400 transition"
          >
            <BellIcon className="w-6 h-6" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5">
                {unreadCount}
              </span>
            )}
          </button>

          {/* 📨 پنل اعلان‌ها */}
          {showNotifications && (
            <div
              id="notification-panel"
              className="absolute top-12 left-5 w-72 bg-white text-gray-800 border border-gray-300 rounded shadow-lg z-50"
            >
              <div className="p-4 border-b font-semibold">اطلاعیه‌ها</div>
              <ul className="max-h-60 overflow-y-auto text-sm px-4 py-2 space-y-2">
                {messages.filter((msg) => !msg.archived).map((msg, index) => (
                  <li
                    key={msg.id}
                    className="border-b border-gray-200 pb-2 px-2 py-1 rounded hover:bg-gray-100 cursor-pointer"
                  >
                    <div className="flex justify-between items-center">
                      <span
                        onClick={() => handleMessageClick(msg.id)}
                        className="text-gray-800 font-medium flex items-center gap-x-2"
                      >
                        {!msg.read && <span className="w-2 h-2 bg-red-500 rounded-full" />}
                        {index + 1}. {msg.title}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleArchive(msg.id);
                        }}
                        title="آرشیو پیام"
                        className="text-gray-400 hover:text-red-500 transition"
                      >
                        🗑️
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="p-3 text-center space-y-2">
                <button
                  onClick={() => {
                    setShowNotifications(false);
                    setShowAllMessages(true);
                  }}
                  className="text-yellow-600 hover:underline text-sm font-medium block"
                >
                  مشاهده تمام پیام‌ها
                </button>
                <button
                  onClick={() => {
                    setShowNotifications(false);
                    setShowArchivedMessages(true);
                  }}
                  className="text-gray-500 hover:underline text-sm font-medium block"
                >
                  مشاهده پیام‌های بایگانی‌شده
                </button>
              </div>
            </div>
          )}
        </div>
        {/* 👤 شناسه و نام کاربر */}
        <div className="flex flex-col items-end text-sm">
          {profile.userId ? (
            <span className="text-yellow-400">{profile.userId}</span>
          ) : (
            <span className="text-gray-500">در حال بارگذاری شناسه...</span>
          )}
          {profile.firstName && profile.lastName ? (
            <span className="text-gray-300">{profile.firstName} {profile.lastName}</span>
          ) : (
            <span className="text-gray-500">در حال بارگذاری نام...</span>
          )}
        </div>
      </div>

      {/* 📩 مودال پیام انتخاب‌شده */}
      {selectedMessage && (
        <div className="fixed inset-0 backdrop-blur-md bg-white/10 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-[90%] max-w-md p-6 text-right">
            <h3 className="text-lg font-bold mb-2 text-gray-800">{selectedMessage.title}</h3>
            <p className="text-sm text-gray-700 mb-4">{selectedMessage.content}</p>
            <div className="text-xs text-gray-500 mb-4">
              {formatJalaliDate(selectedMessage.timestamp)}
            </div>
            <button
              onClick={() => setSelectedMessage(null)}
              className="px-4 py-1 bg-yellow-500 text-black rounded hover:bg-yellow-400 transition"
            >
              بستن
            </button>
          </div>
        </div>
      )}

      {/* 📋 مودال تمام پیام‌ها */}
      {showAllMessages && (
        <div className="fixed inset-0 backdrop-blur-md bg-white/10 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-[90%] max-w-lg p-6 text-right max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-bold mb-4 text-gray-800">تمام پیام‌ها</h3>
            <input
              type="text"
              placeholder="جستجو بر اساس عنوان، متن، شماره یا تاریخ..."
              className="w-full mb-4 px-3 py-2 border border-gray-400 rounded text-sm text-gray-800 placeholder-gray-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <ul className="space-y-3">
              {filteredMessages.length === 0 ? (
                <li className="text-gray-500 text-sm">هیچ پیامی مطابق جستجو یافت نشد.</li>
              ) : (
                filteredMessages.map((msg, index) => (
                  <li
                    key={msg.id}
                    className="border-b border-gray-200 pb-3 cursor-pointer hover:bg-gray-100"
                  >
                    <div className="flex justify-between items-center">
                      <span
                        onClick={() => handleMessageClick(msg.id)}
                        className="font-semibold text-gray-800"
                      >
                        {index + 1}. {msg.title}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleArchive(msg.id);
                        }}
                        title="آرشیو پیام"
                        className="text-gray-400 hover:text-red-500 transition"
                      >
                        🗑️
                      </button>
                    </div>
                    <div className="text-sm text-gray-700 mt-1">
                      {msg.content.length > 80 ? msg.content.slice(0, 80) + '...' : msg.content}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {formatJalaliDate(msg.timestamp)}
                    </div>
                  </li>
                ))
              )}
            </ul>
            <div className="text-center mt-4">
              <button
                onClick={() => setShowAllMessages(false)}
                className="px-4 py-1 bg-yellow-500 text-black rounded hover:bg-yellow-400 transition"
              >
                بستن
              </button>
            </div>
          </div>
        </div>
      )}
      {/* 🗃️ مودال پیام‌های آرشیوشده */}
      {showArchivedMessages && (
        <div className="fixed inset-0 backdrop-blur-md bg-white/10 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-[90%] max-w-lg p-6 text-right max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-bold mb-4 text-gray-800">پیام‌های بایگانی‌شده</h3>
            <input
              type="text"
              placeholder="جستجو در بایگانی..."
              className="w-full mb-4 px-3 py-2 border border-gray-400 rounded text-sm text-gray-800 placeholder-gray-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <ul className="space-y-3">
              {filteredArchived.length === 0 ? (
                <li className="text-gray-500 text-sm">هیچ پیام آرشیوشده‌ای مطابق جستجو یافت نشد.</li>
              ) : (
                filteredArchived.map((msg, index) => (
                  <li
                    key={msg.id}
                    className="border-b border-gray-200 pb-3 cursor-pointer hover:bg-gray-100"
                    onClick={() => handleMessageClick(msg.id)}
                  >
                    <div className="font-semibold text-gray-800">
                      {index + 1}. {msg.title}
                    </div>
                    <div className="text-sm text-gray-700 mt-1">
                      {msg.content.length > 80 ? msg.content.slice(0, 80) + '...' : msg.content}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {formatJalaliDate(msg.timestamp)}
                    </div>
                  </li>
                ))
              )}
            </ul>
            <div className="text-center mt-4">
              <button
                onClick={() => setShowArchivedMessages(false)}
                className="px-4 py-1 bg-yellow-500 text-black rounded hover:bg-yellow-400 transition"
              >
                بستن
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
