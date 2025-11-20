import DashboardLayout from "@/app/components/DashboardLayout";
import All_projects from "@/app/components/All_projects";

export default function ManagementProjects() {
    return (
        <DashboardLayout role="management">
            <All_projects />
        </DashboardLayout>  
    );
}