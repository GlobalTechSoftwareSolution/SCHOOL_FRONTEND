import DashboardLayout from "@/app/school/components/DashboardLayout";
import All_projects from "@/app/school/components/All_projects";

export default function TeachersProjects() {
    return (
        <DashboardLayout role="teachers">
            <All_projects />
        </DashboardLayout>  
    );
}
