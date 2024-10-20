import { Link, useLocation } from 'react-router-dom';
import styles from '../assets/css/Layouts/navBar.module.scss';
import { handleLocalStorage } from '../utils/handleLocalStorage';
import { toast } from 'react-toastify';
import { useCheckSignedIn } from '../customs/hooks';

function NavBar() {
    const location = useLocation();
    const [isSignedIn, setIsSignedIn] = useCheckSignedIn();

    const handleSignoutSubmit = () => {
        handleLocalStorage.clearToken();
        setIsSignedIn(false);
        toast.success('Log out successfully!');
    };

    return (
        <nav className={`navbar navbar-expand-lg bg-body-tertiary ${styles.navbarContainer}`}>
            <div className='container-fluid d-flex justify-content-between align-items-center'>
                {/* Left - Brand Logo and Icons */}
                <div className='d-flex align-items-center'>
                    <Link className={`navbar-brand ${styles.appNameBox} font-cera-round-pro-medium`} to='/'>
                        <img className='logo-icon' src='/logo.png' alt='logo' />
                        <span className={styles.appName}>Sport Center</span>
                    </Link>
                    <div className={`d-flex align-items-center ${styles.leftBox}`}>
                        <Link
                            className={`${styles.leftItemsBox} font-cera-round-pro-regular ${
                                location.pathname === '/course' ? styles.active : ''
                            }`}
                            to='/course'
                        >
                            <span className={styles.leftNavBarItems}>Courses</span>
                        </Link>
                        <Link
                            className={`${styles.leftItemsBox} font-cera-round-pro-regular ${
                                location.pathname === '/sport' ? styles.active : ''
                            }`}
                            to='/sport'
                        >
                            <span className={styles.leftNavBarItems}>Sports</span>
                        </Link>
                        <Link
                            className={`${styles.leftItemsBox} font-cera-round-pro-regular ${
                                location.pathname === '/tournament' ? styles.active : ''
                            }`}
                            to='/tournament'
                        >
                            <span className={styles.leftNavBarItems}>Tournaments</span>
                        </Link>
                    </div>
                </div>

                {/* Middle - Search Combo Box */}
                <div className={`d-flex align-items-center ${styles.middleInput}`}>
                    <div className={`input-group ${styles.inputGroup}`}>
                        <select className={`form-select ${styles.comboBox}`} aria-label='Select a sport'>
                            <option value='' disabled selected>
                                Select a sport...
                            </option>
                            <option value='football'>Football</option>
                            <option value='basketball'>Basketball</option>
                            <option value='tennis'>Tennis</option>
                            <option value='cricket'>Yoga</option>
                            <option value='all'>All sports</option>
                        </select>
                        <div className={`input-group-text ${styles.searchIcon}`}>
                            <i className='fa-regular fa-calendar' title='Check'></i>
                        </div>
                    </div>
                </div>

                {/* Right - Sign In, Sign Up, Sign Out */}
                <div className={`d-flex align-items-center ${styles.iconContainer}`}>
                    <div className={styles.signupButton}>
                        <Link className={`nav-link font-cera-round-pro-medium`} to='/sign-up'>
                            Sign up
                        </Link>
                    </div>
                    {isSignedIn ? (
                        <Link className={'nav-link font-cera-round-pro-medium'} onClick={handleSignoutSubmit} to='/'>
                            <i className='fas fa-arrow-right-from-bracket' style={{ fontSize: '20px' }}></i>
                        </Link>
                    ) : (
                        <Link className={`nav-link font-cera-round-pro-medium`} to='/sign-in'>
                            <i className={`far fa-circle-user ${styles.iconLogin}`}></i>
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
}

export default NavBar;
