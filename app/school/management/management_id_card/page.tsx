import All_Idcards from '@/app/components/All_Idcards'
import DashboardLayout from '@/app/components/DashboardLayout';

const management_Id_card = () => {
    return (
       <DashboardLayout role="management">
        <All_Idcards />
       </DashboardLayout>
    );
};

export default management_Id_card;
