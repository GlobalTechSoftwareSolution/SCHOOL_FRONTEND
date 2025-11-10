import DashboardLayout from '@/app/components/DashboardLayout'
import React from 'react'
import All_reports from '@/app/components/all_reports'

const page = () => {
  return (
    <DashboardLayout role ='principal'>
      <All_reports />
    </DashboardLayout>
  )
}

export default page
