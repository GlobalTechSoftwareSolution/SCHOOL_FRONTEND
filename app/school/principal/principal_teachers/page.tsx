import DashboardLayout from '@/app/school/components/DashboardLayout'
import TeachersPage from '@/app/school/components/All_teachers'
import React from 'react'

const page = () => {
  return (
    <DashboardLayout role='principal'>
      <TeachersPage />
    </DashboardLayout>
  )
}

export default page
