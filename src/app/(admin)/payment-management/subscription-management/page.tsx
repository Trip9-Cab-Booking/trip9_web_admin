import SubscriptionManagement from '@/components/Payment-Management/SubscriptionManagement';
import { Metadata } from 'next';
import React from 'react'


export const metadata: Metadata = {
    title: "trip9 | trip9 Dashboard",
    description: "This is trip9 Analytics & Reports",
  };


const SubscriptionManagementPage = () => {
  return (
        <SubscriptionManagement />
  )
}

export default SubscriptionManagementPage;
