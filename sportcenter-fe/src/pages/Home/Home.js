import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import styles from '../../assets/css/home.module.scss';
import { useUser } from '../../customs/hooks';
import userApi from '../../services/api/userApi';

const bannerImages = [
    'https://res.cloudinary.com/dftznqjsj/image/upload/v1729679449/yoga-banner_otpmcq.png',
    'https://res.cloudinary.com/dftznqjsj/image/upload/v1729679893/Dark_Purple_and_Green_Illustration_Sport_Presentation_hbl0ij.jpg',
    'https://res.cloudinary.com/dftznqjsj/image/upload/v1729679721/Pr%C3%A9sentation_sport_tennis_moderne_orange_vert_q9ajks.jpg',
    'https://res.cloudinary.com/dftznqjsj/image/upload/v1729677944/Blue_and_Red_Modern_Badminton_Sports_YouTube_Thumbnail_dpqv79.png',
    'https://res.cloudinary.com/dftznqjsj/image/upload/v1729677714/Blue_and_Green_Modern_Soccer_Match_Banner_dsxh7h.jpg',
    'https://img.freepik.com/free-vector/badminton-tournament-flat-horizontal-poster-with-male-player-motion-hitting-shuttlecock-with-racquet-across-net-vector-illustration_1284-71470.jpg?t=st=1729916075~exp=1729919675~hmac=613415fe1222e7ffa6c94178d403df4b0c3a2e44907bd4ea7c90761a839d4814&w=996',
];

function Home() {
    const extendedImages = [bannerImages[bannerImages.length - 1], ...bannerImages, bannerImages[0]];
    const [currentIndex, setCurrentIndex] = useState(1);
    const [user, setUser] = useUser();

    const fetchCurrUser = async () => {
        const userRespones = await userApi.getCurrentUser();
        setUser(userRespones.data);
    };

    useEffect(() => {
        fetchCurrUser();
    }, []);

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
                    <h1>Enjoy sports with us and share the excitement!</h1>
                    <p>Book a field, join classes, and enter tournaments today!</p>
                    <Link to='/bookings' className={`btn ${styles.heroButton}`}>
                        Discover now!
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
                <h2>Featured Services</h2>
                <div className={styles.servicesContainer}>
                    <div className={styles.serviceCard}>
                        <i className='fa-solid fa-futbol'></i>
                        <h3>Book a Field</h3>
                        <p>Quickly book a field with a variety of options.</p>
                    </div>
                    <div className={styles.serviceCard}>
                        <i className='fa-solid fa-dumbbell'></i>
                        <h3>Free Courses</h3>
                        <p>Join classes from basic to advanced levels.</p>
                    </div>
                    <div className={styles.serviceCard}>
                        <i className='fa-solid fa-trophy'></i>
                        <h3>Tournaments</h3>
                        <p>Join tournaments to challenge yourself and win valuable prizes.</p>
                    </div>
                    <div className={styles.serviceCard}>
                        <i className='fa-solid fa-store'></i>
                        <h3>Shop</h3>
                        <p>A wide range of specialized products for sports.</p>
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
                <h2>Featured Images</h2>
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
                <h2>What Our Customers Say?</h2>
                <div className={styles.testimonialCard}>
                    <p>"Awesome! The field is beautiful and the staff is very enthusiastic."</p>
                    <span>- Cong Phuong, the football player -</span>
                </div>
            </section>
        </div>
    );
}

export default Home;
