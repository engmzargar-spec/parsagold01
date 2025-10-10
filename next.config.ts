/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // اگر تنظیمات خاصی برای تصاویر یا دامنه‌ها داری، اینجا اضافه کن
  images: {
    domains: ['example.com'], // ← اگر از دامنه خاصی تصویر می‌گیری
  },

  // اگر از redirects یا rewrites استفاده می‌کنی، اینجا اضافه کن
  // redirects: async () => [...],
  // rewrites: async () => [...],

  // اگر از i18n یا locale استفاده می‌کنی، اینجا اضافه کن
  // i18n: {
  //   locales: ['fa', 'en'],
  //   defaultLocale: 'fa',
  // },

  // نیازی به appDir نیست چون در Next.js 15 به‌صورت پیش‌فرض فعاله
};

module.exports = nextConfig;
