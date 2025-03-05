import React, { useEffect, useState } from 'react';
import { Modal } from 'antd';
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

    const [sortCreatedAt, setSortCreatedAt] = useState('asc');
    const [sortUpdatedAt, setSortUpdatedAt] = useState('asc');

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

    const handleDelete = (id) => {
        Modal.confirm({
            title: 'Confirm Deletion',
            content: 'Are you sure you want to delete this notification?',
            okText: 'Yes, Delete',
            cancelText: 'Cancel',
            onOk: async () => {
                try {
                    await notificationApi.softDelete(id);
                    fetchNotifications();
                } catch (error) {
                    console.error('Delete failed:', error);
                }
            },
        });
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

    const handleSortCreatedAt = () => {
        setSortCreatedAt((prev) => (prev === 'asc' ? 'desc' : 'asc'));
        setSortUpdatedAt(null); // Không ảnh hưởng đến updatedAt
    };

    const handleSortUpdatedAt = () => {
        setSortUpdatedAt((prev) => (prev === 'asc' ? 'desc' : 'asc'));
        setSortCreatedAt(null); // Không ảnh hưởng đến createdAt
    };

    const sortedNotifications = [...notifications].sort((a, b) => {
        const dateA = new Date(a.createdAt);
        const dateB = new Date(b.createdAt);
        const updateA = new Date(a.updatedAt);
        const updateB = new Date(b.updatedAt);

        if (sortCreatedAt) {
            return sortCreatedAt === 'asc' ? dateA - dateB : dateB - dateA;
        }

        if (sortUpdatedAt) {
            return sortUpdatedAt === 'asc' ? updateA - updateB : updateB - updateA;
        }

        return 0;
    });

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
                        <span onClick={handleSortCreatedAt} className={styles.sortable}>
                            Created At{' '}
                            {sortCreatedAt === 'asc' ? (
                                <i className='fa-solid fa-arrow-up-short-wide ms-2'></i>
                            ) : (
                                <i className='fa-solid fa-arrow-down-short-wide ms-2'></i>
                            )}
                        </span>
                        <span onClick={handleSortUpdatedAt} className={styles.sortable}>
                            Updated At{' '}
                            {sortUpdatedAt === 'asc' ? (
                                <i className='fa-solid fa-arrow-up-short-wide ms-2'></i>
                            ) : (
                                <i className='fa-solid fa-arrow-down-short-wide ms-2'></i>
                            )}
                        </span>
                        <span>Actions</span>
                    </div>

                    <ul className={styles.list}>
                        {sortedNotifications.length > 0 ? (
                            sortedNotifications.map((noti) => (
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
