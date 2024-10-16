import { useRef, useState } from 'react';
import clsx from 'clsx';
import { toast } from 'react-toastify';

import styles from './Modal.module.scss';
import Input from '../Input/Input';
import authApi from '../../services/api/authApi';
import { Loading } from '../Loading/Loading';

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
            toast.error('Code phải chứa đúng 6 số!');
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
                {isLoading && <Loading></Loading>}

                <h2 className='font-cera-round-pro-bold font-size-24px'>
                    Please check your email and Enter Verification Code
                </h2>
                <p style={{ color: '#ff9966' }}>
                    (expires in 5 minutes)
                    <span onClick={handleSendAgain} className={clsx('font-size-14px ms-2', styles.sendAgainBtn)}>
                        Send again
                    </span>
                </p>
                <form onSubmit={handleSubmit}>
                    <Input
                        className={clsx('mb-3', { [styles.error]: isError })}
                        type='text'
                        placeholder='Enter the 6-digit code...'
                        width='300px'
                        value={code}
                        onChange={handleChange}
                        ref={inputRef}
                    />
                    <button type='submit' className='btn btn-primary'>
                        Verify
                    </button>
                </form>
                <button onClick={onClose} className='btn btn-secondary mt-3'>
                    Close
                </button>
            </div>
        </div>
    );
}

export default Signup2Modal;
