/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'react-toastify';
import clsx from 'clsx';
import styles from '../../../assets/css/Booking/Booking.module.scss';
import bookingApi from '../../../services/api/booking/bookingApi';
import { Processing } from '../../../components/Loading/Processing';
import Button from '../../../components/Button/Button';
import { useGetField } from '../../../customs/hooks';
import { RecurringIntervalType } from '../../../utils/enums/RecurringIntervalType';
import PaymentModal from '../../../components/Modal/PaymentModal';
import formatCurrency from '../../../utils/formatCurrency';
import Video from '../../../components/Video/Video';
import { connectWebSocket, disconnectWebSocket } from '../../../services/websocket/connect';
import { useSelectDateForBooking, useLoading } from '../../../customs/hooks';
import RecurringTimeSlotsModal from '../../../components/Modal/RecurringTimeSlotsModal';
import aiApi from '../../../services/api/ai/aiApi';
import TimeSlotGrid from './TimeSlotGrid';
import { BookingDiscount } from '../../../utils/constants/BookingDiscount';
import discountApi from '../../../services/api/discountConfig/discountApi';

function Booking() {
    const [field, setField] = useGetField();
    const [selectedDate, setSelectedDate] = useSelectDateForBooking();
    const [timeSlots, setTimeSlots] = useState([]);
    const [numberOfHours, setNumberOfHours] = useState(0);
    const [startTime, setStartTime] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const startTimeRef = useRef(); // để canh ô input startTime của booking có trống ko
    const [interval, setInterval] = useState(RecurringIntervalType.WEEKLY);
    const [duration, setDuration] = useState(1);
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [isRecurringModalOpen, setIsRecurringBookingModalOpen] = useState(false);
    // eslint-disable-next-line no-unused-vars
    const [bookingPrice, setBookingPrice] = useState(0);
    const [recurringBookingPrice, setRecurringBookingPrice] = useState(0);
    const [isLoadingContext, setIsLoadingContext] = useLoading();
    const [isShowTimeSlots, setIsShowTimeSlots] = useState(false);
    const [recurringTimeSlots, setRecurringTimeSlots] = useState([]);
    const [bookingProbabilities, setBookingProbabilities] = useState([]);
    const [discountConfig, setDiscountConfig] = useState({});

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    useEffect(() => {
        // Khi component mount, kết nối WebSocket
        connectWebSocket(
            (updatedBooking) => {
                // Xử lý cập nhật booking
                console.log('📢 Cập nhật booking mới:', updatedBooking);
                if (selectedDate) {
                    fetchTimeSlots(selectedDate);
                }
            },
            (newNotification) => {
                // Xử lý notification mới
                console.log('🔔 Notification mới nhận:', newNotification);
            }
        );

        // Cleanup khi component bị unmount (rời khỏi trang)
        return () => {
            //console.log('🔌 Ngắt kết nối WebSocket');
            disconnectWebSocket(); // Ngắt kết nối WebSocket khi component unmount
        };
    }, [selectedDate]); // Chỉ chạy 1 lần khi component mount

    const fetchDiscountConfig = async () => {
        try {
            const response = await discountApi.getAll();
            //console.log(response.data[0].amountDiscount);
            if (response) {
                setDiscountConfig(response.data[0]);
            }
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchDiscountConfig();
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
                //console.log(response.data);
                setTimeSlots(response.data.timeSlots);

                // Gọi AI dự đoán tỉ lệ sau khi có timeslot
                predict(date);
            } catch (error) {
                console.error('Error fetching time slots:', error);
            }
        },
        [field, setField]
    );

    const predict = async (date) => {
        const dayForPredict = new Date(date);
        let dayOfWeek = dayForPredict.getDay();
        // 1 = Thứ Hai, ..., 6 = Thứ Bảy, 0 = Chủ Nhật
        dayOfWeek = dayOfWeek === 0 ? 7 : dayOfWeek; // chuyển Chủ Nhật từ 0 thành 7
        const month = dayForPredict.getMonth() + 1; // cộng 1 vì getMonth() trả về 0-11
        const price = getPriceForDate(field, dayOfWeek);
        const request = {
            field_id: field.id,
            sport_id: field.sportId,
            day_of_week: dayOfWeek,
            month: month,
            price: price,
        };
        const prediction = await aiApi.bookingPredicttion(request);
        if (prediction) {
            setBookingProbabilities(prediction.probabilities); // mảng 24 phần tử
        }
    };

    // tìm những slot có tỉ lệ <=x% đánh dấu nó là lowDemand để hàm getPrice giảm giá
    const markLowDemandTimeSlots = (timeSlots, bookingProbabilities) => {
        return timeSlots.map((slot, index) => {
            const probability = bookingProbabilities[index];
            const discountThreshold = discountConfig ? discountConfig.amountDiscount.threshold / 100 : 0;
            const discountAmount = discountConfig ? discountConfig.amountDiscount.discount : 0;
            const isLowDemand = probability <= discountThreshold; // Nếu tỉ lệ <= x%, đánh dấu là low demand
            console.log(discountAmount);
            return {
                ...slot,
                isLowDemand, // Thêm thuộc tính isLowDemand vào từng timeslot
                discount: discountAmount,
            };
        });
    };

    useEffect(() => {
        if (bookingProbabilities.length > 0 && timeSlots.length > 0) {
            const updatedTimeSlots = markLowDemandTimeSlots(timeSlots, bookingProbabilities);
            // check nếu có thay đổi mới cập nhật, tránh vòng lặp vô tận
            const isChanged = timeSlots.some((slot, index) => {
                return slot.isLowDemand !== updatedTimeSlots[index]?.isLowDemand;
            });

            if (isChanged) {
                setTimeSlots(updatedTimeSlots);
            }
        }
    }, [bookingProbabilities, timeSlots]);

    const getPriceForDate = (field, dayOfWeek) => {
        if (!field.pricePolicies || !selectedDate) return null;
        const matchingPolicy = field.pricePolicies.find((policy) => policy.daysOfWeek.includes(dayOfWeek));
        return matchingPolicy ? matchingPolicy.price : null;
    };

    const handleDateChange = (e) => {
        const date = e.target.value;
        setSelectedDate(date);
        fetchTimeSlots(date);
        if (startTime && numberOfHours > 0) {
            getPrice(true, date);
            getPrice(false, date);
            console.log(date);
        }
    };

    // useEffect(() => {
    //     console.log('Selected date has changed:', selectedDate);
    // }, [selectedDate]);

    const getPrice = async (isRecurring, date) => {
        if (!startTimeRef.current?.value) {
            toast.warn('Please pick start time!');
            return;
        }

        // Kiểm tra nếu discountConfig chưa load xong thì bỏ qua giảm giá
        const hasDiscountConfig = discountConfig && discountConfig.amountDiscount;

        try {
            setIsLoading(true);
            const startDateTimeString = `${date}T${startTime}:00+00:00`;
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

            let price = priceResponse.data;

            const matchedSlot = timeSlots.find((slot) => slot.startTime.includes(`${date}T${startTime}`));

            // Chỉ giảm giá nếu có discountConfig hợp lệ
            if (matchedSlot?.isLowDemand && hasDiscountConfig) {
                price -= (price * discountConfig.amountDiscount.discount) / 100;
            }

            isRecurring ? setRecurringBookingPrice(price) : setBookingPrice(price);
        } catch (err) {
            console.error('Failed to calculate price:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleModal = (isRecurring, e) => {
        e.preventDefault();
        // Kiểm tra nếu startTimeRef không có giá trị
        if (!startTimeRef.current.value) {
            toast.warn('Please pick start time!');
            return;
        }
        isRecurring
            ? setIsRecurringBookingModalOpen(!isRecurringModalOpen)
            : setIsBookingModalOpen(!isBookingModalOpen);
        // getPrice(isRecurring);
    };

    const handleSubmit = async (isRecurring) => {
        try {
            setIsLoadingContext(true); // sang PaymentModal xu ly xong moi dung Context off loading
            const startDateTimeString = `${selectedDate}T${startTime}:00+00:00`;
            const startTimeUTC = new Date(startDateTimeString).toISOString();

            const request = {
                fieldId: field.id,
                startTime: startTimeUTC,
                numberOfHours: numberOfHours,
                price: isRecurring ? recurringBookingPrice : bookingPrice,
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
            // toast.success(response.message);

            return response.data;
        } catch (err) {
            console.error(err);
            //toast.error(err.message);
            setIsLoadingContext(false);
            return null;
        } finally {
            isRecurring ? setIsRecurringBookingModalOpen(false) : setIsBookingModalOpen(false);
        }
    };

    const getRecurringTimeSlots = async () => {
        try {
            setIsShowTimeSlots(true);
            const startDateTimeString = `${selectedDate}T${startTime}:00+00:00`;
            const startTimeUTC = new Date(startDateTimeString).toISOString();

            const request = {
                fieldId: field.id,
                startTime: startTimeUTC,
                numberOfHours: numberOfHours,
                startDate: startTimeUTC,
                interval: interval,
                packageDurationMonths: duration,
            };

            const response = await bookingApi.getRecurringTimeSlots(request);
            setRecurringTimeSlots(response.data);
        } catch (err) {
            console.error(err);
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
        if (selectedDate && startTime && numberOfHours && numberOfHours > 0) {
            getPrice(true, selectedDate);
            getPrice(false, selectedDate);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [numberOfHours, interval, duration, selectedDate, startTime]);

    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    return (
        <div className={styles.bookingContainer}>
            {isLoadingContext && <Processing></Processing>}
            <section className={styles.fieldDetailSection}>
                <div className={styles.fieldImage}>
                    <img src={field.imageUrl} alt={field.fieldName} />
                </div>
                <div className={styles.fieldInfo}>
                    <h1>{field.fieldName}</h1>
                    <p>{field.description}</p>
                    <Video src={field.videoUrl} title={'Instructional video for entering the venue'}></Video>
                </div>
            </section>

            <section className={styles.pricePoliciesSection}>
                <h2>Price Policies</h2>
                <ul className={styles.pricePolicyList}>
                    {field.pricePolicies &&
                        field.pricePolicies.map((policy, index) => (
                            <li key={index} className={styles.pricePolicyItem}>
                                <p className={styles.price}>Price: {formatCurrency(policy.price)}/hours</p>
                                <p>
                                    <strong>Aplpy for:</strong>{' '}
                                    {policy.daysOfWeek
                                        .map((day) => dayNames[day - 1]) // Chuyển từ số sang tên ngày
                                        .join(', ')}
                                </p>
                            </li>
                        ))}
                </ul>
            </section>

            <section className={styles.bookingSection}>
                <h2>Single Booking</h2>
                <div className={styles.formGroup}>
                    <label htmlFor='datePicker'>Choose a date:</label>
                    <input
                        type='date'
                        id='datePicker'
                        required
                        value={selectedDate}
                        onChange={handleDateChange}
                        min={new Date().toISOString().split('T')[0]}
                    />
                </div>

                <TimeSlotGrid
                    timeSlots={timeSlots}
                    setStartTime={setStartTime}
                    bookingProbabilities={bookingProbabilities}
                    startTimeRef={startTimeRef}
                ></TimeSlotGrid>

                <div className={styles.formGroup}>
                    <label htmlFor='startTime'>Start Time:</label>
                    <input ref={startTimeRef} type='text' id='startTime' value={startTime} readOnly />
                </div>
                <form onSubmit={(e) => toggleModal(false, e)} className={styles.bookingForm}>
                    <div className={styles.formGroup}>
                        <label htmlFor='numberOfHours'>Duration (1-12h from start):</label>
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
                    <p className={styles.price}>Price: {formatCurrency(bookingPrice)}</p>
                    <Button type='submit' className={clsx('font-cera-round-pro-medium mb-4', styles.bookingButton)}>
                        Book Now
                    </Button>
                    {isBookingModalOpen && (
                        <PaymentModal
                            price={bookingPrice}
                            isOpen={isBookingModalOpen}
                            onClose={() => setIsBookingModalOpen(false)}
                            onSubmit={() => handleSubmit(false)}
                            isBookingPayment={true}
                            isRegistrationPayment={false}
                            fetchTimeSlots={() => fetchTimeSlots(selectedDate)}
                            isRecurring={false}
                        />
                    )}
                </form>

                <h2 className='mt-4'>Fixed Schedule Booking</h2>
                <form onSubmit={(e) => toggleModal(true, e)} className={styles.bookingForm}>
                    <div className={styles.formGroup}>
                        <label htmlFor='interval'>Select the cycle:</label>
                        <select id='interval' value={interval} onChange={(e) => setInterval(e.target.value)}>
                            <option value={RecurringIntervalType.WEEKLY}>Weekly (once a week)</option>
                            <option value={RecurringIntervalType.BIWEEKLY}>Bi-Weekly (once every 2 weeks)</option>
                        </select>
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor='duration'>Package duration:</label>
                        <select
                            id='duration'
                            value={duration}
                            onChange={(e) => setDuration(Number(e.target.value))} // ép kiểu vì e.target.value là string
                        >
                            {(discountConfig?.monthDiscountList?.length > 0
                                ? discountConfig.monthDiscountList
                                : [{ month: 1, discount: 0 }]
                            ).map(({ month, discount }) => (
                                <option key={month} value={month}>
                                    {month} month{month > 1 ? 's' : ''} {discount > 0 ? `(-${discount}%)` : ''}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Modal hien thi danh sach recurring time slots  */}
                    {isShowTimeSlots && (
                        <RecurringTimeSlotsModal
                            timeSlots={recurringTimeSlots}
                            onClose={() => setIsShowTimeSlots(false)}
                        />
                    )}
                    <p className={styles.price}>
                        Price: {formatCurrency(recurringBookingPrice)}
                        <i
                            className='fa-regular fa-circle-question ms-2 text-dark'
                            style={{ cursor: 'pointer' }}
                            onClick={getRecurringTimeSlots}
                        ></i>
                    </p>
                    <Button type='submit' className={clsx('font-cera-round-pro-medium', styles.bookingButton)}>
                        Recurring Booking Now
                    </Button>
                    {isRecurringModalOpen && (
                        <PaymentModal
                            price={recurringBookingPrice}
                            isOpen={isRecurringModalOpen}
                            onClose={() => setIsRecurringBookingModalOpen(false)}
                            onSubmit={() => handleSubmit(true)}
                            isBookingPayment={true}
                            isRegistrationPayment={false}
                            fetchTimeSlots={() => fetchTimeSlots(selectedDate)}
                            isRecurring={true}
                        />
                    )}
                </form>
            </section>
        </div>
    );
}

export default Booking;
