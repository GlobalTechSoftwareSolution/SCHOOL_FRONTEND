import React from 'react'
import Googlecalender from '@/app/school/components/Googlecalender'
import DashboardLayout from '@/app/school/components/DashboardLayout'

const Students_calender = () => {
  return (
    <div>
      <DashboardLayout role='students'>

      <Googlecalender />
      </DashboardLayout>
    </div>
  )
}

export default Students_calender
