import DashboardLayout from '@/app/components/DashboardLayout'
import React from 'react'
import RaiseIssues from '@/app/components/raise_issues'

const page = () => {
  return (
    <DashboardLayout role ='students'>
     
      <RaiseIssues />
    </DashboardLayout>
  )
}

export default page
