
// import PricingControl from '@/components/PricingControl';
import { Metadata } from 'next';
import React, { Suspense } from 'react'


export const metadata: Metadata = {
    title: "trip9 | trip9 Dashboard",
    description: "This is trip9 Pricing Control",
  };


const PricingControls = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
        {/* <PricingControl /> */}
        <h1>Pricing Control</h1>
    </Suspense>
  )
}

export default PricingControls;
