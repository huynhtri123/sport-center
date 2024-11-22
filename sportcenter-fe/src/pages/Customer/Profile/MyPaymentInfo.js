import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import styles from '../../../assets/css/Profile/myPayments.module.scss';
import userApi from '../../../services/api/userApi';
import { Loading } from '../../../components/Loading/Loading';
import PaymentModal from './PaymentModal';
import formatCurrency from '../../../utils/formatCurrency';

function MyPaymentInfo() {
    const [payments, setPayments] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [userId, setUserId] = useState(null);

    const [accountBalance, setAccountBalance] = useState(0);
    const fetchAccountBalance = async () => {
        try {
            const response = await userApi.getAccountBalance();
            setAccountBalance(response.data || 0);
            console.log(response);
        } catch (err) {
            console.error(err);
        }
    };
    useEffect(() => {
        fetchAccountBalance();
    }, []);

    // console.log(accountBalance);

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                setIsLoading(true);
                const response = await userApi.myProfile();
                const userData = response.data;

                setUserId(userData.id); // Store userId in state

                if (userData && userData.paymentInfos && userData.paymentInfos.length > 0) {
                    setPayments(userData.paymentInfos);
                } else {
                    if (payments.length === 0) {
                        toast.info('No payment records found.');
                    }
                    setPayments([]);
                }
            } catch (err) {
                console.error(err);
                toast.error('Failed to fetch user profile and payment information.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserProfile();
    }, [payments.length]);

    const handleAddPayment = () => {
        setSelectedPayment(null);
        setIsModalOpen(true);
    };

    const handleEditPayment = (payment) => {
        setSelectedPayment(payment);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleSavePayment = (updatedPayment) => {
        if (!userId) {
            toast.error('User ID is required.');
            return;
        }

        const paymentData = { ...updatedPayment, userId }; // Pass userId here
        if (selectedPayment) {
            updatePaymentInfo(paymentData, selectedPayment.id); // Pass paymentId if updating
        } else {
            addPaymentInfo(paymentData); // Pass userId here as well
        }
        setIsModalOpen(false);
    };

    const addPaymentInfo = async (newPayment) => {
        try {
            const response = await userApi.addPaymentInfo(newPayment, newPayment.userId);
            setPayments((prevPayments) => [...prevPayments, response.data]);
            toast.success('Payment added successfully');
        } catch (error) {
            toast.error('Failed to add payment.');
        }
    };

    const updatePaymentInfo = async (updatedPayment, paymentId) => {
        try {
            const response = await userApi.updatePaymentInfo(updatedPayment, updatedPayment.userId, paymentId);
            setPayments((prevPayments) => prevPayments.map((p) => (p.id === paymentId ? response.data : p)));
            toast.success('Payment updated successfully');
        } catch (error) {
            toast.error('Failed to update payment.');
        }
    };

    const deletePaymentInfo = async (paymentId) => {
        if (!userId) {
            toast.error('User ID is required.');
            return;
        }
        try {
            // Call your API to delete the payment, passing both userId and paymentId
            await userApi.deletePaymentInfo(userId, paymentId);
            // Remove the deleted payment from the state
            setPayments((prevPayments) => prevPayments.filter((payment) => payment.id !== paymentId));
            toast.success('Payment deleted successfully');
        } catch (error) {
            toast.error('Failed to delete payment.');
        }
    };

    return (
        <div className={styles.myPaymentInfoContainer}>
            <p className={styles.price}>Số dư hiện có: {formatCurrency(accountBalance) || 0}</p>
            {isLoading && <Loading />}
            <button onClick={handleAddPayment} className={styles.addPaymentButton}>
                Thêm Payment
            </button>
            {payments.length > 0 ? (
                payments.map((payment, index) => (
                    <PaymentCard
                        key={index}
                        payment={payment}
                        onEdit={() => handleEditPayment(payment)}
                        onDelete={() => deletePaymentInfo(payment.id)} // Pass the delete function
                    />
                ))
            ) : (
                <p>No payment records found.</p>
            )}

            {isModalOpen && (
                <PaymentModal
                    payment={selectedPayment}
                    onClose={handleCloseModal}
                    onSave={handleSavePayment}
                    userId={userId} // Pass userId to the modal
                />
            )}
        </div>
    );
}

function PaymentCard({ payment, onEdit, onDelete }) {
    return (
        <div className={styles.paymentCard}>
            <h4>Bank Name: {payment.bankName}</h4>
            <p>
                <span>Card Number:</span> {payment.cardNumber}
            </p>
            <p>
                <span>Card Holder Name:</span> {payment.cardHolderName}
            </p>
            <p>
                <span>Issue Date:</span> {new Date(payment.issueDate).toLocaleDateString()}
            </p>
            <button onClick={onEdit} className={`${styles.updateButton} ${styles.updateButtonCustom}`}>
                Cập nhật
            </button>
            <button onClick={onDelete} className={styles.deleteButton}>
                Xóa
            </button>{' '}
            {/* Delete button */}
        </div>
    );
}

export default MyPaymentInfo;
