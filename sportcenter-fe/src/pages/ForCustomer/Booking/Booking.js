import React, { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'react-toastify';
import clsx from 'clsx';
import styles from '../../../assets/css/Booking/Booking.module.scss';
import bookingApi from '../../../services/api/booking/bookingApi';
import { Loading } from '../../../components/Loading/Loading';
import Button from '../../../components/Button/Button';
import { useGetField } from '../../../customs/hooks';

function Booking() {
    const [field, setField] = useGetField(); // field lấy từ context (được set ở FieldList)
    const [selectedDate, setSelectedDate] = useState(''); // ngày
    const [timeSlots, setTimeSlots] = useState([]); // Danh sách timeSlots
    const [numberOfHours, setNumberOfHours] = useState(1); // Số giờ đặt
    const [startTime, setStartTime] = useState(''); // Thời gian bắt đầu của timeSlot được chọn
    const [isLoading, setIsLoading] = useState(false);
    const startTimeRef = useRef(); // để canh ô input startTime của booking có trống ko

    useEffect(() => {
        window.scrollTo(0, 0); // Scroll to the top of the page when the component mounts
    }, []);

    // Hàm gọi API để lấy timeSlots cho ngày đã chọn
    const fetchTimeSlots = useCallback(
        async (date) => {
            if (!field || !field.id) {
                // khi load lại trang thì lấy lại dữ liệu field từ localStorage
                const savedField = localStorage.getItem('selectedField');
                if (savedField) {
                    setField(JSON.parse(savedField));
                }
                console.warn('Sân chưa được nạp (chỉ là chưa kịp nạp thôi, ko sao)');
                return;
            }
            // console.log(field);
            const onDaySchedule = {
                fieldId: field.id,
                startOfDay: `${date}T00:00:00Z`, // Bắt đầu từ 00:00 ngày được chọn
                endOfDay: `${date}T23:59:00Z`, // Kết thúc vào 23:59 ngày được chọn
            };

            try {
                const response = await bookingApi.updateAndGetSchedule(onDaySchedule);
                // console.log(response);
                setTimeSlots(response.data.timeSlots); // cập nhật danh sách timeSlots đã được lấy theo ngày
            } catch (error) {
                console.error('Error fetching time slots:', error);
            }
        },
        [field, setField]
    );

    // hàm xử lý khi chọn ngày -> nạp lại danh sách timeSlot
    const handleDateChange = (e) => {
        const date = e.target.value;
        setSelectedDate(date);
        fetchTimeSlots(date);
    };

    const handleBookingSubmit = async (e) => {
        e.preventDefault();
        if (!startTimeRef.current.value) {
            toast.warn('Please pick start time!');
            return;
        }
        try {
            setIsLoading(true);
            const startDateTimeString = `${selectedDate}T${startTime}:00+00:00`;
            // console.log(startDateTimeString);

            const bookingRequest = {
                fieldId: field.id,
                startTime: startDateTimeString, // Sử dụng định dạng startTime đã chỉnh sửa
                numberOfHours: numberOfHours,
            };

            // eslint-disable-next-line no-unused-vars
            const response = await bookingApi.createBooking(bookingRequest);
            fetchTimeSlots(selectedDate); // nạp lại danh sách timeSlot
            // console.log(response);
            toast.success('Booking successfully!');
        } catch (err) {
            console.error(err);
            toast.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        // Đặt ngày mặc định là ngày hiện tại
        const today = new Date();
        const defaultDate = today.toISOString().split('T')[0]; // cắt chuỗi tại vị trí T, lấy khúc đầu (chỉ phần ngày)
        setSelectedDate(defaultDate);
        fetchTimeSlots(defaultDate); // lấy today's timeSlots khi component được mount
    }, [fetchTimeSlots]);

    useEffect(() => {
        // nếu đổi ngày thì nạp lại danh sách
        if (selectedDate) {
            fetchTimeSlots(selectedDate);
        }
    }, [selectedDate, fetchTimeSlots]);

    return (
        <div className={styles.bookingContainer}>
            {isLoading && <Loading></Loading>}

            <section className={styles.fieldDetailSection}>
                <div className={styles.fieldImage}>
                    <img src={field.imageUrl} alt={field.fieldName} />
                </div>
                <div className={styles.fieldInfo}>
                    <h1>{field.fieldName}</h1>
                    <p>{field.description}</p>
                    <p>Giá thuê: {field.price} VND/giờ</p>
                </div>
            </section>

            <section className={styles.bookingSection}>
                <h2>Đặt sân</h2>

                {/* Ô chọn ngày */}
                <div className={styles.formGroup}>
                    <label htmlFor='datePicker'>Chọn ngày:</label>
                    <input
                        type='date'
                        id='datePicker'
                        required
                        value={selectedDate}
                        onChange={handleDateChange}
                        min={new Date().toISOString().split('T')[0]} // Chỉ cho phép chọn ngày hôm nay hoặc tương lai
                        // split: tách chuỗi tại 'T', [0] để lấy phần phía trước (2024-10-24T08:30:45.000Z -> 2024-10-24)
                    />
                </div>

                {/* Hiển thị danh sách khung giờ */}
                <div className={styles.timeSlotGrid}>
                    {timeSlots.length > 0 ? (
                        timeSlots.map((slot, index) => {
                            const slotStartTime = new Date(slot.startTime);
                            const currentTimeVN = new Date(new Date().getTime() + 7 * 60 * 60 * 1000); //+7h
                            const isPastSlot = slotStartTime < currentTimeVN; // Kiểm tra xem slot đã qua hay chưa
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
                                            setStartTime(slot.startTime.substring(11, 16)); // để điền vào input
                                        }
                                    }}
                                >
                                    <span>
                                        {slot.startTime.substring(11, 16)} - {slot.endTime.substring(11, 16)}
                                        {/* ví dụ: YYYY-MM-DDTHH:MM:SSZ -> HH:MM */}
                                    </span>
                                </div>
                            );
                        })
                    ) : (
                        <p>Không có khung giờ nào khả dụng cho ngày đã chọn.</p>
                    )}
                </div>

                {/* Ô hiển thị thời gian bắt đầu của timeSlot được chọn */}
                <div className={styles.formGroup}>
                    <label htmlFor='startTime'>Thời gian bắt đầu:</label>
                    <input ref={startTimeRef} type='text' id='startTime' value={startTime} readOnly />
                </div>

                {/* Form đặt sân */}
                <form onSubmit={handleBookingSubmit} className={styles.bookingForm}>
                    <div className={styles.formGroup}>
                        <label htmlFor='numberOfHours'>Số giờ muốn đặt:</label>
                        <input
                            type='number'
                            id='numberOfHours'
                            min='1'
                            value={numberOfHours}
                            onChange={(e) => setNumberOfHours(e.target.value)}
                            required
                        />
                    </div>

                    <Button type='submit' className={clsx('font-cera-round-pro-medium', styles.bookingButton)}>
                        Book Now
                    </Button>
                </form>
            </section>
        </div>
    );
}

export default Booking;
