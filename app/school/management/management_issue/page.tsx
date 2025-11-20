import DashboardLayout from '@/app/school/components/DashboardLayout'
import React from 'react'
import RaiseIssues from '@/app/school/components/raise_issues'

const Management_Issues = () => {
  return (
    <DashboardLayout role ='management'>
     
      <RaiseIssues />
    </DashboardLayout>
  )
}

export default Management_Issues
