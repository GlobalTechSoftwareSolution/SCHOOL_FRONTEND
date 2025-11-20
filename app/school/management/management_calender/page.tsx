import React from 'react'
import Googlecalender from '@/app/school/components/Googlecalender'
import DashboardLayout from '@/app/school/components/DashboardLayout'

const Management_calender = () => {
  return (
    <div>
      <DashboardLayout role='management'>

      <Googlecalender />
      </DashboardLayout>
    </div>
  )
}

export default Management_calender
