"use client"


import { useAuthGuard } from '@/hooks/useAuthGaurd';
import { selectCurrentUser } from '@/store/authSlice';
import React from 'react'
import { useSelector } from 'react-redux';

const Dashboard = () => {
    useAuthGuard();
    const user = useSelector(selectCurrentUser);
    // console.log(user);

  return (
    <div>
        <div>ADMIN Dashboard</div>
    </div>
  )
}

export default Dashboard;
