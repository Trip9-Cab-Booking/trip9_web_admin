
import PaymentManagement from '@/components/Payment-Management/PaymentManagement';
import { Metadata } from 'next';
import React from 'react'


export const metadata: Metadata = {
    title: "trip9 | trip9 Dashboard",
    description: "This is trip9 Analytics & Reports",
  };


const PaymentManagements = () => {
  return (
        <PaymentManagement />
  )
}

export default PaymentManagements;
