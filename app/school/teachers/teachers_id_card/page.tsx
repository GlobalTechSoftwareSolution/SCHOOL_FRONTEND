import All_Idcards from '@/app/components/All_Idcards'
import DashboardLayout from '@/app/components/DashboardLayout';

const Teacher_Id_card = () => {
    return (
       <DashboardLayout role="teachers">
        <All_Idcards />
       </DashboardLayout>
    );
};

export default Teacher_Id_card;
