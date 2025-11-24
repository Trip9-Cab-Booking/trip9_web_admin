
import React from 'react'
import RideManagement from '@/components/RideManagement';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "trip9 | trip9 Dashboard",
    description: "This is trip9 Ride management",
  };

const Ridemanagement = () => {
  return (
    <div className='w-full text-gray-800 dark:text-slate-200 overflow-hidden'>
            <RideManagement />
    </div>
  )
}

export default Ridemanagement;
