import SportHome from './SportHome';
import styles from '../../../../assets/css/Sport/sportHome.module.scss';
import { FieldType } from '../../../../utils/enums/FieldType';

function FootballHome() {
    const features = [
        {
            image: 'https://images.pexels.com/photos/2935982/pexels-photo-2935982.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
            alt: 'Football Fields',
            title: 'Đa dạng sân bóng',
            description: 'Chúng tôi cung cấp nhiều sân bóng với kích thước khác nhau phù hợp cho mọi nhu cầu.',
        },
        {
            image: 'https://res.cloudinary.com/dftznqjsj/image/upload/v1729671871/football-course_j9pzso.jpg',
            alt: 'Training Courses',
            title: 'Khóa học đào tạo',
            description: 'Tham gia các khóa học bóng đá với những huấn luyện viên chuyên nghiệp.',
        },
        {
            image: 'https://images.pexels.com/photos/3764065/pexels-photo-3764065.jpeg?auto=compress&cs=tinysrgb&w=600',
            alt: 'Tournaments',
            title: 'Giải đấu',
            description: 'Tham gia hoặc đăng ký các giải đấu để thể hiện kỹ năng của bạn.',
        },
        {
            image: 'https://res.cloudinary.com/dftznqjsj/image/upload/v1729671862/football-shop_euexxx.jpg',
            alt: 'Football Shop',
            title: 'Cửa hàng dụng cụ',
            description: 'Mua sắm các dụng cụ bóng đá chất lượng cao với giá cả hợp lý.',
        },
    ];

    return (
        <SportHome
            title='FOOTBALL'
            description='Trải nghiệm môn thể thao vua tại Sport Center. Hàng loạt sân bóng đá với đa dạng kích thước.'
            linkTo={`/sport/fields`}
            fieldType={FieldType.FOOTBALL}
            bannerImage='https://images.pexels.com/photos/7187827/pexels-photo-7187827.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
            features={features}
            className={styles.football} // Thêm class để tùy chỉnh màu nền
        />
    );
}

export default FootballHome;
