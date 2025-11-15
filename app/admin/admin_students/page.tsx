import React from 'react'
import StudentsPage from '@/app/components/All_students'
import DashboardLayout from '@/app/components/DashboardLayout'

const AdminStudents = () => {
    return (
        <DashboardLayout role="admin">
            <StudentsPage />
        </DashboardLayout>
    )
}

export default AdminStudents
