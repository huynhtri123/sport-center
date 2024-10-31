// src/pages/Sports/ListSport.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { Link } from 'react-router-dom';

import styles from '../../../assets/css/Sport/sportList.module.scss';
import { useGetSports } from '../../../customs/hooks';

const SportList = () => {
    // eslint-disable-next-line no-unused-vars
    const [sports, setSports] = useGetSports();
    const navigate = useNavigate();

    const handleClick = (sportName) => {
        navigate(`/sport/${sportName.toLowerCase()}`);
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
        <div className={clsx(styles.listSportContainer)}>
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
    );
};

export default SportList;
