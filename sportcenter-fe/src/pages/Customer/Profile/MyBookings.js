import React, { useState } from 'react';
import { toast } from 'react-toastify';

import styles from '../../../assets/css/Profile/myBookings.module.scss';
import bookingApi from '../../../services/api/booking/bookingApi';
import ConfirmModal from '../../../components/Modal/ConfirmModal';
import { Loading } from '../../../components/Loading/Loading';
import formatCurrency from '../../../utils/formatCurrency';

function MyBookings({ bookings, setMyBookings, getMyProfile }) {
    const [isLoading, setIsLoading] = useState(false);

    const handleCancelBookingSubmit = async (bookingId) => {
        try {
            setIsLoading(true);
            const cancelResponse = await bookingApi.cancelBooking(bookingId);
            console.log(cancelResponse);
            toast.info(cancelResponse.message);
            // refetch bookings
            setMyBookings((prevBookings) => prevBookings.filter((booking) => booking.id !== bookingId));
            getMyProfile();
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
                            isLoading={isLoading}
                            setIsLoading={setIsLoading}
                        />
                    ))
                ) : (
                    <p>No bookings available.</p>
                )}
            </div>
        </div>
    );
}

function BookingCard({ booking, handleCancelBookingSubmit, handleCancelRecurring, isLoading, setIsLoading }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCancelRecurringModalOpen, setIsCancelRecurringModalOpen] = useState(false);
    // const [recurringBooking, setRecurringBooking] = useState({});
    const [remainingAmout, setRemainingAmount] = useState(0);
    const toggleModalOpen = () => {
        setIsModalOpen(!isModalOpen);
    };

    const toggleCancelRecurringModalOpen = async () => {
        if (!isCancelRecurringModalOpen) {
            try {
                setIsLoading(true);
                // const getRecurring = await bookingApi.getRecurringByBookingId(booking.id);
                // setRecurringBooking(getRecurring.data);
                const remainingAmoutResponse = await bookingApi.getRemainingAmout(booking.id);
                // console.log(remainingAmoutResponse);
                setRemainingAmount(remainingAmoutResponse.data);
                // console.log(getRecurring);
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        }
        setIsCancelRecurringModalOpen(!isCancelRecurringModalOpen);
    };

    const modalTitle = booking.recurring
        ? 'This is a fixed schedule! If you cancel this booking, you will not receive a refund. Are you sure you want to cancel?'
        : 'Are you sure you want to cancel the booking? The court booking amount will be refunded to your balance!';

    const cardClass = booking.recurring
        ? `${styles.bookingCard} ${styles.recurring}`
        : `${styles.bookingCard} ${styles.nonRecurring}`;

    return (
        <div className={cardClass}>
            {isLoading && <Loading></Loading>}
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
                        Single cancel
                    </button>
                    <button className={styles.cancelBtn} onClick={() => toggleCancelRecurringModalOpen()}>
                        Recurring Cancel
                    </button>
                    {isCancelRecurringModalOpen && (
                        <ConfirmModal
                            title={`You will be refunded ${formatCurrency(
                                remainingAmout / 2
                            )} (50% of the remaining booking amount)! Are you sure you want to cancel the fixed schedule?`}
                            onClose={toggleCancelRecurringModalOpen}
                            onSubmit={() => handleCancelRecurring(booking.id)}
                            isOpen={isCancelRecurringModalOpen}
                        ></ConfirmModal>
                    )}
                </div>
            ) : (
                <button className={styles.cancelBtn} onClick={() => toggleModalOpen()}>
                    Cancel booking
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
