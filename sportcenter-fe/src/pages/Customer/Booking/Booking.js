import React, { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'react-toastify';
import clsx from 'clsx';
import { useNavigate } from 'react-router-dom';
import styles from '../../../assets/css/Booking/Booking.module.scss';
import bookingApi from '../../../services/api/booking/bookingApi';
import { Loading } from '../../../components/Loading/Loading';
import Button from '../../../components/Button/Button';
import { useGetField } from '../../../customs/hooks';
import { RecurringIntervalType } from '../../../utils/enums/RecurringIntervalType';
import PaymentModal from '../../../components/Modal/PaymentModal';
import formatCurrency from '../../../utils/formatCurrency';

function Booking() {
    const [field, setField] = useGetField();
    const [selectedDate, setSelectedDate] = useState('');
    const [timeSlots, setTimeSlots] = useState([]);
    const [numberOfHours, setNumberOfHours] = useState(0);
    const [startTime, setStartTime] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const startTimeRef = useRef(); // để canh ô input startTime của booking có trống ko
    const navigate = useNavigate();
    const [interval, setInterval] = useState(RecurringIntervalType.WEEKLY);
    const [duration, setDuration] = useState(1);
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [isRecurringModalOpen, setIsRecurringBookingModalOpen] = useState(false);
    // eslint-disable-next-line no-unused-vars
    const [bookingPrice, setBookingPrice] = useState(0);
    const [recurringBookingPrice, setRecurringBookingPrice] = useState(0);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const fetchTimeSlots = useCallback(
        async (date) => {
            if (!field || !field.id) {
                const savedField = localStorage.getItem('selectedField');
                if (savedField) setField(JSON.parse(savedField));
                return;
            }

            const onDaySchedule = {
                fieldId: field.id,
                startOfDay: `${date}T00:00:00+07:00`,
                endOfDay: `${date}T23:59:00+07:00`,
            };

            try {
                const response = await bookingApi.updateAndGetSchedule(onDaySchedule);
                setTimeSlots(response.data.timeSlots);
            } catch (error) {
                console.error('Error fetching time slots:', error);
            }
        },
        [field, setField]
    );

    const handleDateChange = (e) => {
        const date = e.target.value;
        setSelectedDate(date);
        fetchTimeSlots(date);
    };

    const getPrice = async (isRecurring) => {
        if (!startTimeRef.current.value) {
            toast.warn('Please pick start time!');
            return;
        }
        try {
            setIsLoading(true);
            const startDateTimeString = `${selectedDate}T${startTime}:00+00:00`;
            const startTimeUTC = new Date(startDateTimeString).toISOString();

            const request = {
                fieldId: field.id,
                startTime: startTimeUTC,
                numberOfHours: numberOfHours,
                ...(isRecurring && {
                    startDate: startTimeUTC,
                    interval: interval,
                    packageDurationMonths: duration,
                }),
            };

            const priceResponse = isRecurring
                ? await bookingApi.getRecurringBookingPrice(request)
                : await bookingApi.getBookingPrice(request);

            isRecurring ? setRecurringBookingPrice(priceResponse.data) : setBookingPrice(priceResponse.data);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleModal = (isRecurring, e) => {
        e.preventDefault();
        isRecurring
            ? setIsRecurringBookingModalOpen(!isRecurringModalOpen)
            : setIsBookingModalOpen(!isBookingModalOpen);
        // getPrice(isRecurring);
    };

    const handleSubmit = async (isRecurring) => {
        if (!startTimeRef.current.value) {
            toast.warn('Please pick start time!');
            return;
        }
        try {
            setIsLoading(true);
            const startDateTimeString = `${selectedDate}T${startTime}:00+00:00`;
            const startTimeUTC = new Date(startDateTimeString).toISOString();


// thêm phần chuyển qua trang payment sau khi booking
//             navigate('/payments', {
//                 state: {
//                     field: field,
//                     selectedDate: selectedDate,
//                     startTime: startTime,
//                     numberOfHours: numberOfHours,
//                     totalPrice: field.price * numberOfHours,
//                 },
//             });

            const request = {
                fieldId: field.id,
                startTime: startTimeUTC,
                numberOfHours: numberOfHours,
                ...(isRecurring && {
                    startDate: startTimeUTC,
                    interval: interval,
                    packageDurationMonths: duration,
                }),
            };

            const response = isRecurring
                ? await bookingApi.createRecurringBooking(request)
                : await bookingApi.createBooking(request);

            fetchTimeSlots(selectedDate);
            toast.success(response.message);

            return true;
        } catch (err) {
            console.error(err);
            toast.error(err.message);
            return false;
        } finally {
            setIsLoading(false);
            isRecurring ? setIsRecurringBookingModalOpen(false) : setIsBookingModalOpen(false);
        }
    };

    useEffect(() => {
        const today = new Date();
        const defaultDate = today.toISOString().split('T')[0];
        setSelectedDate(defaultDate);
        fetchTimeSlots(defaultDate);
    }, [fetchTimeSlots]);

    // Ngừng hành vi cuộn chuột thay đổi giá trị trong input numberOfHours
    useEffect(() => {
        const inputElement = document.getElementById('numberOfHours');
        const handleWheel = (event) => {
            event.preventDefault(); // Ngừng hành vi cuộn chuột
        };
        if (inputElement) {
            inputElement.addEventListener('wheel', handleWheel);
        }
        return () => {
            if (inputElement) {
                inputElement.removeEventListener('wheel', handleWheel);
            }
        };
    }, []);
    const handleChangeNumberOfHours = (e) => {
        setNumberOfHours(e.target.value);
    };

    useEffect(() => {
        if (numberOfHours && numberOfHours >= 1) {
            getPrice(true);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [numberOfHours, interval, duration]);

    return (
        <div className={styles.bookingContainer}>
            {isLoading && <Loading />}
            <section className={styles.fieldDetailSection}>
                <div className={styles.fieldImage}>
                    <img src={field.imageUrl} alt={field.fieldName} />
                </div>
                <div className={styles.fieldInfo}>
                    <h1>{field.fieldName}</h1>
                    <p>{field.description}</p>
                    <p className={styles.price}>Giá thuê: {formatCurrency(field.price)}/giờ</p>
                </div>
            </section>

            <section className={styles.bookingSection}>
                <h2>Đặt sân</h2>
                <div className={styles.formGroup}>
                    <label htmlFor='datePicker'>Chọn ngày:</label>
                    <input
                        type='date'
                        id='datePicker'
                        required
                        value={selectedDate}
                        onChange={handleDateChange}
                        min={new Date().toISOString().split('T')[0]}
                    />
                </div>
                <div className={styles.timeSlotGrid}>
                    {timeSlots.length > 0 ? (
                        timeSlots.map((slot, index) => {
                            const slotStartTime = new Date(slot.startTime);
                            const currentTimeVN = new Date(new Date().getTime() + 7 * 60 * 60 * 1000);
                            const isPastSlot = slotStartTime < currentTimeVN;
                            const isAvailable = slot.status === 'AVAILABLE';
                            return (
                                <div
                                    key={index}
                                    className={clsx(
                                        styles.timeSlot,
                                        isAvailable && !isPastSlot ? styles.available : styles.inUse
                                    )}
                                    onClick={() => {
                                        if (!isPastSlot && isAvailable) {
                                            setStartTime(slot.startTime.substring(11, 16));
                                        }
                                    }}
                                >
                                    <span>
                                        {slot.startTime.substring(11, 16)} - {slot.endTime.substring(11, 16)}
                                    </span>
                                </div>
                            );
                        })
                    ) : (
                        <p>Không có khung giờ nào khả dụng cho ngày đã chọn.</p>
                    )}
                </div>
                <div className={styles.formGroup}>
                    <label htmlFor='startTime'>Thời gian bắt đầu:</label>
                    <input ref={startTimeRef} type='text' id='startTime' value={startTime} readOnly />
                </div>
                <form onSubmit={(e) => toggleModal(false, e)} className={styles.bookingForm}>
                    <div className={styles.formGroup}>
                        <label htmlFor='numberOfHours'>Số giờ muốn đặt:</label>
                        <input
                            type='number'
                            id='numberOfHours'
                            min='1'
                            max='12'
                            value={numberOfHours}
                            onChange={(e) => handleChangeNumberOfHours(e)}
                            required
                        />
                    </div>
                    <p className={styles.price}>Price: {formatCurrency(field.price * numberOfHours)}</p>
                    <Button type='submit' className={clsx('font-cera-round-pro-medium mb-4', styles.bookingButton)}>
                        Book Now
                    </Button>
                    {isBookingModalOpen && (
                        <PaymentModal
                            price={field.price * numberOfHours}
                            isOpen={isBookingModalOpen}
                            onClose={() => setIsBookingModalOpen(false)}
                            onSubmit={() => handleSubmit(false)}
                        />
                    )}
                </form>

                <h2 className='mt-4'>Đặt sân theo lịch cứng</h2>
                <form onSubmit={(e) => toggleModal(true, e)} className={styles.bookingForm}>
                    <div className={styles.formGroup}>
                        <label htmlFor='interval'>Chọn chu kỳ:</label>
                        <select id='interval' value={interval} onChange={(e) => setInterval(e.target.value)}>
                            <option value={RecurringIntervalType.DAILY}>Hàng ngày</option>
                            <option value={RecurringIntervalType.WEEKLY}>Hàng tuần</option>
                            <option value={RecurringIntervalType.MONTHLY}>Hàng tháng</option>
                        </select>
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor='duration'>Thời hạn gói (tháng):</label>
                        <select id='duration' value={duration} onChange={(e) => setDuration(e.target.value)}>
                            <option value={1}>1 tháng</option>
                            <option value={3}>3 tháng</option>
                            <option value={6}>6 tháng</option>
                        </select>
                    </div>
                    <p className={styles.price}>Price: {formatCurrency(recurringBookingPrice)}</p>
                    <Button type='submit' className={clsx('font-cera-round-pro-medium', styles.bookingButton)}>
                        Book Recurring
                    </Button>
                    {isRecurringModalOpen && (
                        <PaymentModal
                            price={recurringBookingPrice}
                            isOpen={isRecurringModalOpen}
                            onClose={() => setIsRecurringBookingModalOpen(false)}
                            onSubmit={() => handleSubmit(true)}
                        />
                    )}
                </form>
            </section>
        </div>
    );
}

export default Booking;
