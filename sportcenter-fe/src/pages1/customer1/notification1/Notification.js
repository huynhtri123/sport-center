/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState, useCallback } from 'react';
import notificationApi from '../../../services/api/notification/notificationApi';
import styles from '../../../assets/css/notification/notification.module.scss';
import { useUser } from '../../../customs/hooks';
import { connectWebSocket, disconnectWebSocket } from '../../../services/websocket/connect';

function Notification() {
    const [notifications, setNotifications] = useState([]);
    const [user] = useUser();
    const [searchTerm, setSearchTerm] = useState('');

    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const pageSize = 4;

    const [selectedNotification, setSelectedNotification] = useState(null);

    // Fetch API theo user + page + searchTerm
    const fetchNotifications = useCallback(async () => {
        if (!user.id) return;
        try {
            const response = await notificationApi.searchByTitle(searchTerm, currentPage, pageSize);
            setNotifications(response.data.content);
            setTotalPages(response.data.totalPages);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    }, [user.id, searchTerm, currentPage, pageSize]);

    // Gọi API khi searchTerm hoặc currentPage thay đổi
    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    // WebSocket: khi có notification mới thì reload lại
    useEffect(() => {
        connectWebSocket(
            (updatedBooking) => {
                console.log('📢 Cập nhật booking mới:', updatedBooking);
            },
            (updatedNotification) => {
                console.log('🔔 Cập nhật notification mới:', updatedNotification);
                fetchNotifications();
            }
        );
        return () => {
            disconnectWebSocket();
        };
    }, [fetchNotifications]);

    const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage < totalPages) {
            setCurrentPage(newPage);
        }
    };

    const closeModal = () => setSelectedNotification(null);

    return (
        <div className={styles.notificationContainer}>
            <div className={styles.headerRow}>
                <h2 className={styles.title}>
                    Notifications{' '}
                    <img
                        src='https://cdn-icons-png.flaticon.com/128/4205/4205999.png'
                        alt='ic loa'
                        className={styles.iconLoa}
                    />
                </h2>
                <input
                    type='text'
                    placeholder='Search by title...'
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(0);
                    }}
                    className={styles.searchInput}
                />
            </div>

            {notifications.length === 0 ? (
                <p className={styles.noNotification}>No notifications available.</p>
            ) : (
                <div className={styles.gridContainer}>
                    {notifications.map((notification) => (
                        <div key={notification.id} className={styles.notificationCard}>
                            {notification.imageUrl && (
                                <img
                                    src={notification.imageUrl}
                                    alt={notification.title}
                                    className={styles.notificationImage}
                                    onClick={() => setSelectedNotification(notification)}
                                />
                            )}
                            <div className={styles.notificationContent}>
                                <h3>{notification.title}</h3>
                                <p>{notification.content}</p>
                                <span className={styles.date}>
                                    {new Date(notification.createdAt).toLocaleString('vi-VN', { hour12: false })}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

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

            {selectedNotification && (
                <div className={styles.modal} onClick={closeModal}>
                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        {selectedNotification.imageUrl && (
                            <img
                                src={selectedNotification.imageUrl}
                                alt='Notification'
                                className={styles.enlargedImage}
                            />
                        )}
                        <h3 className={styles.modalTitle}>{selectedNotification.title}</h3>
                        <p className={styles.modalContentText}>{selectedNotification.content}</p>
                        <span className={styles.modalDate}>
                            {new Date(selectedNotification.createdAt).toLocaleString('vi-VN', { hour12: false })}
                        </span>
                        <button className={styles.closeButton} onClick={closeModal}>
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Notification;
