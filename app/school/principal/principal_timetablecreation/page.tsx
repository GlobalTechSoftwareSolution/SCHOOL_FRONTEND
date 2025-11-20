import React from 'react'
import Timetablecreation from '@/app/school/components/Timetablecreation'
import DashboardLayout from '@/app/school/components/DashboardLayout'

const page = () => {
  return (
    <DashboardLayout role="principal">
    <div>
      <Timetablecreation />
    </div>
    </DashboardLayout>
  )
}

export default page
