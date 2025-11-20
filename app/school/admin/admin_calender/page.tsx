import React from 'react'
import Googlecalender from '@/app/school/components/Googlecalender'
import DashboardLayout from '@/app/school/components/DashboardLayout'

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
