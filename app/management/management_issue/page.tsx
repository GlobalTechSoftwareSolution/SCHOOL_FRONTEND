import DashboardLayout from '@/app/components/DashboardLayout'
import React from 'react'
import RaiseIssues from '@/app/components/raise_issues'

const Management_Issues = () => {
  return (
    <DashboardLayout role ='management'>
     
      <RaiseIssues />
    </DashboardLayout>
  )
}

export default Management_Issues
