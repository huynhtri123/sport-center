import { useState } from 'react';
import clsx from 'clsx';
import { toast } from 'react-toastify';

import styles from './Modal.module.scss';
import Input from '../Input/Input';

function Signup2Modal({ isOpen, onClose, onSubmit }) {
    const [code, setCode] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (code.length === 6) {
            onSubmit(code);
            setCode('');
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

    if (!isOpen) return null;

    return (
        <div className={clsx(styles.modalOverlay)}>
            <div className={clsx(styles.modalContent)}>
                <h2 className='font-cera-round-pro-bold font-size-24px'>
                    Please check your email and Enter Verification Code
                </h2>
                <p style={{ color: '#ff9966' }}>(expires in 5 minutes)</p>
                <form onSubmit={handleSubmit}>
                    <Input
                        className='mb-3'
                        type='text'
                        placeholder='Enter the 6-digit code...'
                        width='300px'
                        value={code}
                        onChange={handleChange}
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
