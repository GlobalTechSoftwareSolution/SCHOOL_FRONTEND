import React from 'react'
import Googlecalender from '@/app/components/Googlecalender'
import DashboardLayout from '@/app/components/DashboardLayout'

const Teachers_calender = () => {
  return (
    <div>
      <DashboardLayout role='teachers'>

      <Googlecalender />
      </DashboardLayout>
    </div>
  )
}

export default Teachers_calender
