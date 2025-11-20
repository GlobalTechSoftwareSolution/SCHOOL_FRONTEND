import React from 'react'
import Googlecalender from '@/app/school/components/Googlecalender'
import DashboardLayout from '@/app/school/components/DashboardLayout'

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
