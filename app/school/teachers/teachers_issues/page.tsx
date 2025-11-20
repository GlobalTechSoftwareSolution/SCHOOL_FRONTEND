import DashboardLayout from '@/app/components/DashboardLayout'
import React from 'react'
import RaiseIssues from '@/app/components/raise_issues'

const page = () => {
  return (
    <DashboardLayout role ='teachers'>
     
      <RaiseIssues />
    </DashboardLayout>
  )
}

export default page
