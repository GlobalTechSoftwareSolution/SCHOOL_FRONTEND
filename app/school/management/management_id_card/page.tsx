import All_Idcards from '@/app/school/components/All_Idcards'
import DashboardLayout from '@/app/school/components/DashboardLayout';

const management_Id_card = () => {
    return (
       <DashboardLayout role="management">
        <All_Idcards />
       </DashboardLayout>
    );
};

export default management_Id_card;
