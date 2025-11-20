import DashboardLayout from '@/app/components/DashboardLayout'
import React from 'react'
import RaiseIssues from '@/app/components/raise_issues'

const Principals_Issues = () => {
  return (
    <DashboardLayout role ='principal'>
     
      <RaiseIssues />
    </DashboardLayout>
  )
}

export default Principals_Issues
