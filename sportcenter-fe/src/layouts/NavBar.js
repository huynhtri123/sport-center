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
        <nav className={`navbar navbar-expand-lg bg-body-tertiary`}>
            <div className='container-fluid'>
                <Link className={`navbar-brand ${location.pathname === '/' ? styles.active : ''}`} to='/'>
                    Home
                </Link>
                <button
                    className='navbar-toggler'
                    type='button'
                    data-bs-toggle='collapse'
                    data-bs-target='#navbarSupportedContent'
                    aria-controls='navbarSupportedContent'
                    aria-expanded='false'
                    aria-label='Toggle navigation'
                >
                    <span className='navbar-toggler-icon'></span>
                </button>
                <div className='collapse navbar-collapse' id='navbarSupportedContent'>
                    <ul className='navbar-nav me-auto mb-2 mb-lg-0'>
                        <li className='nav-item'>
                            <Link
                                className={`nav-link ${location.pathname === '/sign-up' ? styles.active : ''}`}
                                to='/sign-up'
                            >
                                Sign up
                            </Link>
                        </li>

                        <li className='nav-item'>
                            <Link
                                className={`nav-link ${location.pathname === '/sign-in' ? styles.active : ''}`}
                                to='/sign-in'
                            >
                                Sign in
                            </Link>
                        </li>

                        <li className='nav-item'>
                            <Link
                                className={`nav-link ${location.pathname === '/' ? styles.active : ''}`}
                                onClick={handleSignoutSubmit}
                                to='/'
                            >
                                Sign out
                            </Link>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
}

export default NavBar;
