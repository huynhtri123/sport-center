import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import Button from '../../../components/Button/Button';
import styles from '../../../assets/css/Profile/profile.module.scss';
import userApi from '../../../services/api/userApi';
import fileApi from '../../../services/api/fileApi';
import { formatDateToZoneDateTime } from '../../../utils/DateTimeConverter';
import { Loading } from '../../../components/Loading/Loading';

import MyBookings from './MyBookings';
import MyCart from './MyCart';
import MyPaymentInfo from './MyPaymentInfo';
import MyTournaments from './MyTournaments';

function Profile() {
    const [profile, setProfile] = useState({}); // để chứa data lấy từ api
    const [userInfo, setUserInfo] = useState({}); // để chứa data khi edit
    const [originalUserInfo, setOriginalUserInfo] = useState({}); // để khi bấm cancel thì trả về data cũ
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // show hoặc hide các thông tin khác
    const [showCart, setShowCart] = useState(false);
    const [showPaymentInfo, setShowPaymentInfo] = useState(false);
    const [showBookings, setShowBookings] = useState(false);
    const [showTournaments, setShowTournaments] = useState(false);
    // data states
    const [myBooking, setMyBookings] = useState([]);
    const [tournaments, setTournaments] = useState([]);
    // handles
    const handleToggleCart = () => setShowCart(!showCart);
    const handleTogglePaymentInfo = () => setShowPaymentInfo(!showPaymentInfo);
    const handleToggleBookings = async () => {
        setShowBookings(!showBookings);
        if (showBookings === false && profile?.id && myBooking.length === 0) {
            try {
                const myBookingResponse = await userApi.myBookings(profile.id);
                console.log(myBookingResponse);
                setMyBookings(myBookingResponse.data);
            } catch (err) {
                console.error(err);
            }
        }
    };
    const handleToggleTournaments = async () => {
        setShowTournaments(!showTournaments);
        if (showTournaments === false && profile?.id && tournaments.length === 0) {
            try {
                const tournamentsResponse = await userApi.myTournaments();
                console.log(tournamentsResponse);
                setTournaments(tournamentsResponse.data);
            } catch (err) {
                console.error(err);
            }
        }
    };

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

            <div className={styles.section}>
                <h3 onClick={handleToggleCart}>
                    <i className='fa-solid fa-bag-shopping'></i>
                    <span className='ms-3'>Cart</span>
                </h3>
                <p>View your cart items and proceed to checkout.</p>
                {showCart && <MyCart></MyCart>}
            </div>

            <div className={styles.section}>
                <h3 onClick={handleTogglePaymentInfo}>
                    <i className='fa-solid fa-money-check-dollar'></i>
                    <span className='ms-3'>Payment info</span>
                </h3>
                <p>Manage your saved payment methods.</p>
                {showPaymentInfo && <MyPaymentInfo></MyPaymentInfo>}
            </div>

            <div className={styles.section}>
                <h3 onClick={handleToggleBookings}>
                    <i className='fa-regular fa-calendar-days'></i>
                    <span className='ms-3'>Bookings</span>
                </h3>
                <p>Check your current bookings field.</p>
                {showBookings && <MyBookings bookings={myBooking}></MyBookings>}
            </div>

            <div className={styles.section}>
                <h3 onClick={handleToggleTournaments}>
                    <i className='fa-regular fa-calendar-days'></i>
                    <span className='ms-3'>Registered Tournaments And Events</span>
                </h3>
                <p>Check your upcoming sports events and tournaments.</p>
                {showTournaments && <MyTournaments tournaments={tournaments}></MyTournaments>}
            </div>
        </div>
    );
}

export default Profile;
