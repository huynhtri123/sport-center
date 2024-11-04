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
    const [selectedDate, setSelectedDate] = useState(''); // ngày được chọn (vd: 2024-12-10)
    const [timeSlots, setTimeSlots] = useState([]); // danh sách timeSlots
    const [numberOfHours, setNumberOfHours] = useState(1); // số giờ đặt
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
                // console.warn('Sân chưa được nạp (chỉ là chưa kịp nạp thôi, ko sao)');
                return;
            }

            // Cấu hình thời gian với định dạng giờ Việt Nam (+7) vì BE yêu cầu input là kiểu +7
            const onDaySchedule = {
                fieldId: field.id,
                startOfDay: `${date}T00:00:00+07:00`, // Bắt đầu từ 00:00 ngày được chọn
                endOfDay: `${date}T23:59:00+07:00`, // Kết thúc vào 23:59 ngày được chọn
            };
            // console.log('GEt: ', onDaySchedule);

            try {
                // api này trả về kiểu +7
                const response = await bookingApi.updateAndGetSchedule(onDaySchedule);
                setTimeSlots(response.data.timeSlots); // cập nhật danh sách timeSlots đã được lấy theo ngày
            } catch (error) {
                console.error('Error fetching time slots:', error);
            }
        },
        [field, setField]
    );

    // Hàm xử lý khi chọn ngày -> nạp lại danh sách timeSlot
    const handleDateChange = (e) => {
        // vd: 2024-12-10
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
            // startTime là giờ Việt Nam nhưng định dạng UTC (+0) cho khớp BE
            // console.log(startTime);
            const startDateTimeString = `${selectedDate}T${startTime}:00+00:00`;
            // console.log(startDateTimeString)
            const startTimeUTC = new Date(startDateTimeString).toISOString();
            // console.log(startTimeUTC)

            const bookingRequest = {
                fieldId: field.id,
                startTime: startTimeUTC,
                numberOfHours: numberOfHours,
            };
            // console.log('create: ', bookingRequest);

            const response = await bookingApi.createBooking(bookingRequest);
            fetchTimeSlots(selectedDate); // nạp lại danh sách timeSlot
            toast.success(response.message);
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
        const defaultDate = today.toISOString().split('T')[0]; // vd: 2024-12-10
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
            {isLoading && <Loading />}

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
                        type='date' // vd: 2024-12-10
                        id='datePicker'
                        required
                        value={selectedDate}
                        onChange={handleDateChange}
                        min={new Date().toISOString().split('T')[0]} // Chỉ cho phép chọn ngày hôm nay hoặc tương lai
                    />
                </div>

                {/* Hiển thị danh sách khung giờ */}
                <div className={styles.timeSlotGrid}>
                    {timeSlots.length > 0 ? (
                        timeSlots.map((slot, index) => {
                            const slotStartTime = new Date(slot.startTime);
                            const currentTimeVN = new Date(new Date().getTime() + 7 * 60 * 60 * 1000); // +7h
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
