import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import styles from '../../assets/css/home.module.scss';

const bannerImages = ['/yoga-banner.png', '/football-banner.png', '/tennis-banner.png', '/badminton-banner.png'];

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
                <h2>Tại sao chọn chúng tôi?</h2>
                <ul>
                    <li>Cơ sở vật chất hiện đại</li>
                    <li>Huấn luyện viên chuyên nghiệp</li>
                    <li>Lịch trình linh hoạt</li>
                    <li>Vị trí thuận tiện</li>
                </ul>
            </section>

            {/* Gallery */}
            <section className={styles.gallerySection}>
                <h2>Hình ảnh nổi bật</h2>
                <div className={styles.galleryContainer}>
                    <img src='/football.jpg' alt='Gallery 1' />
                    <img src='/jump.jpg' alt='Gallery 2' />
                    <img src='/badminton-old.jpg' alt='Gallery 3' />
                    <img src='/yoga.jpg' alt='Gallery 4' />
                    <img src='/football-train.jpg' alt='Gallery 5' />
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
