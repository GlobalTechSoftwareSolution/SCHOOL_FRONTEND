import DashboardLayout from '@/app/school/components/DashboardLayout'
import React from 'react'
import All_reports from '@/app/school/components/all_reports'

const page = () => {
  return (
    <DashboardLayout role ='management'>
      <All_reports />
    </DashboardLayout>
  )
}

export default page
