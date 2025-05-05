import UserManagement from '@/components/UserManagement'
import { Metadata } from 'next';
import React, { Suspense } from 'react'


export const metadata: Metadata = {
    title: "trip9 | trip9 Dashboard",
    description: "This is trip9 Users Management",
  };


const Users = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
        <UserManagement />
    </Suspense>
  )
}

export default Users;
