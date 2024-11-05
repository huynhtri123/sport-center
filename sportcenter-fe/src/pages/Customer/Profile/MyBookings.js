import React, { useState } from 'react';
import { toast } from 'react-toastify';

import styles from '../../../assets/css/Profile/myBookings.module.scss';
import bookingApi from '../../../services/api/booking/bookingApi';
import ConfirmModal from '../../../components/Modal/ConfirmModal';
import { Loading } from '../../../components/Loading/Loading';

function MyBookings({ bookings }) {
    const [isLoading, setIsLoading] = useState(false);
    const [canceledBookingIds, setCanceledBookingIds] = useState([]);

    const handleCancelBookingSubmit = async (bookingId) => {
        try {
            setIsLoading(true);
            const cancelResponse = await bookingApi.cancelBooking(bookingId);
            console.log(cancelResponse);
            toast.info(cancelResponse.message);
            setCanceledBookingIds((prevIds) => [...prevIds, bookingId]);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredBookings = bookings.filter((booking) => !canceledBookingIds.includes(booking.id));

    return (
        <div className={styles.myBookingsContainer}>
            {isLoading && <Loading></Loading>}
            <div className={styles.bookingList}>
                {filteredBookings.length > 0 ? (
                    filteredBookings.map((booking) => (
                        <BookingCard
                            key={booking.id}
                            booking={booking}
                            handleCancelBookingSubmit={handleCancelBookingSubmit}
                        />
                    ))
                ) : (
                    <p>No bookings available.</p>
                )}
            </div>
        </div>
    );
}

function BookingCard({ booking, handleCancelBookingSubmit }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const toggleModalOpen = () => {
        setIsModalOpen(!isModalOpen);
    };

    return (
        <div className={styles.bookingCard}>
            <h4>{booking.fieldResponse.fieldName}</h4>
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

            <button className={styles.cancelBtn} onClick={() => toggleModalOpen()}>
                Cancel booking
            </button>
            {isModalOpen && (
                <ConfirmModal
                    title={'Bạn có chắc muốn huỷ booking? Hành động này sẽ không được hoàn tiền và không thể hoàn tác!'}
                    isOpen={isModalOpen}
                    onClose={toggleModalOpen}
                    onSubmit={() => handleCancelBookingSubmit(booking.id)}
                ></ConfirmModal>
            )}
        </div>
    );
}

export default MyBookings;
