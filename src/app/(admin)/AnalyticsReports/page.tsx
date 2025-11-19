import AnalyticsReports from '@/components/AnalyticsReports';
import { Metadata } from 'next';
import React, { Suspense } from 'react'


export const metadata: Metadata = {
    title: "trip9 | trip9 Dashboard",
    description: "This is trip9 Analytics & Reports",
  };


const AnalyticsReport = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
        <AnalyticsReports />
    </Suspense>
  )
}

export default AnalyticsReport;
