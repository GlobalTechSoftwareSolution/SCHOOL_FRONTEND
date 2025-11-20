import DashboardLayout from '@/app/components/DashboardLayout'
import All_reports from '@/app/components/all_reports'
import React from 'react'

const page = () => {
  return (
   <DashboardLayout role='admin'>
    <All_reports />
   </DashboardLayout>
  )
}

export default page
