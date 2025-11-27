import React, { Suspense } from 'react';
import UserManagement from '@/components/UserManagement';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "trip9 | trip9 Dashboard",
  description: "This is trip9 Users Management",
};

const Users = () => {
  return (
    <Suspense fallback={<div>Loading users...</div>}>
      <UserManagement />
    </Suspense>
  );
};

export default Users;
