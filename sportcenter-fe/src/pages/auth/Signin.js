import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { toast } from 'react-toastify';

import styles from '../../assets/css/auth/signin.module.scss';
import authApi from '../../services/api/auth/authApi';
import { handleLocalStorage } from '../../utils/handleLocalStorage';
import { useCheckSignedIn } from '../../customs/hooks';
import { Role } from '../../utils/enums/Role';

function Signin() {
    const [showPassword, setShowPassword] = useState(false);

    const togglePasswordVisibility = () => {
        setShowPassword((prevState) => !prevState);
    };
    const [signinRequest, setSigninRequest] = useState({
        email: '',
        password: '',
    });

    // eslint-disable-next-line no-unused-vars
    const [isSignedIn, setIsSignedIn] = useCheckSignedIn();
    // console.log(isSignedIn);

    const handleChangeInput = (e) => {
        setSigninRequest((prevState) => {
            const newState = {
                ...prevState,
                [e.target.name]: e.target.value,
            };
            return newState;
        });
    };

    const navigate = useNavigate();

    // khi đăng nhập sai thông tin thì dùng cái này để css
    const [failed, setFailed] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const siginResponse = await authApi.signin(signinRequest);
            // Xóa thông tin cũ trước khi lưu thông tin mới (xoá cho chắc thôi chứ signout xoá rồi)
            handleLocalStorage.clearToken();
            const { email, role } = siginResponse.data;
            handleLocalStorage.setToken(email, role);

            toast.success(siginResponse.message);
            setFailed(false);
            setIsSignedIn(true);

            // chuyển hướng
            const currentRole = handleLocalStorage.getCurrentRole();
            if (currentRole === Role.ADMIN) {
                navigate('/admin');
            } else {
                navigate('/');
            }
        } catch (error) {
            // Thông báo đã được cài trong axiosClient rồi nên ở đây khỏi
            console.error('Login failed:', error);
            setFailed(true);
        }
    };

    return (
        <div className={styles.authContainer}>
            <form onSubmit={handleSubmit} className={styles.signinBox}>
                <div className={styles.titleGroup}>
                    <span className={styles.titleWelcome}>
                        Welcome Back <i className='fa-solid fa-face-laugh'></i>
                    </span>
                    <span className={styles.titleMain}>Sign In to Your Account</span>
                </div>

                <div className={`${styles.inputGroup}`}>
                    <div className={`${styles.inputBox} ${failed ? styles.failed : ''}`}>
                        <label htmlFor='email' className={styles.label}>
                            Email Address
                        </label>
                        <input
                            id='email'
                            type='email'
                            placeholder='e.g. user001@gmail.com'
                            name='email'
                            value={signinRequest.email}
                            onChange={handleChangeInput}
                            required
                            className={styles.input}
                        />
                    </div>

                    <div className={`${styles.inputBox} ${failed ? styles.failed : ''}`}>
                        <label htmlFor='password' className={styles.label}>
                            Password{' '}
                            <span onClick={togglePasswordVisibility} className={styles.iconShowHide}>
                                {showPassword ? (
                                    <i className='fa-regular fa-eye' title='Hide password?'></i>
                                ) : (
                                    <i className='fa-regular fa-eye-slash' title='Show password?'></i>
                                )}
                            </span>
                        </label>
                        <input
                            id='password'
                            type={showPassword ? 'text' : 'password'}
                            placeholder='Enter your password...'
                            name='password'
                            value={signinRequest.password}
                            onChange={handleChangeInput}
                            required
                            className={styles.input}
                        />
                    </div>

                    <div className={styles.forgotPassword}>
                        <Link to='/forgot-password'>Forgot your password?</Link>
                    </div>
                </div>

                <button type='submit' className={styles.submitBtn}>
                    Sign in <i className='fas fa-sign-in-alt'></i>
                </button>

                <div className={styles.registerText}>
                    New here?
                    <Link to='/sign-up' className={styles.link}>
                        Create your account now
                    </Link>
                </div>
            </form>
        </div>
    );
}

export default Signin;
