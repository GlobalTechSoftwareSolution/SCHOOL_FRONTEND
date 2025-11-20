import All_Idcards from '@/app/school/components/All_Idcards'
import DashboardLayout from '@/app/school/components/DashboardLayout';

const Admin_Idcard = () => {
    return (
       <DashboardLayout role="admin">
        <All_Idcards />
       </DashboardLayout>
    );
};

export default Admin_Idcard;
