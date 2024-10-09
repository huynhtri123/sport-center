import styles from './Modal.module.scss';
import clsx from 'clsx';
import { useRef, useState } from 'react';
import { toast } from 'react-toastify';

import Input from '../Input/Input';
import { RenewPasswordSchema } from '../../utils/Rules/RenewPassWordSchema';
import authApi from '../../services/api/authApi';
import { Loading } from '../Loading/Loading';
import { useNavigate } from 'react-router-dom';

function RenewPasswordModal({ isModalOpen, onClose, email, getVerifyResponse }) {
    const [formData, setFormData] = useState({
        password: '',
        comfirmPassword: '',
        resetPasswordCode: '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});

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
                        Send again
                    </span>
                </p>
                <form onSubmit={(e) => handleSubmit(e)}>
                    <Input
                        className={clsx('mb-3')}
                        name={'resetPasswordCode'}
                        value={formData.resetPasswordCode}
                        onChange={(e) => handleChange(e)}
                        type='text'
                        placeholder='6-digit code...'
                        width='300px'
                        ref={inputCodeRef}
                    />
                    {errors.resetPasswordCode && (
                        <div className={clsx('errors-input font-size-10px')}>{errors.resetPasswordCode}</div>
                    )}
                    <Input
                        className={clsx('mb-3')}
                        name={'password'}
                        value={formData.password}
                        onChange={(e) => handleChange(e)}
                        type='password'
                        placeholder='New password...'
                        width='300px'
                    />
                    {errors.password && <div className={clsx('errors-input font-size-10px')}>{errors.password}</div>}
                    <Input
                        className={clsx('mb-3')}
                        name={'comfirmPassword'}
                        value={formData.comfirmPassword}
                        onChange={(e) => handleChange(e)}
                        type='password'
                        placeholder='Confirm new password...'
                        width='300px'
                    />
                    {errors.comfirmPassword && (
                        <div className={clsx('errors-input font-size-10px')}>{errors.comfirmPassword}</div>
                    )}
                    <button type='submit' className='btn btn-primary mt-4'>
                        Change password
                    </button>
                </form>
                <button onClick={onClose} className='btn btn-secondary mt-3'>
                    Close
                </button>
            </div>
        </div>
    );
}

export default RenewPasswordModal;
