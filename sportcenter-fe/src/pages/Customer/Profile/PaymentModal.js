import React, { useState, useEffect } from 'react';
import styles from '../../../assets/css/Payment/paymentModal.module.scss';
import { toast } from 'react-toastify';

function PaymentModal({ payment, onClose, onSave, userId }) {
    const [formData, setFormData] = useState({
        bankName: '',
        cardNumber: '',
        cardHolderName: '',
        issueDate: '', // Keep the date in its original format (yyyy-MM-dd)
    });

    useEffect(() => {
        if (payment) {
            setFormData({
                bankName: payment.bankName || '',
                cardNumber: payment.cardNumber || '',
                cardHolderName: payment.cardHolderName || '',
                issueDate: payment.issueDate ? payment.issueDate.substring(0, 10) : '', // Extract date portion (yyyy-MM-dd)
            });
        }
    }, [payment]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isValid()) {
            const updatedFormData = {
                ...formData,
                issueDate: `${formData.issueDate}T00:00:00Z`, // Append time and UTC timezone
                userId: userId, // Include userId
            };
            onSave(updatedFormData); // Send the updated data for saving
        }
    };

    const isValid = () => {
        const { bankName, cardNumber, cardHolderName, issueDate } = formData;
        // Kiểm tra tính hợp lệ của cardNumber
        const isCardNumberValid = /^\d{10,16}$/.test(cardNumber); // Kiểm tra số và độ dài
        if (!isCardNumberValid) {
            toast.warn('Số thẻ phải là số và có độ dài từ 10 đến 16 ký tự.');
            return;
        }
        return bankName && isCardNumberValid && cardHolderName && issueDate;
    };

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <h3>{payment ? 'Update Payment Info' : 'Add Payment Info'}</h3>
                <form onSubmit={handleSubmit}>
                    <div>
                        <label>Bank Name:</label>
                        <input type='text' name='bankName' value={formData.bankName} onChange={handleChange} required />
                    </div>
                    <div>
                        <label>Card Number:</label>
                        <input
                            type='text'
                            name='cardNumber'
                            value={formData.cardNumber}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div>
                        <label>Card Holder Name:</label>
                        <input
                            type='text'
                            name='cardHolderName'
                            value={formData.cardHolderName}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div>
                        <label>Issue Date:</label>
                        <input
                            type='date'
                            name='issueDate'
                            value={formData.issueDate}
                            onChange={handleChange}
                            required
                            max={new Date().toISOString().split('T')[0]} // Thiết lập ngày tối đa là hôm nay
                        />
                    </div>
                    <div className={styles.buttons}>
                        <button type='submit' className={styles.saveBtn}>
                            Lưu
                        </button>
                        <button type='button' className={styles.cancelBtn} onClick={onClose}>
                            Hủy
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default PaymentModal;
