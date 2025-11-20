import React from 'react'
import Googlecalender from '@/app/components/Googlecalender'
import DashboardLayout from '@/app/components/DashboardLayout'

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
