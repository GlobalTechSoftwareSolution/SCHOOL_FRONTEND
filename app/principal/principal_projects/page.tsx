import DashboardLayout from "@/app/components/DashboardLayout";
import All_projects from "@/app/components/All_projects";

export default function PrincipalProjects() {
    return (
        <DashboardLayout role="principal">
            <All_projects />
        </DashboardLayout>  
    );
}