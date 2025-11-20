import ProjectsPage from '@/app/school/components/All_projects'
import DashboardLayout from '@/app/school/components/DashboardLayout'

export default function AdminProjectsPage() {
  return(
    <DashboardLayout role='admin'>
        <ProjectsPage />;
    </DashboardLayout>
  )
   
}