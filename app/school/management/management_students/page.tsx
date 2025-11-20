import React from 'react'

import StudentsPage from '@/app/school/components/All_students'
import DashboardLayout from '@/app/school/components/DashboardLayout'

const page = () => {
  return (
    

<DashboardLayout role='management'>
<StudentsPage />
</DashboardLayout>
    
  )
}

export default page
