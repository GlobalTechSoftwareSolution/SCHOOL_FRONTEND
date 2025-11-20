import DashboardLayout from "@/app/school/components/DashboardLayout";
import All_projects from "@/app/school/components/All_projects";

export default function PrincipalProjects() {
    return (
        <DashboardLayout role="principal">
            <All_projects />
        </DashboardLayout>  
    );
}