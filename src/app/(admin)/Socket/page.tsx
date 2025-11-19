
import React, { Suspense } from 'react'
import Chatbot from '@/components/chatbot';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "trip9 | trip9 Dashboard",
    description: "This is trip9 Socketmanagement",
  };

const Socketmanagement = () => {
  return (
    <div className='w-full text-gray-800 dark:text-slate-200 overflow-hidden'>
        <Suspense fallback={<div>Loading...</div>}>
            <Chatbot />
        </Suspense>
    </div>
  )
}

export default Socketmanagement;
