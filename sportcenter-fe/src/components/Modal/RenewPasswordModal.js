import styles from './RenewPasswordModal.module.scss';
import clsx from 'clsx';
import { useRef, useState } from 'react';
import { toast } from 'react-toastify';

import Input from '../Input/Input';
import { RenewPasswordSchema } from '../../utils/Rules/RenewPassWordSchema';
import authApi from '../../services/api/authApi';
import { Loading } from '../Loading/Loading';
import { useNavigate } from 'react-router-dom';
import Button from '../Button/Button';

function RenewPasswordModal({ isModalOpen, onClose, email, getVerifyResponse }) {
    const [formData, setFormData] = useState({
        password: '',
        comfirmPassword: '',
        resetPasswordCode: '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const togglePasswordVisibility = () => {
        setShowPassword((prevState) => !prevState);
    };
    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword((prevState) => !prevState);
    };

    const navigate = useNavigate();
    const inputCodeRef = useRef();

    const handleChange = (e) => {
        const { name, value } = e.target;

        // Chỉ cho phép 6 ký tự số trong trường resetPasswordCode
        if (name === 'resetPasswordCode') {
            if (/^\d{0,6}$/.test(value)) {
                setFormData((prevState) => ({
                    ...prevState,
                    [name]: value,
                }));
            }
        } else {
            setFormData((prevState) => ({
                ...prevState,
                [name]: value,
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // console.log(formData);

        try {
            await RenewPasswordSchema.validate(formData, { abortEarly: false });
        } catch (validationErrors) {
            // nếu validate có lỗi thì nó nằm trong validationErrors.inner
            if (validationErrors && validationErrors.inner) {
                const formErrors = {};
                validationErrors.inner.forEach((error) => {
                    formErrors[error.path] = error.message;
                });
                setErrors(formErrors);
            } else {
                console.error('Validation error structure is not as expected', validationErrors);
            }
            return;
        }

        const userId = getVerifyResponse.data.id;
        // console.log(userId);
        try {
            const renewPasswordResponse = await authApi.renewPassword(userId, {
                password: formData.password,
                comfirmPassword: formData.comfirmPassword,
                resetPasswordCode: formData.resetPasswordCode,
            });
            toast.success(renewPasswordResponse.message);
            navigate('/');
        } catch (apiErr) {
            inputCodeRef.current.focus();
            setErrors('');
            console.error(apiErr);
        }
    };

    const handleSendAgain = async () => {
        try {
            setIsLoading(true);
            const response = await authApi.getVerify({ email: email });
            toast.success(response.message);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isModalOpen) return null;

    return (
        <div className={clsx(styles.modalOverlay)}>
            {isLoading && <Loading></Loading>}

            <div className={clsx(styles.modalContent)}>
                <h2 className='font-cera-round-pro-bold font-size-24px'>
                    Please check your email and Enter Verification Code
                </h2>
                <p style={{ color: '#ff9966' }}>
                    (expires in 5 minutes)
                    <span onClick={handleSendAgain} className={clsx('font-size-14px ms-2', styles.sendAgainBtn)}>
                        Send again?
                    </span>
                </p>
                <form onSubmit={(e) => handleSubmit(e)} className={styles.verifyForm}>
                    <div className={styles.inputBox}>
                        <label htmlFor='resetPasswordCode' className='font-cera-round-pro-bold ms-2'>
                            Verify code
                        </label>
                        <Input
                            className={clsx('mb-3', styles.inputCode)}
                            name={'resetPasswordCode'}
                            value={formData.resetPasswordCode}
                            onChange={(e) => handleChange(e)}
                            type='text'
                            placeholder='6-digit code...'
                            ref={inputCodeRef}
                        />
                        {errors.resetPasswordCode && (
                            <div className={clsx('errors-input font-size-10px')}>{errors.resetPasswordCode}</div>
                        )}
                    </div>

                    <div className={styles.inputBox}>
                        <label htmlFor='password' className='font-cera-round-pro-bold ms-2'>
                            Password{' '}
                            <span onClick={togglePasswordVisibility} className={styles.iconShowHide}>
                                {showPassword ? (
                                    <i class='fa-regular fa-eye' title='Hide password?'></i>
                                ) : (
                                    <i class='fa-regular fa-eye-slash' title='Show password?'></i>
                                )}
                            </span>
                        </label>
                        <Input
                            className={clsx('mb-3', styles.inputCode)}
                            name={'password'}
                            value={formData.password}
                            onChange={(e) => handleChange(e)}
                            type={showPassword ? 'text' : 'password'}
                            placeholder='New password...'
                        />
                        {errors.password && (
                            <div className={clsx('errors-input font-size-10px')}>{errors.password}</div>
                        )}
                    </div>

                    <div className={styles.inputBox}>
                        <label htmlFor='confirmPassword' className='font-cera-round-pro-bold ms-2'>
                            Confirm Password{' '}
                            <span onClick={toggleConfirmPasswordVisibility} className={styles.iconShowHide}>
                                {showConfirmPassword ? (
                                    <i class='fa-regular fa-eye' title='Hide password?'></i>
                                ) : (
                                    <i class='fa-regular fa-eye-slash' title='Show password?'></i>
                                )}
                            </span>
                        </label>
                        <Input
                            className={clsx('mb-3', styles.inputCode)}
                            name={'comfirmPassword'}
                            value={formData.comfirmPassword}
                            onChange={(e) => handleChange(e)}
                            type={showConfirmPassword ? 'text' : 'password'}
                            placeholder='Confirm new password...'
                        />
                        {errors.comfirmPassword && (
                            <div className={clsx('errors-input font-size-10px')}>{errors.comfirmPassword}</div>
                        )}
                    </div>

                    <Button type='submit' className={styles.btnSubmit}>
                        Change password
                    </Button>
                </form>
                <Button onClick={onClose} className={styles.btnClose}>
                    Close
                </Button>
            </div>
        </div>
    );
}

export default RenewPasswordModal;
