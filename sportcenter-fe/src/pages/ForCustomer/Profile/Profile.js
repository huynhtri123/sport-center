import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import Button from '../../../components/Button/Button';
import styles from '../../../assets/css/Profile/profile.module.scss';
import userApi from '../../../services/api/userApi';
import fileApi from '../../../services/api/fileApi';
import { formatDateToZoneDateTime } from '../../../utils/DateTimeConverter';
import { Loading } from '../../../components/Loading/Loading';

function Profile() {
    const [profile, setProfile] = useState({}); // để chứa data lấy từ api
    const [userInfo, setUserInfo] = useState({}); // để chứa data khi edit
    const [originalUserInfo, setOriginalUserInfo] = useState({}); // để khi bấm cancel thì trả về data cũ
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const getMyProfile = async () => {
        try {
            const profileResponse = await userApi.myProfile();
            setProfile(profileResponse.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        getMyProfile();
    }, []);

    useEffect(() => {
        if (Object.keys(profile).length > 0) {
            const profileData = {
                id: profile.id,
                fullName: profile.fullName,
                email: profile.email,
                phoneNumber: profile.phoneNumber,
                address: profile.address,
                dateOfBirth: profile.dateOfBirth,
                avatarUrl: profile.avatarUrl,
            };
            setUserInfo(profileData);
            setOriginalUserInfo(profileData); // Lưu lại thông tin gốc
        }
    }, [profile]);

    const handleNavigate = (path) => {
        navigate(path);
    };

    const handleEditToggle = () => {
        setIsEditing(!isEditing);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUserInfo((prevInfo) => ({
            ...prevInfo,
            [name]: value,
        }));
    };

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                setIsLoading(true);
                const response = await fileApi.uploadImage(file);
                setUserInfo((prevInfo) => ({
                    ...prevInfo,
                    avatarUrl: response.data.url,
                }));
            } catch (error) {
                console.error('Upload failed:', error);
            } finally {
                setIsLoading(false);
            }
        }
    };

    const updateProfile = async () => {
        try {
            setIsLoading(true);
            const userRequest = {
                ...userInfo,
                dateOfBirth: formatDateToZoneDateTime(userInfo.dateOfBirth),
            };
            const updateProfileResponse = await userApi.updateProfile(userRequest);
            toast.success(updateProfileResponse.message);
            getMyProfile();
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = () => {
        updateProfile();
        setIsEditing(false);
    };

    const handleCancel = () => {
        setUserInfo(originalUserInfo); // Khôi phục lại thông tin gốc
        setIsEditing(false);
    };

    return (
        <div className={styles.profileContainer}>
            {isLoading && <Loading></Loading>}

            <div className={styles.profileHeader}>
                <div className={styles.avatarContainer}>
                    <img src={userInfo.avatarUrl} alt='Avatar' className={styles.avatar} />
                    {isEditing && (
                        <label className={styles.uploadLabel}>
                            <input
                                type='file'
                                accept='image/*'
                                onChange={handleImageChange}
                                className={styles.fileInput}
                            />
                            Upload
                        </label>
                    )}
                </div>

                <div className={styles.userInfo}>
                    {isEditing ? (
                        <>
                            <input
                                type='text'
                                name='fullName'
                                value={userInfo.fullName}
                                onChange={handleChange}
                                className={styles.inputField}
                                placeholder='Full Name'
                            />
                            <input
                                type='email'
                                name='email'
                                value={userInfo.email}
                                onChange={handleChange}
                                className={styles.inputField}
                                placeholder='Email'
                                readOnly
                            />
                            <input
                                type='text'
                                name='phoneNumber'
                                value={userInfo.phoneNumber}
                                onChange={handleChange}
                                className={styles.inputField}
                                placeholder='Phone Number'
                            />
                            <input
                                type='text'
                                name='address'
                                value={userInfo.address}
                                onChange={handleChange}
                                className={styles.inputField}
                                placeholder='Address'
                            />
                            <input
                                type='date'
                                name='dateOfBirth'
                                value={userInfo.dateOfBirth.split('T')[0]}
                                onChange={handleChange}
                                className={styles.inputField}
                            />
                            <div className={styles.buttonGroup}>
                                <Button onClick={handleSave} className={styles.editButton}>
                                    Save
                                </Button>
                                <Button onClick={handleCancel} className={styles.cancelButton}>
                                    Cancel
                                </Button>
                            </div>
                        </>
                    ) : (
                        <>
                            <h2>{userInfo.fullName}</h2>
                            <p>Email: {userInfo.email}</p>
                            <p>Phone: {userInfo.phoneNumber}</p>
                            <p>Address: {userInfo.address}</p>
                            <p>Date of Birth: {new Date(userInfo.dateOfBirth).toLocaleDateString()}</p>
                            <Button onClick={handleEditToggle} className={styles.editButton}>
                                Edit
                            </Button>
                        </>
                    )}
                </div>
            </div>

            <div className={styles.section} onClick={() => handleNavigate('/cart-details')}>
                <h3>
                    <i class='fa-solid fa-bag-shopping'></i>
                    <span className='ms-3'>Cart</span>
                </h3>
                <p>View your cart items and proceed to checkout.</p>
            </div>

            <div className={styles.section} onClick={() => handleNavigate('/payment-info')}>
                <h3>
                    <i class='fa-solid fa-money-check-dollar'></i>
                    <span className='ms-3'>Payment info</span>
                </h3>
                <p>Manage your saved payment methods.</p>
            </div>

            <div className={styles.section} onClick={() => handleNavigate('/bookings')}>
                <h3>
                    <i class='fa-regular fa-calendar-days'></i>
                    <span className='ms-3'>Bookings</span>
                </h3>
                <p>Check your upcoming sports events and classes.</p>
            </div>
        </div>
    );
}

export default Profile;
