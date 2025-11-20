import DashboardLayout from '@/app/school/components/DashboardLayout'
import Activities from '@/app/school/components/All_activities'
import React from 'react'

const page = () => {
  return (
    <DashboardLayout role='principal'>
      <Activities />
    </DashboardLayout>

  )
}

export default page
