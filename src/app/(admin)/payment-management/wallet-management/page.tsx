

import { Metadata } from 'next';
import React from 'react';
import WalletManagement from '@/components/Payment-Management/WalletManagement';


export const metadata: Metadata = {
    title: "trip9 | trip9 Dashboard",
    description: "This is trip9 Analytics & Reports",
  };


const WalletManagementPage = () => {
  return (
        <>
        <WalletManagement />
        </>
  )
}

export default WalletManagementPage;
