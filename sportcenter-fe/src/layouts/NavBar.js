import { Link, useLocation } from 'react-router-dom';
import styles from '../assets/css/Layouts/navBar.module.scss';
import { handleLocalStorage } from '../utils/handleLocalStorage';
import { toast } from 'react-toastify';

function NavBar() {
    const location = useLocation();
    const handleSignoutSubmit = () => {
        handleLocalStorage.clearToken();
        toast.success('Log out successfully!');
    };

    return (
        <nav className={`navbar navbar-expand-lg bg-body-tertiary ${styles.navbarContainer}`}>
            <div className='container-fluid d-flex justify-content-between align-items-center'>
                {/* Left - Brand Logo and Icons */}
                <div className='d-flex align-items-center'>
                    <Link className={`navbar-brand ${styles.brand} font-cera-round-pro-medium`} to='/'>
                        <img className='logo-icon' src='/logo.png' alt='logo' />
                        <span className={styles.appName}>Sport Center</span>
                    </Link>
                    <div className={`d-flex align-items-center ${styles.leftIcons}`}>
                        <span>chuc nang 1</span>
                        <span>chuc nang 2</span>
                        <span>chuc nang 3</span>
                    </div>
                </div>

                {/* Spacer to center-align */}
                <div className={styles.spacer}></div>

                {/* Right - Sign In, Sign Up, Sign Out */}
                <div className={`d-flex align-items-center ${styles.iconContainer}`}>
                    <Link
                        className={`nav-link font-cera-round-pro-medium ${
                            location.pathname === '/sign-up' ? styles.active : ''
                        }`}
                        to='/sign-up'
                    >
                        Sign up
                    </Link>
                    <Link
                        className={`nav-link font-cera-round-pro-medium ${
                            location.pathname === '/sign-in' ? styles.active : ''
                        }`}
                        to='/sign-in'
                    >
                        Sign in
                    </Link>
                    <Link className={'nav-link font-cera-round-pro-medium'} onClick={handleSignoutSubmit} to='/'>
                        Sign out
                    </Link>
                </div>
            </div>
        </nav>
    );
}

export default NavBar;
