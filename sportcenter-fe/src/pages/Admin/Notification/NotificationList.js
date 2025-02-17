import React, { useEffect, useState } from 'react';
import notificationApi from '../../../services/api/notification/notificationApi';
import styles from '../../../assets/css/Admin/notificationList.module.scss';

export default function NotificationList({ refresh }) {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(0);
    const [size] = useState(5);
    const [totalPages, setTotalPages] = useState(1);
    const [editMode, setEditMode] = useState(null);
    const [editData, setEditData] = useState({ title: '', content: '' });

    useEffect(() => {
        fetchNotifications();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, refresh]);

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const response = await notificationApi.getAllActive(page, size);
            setNotifications(response.data || []);
            setTotalPages(response.totalPages || 1);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        }
        setLoading(false);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this notification?')) return;
        try {
            await notificationApi.softDelete(id);
            fetchNotifications();
        } catch (error) {
            console.error('Delete failed:', error);
        }
    };

    const handleEdit = (noti) => {
        setEditMode(noti.id);
        setEditData({ title: noti.title, content: noti.content });
    };

    const handleUpdate = async () => {
        try {
            await notificationApi.update(editMode, editData);
            setEditMode(null);
            fetchNotifications();
        } catch (error) {
            console.error('Update failed:', error);
        }
    };

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>All Notifications</h2>

            {loading ? (
                <p className={styles.loading}>Loading...</p>
            ) : (
                <>
                    <div className={styles.headerRow}>
                        <span>Title</span>
                        <span>Content</span>
                        <span>Created At</span>
                        <span>Updated At</span>
                        <span>Actions</span>
                    </div>

                    <ul className={styles.list}>
                        {notifications.length > 0 ? (
                            notifications.map((noti) => (
                                <li key={noti.id} className={styles.itemRow}>
                                    {editMode === noti.id ? (
                                        <>
                                            <input
                                                type='text'
                                                value={editData.title}
                                                onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                                                className={styles.input}
                                                placeholder='Title...'
                                            />
                                            <textarea
                                                value={editData.content}
                                                onChange={(e) => setEditData({ ...editData, content: e.target.value })}
                                                className={styles.textarea}
                                                placeholder='Content...'
                                            />

                                            <button className={styles.saveButton} onClick={handleUpdate}>
                                                Save
                                            </button>
                                            <button className={styles.cancelButton} onClick={() => setEditMode(null)}>
                                                Cancel
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <span className={styles.dataTitle}>{noti.title}</span>
                                            <span className={styles.dataContent}>{noti.content}</span>
                                            <span className={styles.dataDate}>
                                                {new Date(noti.createdAt).toLocaleString('vi-VN', { hour12: false })}
                                            </span>
                                            <span className={styles.dataDate}>
                                                {new Date(noti.updatedAt).toLocaleString('vi-VN', { hour12: false })}
                                            </span>
                                            <div className={styles.actions}>
                                                <button className={styles.editButton} onClick={() => handleEdit(noti)}>
                                                    Edit
                                                </button>
                                                <button
                                                    className={styles.deleteButton}
                                                    onClick={() => handleDelete(noti.id)}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </li>
                            ))
                        ) : (
                            <p className={styles.noData}>No notifications available</p>
                        )}
                    </ul>

                    <div className={styles.pagination}>
                        <button onClick={() => setPage((prev) => Math.max(prev - 1, 0))} disabled={page === 0}>
                            Previous
                        </button>
                        <span>
                            Page {page + 1} / {totalPages}
                        </span>
                        <button
                            onClick={() => setPage((prev) => (prev + 1 < totalPages ? prev + 1 : prev))}
                            disabled={page + 1 >= totalPages}
                        >
                            Next
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
