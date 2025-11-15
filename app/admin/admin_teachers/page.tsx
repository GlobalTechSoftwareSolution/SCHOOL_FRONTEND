import TeachersPage from "@/app/components/All_teachers";
import DashboardLayout from "@/app/components/DashboardLayout";

export default function AdminTeachersPage() {
    return (
      <DashboardLayout role="admin">
        <TeachersPage />
      </DashboardLayout>
    );
}