import { toast } from 'react-toastify';
import sportApi from '../../services/api/sportApi';
import styles from '../../assets/css/Sport/sport.module.scss';

function CreateSport() {
    const data = {
        sportName: 'Footbal',
        description: 'Bóng đá là môn thể thao vua',
        imageUrl: 'https://vff.org.vn/uploads/images/fifa-women-2015.jpg',
    };
    const handleClick = async () => {
        try {
            const response = await sportApi.create(data);
            console.log(response);
            toast.success(response.message);
        } catch (error) {
            // Hiện toast trong axiosClient rồi
            console.log('Tạo sport không thành công: ', error);
        }
    };
    return (
        <div className={styles.sportContainer}>
            <button onClick={handleClick}>Create sport api</button>
        </div>
    );
}

export default CreateSport;
