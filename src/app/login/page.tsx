'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import { HomeIcon } from '@heroicons/react/24/solid';
import Select from 'react-select';

function generateCaptcha() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

type CountryOption = {
  value: string;
  label: string;
  code: string;
  flag: string;
};

const countryOptions: CountryOption[] = [
  { value: 'IR', label: 'ایران', code: '+98', flag: '/icons/flags/ir.png' },
  { value: 'AF', label: 'افغانستان', code: '+93', flag: '/icons/flags/af.png' },
  { value: 'AZ', label: 'آذربایجان', code: '+994', flag: '/icons/flags/az.png' },
  { value: 'AE', label: 'امارات', code: '+971', flag: '/icons/flags/ae.png' },
  { value: 'TR', label: 'ترکیه', code: '+90', flag: '/icons/flags/tr.png' },
  { value: 'IQ', label: 'عراق', code: '+964', flag: '/icons/flags/iq.png' },
  { value: 'LB', label: 'لبنان', code: '+961', flag: '/icons/flags/lb.png' },
  { value: 'IN', label: 'هند', code: '+91', flag: '/icons/flags/in.png' },
];

export default function LoginPage() {
  const router = useRouter();

  const defaultCountry = countryOptions.find(c => c.value === 'IR')!;
  const [selectedCountry, setSelectedCountry] = useState<CountryOption>(defaultCountry);

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaCode, setCaptchaCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  useEffect(() => {
    setCaptchaCode(generateCaptcha());

    const locale = Intl.DateTimeFormat().resolvedOptions().locale;
    const countryCode = locale.split('-')[1]; // مثل "IR"
    const matched = countryOptions.find(c => c.value === countryCode);
    setSelectedCountry(matched ?? defaultCountry);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const cleanedPhone = phone.replace(/\D/g, '').replace(/^0/, '');
    const fullPhone = '00' + selectedCountry.code.replace('+', '') + cleanedPhone;

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: fullPhone,
          password,
          captchaInput,
          captchaCode,
        }),
      });

      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        setError('پاسخ سرور معتبر نبود. لطفاً دوباره تلاش کنید.');
        setCaptchaCode(generateCaptcha());
        return;
      }

      const result = await res.json();

      if (!res.ok) {
        setError(result.message || 'ورود ناموفق بود.');
        setCaptchaCode(generateCaptcha());
        return;
      }

      const user = result.user || {};
      const loginPhone = result.phone || user.phone || '';
      sessionStorage.setItem('loginPhone', loginPhone);

      await fetch('/api/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: user.phone,
          type: 'login',
          title: `ورود موفق`,
          content: `سلام ${user.firstName || ''} ${user.lastName || ''} عزیز، خوش آمدید.`,
          read: false,
        }),
      });

      setSuccess(result.message || 'ورود با موفقیت انجام شد');

      setTimeout(() => {
        router.push('/dashboard');
      }, 1000);
    } catch (err) {
      setError('ارتباط با سرور برقرار نشد.');
      setCaptchaCode(generateCaptcha());
    }
  };
  const customSingleValue = ({ data }: any) => (
    <div className="flex items-center gap-2 text-xs md:text-base">
      <div className="w-6 h-4 flex items-center justify-center">
        <Image src={data.flag} alt={data.label} width={24} height={18} />
      </div>
      <span className="truncate">{data.label}</span>
    </div>
  );

  const customOption = (props: any) => {
    const { data, innerRef, innerProps } = props;
    return (
      <div ref={innerRef} {...innerProps} className="flex items-center gap-2 px-3 py-2 hover:bg-gray-700 cursor-pointer text-xs md:text-sm">
        <div className="w-6 h-4 flex items-center justify-center">
          <Image src={data.flag} alt={data.label} width={24} height={16} />
        </div>
        <span className="truncate">{data.label}</span>
      </div>
    );
  };

  const customStyles = {
    control: (base: any) => ({
      ...base,
      backgroundColor: '#1f2937',
      borderColor: '#374151',
      color: 'white',
      minHeight: '2.5rem',
    }),
    menu: (base: any) => ({
      ...base,
      backgroundColor: '#1f2937',
      color: 'white',
    }),
    option: (base: any, state: any) => ({
      ...base,
      backgroundColor: state.isFocused ? '#374151' : '#1f2937',
      color: 'white',
      cursor: 'pointer',
      fontSize: '0.75rem',
      '@media (min-width: 768px)': {
        fontSize: '0.875rem',
      },
    }),
    singleValue: (base: any) => ({
      ...base,
      color: 'white',
      fontSize: '0.75rem',
      '@media (min-width: 768px)': {
        fontSize: '1rem',
      },
    }),
    input: (base: any) => ({
      ...base,
      color: 'white',
    }),
    placeholder: (base: any) => ({
      ...base,
      color: '#9ca3af',
    }),
  };

  return (
    <main dir="rtl" className="relative min-h-screen bg-gradient-to-br from-gray-900 to-black text-white flex items-center justify-center px-4 py-10">
      <Link href="/" className="absolute top-6 right-6 text-yellow-400 hover:text-yellow-300 flex items-center gap-2">
        <HomeIcon className="w-6 h-6" />
        <span className="hidden md:inline text-sm">خانه</span>
      </Link>

      <div className="w-full max-w-5xl bg-gray-900 bg-opacity-70 backdrop-blur-md rounded-xl shadow-xl flex flex-col md:flex-row overflow-hidden">
        <div className="md:w-1/2 w-full p-8 flex flex-col justify-center">
          <h2 className="text-2xl font-bold text-yellow-400 mb-6 text-center">ورود با شماره همراه</h2>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="flex flex-row-reverse items-center gap-2">
              <div className="w-40">
                <Select
                  options={countryOptions}
                  value={selectedCountry}
                  onChange={(option) => option && setSelectedCountry(option)}
                  components={{ SingleValue: customSingleValue, Option: customOption }}
                  styles={customStyles}
                  className="text-right"
                  isSearchable={false}
                />
              </div>
              <span className="text-yellow-400 text-sm">{selectedCountry.code}</span>
              <input
                type="text"
                placeholder="شماره همراه بدون صفر"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="px-11 py-4 rounded-md bg-gray-800 text-white placeholder-gray-400 text-right text-xs md:text-sm w-[20ch] md:w-auto"
              />
            </div>

            <input
              type="password"
              placeholder="رمز عبور"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-md bg-gray-800 text-white placeholder-gray-400 text-right focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />

            <div className="text-right text-xs text-gray-400 mt-1">
              <Link href="/forgot-password" className="hover:text-yellow-400 transition-colors">
                فراموشی رمز عبور؟
              </Link>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="کد کپچا"
                value={captchaInput}
                onChange={(e) => setCaptchaInput(e.target.value)}
                required
                className="flex-1 px-4 py-2 rounded-md bg-gray-800 text-white placeholder-gray-400 text-right focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
              <span className="text-lg font-mono bg-gray-700 px-4 py-2 rounded-md tracking-widest text-yellow-400">
                {captchaCode}
              </span>
              <button
                type="button"
                onClick={() => setCaptchaCode(generateCaptcha())}
                className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 transition"
                title="تغییر کپچا"
              >
                <ArrowPathIcon className="w-5 h-5 text-yellow-400" />
              </button>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-yellow-500 text-black font-semibold rounded-md shadow-md hover:bg-yellow-400 transition duration-300 ease-in-out"
            >
              ورود
            </button>

            {error && <p className="text-red-400 text-sm text-right mt-2">{error}</p>}
            {success && <p className="text-green-400 text-sm text-right mt-2">{success}</p>}
          </form>
        </div>

        <div className="hidden md:block w-[2px] bg-yellow-500"></div>

        <div className="md:w-1/2 flex items-center justify-center p-8 bg-gray-800">
          <div className="animate-slide-in-right">
            <Image src="/parsagold-logo-03.png" alt="Logo" width={240} height={240} className="drop-shadow-lg" />
          </div>
        </div>
      </div>
    </main>
  );
}
