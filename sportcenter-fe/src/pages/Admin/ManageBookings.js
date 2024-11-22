import React, { useEffect, useState, useCallback } from 'react';
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
    const [bookingToCancel, setBookingToCancel] = useState(null);
    const [searchQuery, setSearchQuery] = useState(''); // State for the search query

    // Pagination state
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(5); // Set page size to 5
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    const toggleOpenModal = () => {
        setIsModalOpen(!isModalOpen);
    };

    const fetchBookings = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await bookingApi.getAllActive(currentPage, pageSize);
            setBookings(response.data.content);
            setTotalPages(response.data.totalPages);
            setTotalElements(response.data.totalElements);
        } catch (err) {
            console.error(err);
            toast.error('Failed to fetch bookings.');
        } finally {
            setIsLoading(false);
        }
    }, [currentPage, pageSize]);

    useEffect(() => {
        fetchBookings();
    }, [fetchBookings]);

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

    // Filter bookings based on canceledBookingIds and searchQuery
    const filteredBookings = bookings.filter((booking) => {
        const matchesCancellation = !canceledBookingIds.includes(booking.id);
        const matchesSearch = booking.fieldResponse?.fieldName.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCancellation && matchesSearch;
    });

    return (
        <div className={styles.manageBookingsContainer}>
            {isLoading && <Loading />}
            <div className={styles.searchContainer}>
                <input
                    type="text"
                    placeholder="Search by field name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={styles.searchInput}
                />
            </div>
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
                                <td>{index + 1 + currentPage * pageSize}</td>
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

            {/* Pagination controls */}
            <div className={styles.pagination}>
                <button
                    disabled={currentPage === 0}
                    onClick={() => setCurrentPage(currentPage - 1)}
                >
                    Previous
                </button>
                <span>{`Page ${currentPage + 1} of ${totalPages}`}</span>
                <button
                    disabled={currentPage >= totalPages - 1}
                    onClick={() => setCurrentPage(currentPage + 1)}
                >
                    Next
                </button>
            </div>
        </div>
    );
}

export default ManageBookings;