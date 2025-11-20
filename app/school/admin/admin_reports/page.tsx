import DashboardLayout from '@/app/school/components/DashboardLayout'
import All_reports from '@/app/school/components/all_reports'
import React from 'react'

const page = () => {
  return (
   <DashboardLayout role='admin'>
    <All_reports />
   </DashboardLayout>
  )
}

export default page
