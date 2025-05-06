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

    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const pageSize = 4;

    const [selectedImage, setSelectedImage] = useState(null);

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
            disconnectWebSocket();
        };
    }, []);

    useEffect(() => {
        if (user.id) {
            fetchNotifications(currentPage);
        }
    }, [user, currentPage]);

    useEffect(() => {
        if (user.id) {
            fetchNotifications(currentPage);
        }
    }, [searchTerm]);

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

    const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage < totalPages) {
            setCurrentPage(newPage);
        }
    };

    const filteredNotifications = notifications.filter((notification) =>
        notification.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const closeModal = () => setSelectedImage(null);

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
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={styles.searchInput}
                />
            </div>

            {filteredNotifications.length === 0 ? (
                <p className={styles.noNotification}>No notifications available.</p>
            ) : (
                <div className={styles.gridContainer}>
                    {filteredNotifications.map((notification) => (
                        <div key={notification.id} className={styles.notificationCard}>
                            {notification.imageUrl && (
                                <img
                                    src={notification.imageUrl}
                                    alt={notification.title}
                                    className={styles.notificationImage}
                                    onClick={() => setSelectedImage(notification.imageUrl)}
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

            {selectedImage && (
                <div className={styles.modal} onClick={closeModal}>
                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <img src={selectedImage} alt='Enlarged' className={styles.enlargedImage} />
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
