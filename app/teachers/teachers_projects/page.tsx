import DashboardLayout from "@/app/components/DashboardLayout";
import All_projects from "@/app/components/All_projects";

export default function TeachersProjects() {
    return (
        <DashboardLayout role="teachers">
            <All_projects />
        </DashboardLayout>  
    );
}
