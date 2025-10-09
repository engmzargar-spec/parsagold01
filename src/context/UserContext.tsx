'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

type User = {
  phone?: string;
  userId?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
};

type UserContextType = {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const phone = sessionStorage.getItem('loginPhone');
    if (!phone) {
      setUser({});
      return;
    }

    fetch(`/users/${phone}/profile.json`)
      .then((res) => {
        if (!res.ok) throw new Error('فایل پروفایل یافت نشد');
        return res.json();
      })
      .then((data) => {
        setUser({
          phone,
          userId: data.userId,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
        });
      })
      .catch((err) => {
        console.error('❌ خطا در بارگذاری اطلاعات کاربر:', err);
        setUser({});
      });
  }, []);

  const logout = () => {
    sessionStorage.removeItem('loginPhone');
    setUser(null);
  };

  return (
    <UserContext.Provider value={{ user, setUser, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser باید داخل UserProvider استفاده شود.');
  return context;
};
