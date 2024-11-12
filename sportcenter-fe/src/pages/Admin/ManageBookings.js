import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import styles from '../../assets/css/Admin/manageBookings.module.scss';
import bookingApi from '../../services/api/booking/bookingApi';
import { Loading } from '../../components/Loading/Loading';
import ConfirmModal from '../../components/Modal/ConfirmModal';

function ManageBookings() {
    const [bookings, setBookings] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [canceledBookingIds, setCanceledBookingIds] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [bookingToCancel, setBookingToCancel] = useState(null); // Store the booking to be canceled

    const toggleOpenModal = () => {
        setIsModalOpen(!isModalOpen);
    };

    const fetchBookings = async () => {
        try {
            setIsLoading(true);
            const response = await bookingApi.getAllActive();
            setBookings(response.data);
            // toast.success(response.message);
        } catch (err) {
            console.error(err);
            toast.error('Failed to fetch bookings.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    const handleCancelBooking = (booking) => {
        setBookingToCancel(booking); // Set the booking to cancel
        toggleOpenModal(); // Open the modal
    };

    const handleCancelBookingSubmit = async () => {
        if (!bookingToCancel) return;

        try {
            setIsLoading(true);
            const cancelResponse = await bookingApi.cancelBooking(bookingToCancel.id);
            toast.info(cancelResponse.message);
            setCanceledBookingIds((prevIds) => [...prevIds, bookingToCancel.id]);
            setBookingToCancel(null); // Clear the booking to cancel
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
            setIsModalOpen(false);
        }
    };

    const filteredBookings = bookings.filter((booking) => !canceledBookingIds.includes(booking.id));

    return (
        <div className={styles.manageBookingsContainer}>
            {isLoading && <Loading />}
            <table className={`mt-4 ${styles.bookingsTable}`}>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Booking ID</th>
                        <th>Field Name</th>
                        <th>User Email</th>
                        <th>Booking Date</th>
                        <th>Start Time</th>
                        <th>End Time</th>
                        <th>Number of Hours</th>
                        <th>Total Price</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredBookings.length > 0 ? (
                        filteredBookings.map((booking, index) => (
                            <tr key={booking.id}>
                                <td>{index + 1}</td>
                                <td>{booking.id}</td>
                                <td>{booking.fieldResponse?.fieldName || 'N/A'}</td>
                                <td>{booking.userName || 'N/A'}</td>
                                <td>{booking.bookingDate}</td>
                                <td>{booking.startTime}</td>
                                <td>{booking.endTime}</td>
                                <td>{booking.numberOfHours}</td>
                                <td>${booking.totalPrice.toFixed(2)}</td>
                                <td>
                                    <button
                                        className={`btn ${styles.cancelButton}`}
                                        onClick={() => handleCancelBooking(booking)}
                                    >
                                        Cancel Booking
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan='10'>No bookings available.</td>
                        </tr>
                    )}
                </tbody>
            </table>

            {isModalOpen && (
                <ConfirmModal
                    title='Chủ sỡ hữu sẽ nhận được email thông báo và được hoàn tiền vào số dư, bạn có chắc muốn huỷ booking này?'
                    isOpen={isModalOpen}
                    onClose={toggleOpenModal}
                    onSubmit={handleCancelBookingSubmit}
                />
            )}
        </div>
    );
}

export default ManageBookings;
