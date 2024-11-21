import React, { useState } from 'react';
import { toast } from 'react-toastify';

import styles from '../../../assets/css/Profile/myBookings.module.scss';
import bookingApi from '../../../services/api/booking/bookingApi';
import ConfirmModal from '../../../components/Modal/ConfirmModal';
import { Loading } from '../../../components/Loading/Loading';
import formatCurrency from '../../../utils/formatCurrency';

function MyBookings({ bookings, setMyBookings }) {
    const [isLoading, setIsLoading] = useState(false);

    const handleCancelBookingSubmit = async (bookingId) => {
        try {
            setIsLoading(true);
            const cancelResponse = await bookingApi.cancelBooking(bookingId);
            console.log(cancelResponse);
            toast.info(cancelResponse.message);
            // refetch bookings
            setMyBookings((prevBookings) => prevBookings.filter((booking) => booking.id !== bookingId));
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancelRecurring = async (bookingId) => {
        try {
            setIsLoading(true);

            const cancelRecurringResponse = await bookingApi.cancelRecurring(bookingId);
            console.log(cancelRecurringResponse);

            // refetch bookings
            const canceledBookingIds = cancelRecurringResponse.data.bookingIds;
            setMyBookings((prevBookings) => prevBookings.filter((booking) => !canceledBookingIds.includes(booking.id)));

            toast.success(cancelRecurringResponse.message);
        } catch (err) {
            console.log(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.myBookingsContainer}>
            {isLoading && <Loading></Loading>}
            <div className={styles.bookingList}>
                {bookings.length > 0 ? (
                    bookings.map((booking) => (
                        <BookingCard
                            key={booking.id}
                            booking={booking}
                            handleCancelBookingSubmit={handleCancelBookingSubmit}
                            handleCancelRecurring={handleCancelRecurring}
                        />
                    ))
                ) : (
                    <p>No bookings available.</p>
                )}
            </div>
        </div>
    );
}

function BookingCard({ booking, handleCancelBookingSubmit, handleCancelRecurring }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCancelRecurringModalOpen, setIsCancelRecurringModalOpen] = useState(false);
    const [recurringBooking, setRecurringBooking] = useState({});
    const toggleModalOpen = () => {
        setIsModalOpen(!isModalOpen);
    };

    const toggleCancelRecurringModalOpen = async () => {
        if (!isCancelRecurringModalOpen) {
            try {
                const getRecurring = await bookingApi.getRecurringByBookingId(booking.id);
                setRecurringBooking(getRecurring.data);
                // console.log(getRecurring);
            } catch (err) {
                console.error(err);
            }
        }
        setIsCancelRecurringModalOpen(!isCancelRecurringModalOpen);
    };

    const modalTitle = booking.recurring
        ? 'Đây là lịch cứng! Nếu huỷ lẻ booking này bạn sẽ không được hoàn tiền! Bạn có chắc muốn huỷ?'
        : 'Bạn có chắc muốn huỷ booking? Số tiền đặt sân sẽ được hoàn vào số dư!';

    const cardClass = booking.recurring
        ? `${styles.bookingCard} ${styles.recurring}`
        : `${styles.bookingCard} ${styles.nonRecurring}`;

    return (
        <div className={cardClass}>
            <h4>
                {booking.recurring ? `RECURRING - ${booking.fieldResponse.fieldName}` : booking.fieldResponse.fieldName}
            </h4>
            <p>
                <span>Booking Date:</span>
                <span>{booking.bookingDate}</span>
            </p>
            <p>
                <span>Start Time:</span>
                <span>{booking.startTime}</span>
            </p>
            <p>
                <span>End Time:</span>
                <span>{booking.endTime}</span>
            </p>
            <p>
                <span>Hours:</span>
                <span>{booking.numberOfHours}</span>
            </p>
            <p>
                <span>Total Price:</span>
                <span>${booking.totalPrice}</span>
            </p>

            {booking.recurring ? (
                <div>
                    <button className={styles.cancelBtn} onClick={() => toggleModalOpen()}>
                        Just cancel this (2)
                    </button>
                    <button className={styles.cancelBtn} onClick={() => toggleCancelRecurringModalOpen()}>
                        Cancel recurring (3)
                    </button>
                    {isCancelRecurringModalOpen && (
                        <ConfirmModal
                            title={`Bạn sẽ được hoàn ${formatCurrency(
                                recurringBooking.price / 2
                            )} (50% booking price)! Bạn vẫn chắc muôn huỷ lịch cứng?`}
                            onClose={toggleCancelRecurringModalOpen}
                            onSubmit={() => handleCancelRecurring(booking.id)}
                            isOpen={isCancelRecurringModalOpen}
                        ></ConfirmModal>
                    )}
                </div>
            ) : (
                <button className={styles.cancelBtn} onClick={() => toggleModalOpen()}>
                    Cancel booking (1)
                </button>
            )}

            {isModalOpen && (
                <ConfirmModal
                    title={modalTitle}
                    isOpen={isModalOpen}
                    onClose={toggleModalOpen}
                    onSubmit={() => handleCancelBookingSubmit(booking.id)}
                ></ConfirmModal>
            )}
        </div>
    );
}

export default MyBookings;
