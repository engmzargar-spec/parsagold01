'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { HomeIcon } from '@heroicons/react/24/solid';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { SingleValue } from 'react-select';

const Select = dynamic(() => import('react-select'), { ssr: false });

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

function sanitize(value: string) {
  return value.replace(/[<>"]/g, '').trim();
}

function isValidPhone(value: string) {
  return /^\d{9,12}$/.test(value);
}

function isStrongPassword(value: string) {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(value);
}

function extractOS(userAgent: string): string {
  if (/windows/i.test(userAgent)) return 'Windows';
  if (/android/i.test(userAgent)) return 'Android';
  if (/iphone|ipad|ios/i.test(userAgent)) return 'iOS';
  if (/macintosh|mac os/i.test(userAgent)) return 'MacOS';
  if (/linux/i.test(userAgent)) return 'Linux';
  return 'نامشخص';
}

export default function SignupPage() {
  const router = useRouter();
  const defaultCountry = countryOptions.find(c => c.value === 'IR')!;
  const [selectedCountry, setSelectedCountry] = useState<CountryOption>(defaultCountry);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const fallbackCountry = () => {
      const locale = Intl.DateTimeFormat().resolvedOptions().locale;
      const code = locale.split('-')[1]?.toUpperCase();
      const matched = countryOptions.find(c => c.value === code);
      setSelectedCountry(matched ?? defaultCountry);
    };

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await fetch(`/api/geo?lat=${latitude}&lng=${longitude}`);
          const data = await res.json();
          const matched = countryOptions.find(c => c.value === data.countryCode);
          setSelectedCountry(matched ?? defaultCountry);
        } catch {
          fallbackCountry();
        }
      },
      () => {
        fallbackCountry(); // کاربر اجازه نداد یا خطا بود
      }
    );

    setIsMounted(true);
  }, []);
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
  const [invalidFields, setInvalidFields] = useState<string[]>([]);

  const handleCountryChange = (option: SingleValue<CountryOption>) => {
    if (option) setSelectedCountry(option);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
    setInvalidFields((prev) => prev.filter((f) => f !== name));
  };

  const inputClass = (name: string) =>
    `w-full px-4 py-3 rounded-md bg-gray-800 text-white placeholder-gray-400 text-right ${
      invalidFields.includes(name) ? 'border border-red-500' : ''
    }`;

  const customSingleValue = ({ data }: { data: CountryOption }) => (
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
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const invalids: string[] = [];

    for (const key in form) {
      const typedKey = key as keyof typeof form;
      if (typedKey !== 'acceptedTerms' && form[typedKey].toString().trim() === '') {
        invalids.push(typedKey);
      }
    }

    if (!form.acceptedTerms) {
      invalids.push('acceptedTerms');
      setError('لطفاً قوانین و مقررات را مطالعه کرده و تیک تأیید را بزنید.');
    }

    if (!isStrongPassword(form.password)) {
      invalids.push('password');
      setError('رمز عبور باید حداقل ۸ کاراکتر و شامل حروف بزرگ، کوچک، عدد و علامت خاص باشد.');
    }

    if (form.password !== form.confirmPassword) {
      invalids.push('confirmPassword');
      setError('تکرار رمز عبور با رمز اصلی مطابقت ندارد.');
    }

    let rawPhone = form.phone.trim();
    if (rawPhone.startsWith('0')) rawPhone = rawPhone.slice(1);
    if (!isValidPhone(rawPhone)) {
      invalids.push('phone');
      setError('شماره موبایل معتبر نیست. لطفاً بدون صفر و فقط عدد وارد کنید.');
    }

    if (invalids.length > 0) {
      setInvalidFields(invalids);
      return;
    }

    const fullPhone = sanitize('00' + selectedCountry.code.replace('+', '') + rawPhone);
    const os = extractOS(navigator.userAgent);

    let locationData = null;
    try {
      const geo = await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject)
      );
      locationData = {
        latitude: geo.coords.latitude,
        longitude: geo.coords.longitude,
      };
    } catch {
      console.warn('⚠️ موقعیت جغرافیایی قابل دریافت نیست');
    }

    const payload = {
      firstName: sanitize(form.firstName),
      lastName: sanitize(form.lastName),
      email: sanitize(form.email),
      phone: fullPhone,
      password: sanitize(form.password),
      os,
      location: locationData,
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
      sessionStorage.setItem('userId', result.userId);

      await fetch('/api/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: result.phone,
          type: 'signup',
          title: `خوش آمدید ${form.firstName} ${form.lastName} عزیز`,
          content: `ثبت‌نام شما با موفقیت انجام شد. شناسه شما: ${result.userId}`,
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
}
