import styles from '../../assets/css/Auth/forgotPw.module.scss';
import { useState } from 'react';
import { Link } from 'react-router-dom';

import RenewPasswordModal from '../../components/Modal/RenewPasswordModal';
import authApi from '../../services/api/auth/authApi';
import { Loading } from '../../components/Loading/Loading';

function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [errors, setErrors] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [getVerifyResponse, setGetVerifyResponse] = useState({});

    const handleChangeInput = (e) => {
        setEmail(e.target.value);
    };

    const toggleOpenModal = () => {
        setIsModalOpen(!isModalOpen);
    };

    const validateEmail = (email) => {
        // Kiểm tra xem email có trống không và có đúng định dạng không
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email) {
            return 'Email is required';
        } else if (!emailRegex.test(email)) {
            return 'Invalid email format';
        }
        return '';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate email
        const emailError = validateEmail(email);
        if (emailError) {
            setErrors(emailError);
            return;
        }

        // Nếu không có lỗi, goi api va mở modal
        try {
            setIsLoading(true);
            const response = await authApi.getVerify({ email: email });
            setGetVerifyResponse(response);
            //toast.success(response.message);
            setIsModalOpen(true);
        } catch (err) {
            if (err.response && err.response.data) {
                setErrors(err.response.data.message);
            } else {
                setErrors('An unexpected error occurred. Please try again.');
            }
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.authContainer}>
            {isLoading && <Loading />}

            <div className={styles.forgotPasswordBox}>
                <div className={styles.titleGroup}>
                    <h3 className={styles.titleMain}>Forgot Your Password?</h3>
                </div>

                <div className={styles.inputGroup}>
                    <div className={styles.inputBox}>
                        <label htmlFor='email' className={styles.label}>
                            Email Address
                        </label>
                        <input
                            id='email'
                            type='email'
                            placeholder='e.g. user001@gmail.com'
                            name='email'
                            value={email}
                            onChange={handleChangeInput}
                            required
                            className={`${styles.input} ${errors ? styles.failed : ''}`}
                        />
                        {errors && <div className={styles.errorText}>{errors}</div>}
                    </div>
                </div>

                <button className={styles.submitBtn} type='submit' onClick={(e) => handleSubmit(e)}>
                    Send verify code <i className='fa-regular fa-paper-plane'></i>
                </button>

                <div className={styles.registerText}>
                    New here?
                    <Link to='/sign-up' className={styles.link}>
                        Create your account now
                    </Link>
                </div>

                {isModalOpen && (
                    <RenewPasswordModal
                        isModalOpen={isModalOpen}
                        onClose={toggleOpenModal}
                        email={email}
                        getVerifyResponse={getVerifyResponse}
                    />
                )}
            </div>
        </div>
    );
}

export default ForgotPassword;
