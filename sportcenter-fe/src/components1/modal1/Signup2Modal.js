import { useRef, useState } from 'react';
import clsx from 'clsx';
import { toast } from 'react-toastify';

import styles from './signup2.module.scss';
import authApi from '../../services/api/auth/authApi';
import { Loading } from '../loadings/Loading';

function Signup2Modal({ isOpen, onClose, onSubmit, signupEmail, isError }) {
    const [code, setCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const inputRef = useRef();

    const handleSubmit = (e) => {
        e.preventDefault();
        inputRef.current.focus();
        if (code.length === 6) {
            onSubmit(code);
        } else {
            toast.error('The code must contain exactly 6 digits!');
        }
    };

    const handleChange = (e) => {
        const value = e.target.value;
        // Chỉ cho phép nhập số và giới hạn độ dài là 6
        if (/^\d{0,6}$/.test(value)) {
            setCode(value);
        }
    };

    const handleSendAgain = async () => {
        try {
            setIsLoading(true);
            const response = await authApi.getVerify({ email: signupEmail });
            toast.success(response.message);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className={clsx(styles.modalOverlay)}>
            <div className={clsx(styles.modalContent)}>
                {isLoading && <Loading />}

                <h2 className='font-cera-round-pro-bold font-size-24px'>Please check your email to get code</h2>

                <p style={{ color: '#ff9966' }}>
                    (expires in 5 minutes)
                    <span onClick={handleSendAgain} className={clsx('font-size-14px ms-2', styles.sendAgainBtn)}>
                        Send again
                    </span>
                </p>

                <form onSubmit={handleSubmit} className={styles.verifyForm}>
                    <div className={styles.inputBox}>
                        <label htmlFor='code'>Verification Code</label>
                        <input
                            id='code'
                            ref={inputRef}
                            type='text'
                            placeholder='Enter the 6-digit code...'
                            className={clsx(styles.inputCode, { [styles['errors-input']]: isError })}
                            value={code}
                            onChange={handleChange}
                        />
                        {isError && <span className={styles['errors-input']}>Code is invalid or expired.</span>}
                    </div>

                    <button type='submit' className={styles.btnSubmit}>
                        Verify
                    </button>
                </form>

                <button onClick={onClose} className={styles.btnClose}>
                    Close
                </button>
            </div>
        </div>
    );
}

export default Signup2Modal;
