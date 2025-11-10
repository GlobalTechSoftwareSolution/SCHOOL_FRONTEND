import DashboardLayout from '@/app/components/DashboardLayout'
import React from 'react'
import All_notice from '@/app/components/all_notice'

const page = () => {
  return (
    <DashboardLayout role ='parents'>
      <All_notice />
    </DashboardLayout>
  )
}

export default page
