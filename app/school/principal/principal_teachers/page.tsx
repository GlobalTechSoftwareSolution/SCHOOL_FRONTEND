import DashboardLayout from '@/app/components/DashboardLayout'
import TeachersPage from '@/app/components/All_teachers'
import React from 'react'

const page = () => {
  return (
    <DashboardLayout role='principal'>
      <TeachersPage />
    </DashboardLayout>
  )
}

export default page
