import DashboardLayout from '@/app/school/components/DashboardLayout'
import React from 'react'
import RaiseIssues from '@/app/school/components/raise_issues'

const Principals_Issues = () => {
  return (
    <DashboardLayout role ='principal'>
     
      <RaiseIssues />
    </DashboardLayout>
  )
}

export default Principals_Issues
