/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { Modal } from 'antd';
import notificationApi from '../../../services/api/notification/notificationApi';
import styles from '../../../assets/css/admin/notification/notificationList.module.scss';
import { Loading } from '../../../components/loadings/Loading';
import { defaultIcon } from '../../../utils/defaultIcon';
import fileApi from '../../../services/api/file/fileApi';

export default function NotificationList({ refresh }) {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [page, setPage] = useState(0);
    const [size] = useState(3);
    const [totalPages, setTotalPages] = useState(1);
    const [editMode, setEditMode] = useState(null);
    const [editData, setEditData] = useState({ title: '', content: '' });
    const [sortCreatedAt, setSortCreatedAt] = useState('desc');
    const [sortUpdatedAt, setSortUpdatedAt] = useState('desc');
    const [imageFile, setImageFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (searchTerm.trim() === '') {
            fetchNotifications();
        } else {
            searchNotifications();
        }
    }, [page, refresh, searchTerm]);

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

    const searchNotifications = async () => {
        // setLoading(true);
        try {
            const response = await notificationApi.searchByTitle(searchTerm, page, size);
            setNotifications(response.data.content || []);
            setTotalPages(response.totalPages || 1);
        } catch (error) {
            console.error('Search failed:', error);
        }
        // setLoading(false);
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setPage(0); // Reset về trang đầu khi thực hiện tìm kiếm
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
        setEditData({ title: noti.title, content: noti.content, imageUrl: noti.imageUrl });
        setImageFile(null);
        setPreviewUrl(noti.imageUrl || defaultIcon);
    };

    const handleChangeImageFile = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleUpdate = async () => {
        try {
            setIsLoading(true);
            let updatedData = { ...editData };

            if (imageFile) {
                const response = await fileApi.uploadImage(imageFile);
                updatedData.imageUrl = response.data.url;
            }

            await notificationApi.update(editMode, updatedData);
            setEditMode(null);
            fetchNotifications();
        } catch (error) {
            console.error('Update failed:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSortCreatedAt = () => {
        setSortCreatedAt((prev) => (prev === 'asc' ? 'desc' : 'asc'));
        setSortUpdatedAt(null);
    };

    const handleSortUpdatedAt = () => {
        setSortUpdatedAt((prev) => (prev === 'asc' ? 'desc' : 'asc'));
        setSortCreatedAt(null);
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
            {isLoading && <Loading></Loading>}
            <h2 className={styles.title}>All Notifications</h2>
            <div className={styles.searchWrapper}>
                <input
                    type='text'
                    placeholder='Search by title...'
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className={styles.searchInput}
                />
            </div>
            {loading ? (
                <Loading></Loading>
            ) : (
                <>
                    <ul className={styles.list}>
                        <div className={styles.listHeader}>
                            <span className={styles.headerItem}>Title</span>
                            <span className={styles.headerItem}>Content</span>
                            <span className={styles.headerItem}>Image</span>
                            <span
                                className={styles.headerItem}
                                onClick={handleSortCreatedAt}
                                style={{ cursor: 'pointer' }}
                            >
                                Created At{' '}
                                <i
                                    className={
                                        sortCreatedAt === 'asc'
                                            ? 'fa-solid fa-sort-up'
                                            : sortCreatedAt === 'desc'
                                            ? 'fa-solid fa-sort-down'
                                            : 'fa-solid fa-sort'
                                    }
                                ></i>
                            </span>

                            <span
                                className={styles.headerItem}
                                onClick={handleSortUpdatedAt}
                                style={{ cursor: 'pointer' }}
                            >
                                Updated At{' '}
                                <i
                                    className={
                                        sortUpdatedAt === 'asc'
                                            ? 'fa-solid fa-sort-up'
                                            : sortUpdatedAt === 'desc'
                                            ? 'fa-solid fa-sort-down'
                                            : 'fa-solid fa-sort'
                                    }
                                ></i>
                            </span>

                            <span className={styles.headerItem}>Actions</span>
                        </div>

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
                                            <span>
                                                <input
                                                    type='file'
                                                    accept='image/*'
                                                    onChange={handleChangeImageFile}
                                                    className={styles.imageInput}
                                                />
                                                {previewUrl && (
                                                    <div className={styles.preview}>
                                                        <img
                                                            src={previewUrl}
                                                            alt='Preview'
                                                            className={styles.imagePreview}
                                                        />
                                                    </div>
                                                )}
                                            </span>
                                            <span></span>
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
                                            <span>
                                                {noti.imageUrl ? (
                                                    <img
                                                        src={noti.imageUrl}
                                                        alt='Notification'
                                                        className={styles.imagePreview}
                                                    />
                                                ) : (
                                                    <span className={styles.emptyImage}></span>
                                                )}
                                            </span>
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
