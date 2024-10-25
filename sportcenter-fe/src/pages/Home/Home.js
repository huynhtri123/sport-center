import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import styles from '../../assets/css/home.module.scss';

const bannerImages = [
    'https://res.cloudinary.com/dftznqjsj/image/upload/v1729679449/yoga-banner_otpmcq.png',
    'https://res.cloudinary.com/dftznqjsj/image/upload/v1729679893/Dark_Purple_and_Green_Illustration_Sport_Presentation_hbl0ij.jpg',
    'https://res.cloudinary.com/dftznqjsj/image/upload/v1729679721/Pr%C3%A9sentation_sport_tennis_moderne_orange_vert_q9ajks.jpg',
    'https://res.cloudinary.com/dftznqjsj/image/upload/v1729677944/Blue_and_Red_Modern_Badminton_Sports_YouTube_Thumbnail_dpqv79.png',
    'https://res.cloudinary.com/dftznqjsj/image/upload/v1729677714/Blue_and_Green_Modern_Soccer_Match_Banner_dsxh7h.jpg',
];

function Home() {
    const extendedImages = [bannerImages[bannerImages.length - 1], ...bannerImages, bannerImages[0]];
    const [currentIndex, setCurrentIndex] = useState(1);

    useEffect(() => {
        const interval = setInterval(() => {
            // ví dụ có 3 ảnh, mà preIndex=2 -> trả về vị trí 0
            setCurrentIndex((prevIndex) => (prevIndex + 1) % extendedImages.length);
        }, 4000);

        return () => clearInterval(interval); // Clear interval on component unmount
    }, [extendedImages.length]);

    // Reset the index when the animation ends
    useEffect(() => {
        if (currentIndex === extendedImages.length - 1) {
            // nếu đang là ảnh cuối, chờ 500ms sau đó chuyển về ảnh thứ 2 (ảnh 1 gốc)
            setTimeout(() => setCurrentIndex(1), 500);
        }
    }, [currentIndex, extendedImages.length]);

    return (
        <div className={styles.homeContainer}>
            {/* Hero Section */}
            <section className={styles.heroSection}>
                <div className={styles.heroContent}>
                    <h1>Tận hưởng thể thao cùng chúng tôi!</h1>
                    <p>Đặt sân, tham gia lớp học và giải đấu ngay hôm nay</p>
                    <Link to='/course' className={`btn ${styles.heroButton}`}>
                        Khám phá ngay
                    </Link>
                </div>

                {/* Image Slider */}
                <div className={styles.sliderContainer}>
                    <div
                        className={styles.slider}
                        style={{
                            transform: `translateX(-${currentIndex * 100}%)`, // Slide effect
                            transition: currentIndex === 1 ? 'none' : 'transform 0.5s ease-in-out', // No transition on reset
                        }}
                    >
                        {extendedImages.map((image, index) => (
                            <img key={index} className={styles.heroImage} src={image} alt={`Banner ${index + 1}`} />
                        ))}
                    </div>
                </div>
            </section>

            {/* Featured Services */}
            <section className={styles.featuredServices}>
                <h2>Dịch vụ nổi bật</h2>
                <div className={styles.servicesContainer}>
                    <div className={styles.serviceCard}>
                        <i className='fa-solid fa-futbol'></i>
                        <h3>Đặt Sân</h3>
                        <p>Đặt sân nhanh chóng với nhiều loại sân đa dạng.</p>
                    </div>
                    <div className={styles.serviceCard}>
                        <i className='fa-solid fa-dumbbell'></i>
                        <h3>Đăng ký Lớp Học</h3>
                        <p>Tham gia các lớp học từ cơ bản đến nâng cao.</p>
                    </div>
                    <div className={styles.serviceCard}>
                        <i className='fa-solid fa-trophy'></i>
                        <h3>Giải Đấu</h3>
                        <p>Tham gia các giải đấu để thử thách bản thân.</p>
                    </div>
                    <div className={styles.serviceCard}>
                        <i className='fa-solid fa-store'></i>
                        <h3>Cửa hàng</h3>
                        <p>Đa dạng sản phẩm chuyên dụng cho các môn thể thao.</p>
                    </div>
                </div>
            </section>

            {/* Why Choose Us */}
            <section className={styles.whyChooseUs}>
                <h2>Why choose us?</h2>
                <ul>
                    <li>
                        Modern Facilities: Our top-notch, well-maintained facilities ensure the best sports experience
                        for you.
                    </li>
                    <li>
                        Professional Coaches: Skilled and experienced coaches provide personalized guidance to help you
                        improve.
                    </li>
                    <li>
                        Flexible Scheduling: We offer flexible time slots to fit your busy schedule and make training
                        easy.
                    </li>
                    <li>
                        Convenient Location: Centrally located, making it quick and easy for you to join us from
                        anywhere in the city.
                    </li>
                    <li>
                        Dedicated Customer Service: Our friendly staff is always ready to assist and ensure you have a
                        great experience.
                    </li>
                    <li>
                        Vibrant Sports Community: Join a dynamic community of sports enthusiasts and make new
                        connections.
                    </li>
                </ul>
            </section>

            {/* Gallery */}
            <section className={styles.gallerySection}>
                <h2>Hình ảnh nổi bật</h2>
                <div className={styles.galleryContainer}>
                    <img
                        src='https://images.pexels.com/photos/264312/pexels-photo-264312.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
                        alt='Gallery 1'
                    />
                    <img
                        src='https://res.cloudinary.com/dftznqjsj/image/upload/v1729671863/jump_y31cwb.jpg'
                        alt='Gallery 2'
                    />
                    <img
                        src='https://images.pexels.com/photos/6292463/pexels-photo-6292463.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
                        alt='Gallery 3'
                    />
                    <img
                        src='https://images.pexels.com/photos/9519530/pexels-photo-9519530.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
                        alt='Gallery 4'
                    />
                    <img
                        src='https://images.pexels.com/photos/7188095/pexels-photo-7188095.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
                        alt='Gallery 5'
                    />
                </div>
            </section>

            {/* Testimonials */}
            <section className={styles.testimonials}>
                <h2>Khách hàng nói gì?</h2>
                <div className={styles.testimonialCard}>
                    <p>"Rất tuyệt vời! Sân rất đẹp và đội ngũ nhân viên nhiệt tình."</p>
                    <span>- Cầu thủ Công Phượng -</span>
                </div>
            </section>
        </div>
    );
}

export default Home;
