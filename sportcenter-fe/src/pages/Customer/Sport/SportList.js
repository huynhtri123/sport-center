import React from 'react';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

import styles from '../../../assets/css/Sport/sportList.module.scss';
import { useGetSports } from '../../../customs/hooks';
import sportData from '../../../data/sportData';
import { useGetFields } from '../../../customs/hooks';
import fieldApi from '../../../services/api/fieldApi';

const SportList = () => {
    // eslint-disable-next-line no-unused-vars
    const [sports, setSports] = useGetSports();
    // eslint-disable-next-line no-unused-vars
    const [fields, setFields] = useGetFields();
    const navigate = useNavigate();

    const fetchAndNavigate = async (type, to) => {
        try {
            const fieldsResponse = await fieldApi.findByType(type);
            if (fieldsResponse.status === 404) {
                toast.warn(fieldsResponse.message);
            } else {
                // toast.success(fieldsResponse.message);
            }
            setFields(fieldsResponse.data);
            localStorage.setItem('selectedFields', JSON.stringify(fieldsResponse.data));
            navigate(to); // Navigate after successful data fetching
        } catch (err) {
            setFields([]);
            toast.error(err.message || 'Có lỗi xảy ra!');
        }
    };

    const handleClick = (sportName) => {
        const sport = sportData.find((item) => item.key === sportName.toLowerCase());
        // console.log(sport);
        const linkTo = sport.linkTo;
        const fieldType = sport.fieldType;
        fetchAndNavigate(fieldType, linkTo);
    };

    if (!sports || sports.length === 0) {
        return (
            <div className={styles.container}>
                <h2 className={styles.title}>Chưa có môn thể thao nào.</h2>
                <Link to={'/'}>Back to Home</Link>
            </div>
        );
    }

    return (
        <div className={clsx(styles.pageContainer)}>
            {/* Banner Section */}
            <div className={clsx(styles.banner)}>
                <div className={styles.bannerContent}>
                    <h1>Choose Your Sport, Book Your Court</h1>
                    <p>Select a sport and reserve your court today!</p>
                </div>
            </div>

            {/* Sport List Section */}
            <div className={clsx(styles.listSportContainer)}>
                {/* <h2 className={styles.sectionTitle}>Available Sports</h2> */}
                <ul className={clsx(styles.sportList)}>
                    {sports.map((sport, index) => (
                        <li key={index} className={clsx(styles.sportItem)} onClick={() => handleClick(sport.sportName)}>
                            <img src={sport.imageUrl} alt={sport.sportName} className={clsx(styles.sportImage)} />
                            <div className={clsx(styles.sportInfo)}>
                                <h2>{sport.sportName}</h2>
                                <p>{sport.description}</p>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default SportList;
