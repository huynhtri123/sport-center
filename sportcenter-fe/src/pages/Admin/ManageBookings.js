/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import styles from '../../assets/css/Admin/manageBookings.module.scss';
import bookingApi from '../../services/api/booking/bookingApi';
import { Loading } from '../../components/Loading/Loading';
import ConfirmModal from '../../components/Modal/ConfirmModal';
import Button from '../../components/Button/Button';
import formatCurrency from '../../utils/formatCurrency';
import { connectWebSocket, disconnectWebSocket } from '../../services/websocket/connect';

function ManageBookings() {
    const [bookings, setBookings] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [canceledBookingIds, setCanceledBookingIds] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [bookingToCancel, setBookingToCancel] = useState(null); // Store the booking to be canceled
    const [recurringBooking, setRecurringBooking] = useState({});
    const [isCancelRecurringModalOpen, setIsCancelRecurringModalOpen] = useState(false);
    const [remainingAmout, setRemainingAmount] = useState(0);

    const [searchQuery, setSearchQuery] = useState(''); // State for the search query
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(5); // Set page size to 5
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    const toggleCancelRecurringModalOpen = async (bookingId) => {
        if (!isCancelRecurringModalOpen) {
            try {
                setIsLoading(true);
                const getRecurring = await bookingApi.getRecurringByBookingId(bookingId);
                setRecurringBooking(getRecurring.data);
                const remainingAmoutResponse = await bookingApi.getRemainingAmout(bookingId);
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

    const toggleOpenModal = () => {
        setIsModalOpen(!isModalOpen);
    };

    useEffect(() => {
        // Khi component mount, kết nối WebSocket
        connectWebSocket((updatedBooking) => {
            //console.log('📢 Cập nhật booking mới:', updatedBooking);
            fetchBookings();
        });

        // Cleanup khi component bị unmount (rời khỏi trang)
        return () => {
            console.log('🔌 Ngắt kết nối WebSocket');
            disconnectWebSocket(); // Ngắt kết nối WebSocket khi component unmount
        };
    }, []);

    const fetchBookings = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await bookingApi.searchByFieldName(searchQuery, currentPage, pageSize); // Sử dụng API tìm kiếm
            setBookings(response.data.content);
            setTotalPages(response.data.totalPages);
            setTotalElements(response.data.totalElements);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [currentPage, pageSize, searchQuery]);

    useEffect(() => {
        fetchBookings();
    }, [fetchBookings]);

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
        setCurrentPage(0); // Reset currentPage to 0 on new search
    };

    useEffect(() => {
        fetchBookings();
    }, [searchQuery, currentPage]);

    const handleCancelBooking = (booking) => {
        setBookingToCancel(booking);
        toggleOpenModal();
    };

    const handleCancelBookingSubmit = async () => {
        if (!bookingToCancel) return;

        try {
            setIsLoading(true);
            const cancelResponse = await bookingApi.cancelBooking(bookingToCancel.id);
            toast.info(cancelResponse.message);
            setCanceledBookingIds((prevIds) => [...prevIds, bookingToCancel.id]);
            setBookingToCancel(null);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
            setIsModalOpen(false);
            fetchBookings(); // Refresh bookings after cancellation
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

    // Filter bookings based on canceledBookingIds and searchQuery
    const filteredBookings = bookings.filter((booking) => {
        const matchesCancellation = !canceledBookingIds.includes(booking.id);
        const matchesSearch = booking.fieldResponse?.fieldName.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCancellation && matchesSearch;
    });

    useEffect(() => {
        if (filteredBookings.length === 0 && currentPage > 0) {
            setCurrentPage(0); // Reset to the first page if there are no results
        }
    }, [filteredBookings, currentPage]);

    // console.log('Original Bookings:', bookings);
    // console.log('Filtered Bookings:', filteredBookings);

    return (
        <div className={styles.manageBookingsContainer}>
            {isLoading && <Loading />}
            <div className={styles.searchContainer}>
                <input
                    type='text'
                    placeholder='Search by field name...'
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className={styles.searchInput}
                />
            </div>
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
                                <td>{index + 1 + currentPage * pageSize}</td>
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
                                <td className={styles.startTime}>{new Date(booking.bookingDate).toLocaleString()}</td>
                                <td>
                                    <div className={styles.timeRange}>
                                        <span className={styles.startTime}>
                                            {new Date(booking.startTime).toLocaleString()}
                                        </span>
                                        <span className={styles.timeSeparator}> - </span>
                                        <span className={styles.endTime}>
                                            {new Date(booking.endTime).toLocaleString()}
                                        </span>
                                    </div>
                                </td>
                                <td>{booking.numberOfHours}</td>
                                <td>{formatCurrency(booking.totalPrice)}</td>
                                <td>
                                    {booking.recurring ? (
                                        <>
                                            <Button
                                                className={`btn ${styles.cancelButtonRecurring}`}
                                                onClick={() => handleCancelBooking(booking)}
                                            >
                                                Single Cancel
                                            </Button>
                                            <Button
                                                className={`btn ${styles.cancelButtonRecurring}`}
                                                onClick={() => toggleCancelRecurringModalOpen(booking.id)}
                                            >
                                                Recurring Cancel
                                            </Button>
                                            {isCancelRecurringModalOpen && (
                                                <ConfirmModal
                                                    title={`The owner will be refunded ${formatCurrency(
                                                        remainingAmout / 2
                                                    )} (50% of the remaining booking amount)! Are you sure you want to cancel this fixed booking?`}
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
                                            Cancel Booking
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
                            ? 'This is a fixed schedule! If you cancel this booking, the owner will not receive a refund! Are you sure you want to cancel?'
                            : 'Are you sure you want to cancel the booking? The court booking fee will be refunded to the owner balance!'
                    }
                    isOpen={isModalOpen}
                    onClose={toggleOpenModal}
                    onSubmit={handleCancelBookingSubmit}
                />
            )}

            {/* Pagination controls */}
            <div className={styles.pagination}>
                <button disabled={currentPage === 0} onClick={() => setCurrentPage(currentPage - 1)}>
                    Previous
                </button>
                <span>{`Page ${currentPage + 1} of ${totalPages}`}</span>
                <button disabled={currentPage >= totalPages - 1} onClick={() => setCurrentPage(currentPage + 1)}>
                    Next
                </button>
            </div>
        </div>
    );
}

export default ManageBookings;
