import SportHome from './SportHome';
import styles from '../../../../assets/css/Sport/sportHome.module.scss';
import { FieldType } from '../../../../utils/enums/FieldType';

function TennisHome() {
    const features = [
        {
            image: 'https://images.pexels.com/photos/1619860/pexels-photo-1619860.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
            alt: 'Tennis Courts',
            title: 'Đa dạng sân quần vợt',
            description: 'Chúng tôi cung cấp nhiều sân quần vợt với kích thước và tiêu chuẩn quốc tế.',
        },
        {
            image: 'https://images.pexels.com/photos/1103829/pexels-photo-1103829.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
            alt: 'Training Courses',
            title: 'Khóa học đào tạo',
            description: 'Tham gia các khóa học quần vợt với những huấn luyện viên chuyên nghiệp.',
        },
        {
            image: 'https://images.pexels.com/photos/5739223/pexels-photo-5739223.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
            alt: 'Tournaments',
            title: 'Giải đấu',
            description: 'Tham gia hoặc đăng ký các giải đấu để thể hiện kỹ năng của bạn.',
        },
        {
            image: 'https://img.freepik.com/free-photo/tennis-paddles-balls-arrangement_23-2149434236.jpg?t=st=1729674812~exp=1729678412~hmac=526b5e22cdba0ecfec2f27330d648f91664d9b28d044d0f62b28a98343de20a5&w=996',
            alt: 'Tennis Shop',
            title: 'Cửa hàng dụng cụ',
            description: 'Mua sắm các dụng cụ quần vợt chất lượng cao với giá cả hợp lý.',
        },
    ];

    return (
        <SportHome
            title='TENNIS'
            description='"QUẦN VỢT - MÔN THỂ THAO THÚ VỊ VÀ ĐẦY THÁCH THỨC"'
            linkTo={`/sport/fields`}
            fieldType={FieldType.TENNIS}
            bannerImage='https://images.pexels.com/photos/6292463/pexels-photo-6292463.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
            features={features}
            className={styles.tennis}
        />
    );
}

export default TennisHome;
