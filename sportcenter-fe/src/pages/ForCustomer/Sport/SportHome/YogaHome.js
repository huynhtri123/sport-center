import SportHome from './SportHome';
import styles from '../../../../assets/css/Sport/sportHome.module.scss';
import { FieldType } from '../../../../utils/enums/FieldType';

function YogaHome() {
    const features = [
        {
            image: 'https://res.cloudinary.com/dftznqjsj/image/upload/v1729680312/Beige_And_Green_Modern_Illustrative_Yoga_Tutorial_YouTube_Thumbnail_j9u1dj.png',
            alt: 'Yoga Classes',
            title: 'Các lớp yoga',
            description: 'Tham gia các lớp học yoga từ cơ bản đến nâng cao để cải thiện sức khỏe và tâm trí.',
        },
        {
            image: 'https://images.pexels.com/photos/866023/pexels-photo-866023.jpeg?auto=compress&cs=tinysrgb&w=600',
            alt: 'Professional Instructors',
            title: 'Phòng tập yoga',
            description: 'Đa dạng phòng tập yoga với các kích thước khác nhau, sự yên tĩnh tuyệt đỉnh.',
        },
        {
            image: 'https://res.cloudinary.com/dftznqjsj/image/upload/v1729671865/yoga-tournament_pz78gs.jpg',
            alt: 'Yoga Retreats',
            title: 'Chương trình yoga retreat',
            description: 'Tham gia các chương trình retreat để thư giãn và phục hồi sức khỏe.',
        },
        {
            image: 'https://res.cloudinary.com/dftznqjsj/image/upload/v1729671864/yoga-shop_flnpbr.jpg',
            alt: 'Yoga Shop',
            title: 'Cửa hàng dụng cụ',
            description: 'Mua sắm các dụng cụ yoga chất lượng như thảm, bóng và phụ kiện khác.',
        },
    ];

    return (
        <SportHome
            title='YOGA'
            description='"YOGA - HÀI HÒA GIỮA THỂ CHẤT VÀ TINH THẦN"'
            linkTo={`/sport/fields`}
            fieldType={FieldType.YOGA}
            bannerImage='https://res.cloudinary.com/dftznqjsj/image/upload/v1729677542/Cream_Illustrative_International_Yoga_Day_Banner_e3mbp5.png'
            features={features}
            className={styles.yoga}
        />
    );
}

export default YogaHome;
