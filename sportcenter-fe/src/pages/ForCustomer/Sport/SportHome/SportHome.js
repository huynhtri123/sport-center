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

    const handleGetFields = async () => {
        try {
            const fieldsResponse = await fieldApi.findByType(fieldType);
            if (fieldsResponse.status === 404) {
                toast.warn(fieldsResponse.message);
            } else {
                toast.success(fieldsResponse.message);
            }
            setFields(fieldsResponse.data);
            localStorage.setItem('selectedFields', JSON.stringify(fieldsResponse.data));
            navigate(linkTo); // Chuyển hướng tới linkTo sau khi lấy dữ liệu thành công
        } catch (err) {
            setFields([]);
            toast.error(err.message || 'Có lỗi xảy ra!');
        }
    };

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
                            <img src={feature.image} alt={feature.alt} />
                            <h3>{feature.title}</h3>
                            <p>{feature.description}</p>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}

export default SportHome;
