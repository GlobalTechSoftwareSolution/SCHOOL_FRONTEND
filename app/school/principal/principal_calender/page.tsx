import React from 'react'
import Googlecalender from '@/app/school/components/Googlecalender'
import DashboardLayout from '@/app/school/components/DashboardLayout'

const Principal_calender = () => {
  return (
    <div>
      <DashboardLayout role='principal'>

      <Googlecalender />
      </DashboardLayout>
    </div>
  )
}

export default Principal_calender
