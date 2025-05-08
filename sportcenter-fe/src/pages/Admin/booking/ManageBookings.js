/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import styles from '../../../assets/css/Admin/manage/manageBookings.module.scss';
import bookingApi from '../../../services/api/booking/bookingApi';
import { Loading } from '../../../components/Loading/Loading';
import Button from '../../../components/Button/Button';
import formatCurrency from '../../../utils/formatCurrency';
import { connectWebSocket, disconnectWebSocket } from '../../../services/websocket/connect';
import PDFModal from '../../../components/Modal/PDFModal';

function ManageBookings() {
    const [bookings, setBookings] = useState([]);
    const [canceledBookingIds, setCanceledBookingIds] = useState([]);
    const [bookingToCancel, setBookingToCancel] = useState(null); // Store the booking to be canceled

    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCancelRecurringModalOpen, setIsCancelRecurringModalOpen] = useState(false);

    const [isPDFModalVisible, setIsPDFModalVisible] = useState(false);
    const [isRecurringCancel, setIsRecurringCancel] = useState(false);

    const showCancelConfirm = (booking) => {
        setBookingToCancel(booking);
        setIsRecurringCancel(false);
        setIsPDFModalVisible(true);
    };

    const showCancelRecurringConfirm = (booking) => {
        setBookingToCancel(booking);
        setIsRecurringCancel(true);
        setIsPDFModalVisible(true);
    };

    // State for the search query
    const [searchQuery, setSearchQuery] = useState('');
    const [searchQueryUserFullName, setSearchQueryUserFullName] = useState('');

    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(5); // Set page size to 5
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    const [sortOrder, setSortOrder] = useState('asc'); // Mặc định là tăng dần
    const [sortOrderTime, setSortOrderTime] = useState('asc'); // Mặc định sắp xếp tăng dần
    const handleSortByDate = () => {
        const newSortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
        setSortOrder(newSortOrder);

        const sortedBookings = [...bookings].sort((a, b) => {
            const dateA = new Date(a.bookingDate);
            const dateB = new Date(b.bookingDate);

            return newSortOrder === 'asc' ? dateA - dateB : dateB - dateA;
        });

        setBookings(sortedBookings);
    };
    const handleSortByTimeRange = () => {
        const newSortOrder = sortOrderTime === 'asc' ? 'desc' : 'asc';
        setSortOrderTime(newSortOrder);

        const sortedBookings = [...bookings].sort((a, b) => {
            const timeA = new Date(a.startTime);
            const timeB = new Date(b.startTime);

            return newSortOrder === 'asc' ? timeA - timeB : timeB - timeA;
        });

        setBookings(sortedBookings);
    };

    useEffect(() => {
        // Khi component mount, kết nối WebSocket
        connectWebSocket(
            (updatedBooking) => {
                // Xử lý cập nhật booking
                fetchBookings();
            },
            (newNotification) => {
                // Xử lý notification mới
                console.log('🔔 Notification mới nhận:', newNotification);
            }
        );

        // Cleanup khi component bị unmount (rời khỏi trang)
        return () => {
            console.log('🔌 Ngắt kết nối WebSocket');
            disconnectWebSocket(); // Ngắt kết nối WebSocket khi component unmount
        };
    }, []);

    const fetchBookings = useCallback(async () => {
        try {
            setIsLoading(true);
            let response;

            if (searchQueryUserFullName.trim() !== '') {
                response = await bookingApi.searchByUserName(searchQueryUserFullName, currentPage, pageSize);
            } else {
                response = await bookingApi.searchByFieldName(searchQuery, currentPage, pageSize);
            }

            setBookings(response.data.content);
            setTotalPages(response.data.totalPages);
            setTotalElements(response.data.totalElements);
        } catch (err) {
            console.error(err);
            toast.error('Failed to fetch bookings.');
        } finally {
            setIsLoading(false);
        }
    }, [currentPage, pageSize, searchQuery, searchQueryUserFullName]);

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
    const handleCancelRecurring = async () => {
        if (!bookingToCancel) return;
        try {
            setIsLoading(true);

            const cancelRecurringResponse = await bookingApi.cancelRecurring(bookingToCancel.id);
            console.log(cancelRecurringResponse);

            // Loại bỏ booking đã huỷ khỏi state `bookings`
            setBookings((prev) => prev.filter((b) => !cancelRecurringResponse.data.bookingIds.includes(b.id)));

            toast.success(cancelRecurringResponse.message);
        } catch (err) {
            console.log(err);
            toast.error('Failed to cancel recurring booking.' + err);
        } finally {
            setIsLoading(false);
            setIsCancelRecurringModalOpen(false);
        }
    };

    const handleSearchNameChange = (e) => {
        setSearchQueryUserFullName(e.target.value);
        setCurrentPage(0); // reset page về đầu
    };

    // Filter bookings based on canceledBookingIds and searchQuery
    const filteredBookings = bookings.filter((booking) => {
        const matchesCancellation = !canceledBookingIds.includes(booking.id);
        const matchesFieldName = booking.fieldResponse?.fieldName.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesUserFullName = booking.userFullName?.toLowerCase().includes(searchQueryUserFullName.toLowerCase());

        return matchesCancellation && matchesFieldName && matchesUserFullName;
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

            <PDFModal
                visible={isPDFModalVisible}
                onConfirm={() => {
                    isRecurringCancel ? handleCancelRecurring() : handleCancelBookingSubmit();
                    setIsPDFModalVisible(false);
                }}
                onCancel={() => setIsPDFModalVisible(false)}
            />

            <div className={styles.searchContainer}>
                <input
                    type='text'
                    placeholder='Search by field name...'
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className={styles.searchInput}
                />
                <input
                    type='text'
                    placeholder='Search by customer name...'
                    value={searchQueryUserFullName}
                    onChange={handleSearchNameChange}
                    className={styles.searchInput}
                />
            </div>

            <table className={`mt-4 ${styles.bookingsTable}`}>
                <thead>
                    <tr>
                        <th>Order</th>
                        <th>Booking ID</th>
                        <th>Field Name</th>
                        <th>Customer Info</th>
                        <th onClick={handleSortByDate} style={{ cursor: 'pointer' }}>
                            Booking Date{' '}
                            {sortOrder === 'asc' ? (
                                <i className='fa-solid fa-arrow-up-short-wide ms-2'></i>
                            ) : (
                                <i className='fa-solid fa-arrow-down-short-wide ms-2'></i>
                            )}
                        </th>
                        <th onClick={handleSortByTimeRange} style={{ cursor: 'pointer' }}>
                            Time Range{' '}
                            {sortOrderTime === 'asc' ? (
                                <i className='fa-solid fa-arrow-up-short-wide ms-2'></i>
                            ) : (
                                <i className='fa-solid fa-arrow-down-short-wide ms-2'></i>
                            )}
                        </th>
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
                                <td className={styles.startTime}>
                                    {new Date(booking.bookingDate).toLocaleString('vi-VN', { hour12: false })}
                                </td>
                                <td>
                                    <div className={styles.timeRange}>
                                        <span className={styles.startTime}>
                                            {new Date(booking.startTime).toLocaleString('vi-VN', { hour12: false })}
                                        </span>
                                        <span className={styles.timeSeparator}> - </span>
                                        <span className={styles.endTime}>
                                            {new Date(booking.endTime).toLocaleString('vi-VN', { hour12: false })}
                                        </span>
                                    </div>
                                </td>
                                <td>{booking.numberOfHours}</td>
                                <td>{formatCurrency(booking.totalPrice)}</td>
                                <td>
                                    <Button
                                        className={`btn ${styles.cancelButton}`}
                                        onClick={() => showCancelConfirm(booking)}
                                    >
                                        Cancel Booking
                                    </Button>
                                    {booking.recurring && (
                                        <Button
                                            className={`btn ${styles.cancelButtonRecurring}`}
                                            onClick={() => showCancelRecurringConfirm(booking)}
                                        >
                                            Cancel Recurring
                                        </Button>
                                    )}
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan='9'>No bookings available.</td>
                        </tr>
                    )}
                </tbody>
            </table>

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
