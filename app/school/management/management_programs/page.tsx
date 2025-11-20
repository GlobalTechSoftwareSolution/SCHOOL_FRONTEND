import DashboardLayout from '@/app/components/DashboardLayout'
import ProgramsPage from '@/app/components/All_programs'
import React from 'react'

const page = () => {
  return (
    <DashboardLayout role='management'>
      <ProgramsPage />
    </DashboardLayout>
  )
}

export default page
