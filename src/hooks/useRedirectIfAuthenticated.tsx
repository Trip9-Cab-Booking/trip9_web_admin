// hooks/useRedirectIfAuthenticated.ts
"use client"


import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { selectAccessToken, selectCurrentUser } from '@/store/authSlice';

export const useRedirectIfAuthenticated = () => {
  const router = useRouter();
  const accessToken = useSelector(selectAccessToken);
  const user = useSelector(selectCurrentUser);
  console.log(accessToken);


  useEffect(() => {
    if (accessToken && user?.role === "admin") {
      router.push('/');
    }
  }, [accessToken, router]);
};
