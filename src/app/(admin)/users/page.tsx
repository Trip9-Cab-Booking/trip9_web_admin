import UserManagement from '@/components/UserManagement'
import { Metadata } from 'next';
import React from 'react'


export const metadata: Metadata = {
    title: "trip9 | trip9 Dashboard",
    description: "This is trip9 Users Management",
  };


const Users = () => {
  return (
        <UserManagement />
  )
}

export default Users;
