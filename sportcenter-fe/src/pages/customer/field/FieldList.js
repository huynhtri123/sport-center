/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import styles from '../../../assets/css/field/field.module.scss';
import { useGetFields, useGetField } from '../../../customs/hooks';
import bookingApi from '../../../services/api/booking/bookingApi';
import sportApi from '../../../services/api/sport/sportApi';

const FieldList = () => {
    const [fields, setFields] = useGetFields();
    const [field, setField] = useGetField();
    const [sportName, setSportName] = useState('');

    // reset để tránh lấy lộn lịch timeslots
    useEffect(() => {
        localStorage.removeItem('selectedField');
        setField({});
    }, []);

    useEffect(() => {
        if (!fields || fields.length === 0) {
            const storedFields = localStorage.getItem('selectedFields');
            if (storedFields) {
                setFields(JSON.parse(storedFields));
            }
        }
    }, [fields, setFields]);

    const sportId = fields[0]?.sportId;
    useEffect(() => {
        const fetchSportName = async () => {
            try {
                if (sportId) {
                    const response = await sportApi.getById(sportId);
                    setSportName(response.data.sportName || 'Sport');
                }
            } catch (error) {
                console.error('Error fetching sport:', error);
                setSportName('Sport');
            }
        };
        fetchSportName();
    }, [sportId]);

    const handleGetField = async (fieldId) => {
        try {
            const date = new Date();
            const year = date.getUTCFullYear();
            const month = String(date.getUTCMonth() + 1).padStart(2, '0');
            const day = String(date.getUTCDate()).padStart(2, '0');

            const onDaySchedule = {
                fieldId: fieldId,
                startOfDay: `${year}-${month}-${day}T00:00:00Z`,
                endOfDay: `${year}-${month}-${day}T23:59:00Z`,
            };

            const fieldResponse = await bookingApi.updateAndGetSchedule(onDaySchedule);
            if (fieldResponse.data) {
                setField(fieldResponse.data);
                localStorage.setItem('selectedField', JSON.stringify(fieldResponse.data));
            } else {
                toast.error('Field information not found.');
                setField(null);
            }
        } catch (err) {
            toast.error(err.message || 'An error occurred.');
        }
    };

    if (!fields || fields.length === 0) {
        return (
            <div className={styles.container}>
                <h2 className={styles.title}>Chưa có sân</h2>
                <Link to={'/'}>Chọn môn thể thao khác</Link>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>{sportName ? `${sportName}` : 'Fields'}</h2>
            <div className={styles.cardContainer}>
                {fields.map((fieldMap) => {
                    return (
                        <Link
                            key={fieldMap.id}
                            className={`${styles.card}`}
                            onClick={() => handleGetField(fieldMap.id)}
                            to={`/booking`}
                        >
                            <img src={fieldMap.imageUrl} alt={fieldMap.name} />
                            <h3>{fieldMap.fieldName}</h3>
                            <p>{fieldMap.description}</p>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
};

export default FieldList;
