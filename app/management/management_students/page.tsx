import React from 'react'

import StudentsPage from '@/app/components/All_students'
import DashboardLayout from '@/app/components/DashboardLayout'

const page = () => {
  return (
    

<DashboardLayout role='management'>
<StudentsPage />
</DashboardLayout>
    
  )
}

export default page
