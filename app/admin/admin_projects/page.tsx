import ProjectsPage from '@/app/components/All_projects'
import DashboardLayout from '@/app/components/DashboardLayout'

export default function AdminProjectsPage() {
  return(
    <DashboardLayout role='admin'>
        <ProjectsPage />;
    </DashboardLayout>
  )
   
}