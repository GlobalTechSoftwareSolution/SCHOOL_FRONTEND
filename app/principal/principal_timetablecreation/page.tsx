import React from 'react'
import Timetablecreation from '@/app/components/Timetablecreation'
import DashboardLayout from '@/app/components/DashboardLayout'

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
