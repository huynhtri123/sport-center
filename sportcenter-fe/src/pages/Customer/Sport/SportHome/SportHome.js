import { Link, useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import styles from '../../../../assets/css/Sport/sportHome.module.scss';
import fieldApi from '../../../../services/api/fieldApi';
import { useGetFields } from '../../../../customs/hooks';
import { toast } from 'react-toastify';

function SportHome({ title, description, linkTo, fieldType, bannerImage, features, className }) {
    // eslint-disable-next-line no-unused-vars
    const [fields, setFields] = useGetFields();
    const navigate = useNavigate();

    const fetchAndNavigate = async (type, to) => {
        try {
            const fieldsResponse = await fieldApi.findByType(type);
            if (fieldsResponse.status === 404) {
                toast.warn(fieldsResponse.message);
            } else {
                toast.success(fieldsResponse.message);
            }
            setFields(fieldsResponse.data);
            localStorage.setItem('selectedFields', JSON.stringify(fieldsResponse.data));
            navigate(to); // Navigate after successful data fetching
        } catch (err) {
            setFields([]);
            toast.error(err.message || 'Có lỗi xảy ra!');
        }
    };

    const handleGetFields = () => fetchAndNavigate(fieldType, linkTo);

    return (
        <div className={styles.sportHomeContainer}>
            <section className={clsx(styles.bannerSection, className)}>
                <div className={styles.bannerSectionContent}>
                    <h1>{title}</h1>
                    <p>{description}</p>
                    <Link onClick={handleGetFields} to='#' className={`btn ${styles.heroButton}`}>
                        Chọn sân ngay
                    </Link>
                </div>
                <div className={styles.bannerSectionImage}>
                    <img src={bannerImage} alt='banner' />
                </div>
            </section>

            <section className={styles.featuresSection}>
                <h2>Các dịch vụ có sẵn</h2>
                <div className={styles.featuresContainer}>
                    {features.map((feature, index) => (
                        <div className={styles.featureCard} key={index}>
                            <button
                                to='#' // Prevent default Link behavior
                                className={styles.featureLink}
                                onClick={() => {
                                    // Check if it's the first feature (Đa dạng sân)
                                    console.log(feature.linkTo);
                                    if (index === 0) {
                                        fetchAndNavigate(fieldType, feature.linkTo);
                                    } else {
                                        navigate(feature.linkTo);
                                    }
                                }}
                            >
                                <img src={feature.image} alt={feature.alt} />
                                <h3>{feature.title}</h3>
                                <p>{feature.description}</p>
                            </button>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}

export default SportHome;
