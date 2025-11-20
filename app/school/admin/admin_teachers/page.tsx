import TeachersPage from "@/app/school/components/All_teachers";
import DashboardLayout from "@/app/school/components/DashboardLayout";

export default function AdminTeachersPage() {
    return (
      <DashboardLayout role="admin">
        <TeachersPage />
      </DashboardLayout>
    );
}