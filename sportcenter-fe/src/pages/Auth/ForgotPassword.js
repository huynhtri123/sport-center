import styles from '../../assets/css/Auth/auth.module.scss';
import clsx from 'clsx';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

import Input from '../../components/Input/Input';
import Button from '../../components/Button/Button';
import RenewPasswordModal from '../../components/Modal/RenewPasswordModal';
import authApi from '../../services/api/authApi';
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
            toast.success(response.message);
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
        <div className={clsx(styles.authContainer)}>
            {isLoading && <Loading></Loading>}

            <div className={clsx(styles.forgotPasswordBox, 'flex-column')}>
                <div className='font-size-26px mb-3 d-flex flex-column'>
                    <span className='font-cera-round-pro-black font-size-24px mt-3'>
                        <p>Forgot Your Password?</p>
                    </span>
                </div>

                <div className={`input-box d-flex flex-column mt-3 ${styles.inputGroup}`}>
                    <div className={styles.inputBox}>
                        <label htmlFor='email' className='font-cera-round-pro-bold ms-2'>
                            Email Address
                        </label>
                        <Input
                            className={clsx('mb-3', { 'error-box': errors })}
                            type={'email'}
                            placeholder={'e.g. user001@gmail.com'}
                            name='email'
                            value={email}
                            onChange={(e) => handleChangeInput(e)}
                            required
                        />
                        {errors && <div className={clsx('errors-input font-size-10px')}>{errors}</div>}
                    </div>
                </div>

                <Button className='font-size-20px mt-3' type='submit' onClick={(e) => handleSubmit(e)}>
                    Send verify code
                    <i className='fa-regular fa-paper-plane ms-2'></i>
                </Button>

                <div className='font-cera-round-pro-regular mt-2'>
                    New here?
                    <Link to={'/sign-up'} className='text-underline ms-2'>
                        Create your account now
                    </Link>
                </div>

                {
                    <RenewPasswordModal
                        isModalOpen={isModalOpen}
                        onClose={toggleOpenModal}
                        email={email}
                        getVerifyResponse={getVerifyResponse}
                    ></RenewPasswordModal>
                }
            </div>
        </div>
    );
}

export default ForgotPassword;
