'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="absolute top-4 right-4 p-2 bg-gray-700 text-yellow-400 rounded-full z-50"
    >
      {theme === 'dark' ? '☀️' : '🌙'}
    </button>
  );
}
