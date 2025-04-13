/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react';
import notificationApi from '../../../services/api/notification/notificationApi';
import styles from '../../../assets/css/Notification/Notification.module.scss';
import { useUser } from '../../../customs/hooks';
import { connectWebSocket, disconnectWebSocket } from '../../../services/websocket/connect';

function Notification() {
    const [notifications, setNotifications] = useState([]);
    const [user] = useUser();
    const [searchTerm, setSearchTerm] = useState('');

    // ws
    useEffect(() => {
        connectWebSocket(
            (updatedBooking) => {
                console.log('📢 Cập nhật booking mới:', updatedBooking);
            },
            (updatedNotification) => {
                console.log('🔔 Cập nhật notification mới:', updatedNotification);
                if (user.id) {
                    fetchNotifications(currentPage);
                }
            }
        );

        return () => {
            console.log('🔌 Ngắt kết nối WebSocket');
            disconnectWebSocket();
        };
    }, []);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const pageSize = 3; // Số thông báo hiển thị mỗi trang

    useEffect(() => {
        if (user.id) {
            fetchNotifications(currentPage);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, currentPage]);

    const fetchNotifications = async (page) => {
        try {
            const response = await notificationApi.getNotificationsForUser(
                user.id,
                page,
                pageSize,
                'createdAt',
                'desc'
            );

            const filtered = response.data.content.filter((notification) =>
                notification.title.toLowerCase().includes(searchTerm.toLowerCase())
            );

            setNotifications(filtered);
            setTotalPages(response.data.totalPages);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    useEffect(() => {
        if (user.id) {
            fetchNotifications(currentPage);
        }
    }, [searchTerm]);

    const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage < totalPages) {
            setCurrentPage(newPage);
        }
    };

    return (
        <div className={styles.notificationContainer}>
            <div className={styles.headerRow}>
                <h2 className={styles.title}>
                    Notifications{' '}
                    <span className='ms-2'>
                        <i className='fa fa-volume-up'></i>
                    </span>
                </h2>
                <input
                    type='text'
                    placeholder='Search by title...'
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={styles.searchInput}
                />
            </div>

            <ul className={styles.notificationList}>
                {notifications.length === 0 ? (
                    <p className={styles.noNotification}>No notifications available.</p>
                ) : (
                    notifications.map((notification) => (
                        <li key={notification.id} className={styles.notificationItem}>
                            <div className={styles.notificationContent}>
                                <h3>{notification.title}</h3>
                                <p>{notification.content}</p>
                            </div>
                            <span className={styles.date}>
                                {new Date(notification.createdAt).toLocaleString('vi-VN', { hour12: false })}
                            </span>
                        </li>
                    ))
                )}
            </ul>

            {/* Pagination Controls */}
            <div className={styles.pagination}>
                <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 0}>
                    ◀ Prev
                </button>
                <span>
                    Page {currentPage + 1} of {totalPages}
                </span>
                <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages - 1}>
                    Next ▶
                </button>
            </div>
        </div>
    );
}

export default Notification;
