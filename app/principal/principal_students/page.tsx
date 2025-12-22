import React from 'react'

import StudentsPage from '@/app/components/All_students'
import DashboardLayout from '@/app/components/DashboardLayout'

const page = () => {
  return (
    <DashboardLayout role='principal'>
      <StudentsPage />
    </DashboardLayout>
  )
}

export default page
