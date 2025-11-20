import React from 'react'

import StudentsPage from '@/app/school/components/All_students'
import DashboardLayout from '@/app/school/components/DashboardLayout'

const page = () => {
  return (
    

<DashboardLayout role='principal'>
<StudentsPage />
</DashboardLayout>
    
  )
}

export default page
