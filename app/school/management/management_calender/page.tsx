import React from 'react'
import Googlecalender from '@/app/components/Googlecalender'
import DashboardLayout from '@/app/components/DashboardLayout'

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
