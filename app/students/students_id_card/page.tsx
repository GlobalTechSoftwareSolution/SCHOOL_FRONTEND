import All_Idcards from '@/app/components/All_Idcards'
import DashboardLayout from '@/app/components/DashboardLayout';

const Student_Id_card = () => {
    return (
       <DashboardLayout role="students">
        <All_Idcards />
       </DashboardLayout>
    );
};

export default Student_Id_card;
