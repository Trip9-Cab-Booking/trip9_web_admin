
import DriverManagement from '@/components/DriverManagement';
// import { Driver } from '@/types/drivers';
import React from 'react'


// async function getDriversData(): Promise<Driver[]> {
//     const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/drivers`, {
//         headers: { Authorization: "Bearer token" },
//         cache: "no-store",
//         next: { revalidate: 60 } // ISR or use `cache: 'no-store'` if needed
//     });

//     if (!res.ok) throw new Error("Failed to fetch drivers");
//   const json = await res.json();
//   return json.data as Driver[];
//   }

const Demo = () => {
  return (
    <div className='w-full text-gray-800 dark:text-slate-200 overflow-hidden'>
        <DriverManagement />
    </div>
  )
}

export default Demo;
