
import React, { Suspense } from 'react'
import DriverManagement from '@/components/DriverManagement';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "trip9 | trip9 Dashboard",
    description: "This is trip9 drivers management",
  };

const Demo = () => {
  return (
    <div className='w-full text-gray-800 dark:text-slate-200 overflow-hidden'>
        <Suspense fallback={<div>Loading...</div>}>
            <DriverManagement />
        </Suspense>
    </div>
  )
}

export default Demo;
