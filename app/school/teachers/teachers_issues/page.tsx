import DashboardLayout from '@/app/school/components/DashboardLayout'
import React from 'react'
import RaiseIssues from '@/app/school/components/raise_issues'

const page = () => {
  return (
    <DashboardLayout role ='teachers'>
     
      <RaiseIssues />
    </DashboardLayout>
  )
}

export default page
