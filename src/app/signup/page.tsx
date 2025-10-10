'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { HomeIcon } from '@heroicons/react/24/solid';
import { useRouter } from 'next/navigation';
import Select from 'react-select';

type CountryOption = {
  value: string;
  label: string;
  code: string;
  flag: string;
};

export default function SignupPage() {
  const router = useRouter();

  const countryOptions: CountryOption[] = [
    { value: 'IR', label: 'ایران', code: '+98', flag: '/icons/flags/ir.png' },
    { value: 'AF', label: 'افغانستان', code: '+93', flag: '/icons/flags/af.png' },
    { value: 'AZ', label: 'آذربایجان', code: '+994', flag: '/icons/flags/az.png' },
    { value: 'AE', label: 'امارات', code: '+971', flag: '/icons/flags/ae.png' },
    { value: 'BH', label: 'بحرین', code: '+973', flag: '/icons/flags/bh.png' },
    { value: 'PK', label: 'پاکستان', code: '+92', flag: '/icons/flags/pk.png' },
    { value: 'TJ', label: 'تاجیکستان', code: '+992', flag: '/icons/flags/tj.png' },
    { value: 'TR', label: 'ترکیه', code: '+90', flag: '/icons/flags/tr.png' },
    { value: 'IQ', label: 'عراق', code: '+964', flag: '/icons/flags/iq.png' },
    { value: 'SA', label: 'عربستان', code: '+966', flag: '/icons/flags/sa.png' },
    { value: 'OM', label: 'عمان', code: '+968', flag: '/icons/flags/om.png' },
    { value: 'SY', label: 'سوریه', code: '+963', flag: '/icons/flags/sy.png' },
    { value: 'QA', label: 'قطر', code: '+974', flag: '/icons/flags/qa.png' },
    { value: 'LB', label: 'لبنان', code: '+961', flag: '/icons/flags/lb.png' },
    { value: 'KW', label: 'کویت', code: '+965', flag: '/icons/flags/kw.png' },
    { value: 'IN', label: 'هند', code: '+91', flag: '/icons/flags/in.png' },
  ];

  const defaultCountry = countryOptions.find(c => c.value === 'IR');
  const initialCountry: CountryOption = defaultCountry ?? {
    value: 'IR',
    label: 'ایران',
    code: '+98',
    flag: '/icons/flags/ir.png',
  };

  const [selectedCountry, setSelectedCountry] = useState<CountryOption>(initialCountry);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    acceptedTerms: false,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const sanitize = (value: string) => value.replace(/[<>"]/g, '').trim();
  const isValidPhone = (value: string) => /^\d{9,12}$/.test(value);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    for (const key in form) {
      const typedKey = key as keyof typeof form;
      if (typedKey !== 'acceptedTerms' && form[typedKey].toString().trim() === '') {
        setError(`لطفاً فیلد "${typedKey}" را کامل کنید.`);
        return;
      }
    }

    let rawPhone = form.phone.trim();
    if (rawPhone.startsWith('0')) {
      rawPhone = rawPhone.slice(1);
    }

    if (!isValidPhone(rawPhone)) {
      setError('شماره موبایل معتبر نیست. لطفاً بدون صفر و فقط عدد وارد کنید.');
      return;
    }

    const fullPhone = sanitize(selectedCountry.code.replace('+', '') + rawPhone);

    const payload = {
      firstName: sanitize(form.firstName),
      lastName: sanitize(form.lastName),
      email: sanitize(form.email || ''),
      phone: fullPhone,
      password: sanitize(form.password),
    };

    try {
      const res = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok) {
        setError(result.message || 'خطا در ثبت‌نام. لطفاً دوباره تلاش کنید.');
        return;
      }

      sessionStorage.setItem('loginPhone', result.phone);

      await fetch('/api/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: result.phone,
          type: 'signup',
          title: `خوش آمدید ${result.firstName} ${result.lastName} عزیز`,
          content: `ثبت‌نام شما با موفقیت انجام شد. لطفاً وارد شوید.`,
          read: false,
        }),
      });

      setSuccess('ثبت‌نام با موفقیت انجام شد. در حال انتقال...');
      setTimeout(() => {
        router.push('/login');
      }, 1000);
    } catch (err) {
      setError('ارتباط با سرور برقرار نشد.');
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
    <main dir="rtl" className="relative min-h-screen bg-gradient-to-br from-gray-900 to-black text-white px-4 py-10">
      {/* آیکون خانه */}
      <div className="absolute top-4 right-4 z-50">
        <Link href="/" className="text-yellow-400 hover:text-yellow-300 flex items-center gap-2">
          <HomeIcon className="w-6 h-6" />
        </Link>
      </div>

      {/* فرم و تصویر کنار هم با خط طلایی */}
      <div className="flex flex-col md:flex-row-reverse items-stretch justify-center max-w-5xl mx-auto">
        {/* فرم ثبت‌نام */}
        <div className="w-full md:w-1/2 bg-gray-900 bg-opacity-70 backdrop-blur-md rounded-r-xl shadow-xl p-6">
          <h2 className="text-2xl font-bold text-yellow-400 mb-6 text-center">ثبت‌نام</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="text" name="firstName" placeholder="نام: *" value={form.firstName} onChange={handleChange} required className="w-full px-4 py-3 rounded-md bg-gray-800 text-white placeholder-gray-400 text-right" />
            <input type="text" name="lastName" placeholder="نام خانوادگی: *" value={form.lastName} onChange={handleChange} required className="w-full px-4 py-3 rounded-md bg-gray-800 text-white placeholder-gray-400 text-right" />
            <input type="email" name="email" placeholder="ایمیل: *" value={form.email} onChange={handleChange} required className="w-full px-4 py-3 rounded-md bg-gray-800 text-white placeholder-gray-400 text-right" />

            <div className="flex flex-row-reverse items-center gap-2">
              <div className="w-40">
                <Select
                  options={countryOptions}
                  value={selectedCountry}
                  onChange={(option) => {
                    if (option) setSelectedCountry(option);
                  }}
                  components={{ SingleValue: customSingleValue, Option: customOption }}
                  styles={customStyles}
                  className="text-right"
                  isSearchable={false}
                />
              </div>
              <span className="text-yellow-400 text-sm">{selectedCountry.code}</span>
              <input
                type="tel"
                name="phone"
                placeholder="*شماره بدون صفر"
                value={form.phone}
                onChange={handleChange}
                required
                className="px-11 py-4 rounded-md bg-gray-800 text-white placeholder-gray-400 text-right text-xs md:text-sm w-[20ch] md:w-auto"
              />
            </div>

            <input type="password" name="password" placeholder="رمز عبور: *" value={form.password} onChange={handleChange} required className="w-full px-4 py-3 rounded-md bg-gray-800 text-white placeholder-gray-400 text-right" />
            <p className="text-xs text-gray-400 text-right">رمز عبور باید شامل حداقل ۸ کاراکتر، حروف بزرگ، حروف کوچک، عدد و علامت خاص باشد.</p>
            <input type="password" name="confirmPassword" placeholder="تکرار رمز عبور: *" value={form.confirmPassword} onChange={handleChange} required className="w-full px-4 py-3 rounded-md bg-gray-800 text-white placeholder-gray-400 text-right" />

            <label className="flex flex-row-reverse items-center justify-end gap-x-2 text-sm text-gray-300 text-right">
              <input type="checkbox" name="acceptedTerms" checked={form.acceptedTerms} onChange={handleChange} className="accent-yellow-500" />
              <Link href="/terms" className="text-yellow-400 underline hover:text-yellow-300">قوانین و مقررات را مطالعه کرده‌ام و می‌پذیرم</Link>
            </label>

            <button type="submit" className="w-full py-3 bg-yellow-500 text-black font-semibold rounded-md shadow-md hover:bg-yellow-400 transition duration-300 ease-in-out">
              ثبت‌نام
            </button>

            {error && <p className="text-red-400 text-sm text-right mt-2">{error}</p>}
            {success && <p className="text-green-400 text-sm text-right mt-2">{success}</p>}
          </form>
        </div>

        {/* تصویر با خط طلایی جداکننده */}
        <div className="w-full md:w-1/2 bg-gray-800 border-l-2 border-yellow-500 rounded-l-xl shadow-xl flex items-center justify-center p-8">
          <Image src="/handshake.png" alt="Handshake Logo" width={240} height={240} className="drop-shadow-lg" />
        </div>
      </div>
    </main>
  );
}
