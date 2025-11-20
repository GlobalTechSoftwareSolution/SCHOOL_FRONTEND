import DashboardLayout from '@/app/school/components/DashboardLayout'
import ProgramsPage from '@/app/school/components/All_programs'
import React from 'react'

const page = () => {
  return (
    <DashboardLayout role='admin'>
        <ProgramsPage />
    </DashboardLayout>
  )
}

export default page
