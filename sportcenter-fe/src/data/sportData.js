import { FieldType } from '../utils/enums/FieldType';
import styles from '../assets/css/Sport/sportHome.module.scss';

const sportData = [
    {
        key: 'football',
        title: 'FOOTBALL',
        description: 'Trải nghiệm môn thể thao vua tại Sport Center. Hàng loạt sân bóng đá với đa dạng kích thước.',
        linkTo: '/sport/fields',
        fieldType: FieldType.FOOTBALL,
        bannerImage:
            'https://images.pexels.com/photos/7187827/pexels-photo-7187827.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
        className: styles.football,
        features: [
            {
                image: 'https://images.pexels.com/photos/2935982/pexels-photo-2935982.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
                alt: 'Football Fields',
                title: 'Đa dạng sân bóng',
                description: 'Chúng tôi cung cấp nhiều sân bóng với kích thước khác nhau phù hợp cho mọi nhu cầu.',
                linkTo: '/sport/fields',
            },
            {
                image: 'https://res.cloudinary.com/dftznqjsj/image/upload/v1729671871/football-course_j9pzso.jpg',
                alt: 'Training Courses',
                title: 'Khóa học đào tạo',
                description: 'Tham gia các khóa học bóng đá với những huấn luyện viên chuyên nghiệp.',
                linkTo: '/courses',
            },
            {
                image: 'https://images.pexels.com/photos/3764065/pexels-photo-3764065.jpeg?auto=compress&cs=tinysrgb&w=600',
                alt: 'Tournaments',
                title: 'Giải đấu',
                description: 'Tham gia hoặc đăng ký các giải đấu để thể hiện kỹ năng của bạn.',
                linkTo: '/tournaments', // Added link
            },
            {
                image: 'https://res.cloudinary.com/dftznqjsj/image/upload/v1729671862/football-shop_euexxx.jpg',
                alt: 'Football Shop',
                title: 'Cửa hàng dụng cụ',
                description: 'Mua sắm các dụng cụ bóng đá chất lượng cao với giá cả hợp lý.',
                linkTo: '/sport/football/shop', // Added link
            },
        ],
    },

    {
        key: 'badminton',
        title: 'BADMINTON',
        description: '"CẦU LÔNG - SỰ LỰA CHỌN HOÀN HẢO CHO SỨC KHỎE VÀ NIỀM VUI"',
        linkTo: '/sport/fields',
        fieldType: FieldType.BADMINTON,
        bannerImage:
            'https://images.pexels.com/photos/7438732/pexels-photo-7438732.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
        className: styles.badminton,
        features: [
            {
                image: 'https://res.cloudinary.com/dftznqjsj/image/upload/v1729674136/badminton-field_vrvpld.jpg',
                alt: 'Badminton Courts',
                title: 'Đa dạng sân cầu lông',
                description: 'Chúng tôi cung cấp nhiều sân bóng với kích thước khác nhau phù hợp cho mọi nhu cầu.',
                linkTo: '/sport/fields',
            },
            {
                image: 'https://images.pexels.com/photos/2202685/pexels-photo-2202685.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
                alt: 'Training Courses',
                title: 'Khóa học đào tạo',
                description: 'Tham gia các khóa học cầu lông với những huấn luyện viên chuyên nghiệp.',
                linkTo: '/courses',
            },
            {
                image: 'https://img.freepik.com/free-vector/badminton-tournament-flat-horizontal-poster-with-male-player-motion-hitting-shuttlecock-with-racquet-across-net-vector-illustration_1284-71470.jpg',
                alt: 'Tournaments',
                title: 'Giải đấu',
                description: 'Tham gia hoặc đăng ký các giải đấu để thể hiện kỹ năng của bạn.',
                linkTo: '/tournaments',
            },
            {
                image: 'https://images.pexels.com/photos/3660204/pexels-photo-3660204.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
                alt: 'Badminton Shop',
                title: 'Cửa hàng dụng cụ',
                description: 'Mua sắm các dụng cụ cầu lông chất lượng cao với giá cả hợp lý.',
                linkTo: '/sport/badminton/shop',
            },
        ],
    },

    {
        key: 'tennis',
        title: 'TENNIS',
        description: '"QUẦN VỢT - MÔN THỂ THAO THÚ VỊ VÀ ĐẦY THÁCH THỨC"',
        linkTo: '/sport/fields',
        fieldType: FieldType.TENNIS,
        bannerImage:
            'https://images.pexels.com/photos/6292463/pexels-photo-6292463.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
        className: styles.tennis,
        features: [
            {
                image: 'https://images.pexels.com/photos/1619860/pexels-photo-1619860.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
                alt: 'Tennis Courts',
                title: 'Đa dạng sân quần vợt',
                description: 'Chúng tôi cung cấp nhiều sân quần vợt với kích thước và tiêu chuẩn quốc tế.',
                linkTo: '/sport/fields',
            },
            {
                image: 'https://images.pexels.com/photos/1103829/pexels-photo-1103829.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
                alt: 'Training Courses',
                title: 'Khóa học đào tạo',
                description: 'Tham gia các khóa học quần vợt với những huấn luyện viên chuyên nghiệp.',
                linkTo: '/courses',
            },
            {
                image: 'https://images.pexels.com/photos/5739223/pexels-photo-5739223.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
                alt: 'Tournaments',
                title: 'Giải đấu',
                description: 'Tham gia hoặc đăng ký các giải đấu để thể hiện kỹ năng của bạn.',
                linkTo: '/tournaments',
            },
            {
                image: 'https://img.freepik.com/free-photo/tennis-paddles-balls-arrangement_23-2149434236.jpg?t=st=1729674812~exp=1729678412~hmac=526b5e22cdba0ecfec2f27330d648f91664d9b28d044d0f62b28a98343de20a5&w=996',
                alt: 'Tennis Shop',
                title: 'Cửa hàng dụng cụ',
                description: 'Mua sắm các dụng cụ quần vợt chất lượng cao với giá cả hợp lý.',
                linkTo: '/sport/tennis/shop',
            },
        ],
    },

    {
        key: 'yoga',
        title: 'YOGA',
        description: '"YOGA - HÀI HÒA GIỮA THỂ CHẤT VÀ TINH THẦN"',
        linkTo: '/sport/fields',
        fieldType: FieldType.YOGA,
        bannerImage:
            'https://res.cloudinary.com/dftznqjsj/image/upload/v1729677542/Cream_Illustrative_International_Yoga_Day_Banner_e3mbp5.png',
        className: styles.yoga,
        features: [
            {
                image: 'https://res.cloudinary.com/dftznqjsj/image/upload/v1729680312/Beige_And_Green_Modern_Illustrative_Yoga_Tutorial_YouTube_Thumbnail_j9u1dj.png',
                alt: 'Yoga Classes',
                title: 'Các lớp yoga',
                description: 'Tham gia các lớp học yoga từ cơ bản đến nâng cao để cải thiện sức khỏe và tâm trí.',
                linkTo: '/courses',
            },
            {
                image: 'https://images.pexels.com/photos/866023/pexels-photo-866023.jpeg?auto=compress&cs=tinysrgb&w=600',
                alt: 'Professional Instructors',
                title: 'Phòng tập yoga',
                description: 'Đa dạng phòng tập yoga với các kích thước khác nhau, sự yên tĩnh tuyệt đỉnh.',
                linkTo: '/sport/fields',
            },
            {
                image: 'https://res.cloudinary.com/dftznqjsj/image/upload/v1729671865/yoga-tournament_pz78gs.jpg',
                alt: 'Yoga Retreats',
                title: 'Chương trình yoga retreat',
                description: 'Tham gia các chương trình retreat để thư giãn và phục hồi sức khỏe.',
                linkTo: '/tournaments',
            },
            {
                image: 'https://res.cloudinary.com/dftznqjsj/image/upload/v1729671864/yoga-shop_flnpbr.jpg',
                alt: 'Yoga Shop',
                title: 'Cửa hàng dụng cụ',
                description: 'Mua sắm các dụng cụ yoga chất lượng như thảm, bóng và phụ kiện khác.',
                linkTo: '/sport/yoga/shop',
            },
        ],
    },
];

export default sportData;
