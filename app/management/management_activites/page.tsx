import DashboardLayout from '@/app/components/DashboardLayout'
import Activities from '@/app/components/All_activities'
import React from 'react'

const page = () => {
  return (
    <DashboardLayout role='management'>
      <Activities />
    </DashboardLayout>

  )
}

export default page
