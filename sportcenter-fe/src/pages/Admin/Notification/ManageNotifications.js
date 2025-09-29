import React, { useState } from 'react';
import notificationApi from '../../../services/api/notification/notificationApi';
import fileApi from '../../../services/api/file/fileApi';
import styles from '../../../assets/css/Admin/manage/manageNotifications.module.scss';
import { Loading } from '../../../components/Loading/Loading';
import { toast } from 'react-toastify';
import NotificationList from './NotificationList';
import { defaultIcon } from '../../../utils/defaultIcon';

export default function ManageNotifications() {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [imageFile, setImageFile] = useState(null); // ảnh chưa upload
    const [previewUrl, setPreviewUrl] = useState(defaultIcon); // hiển thị tạm
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

        let imageUrl = '';

        try {
            if (imageFile) {
                const response = await fileApi.uploadImage(imageFile);
                imageUrl = response.data.url;
            }

            const request = { title, content, imageUrl };
            const response = await notificationApi.create(request);
            toast.success(response.message);
            setTitle('');
            setContent('');
            setImageFile(null);
            setPreviewUrl(defaultIcon);
            setRefresh((prev) => !prev);
        } catch (error) {
            setMessage('❌ Failed to send notification. Please try again!');
            console.error(error);
        }

        setLoading(false);
    };

    const handleChangeImageFile = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setPreviewUrl(URL.createObjectURL(file)); // chỉ hiển thị, chưa upload
        }
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

                <div className={styles.formGroup}>
                    <label htmlFor='image'>Image:</label>
                    <input
                        type='file'
                        id='image'
                        accept='image/*'
                        onChange={handleChangeImageFile}
                    />
                    {previewUrl && previewUrl !== defaultIcon && (
                        <div className={styles.preview}>
                            <img src={previewUrl} alt='Preview' height={120} />
                        </div>
                    )}
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
