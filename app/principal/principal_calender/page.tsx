import React from 'react'
import Googlecalender from '@/app/components/Googlecalender'
import DashboardLayout from '@/app/components/DashboardLayout'

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
