import ResetPasswordForm from '@/components/resetPassword/ResetPassForm'
import { Metadata } from 'next';
import React from 'react'

export const metadata: Metadata = {
    title: "trip9 | trip9 Dashboard",
    description: "trip9 admin forgot password for admin dashboard",
  };

const ResetPassword = () => {
  return <ResetPasswordForm />
}

export default ResetPassword
