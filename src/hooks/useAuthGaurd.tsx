"use client"

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { selectAccessToken } from '@/store/authSlice';

export const useAuthGuard = () => {
  const router = useRouter();
  const accessToken = useSelector(selectAccessToken);


  useEffect(() => {
    if (!accessToken) {
      return router.push('/signin');
    }
  }, [accessToken, router]);
};
