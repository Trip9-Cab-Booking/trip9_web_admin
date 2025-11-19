
import PaymentManagement from '@/components/PaymentManagement';
import { Metadata } from 'next';
import React, { Suspense } from 'react'


export const metadata: Metadata = {
    title: "trip9 | trip9 Dashboard",
    description: "This is trip9 Analytics & Reports",
  };


const PaymentManagements = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
        <PaymentManagement />
    </Suspense>
  )
}

export default PaymentManagements;
