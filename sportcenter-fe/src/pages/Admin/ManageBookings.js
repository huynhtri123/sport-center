import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import styles from '../../assets/css/Admin/manageBookings.module.scss';
import bookingApi from '../../services/api/booking/bookingApi';
import { Loading } from '../../components/Loading/Loading';
import ConfirmModal from '../../components/Modal/ConfirmModal';
import Button from '../../components/Button/Button';
import formatCurrency from '../../utils/formatCurrency';

function ManageBookings() {
    const [bookings, setBookings] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [canceledBookingIds, setCanceledBookingIds] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [bookingToCancel, setBookingToCancel] = useState(null); // Store the booking to be canceled
    const [recurringBooking, setRecurringBooking] = useState({});
    const [isCancelRecurringModalOpen, setIsCancelRecurringModalOpen] = useState(false);

    const toggleCancelRecurringModalOpen = async (bookingId) => {
        if (!isCancelRecurringModalOpen) {
            try {
                const getRecurring = await bookingApi.getRecurringByBookingId(bookingId);
                setRecurringBooking(getRecurring.data);
                // console.log(getRecurring);
            } catch (err) {
                console.error(err);
            }
        }
        setIsCancelRecurringModalOpen(!isCancelRecurringModalOpen);
    };

    const toggleOpenModal = () => {
        setIsModalOpen(!isModalOpen);
    };

    const fetchBookings = async () => {
        try {
            setIsLoading(true);
            const response = await bookingApi.getAllActive();
            // console.log(response);
            setBookings(response.data);
            // toast.success(response.message);
        } catch (err) {
            console.error(err);
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

    // huỷ cứng
    const handleCancelRecurring = async (bookingId) => {
        try {
            setIsLoading(true);

            const cancelRecurringResponse = await bookingApi.cancelRecurring(bookingId);
            console.log(cancelRecurringResponse);

            // Loại bỏ booking đã huỷ khỏi state `bookings`
            const bookingIds = recurringBooking.bookingIds;
            setBookings((prevBookings) => prevBookings.filter((booking) => !bookingIds.includes(booking.id)));

            toast.success(cancelRecurringResponse.message);
        } catch (err) {
            console.log(err);
            toast.error('Failed to cancel recurring booking.' + err);
        } finally {
            setIsLoading(false);
            setIsCancelRecurringModalOpen(false);
        }
    };

    const filteredBookings = bookings.filter((booking) => !canceledBookingIds.includes(booking.id));

    return (
        <div className={styles.manageBookingsContainer}>
            {isLoading && <Loading />}
            <table className={`mt-4 ${styles.bookingsTable}`}>
                <thead>
                    <tr>
                        <th>Order</th>
                        <th>Booking ID</th>
                        <th>Field Name</th>
                        <th>Customer Info</th> {/* Gộp thành cột mới */}
                        <th>Booking Date</th>
                        <th>Time Range</th>
                        <th>Duration (h)</th>
                        <th>Total Price</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredBookings.length > 0 ? (
                        filteredBookings.map((booking, index) => (
                            <tr key={booking.id} className={booking.recurring ? styles.recurring : styles.single}>
                                <td>{index + 1}</td>
                                <td>{booking.id}</td>
                                <td>{booking.fieldResponse?.fieldName || 'N/A'}</td>
                                <td>
                                    <div className={styles.customerInfo}>
                                        <div>
                                            <strong>{booking.userFullName || 'N/A'}</strong>
                                        </div>
                                        <div>{booking.userName || 'N/A'}</div>
                                        <div>{booking.userPhoneNumber || 'N/A'}</div>
                                    </div>
                                </td>
                                <td className={styles.startTime}>{booking.bookingDate}</td>
                                <td>
                                    <div className={styles.timeRange}>
                                        <span className={styles.startTime}>{booking.startTime}</span>
                                        <span className={styles.timeSeparator}> - </span>
                                        <span className={styles.endTime}>{booking.endTime}</span>
                                    </div>
                                </td>
                                <td>{booking.numberOfHours}</td>
                                <td>${booking.totalPrice.toFixed(2)}</td>
                                <td>
                                    {booking.recurring ? (
                                        <>
                                            <Button
                                                className={`btn ${styles.cancelButtonRecurring}`}
                                                onClick={() => handleCancelBooking(booking)}
                                            >
                                                Just cancel this
                                            </Button>
                                            <Button
                                                className={`btn ${styles.cancelButtonRecurring}`}
                                                onClick={() => toggleCancelRecurringModalOpen(booking.id)}
                                            >
                                                Cancel Recurring
                                            </Button>
                                            {isCancelRecurringModalOpen && (
                                                <ConfirmModal
                                                    title={`Chủ sỡ hữu sẽ được hoàn ${formatCurrency(
                                                        recurringBooking.price / 2
                                                    )} (50% booking price)! Bạn vẫn chắc muôn huỷ lịch cứng?`}
                                                    isOpen={isCancelRecurringModalOpen}
                                                    onClose={toggleCancelRecurringModalOpen}
                                                    onSubmit={() => handleCancelRecurring(booking.id)}
                                                ></ConfirmModal>
                                            )}
                                        </>
                                    ) : (
                                        <Button
                                            className={`btn ${styles.cancelButton}`}
                                            onClick={() => handleCancelBooking(booking)}
                                        >
                                            Cancel Booking 2
                                        </Button>
                                    )}
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan='9'>No bookings available.</td> {/* Update colSpan to match new column count */}
                        </tr>
                    )}
                </tbody>
            </table>
            {isModalOpen && (
                <ConfirmModal
                    title={
                        bookingToCancel.recurring
                            ? 'Đây là lịch cứng! Nếu huỷ lẻ booking này chủ sỡ hữu sẽ không được hoàn tiền! Bạn có chắc muốn huỷ?'
                            : 'Bạn có chắc muốn huỷ booking? Số tiền đặt sân sẽ được hoàn vào số dư cho chủ sỡ hữu!'
                    }
                    isOpen={isModalOpen}
                    onClose={toggleOpenModal}
                    onSubmit={handleCancelBookingSubmit}
                />
            )}
        </div>
    );
}

export default ManageBookings;
