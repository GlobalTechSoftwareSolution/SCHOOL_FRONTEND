import All_Idcards from '@/app/components/All_Idcards'
import DashboardLayout from '@/app/components/DashboardLayout';

const Principal_Id_card = () => {
    return (
       <DashboardLayout role="principal">
        <All_Idcards />
       </DashboardLayout>
    );
};

export default Principal_Id_card;
