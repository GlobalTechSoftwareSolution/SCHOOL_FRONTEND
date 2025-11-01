"use client"
import DashboardLayout from '@/app/components/DashboardLayout'
import React, { useState, useEffect } from 'react'
import Raise_issues from '@/app/components/raise_issues'

const Issues_Page = () => {

  return (
    <DashboardLayout role="admin">
      <Raise_issues />
    </DashboardLayout>
  )
}

export default Issues_Page