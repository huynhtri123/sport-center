import SportHome from './SportHome';
import styles from '../../../../assets/css/Sport/sportHome.module.scss';
import { FieldType } from '../../../../utils/enums/FieldType';

function BadmintonHome() {
    const features = [
        {
            image: 'https://res.cloudinary.com/dftznqjsj/image/upload/v1729674136/badminton-field_vrvpld.jpg',
            alt: 'Badminton Courts',
            title: 'Đa dạng sân cầu lông',
            description: 'Chúng tôi cung cấp nhiều sân bóng với kích thước khác nhau phù hợp cho mọi nhu cầu.',
        },
        {
            image: 'https://images.pexels.com/photos/2202685/pexels-photo-2202685.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
            alt: 'Training Courses',
            title: 'Khóa học đào tạo',
            description: 'Tham gia các khóa học cầu lông với những huấn luyện viên chuyên nghiệp.',
        },
        {
            image: 'https://img.freepik.com/free-vector/badminton-tournament-flat-horizontal-poster-with-male-player-motion-hitting-shuttlecock-with-racquet-across-net-vector-illustration_1284-71470.jpg?t=st=1729674485~exp=1729678085~hmac=ad5c1f24d543b118203e1d6c62e8343e8ec0377883372d82a03c55805dc1ee3b&w=996',
            alt: 'Tournaments',
            title: 'Giải đấu',
            description: 'Tham gia hoặc đăng ký các giải đấu để thể hiện kỹ năng của bạn.',
        },
        {
            image: 'https://images.pexels.com/photos/3660204/pexels-photo-3660204.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
            alt: 'Badminton Shop',
            title: 'Cửa hàng dụng cụ',
            description: 'Mua sắm các dụng cụ cầu lông chất lượng cao với giá cả hợp lý.',
        },
    ];

    return (
        <SportHome
            title='BADMINTON'
            description='"CẦU LÔNG - SỰ LỰA CHỌN HOÀN HẢO CHO SỨC KHỎE VÀ NIỀM VUI"'
            linkTo={`/sport/fields`}
            fieldType={FieldType.BADMINTON}
            bannerImage='https://images.pexels.com/photos/7438732/pexels-photo-7438732.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
            features={features}
            className={styles.badminton}
        />
    );
}

export default BadmintonHome;
