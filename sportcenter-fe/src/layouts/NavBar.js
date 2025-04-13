/* eslint-disable no-unused-vars */
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

import styles from '../assets/css/Layouts/navBar.module.scss';
import { useCheckSignedIn } from '../customs/hooks';
import { useGetSports } from '../customs/hooks';
import sportApi from '../services/api/sport/sportApi';
import { connectWebSocket, disconnectWebSocket } from '../services/websocket/connect';
import notificationApi from '../services/api/notification/notificationApi';
import { useUser } from '../customs/hooks';
import userApi from '../services/api/user/userApi';

function NavBar() {
    const [sports, setSports] = useGetSports();
    const [selectedSport, setSelectedSport] = useState('');
    const location = useLocation();
    // eslint-disable-next-line no-unused-vars
    const [isSignedIn, setIsSignedIn] = useCheckSignedIn();
    const [user, setUser] = useUser();
    const [myNotifications, setMyNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0); // Số lượng notification chưa đọc

    useEffect(() => {
        fetchUserAndNotification();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isSignedIn]); // đăng nhập xong thì nó sẽ đc gọi lại

    const fetchUserAndNotification = async () => {
        try {
            // fetch current user
            const userResponse = await userApi.getCurrentUser();
            setUser(userResponse.data);

            // fetch notifications
            const response = await notificationApi.getAllByUserId(userResponse.data.id);
            const notifications = response.data;
            setMyNotifications(notifications);

            // count unred notifications
            const unreadNotifications = notifications.filter((noti) => !noti.read).length;
            setUnreadCount(unreadNotifications);
        } catch (err) {
            //console.error('Error fetching user:', err);
        }
    };

    // ws
    useEffect(() => {
        connectWebSocket(
            (updatedBooking) => {
                console.log('📢 Cập nhật booking mới:', updatedBooking);
            },
            (updatedNotification) => {
                console.log('🔔 Cập nhật notification mới:', updatedNotification);
                setUnreadCount((prevCount) => prevCount + 1);
            }
        );

        return () => {
            console.log('🔌 Ngắt kết nối WebSocket');
            disconnectWebSocket();
        };
    }, []);

    // khi click vao cai chuong thi đánh dấu tất cả là đã đọc
    const handleMarkAllAsRead = async () => {
        try {
            await notificationApi.setReadAll(user.id);
            setUnreadCount(0);
        } catch (error) {
            console.error('Lỗi khi cập nhật trạng thái đọc của thông báo:', error);
        }
    };

    const handleChangeSelect = (e) => {
        setSelectedSport(e.target.value);
    };

    const navigate = useNavigate();

    const handleSearch = () => {
        if (selectedSport) {
            navigate(`/sport/${selectedSport.toLowerCase()}`);
        }
    };

    useEffect(() => {
        getSports();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // lấy danh sách sports lưu vào context
    const getSports = async () => {
        try {
            const sportsResponse = await sportApi.getAllActive(0, 100);
            setSports(sportsResponse.data.content);
        } catch (err) {
            console.error(err);
        }
    };

    // console.log(selectedSport);
    // console.log(isSignedIn);

    return (
        <nav className={`navbar navbar-expand-lg bg-body-tertiary ${styles.navbarContainer}`}>
            <div className='container-fluid d-flex justify-content-between align-items-center'>
                {/* Left - Brand Logo and Icons */}
                <div className='d-flex align-items-center'>
                    <Link className={`navbar-brand ${styles.appNameBox} font-cera-round-pro-medium`} to='/'>
                        <img
                            className='logo-icon'
                            src='https://cdn-icons-png.flaticon.com/128/11908/11908387.png'
                            alt='logo'
                        />
                        <span className={styles.appName}>Sport Center</span>
                    </Link>
                    <div className={`d-flex align-items-center ${styles.leftBox}`}>
                        <Link
                            className={`${styles.leftItemsBox} font-cera-round-pro-regular ${
                                location.pathname === '/courses' ? styles.active : ''
                            }`}
                            to='/courses'
                        >
                            <span className={styles.leftNavBarItems}>Courses</span>
                        </Link>
                        <Link
                            className={`${styles.leftItemsBox} font-cera-round-pro-regular ${
                                location.pathname === '/bookings' ? styles.active : ''
                            }`}
                            to='/bookings'
                        >
                            <span className={styles.leftNavBarItems}>Bookings</span>
                        </Link>
                        <Link
                            className={`${styles.leftItemsBox} font-cera-round-pro-regular ${
                                location.pathname === '/tournaments' ? styles.active : ''
                            }`}
                            to='/tournaments'
                        >
                            <span className={styles.leftNavBarItems}>Tournaments</span>
                        </Link>
                    </div>
                </div>

                {/* Middle - Search Combo Box
                <form className={`d-flex align-items-center ${styles.middleInput}`}>
                    <div className={`input-group ${styles.inputGroup}`}>
                        <select
                            className={`form-select ${styles.comboBox}`}
                            aria-label='Select a sport'
                            value={selectedSport}
                            onChange={handleChangeSelect}
                        >
                            <option value='' disabled>
                                Select a sport...
                            </option>
                            {sports.map((sport, index) => (
                                <option key={index} value={sport.id}>
                                    {sport.sportName}
                                </option>
                            ))}
                        </select>
                        <div className={`input-group-text ${styles.searchIcon}`} onClick={handleSearch}>
                            <i className='fa-regular fa-calendar' title='Check'></i>
                        </div>
                    </div>
                </form> */}

                {/* Right - Sign In, Sign Up, Sign Out */}
                <div className={`d-flex align-items-center ${styles.iconContainer}`}>
                    <div className={styles.signupButton}>
                        <Link className={`nav-link font-cera-round-pro-medium`} to='/sign-up'>
                            Sign up
                        </Link>
                    </div>
                    {isSignedIn ? (
                        <Link className={'nav-link font-cera-round-pro-medium'} to='/profile'>
                            <i className='fa-solid fa-circle-user' style={{ fontSize: '32px' }}></i>
                        </Link>
                    ) : (
                        <Link className={`nav-link font-cera-round-pro-medium`} to='/sign-in'>
                            <i className={`fa-regular fa-circle-user ${styles.iconLogin}`}></i>
                        </Link>
                    )}

                    {/* notification */}
                    {isSignedIn && (
                        <Link
                            className='nav-link font-cera-round-pro-medium position-relative'
                            to='/notifications'
                            onClick={handleMarkAllAsRead}
                        >
                            <i className='fa-regular fa-bell' style={{ fontSize: '24px', marginRight: '15px' }}></i>
                            {unreadCount > 0 && <span className={styles.notificationBadge}>{unreadCount}</span>}
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
}

export default NavBar;
