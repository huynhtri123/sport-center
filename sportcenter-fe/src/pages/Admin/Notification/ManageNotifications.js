import React, { useState } from 'react';
import notificationApi from '../../../services/api/notification/notificationApi';
import styles from '../../../assets/css/Admin/manageNotifications.module.scss';
import { Loading } from '../../../components/Loading/Loading';
import { toast } from 'react-toastify';
import NotificationList from './NotificationList';

export default function ManageNotifications() {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [refresh, setRefresh] = useState(false);

    const handleAddNotification = async () => {
        if (!title || !content) {
            setMessage('Please enter all required fields!');
            return;
        }

        setLoading(true);
        setMessage('');

        try {
            const request = { title, content };
            const response = await notificationApi.create(request);
            toast.success(response.message);
            setTitle('');
            setContent('');
            setRefresh((prev) => !prev);
        } catch (error) {
            setMessage('❌ Failed to send notification. Please try again!');
            console.error(error);
        }

        setLoading(false);
    };

    return (
        <div>
            <div className={styles.container}>
                {loading && <Loading />}
                <h2 className={styles.title}>Create New Notification</h2>
                {message && <p className={styles.message}>{message}</p>}

                <div className={styles.formGroup}>
                    <label htmlFor='title'>Title:</label>
                    <input
                        type='text'
                        id='title'
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder='Enter notification title...'
                    />
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor='content'>Content:</label>
                    <textarea
                        id='content'
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder='Enter notification content...'
                    />
                </div>

                <button onClick={handleAddNotification} disabled={loading} className={styles.submitButton}>
                    {loading ? 'Sending...' : 'Send Notification'}
                </button>
            </div>

            <div>
                <NotificationList refresh={refresh} />
            </div>
        </div>
    );
}
