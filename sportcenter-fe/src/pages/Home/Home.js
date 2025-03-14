/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import styles from '../../assets/css/home.module.scss';
import bannerApi from '../../services/api/banner/bannerApi';
import testimonialApi from '../../services/api/testimonial/testimonialApi';
import { useCheckSignedIn } from '../../customs/hooks';
import userApi from '../../services/api/user/userApi';
import fileApi from '../../services/api/file/fileApi';
import galleryApi from '../../services/api/gallery/galleryApi';
import { Loading } from '../../components/Loading/Loading';

function Home() {
    const [isSignedIn, setIsSignedIn] = useCheckSignedIn();
    const [isLoading, setIsLoading] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);

    // for banner slide
    const [currentIndex, setCurrentIndex] = useState(1);

    const [banners, setBanners] = useState([]);
    const [testimonials, setTestimonials] = useState([]);
    const [galleryImages, setGalleryImages] = useState([]);

    const [selectedBannerFile, setSelectedBannerFile] = useState(null);
    const [selectedTestimonialFile, setSelectedTestimonialFile] = useState(null);
    const [selectedGalleryFile, setSelectedGalleryFile] = useState(null);

    const bannerFileRef = useRef(null);
    const testimonialFileRef = useRef(null);
    const galleryFileRef = useRef(null);

    useEffect(() => {
        checkCurrentRole();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isSignedIn]); // đăng nhập xong thì nó sẽ đc gọi lại

    const checkCurrentRole = async () => {
        try {
            const userResponse = await userApi.getCurrentUser();
            if (userResponse && userResponse.data.role === 'ADMIN') {
                setIsAdmin(true);
            }
        } catch (err) {
            setIsAdmin(false);
        }
    };

    const handleFileChange = (event, type) => {
        const file = event.target.files[0];

        if (!file) return;

        if (
            file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
            file.type === 'application/vnd.ms-excel'
        ) {
            if (type === 'banner') {
                setSelectedBannerFile(file);
            } else if (type === 'testimonial') {
                setSelectedTestimonialFile(file);
            } else if (type === 'gallery') {
                setSelectedGalleryFile(file);
            }
        } else {
            if (type === 'banner') {
                setSelectedBannerFile(null);
            } else if (type === 'testimonial') {
                setSelectedTestimonialFile(null);
            } else if (type === 'gallery') {
                setSelectedGalleryFile(null);
            }
        }
    };

    const handleUpload = async (type) => {
        const fileToUpload =
            type === 'banner'
                ? selectedBannerFile
                : type === 'testimonial'
                ? selectedTestimonialFile
                : selectedGalleryFile;

        if (!fileToUpload) {
            toast.warn('Please select a valid Excel file (.xlsx or .xls)!');
            return;
        }

        try {
            setIsLoading(true);
            const response = await fileApi.uploadExcel(fileToUpload, type);
            toast.success(response.message || 'File uploaded successfully!');

            if (type === 'banner') fetchBanners();
            if (type === 'testimonial') fetchTestimonials();
            if (type === 'gallery') fetchGalleries();

            // Reset state và input file sau khi upload thành công
            if (type === 'banner') {
                setSelectedBannerFile(null);
                if (bannerFileRef.current) bannerFileRef.current.value = '';
            } else if (type === 'testimonial') {
                setSelectedTestimonialFile(null);
                if (testimonialFileRef.current) testimonialFileRef.current.value = '';
            } else if (type === 'gallery') {
                setSelectedGalleryFile(null);
                if (galleryFileRef.current) galleryFileRef.current.value = '';
            }
        } catch (err) {
            console.error('Upload failed:', err);
            toast.error('File upload failed!');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchBanners();
        fetchTestimonials();
        fetchGalleries();
    }, []);

    const fetchBanners = async () => {
        try {
            const response = await bannerApi.getAllActive();
            if (response.data) {
                const validBanners = response.data.filter((banner) => banner.url);
                setBanners(validBanners);
            }
        } catch (err) {
            console.error('Failed to fetch banners:', err);
        }
    };

    // Tạo danh sách mở rộng để hỗ trợ hiệu ứng chuyển đổi mượt mà
    const extendedImages = banners.length > 0 ? [banners[banners.length - 1], ...banners, banners[0]] : [];

    // banner slide
    useEffect(() => {
        if (banners.length === 0) return;
        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % extendedImages.length);
        }, 4000);
        return () => clearInterval(interval);
    }, [banners, extendedImages.length]);

    useEffect(() => {
        if (currentIndex === extendedImages.length - 1) {
            // nếu đang là ảnh cuối, chờ 500ms sau đó chuyển về ảnh thứ 2 (ảnh 1 gốc)
            setTimeout(() => setCurrentIndex(1), 500);
        }
    }, [currentIndex, extendedImages.length]);

    const fetchTestimonials = async () => {
        try {
            const response = await testimonialApi.getAllActive();
            if (response.data) {
                setTestimonials(response.data);
            }
        } catch (err) {
            console.error('Failed to fetch testimonials:', err);
        }
    };

    const fetchGalleries = async () => {
        try {
            const response = await galleryApi.getAllActive();
            if (response.data) setGalleryImages(response.data);
        } catch (err) {
            console.error('Failed to fetch gallery images:', err);
        }
    };

    return (
        <div className={styles.homeContainer}>
            {isLoading && <Loading />}

            {/* Toggle bật tắt chế độ chỉnh sửa cho admin */}
            {isAdmin && (
                <button
                    className={isEditMode ? styles.btnToggleEditModeActive : styles.btnToggleEditMode}
                    onClick={() => {
                        setIsEditMode(!isEditMode);
                    }}
                >
                    Edit mode
                </button>
            )}

            {/* Hero Section */}
            <section className={styles.heroSection}>
                {/* Left Side: Hero Content */}
                <div className={styles.heroContent}>
                    <h1>Enjoy sports with us and share the excitement!</h1>
                    <p>Book a field, join classes, and enter tournaments today!</p>
                    <Link to='/bookings' className={`btn ${styles.heroButton}`}>
                        Discover now!
                    </Link>
                </div>

                {/* Right Side: Banner Section */}
                <div className={styles.rightContainer}>
                    {/* Banner Slideshow */}
                    <div className={styles.sliderContainer}>
                        {banners.length > 0 ? (
                            <div
                                className={styles.slider}
                                style={{
                                    transform: `translateX(-${currentIndex * 100}%)`,
                                    transition: currentIndex === 1 ? 'none' : 'transform 0.5s ease-in-out',
                                }}
                            >
                                {extendedImages.map((banner, index) => (
                                    <img
                                        key={index}
                                        className={styles.heroImage}
                                        src={banner.url}
                                        alt={`Banner ${index + 1}`}
                                    />
                                ))}
                            </div>
                        ) : (
                            <p>Loading banners...</p>
                        )}
                    </div>

                    {/* Upload Banner Section */}
                    {isAdmin && isEditMode && (
                        <div className={styles.uploadBannerSection}>
                            <label className={styles.uploadLabel}>
                                <span>Upload Banner Source </span>
                                <input
                                    type='file'
                                    ref={bannerFileRef}
                                    onChange={(e) => handleFileChange(e, 'banner')}
                                    className={styles.uploadInput}
                                />
                            </label>
                            <button className={styles.uploadBannerButton} onClick={() => handleUpload('banner')}>
                                Save changes
                            </button>
                        </div>
                    )}
                </div>
            </section>

            {/* Featured Services Section */}
            <section className={styles.featuredServices}>
                <h2>FEATURED SERVICES</h2>
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

            {/* Why Choose Us Section */}
            <section className={styles.whyChooseUs}>
                <h2>Why choose us?</h2>
                <ul>
                    <li>Modern Facilities: Top-notch, well-maintained facilities ensure the best sports experience.</li>
                    <li>Professional Coaches: Skilled and experienced coaches provide personalized guidance.</li>
                    <li>Flexible Scheduling: flexible time slots to fit your busy schedule and make training easy.</li>
                    <li>Convenient Location: Centrally located, Easy for you to join us from anywhere.</li>
                    <li>Dedicated Customer Service: Our friendly staff is always ready to assist and ensure you.</li>
                    <li>Vibrant Sports Community: Dynamic community of sports enthusiasts and make new connections.</li>
                </ul>
            </section>

            {/* Gallery */}
            <section className={styles.gallerySection}>
                <h2>FEATURED PICTURES</h2>
                <div className={styles.galleryContainer}>
                    {galleryImages.length > 0 ? (
                        galleryImages.map((image, index) => (
                            <img key={index} src={image.url} alt={`Gallery ${index + 1}`} />
                        ))
                    ) : (
                        <p>Loading images...</p>
                    )}
                </div>
                {isAdmin && isEditMode && (
                    <div className={styles.uploadSection}>
                        <label className={styles.uploadLabel}>
                            <span>Upload Gallery Image </span>
                            <input
                                type='file'
                                ref={galleryFileRef}
                                onChange={(e) => handleFileChange(e, 'gallery')}
                                className={styles.uploadInput}
                            />
                        </label>
                        <button className={styles.uploadButton} onClick={() => handleUpload('gallery')}>
                            Save changes
                        </button>
                    </div>
                )}
            </section>

            {/* Testimonials Section */}
            <section className={styles.testimonials}>
                <h2>WHAT OUR CUSTOMER SAY? </h2>

                <div className={styles.testimonialContainer}>
                    {testimonials.length > 0 ? (
                        testimonials.map((testimonial) => (
                            <div key={testimonial.id} className={styles.testimonialCard}>
                                <p>"{testimonial.comment}"</p>
                                <span>{testimonial.author}</span>
                            </div>
                        ))
                    ) : (
                        <p>Loading testimonials...</p>
                    )}
                </div>
                {isAdmin && isEditMode && (
                    <div className={styles.uploadSection}>
                        <label className={styles.uploadLabel}>
                            <span>Upload Testimonial Source </span>
                            <input
                                type='file'
                                ref={testimonialFileRef}
                                onChange={(e) => handleFileChange(e, 'testimonial')}
                                className={styles.uploadInput}
                            />
                        </label>
                        <button className={styles.uploadButton} onClick={() => handleUpload('testimonial')}>
                            Save changes
                        </button>
                    </div>
                )}
            </section>
        </div>
    );
}

export default Home;
