import React from 'react'
import StudentsPage from '@/app/school/components/All_students'
import DashboardLayout from '@/app/school/components/DashboardLayout'

const AdminStudents = () => {
    return (
        <DashboardLayout role="admin">
            <StudentsPage />
        </DashboardLayout>
    )
}

export default AdminStudents
