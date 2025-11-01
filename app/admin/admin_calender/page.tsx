import React from 'react'
import Googlecalender from '@/app/components/Googlecalender'
import DashboardLayout from '@/app/components/DashboardLayout'

const Admin_calender = () => {
  return (
    <div>
      <DashboardLayout role='admin'>
      <Googlecalender />
      </DashboardLayout>
    </div>
  )
}

export default Admin_calender
