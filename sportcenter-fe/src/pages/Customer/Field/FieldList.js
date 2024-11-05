import { React, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import styles from '../../../assets/css/Field/field.module.scss';
import { useGetFields, useGetField } from '../../../customs/hooks';
import bookingApi from '../../../services/api/booking/bookingApi';

const FieldList = () => {
    const [fields, setFields] = useGetFields(); // danh sách field, lấy từ context (set ở trang SportHome)
    // eslint-disable-next-line no-unused-vars
    const [field, setField] = useGetField();

    // Lấy danh sách `fields` từ `localStorage` nếu `fields` bị null hoặc rỗng
    useEffect(() => {
        if (!fields || fields.length === 0) {
            const storedFields = localStorage.getItem('selectedFields');
            if (storedFields) {
                setFields(JSON.parse(storedFields));
            }
        }
    }, [fields, setFields]);

    if (!fields || fields.length === 0) {
        return (
            <div className={styles.container}>
                <h2 className={styles.title}>Chưa có sân</h2>
                <Link to={'/'}>Chọn môn thể thao khác</Link>
            </div>
        );
    }

    // lấy chi tiết sân (thật ra là lấy lịch từ bookingController)
    const handleGetField = async (fieldId) => {
        try {
            const date = new Date();
            const year = date.getUTCFullYear();
            const month = String(date.getUTCMonth() + 1).padStart(2, '0');
            const day = String(date.getUTCDate()).padStart(2, '0');

            const onDaySchedule = {
                fieldId: fieldId,
                startOfDay: `${year}-${month}-${day}T00:00:00Z`, // Bắt đầu từ 00:00
                endOfDay: `${year}-${month}-${day}T23:59:00Z`, // Kết thúc vào 23:59
            };
            const fieldResponse = await bookingApi.updateAndGetSchedule(onDaySchedule);
            // console.log(fieldResponse.data);
            if (fieldResponse.data) {
                toast.success(fieldResponse.message);
                setField(fieldResponse.data);
                // Lưu thông tin sân vào localStorage
                localStorage.setItem('selectedField', JSON.stringify(fieldResponse.data));
            } else {
                toast.error('Không tìm thấy thông tin sân.');
                setField(null);
            }
        } catch (err) {
            toast.error(err.message || 'Có lỗi xảy ra.');
        }
    };

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>{fields[0]?.fieldType || 'Fields'}</h2>
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
                            <p>Mô tả: {fieldMap.description}</p>
                            <p style={{ color: '#dd0f00' }}>Giá: {fieldMap.price}</p>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
};

export default FieldList;
