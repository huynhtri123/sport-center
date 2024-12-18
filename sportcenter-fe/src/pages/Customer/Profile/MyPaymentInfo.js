/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import styles from '../../../assets/css/Profile/myPayments.module.scss';
import userApi from '../../../services/api/userApi';
import { Loading } from '../../../components/Loading/Loading';
import PaymentModal from './PaymentModal';
import ConfirmModal from '../../../components/Modal/ConfirmModal';

function MyPaymentInfo() {
    const [payments, setPayments] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [userId, setUserId] = useState(null);

    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false); // Quản lý trạng thái ConfirmModal
    const [paymentToDelete, setPaymentToDelete] = useState(null); // Lưu payment cần xóa

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

    useEffect(() => {
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

    const handleSavePayment = async (updatedPayment) => {
        if (!userId) {
            toast.error('User ID is required.');
            return;
        }

        const paymentData = { ...updatedPayment, userId }; // Pass userId here
        if (selectedPayment) {
            await updatePaymentInfo(paymentData, selectedPayment.id); // Pass paymentId if updating
        } else {
            await addPaymentInfo(paymentData); // Pass userId here as well
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
            fetchUserProfile();
        } catch (error) {
            toast.error('Failed to update payment.');
        }
    };

    const handleDeletePayment = (paymentId) => {
        setPaymentToDelete(paymentId); // Lưu payment cần xóa
        setIsConfirmModalOpen(true); // Mở modal xác nhận
    };

    const confirmDeletePayment = async () => {
        if (!userId || !paymentToDelete) {
            toast.error('User ID or Payment ID is required.');
            return;
        }
        try {
            await userApi.deletePaymentInfo(userId, paymentToDelete);
            setPayments((prevPayments) => prevPayments.filter((payment) => payment.id !== paymentToDelete));
            toast.success('Payment deleted successfully');
        } catch (error) {
            toast.error('Failed to delete payment.');
        } finally {
            setIsConfirmModalOpen(false); // Đóng modal
            setPaymentToDelete(null); // Xóa thông tin payment cần xóa
        }
    };

    return (
        <div className={styles.myPaymentInfoContainer}>
            {isLoading && <Loading />}
            <button onClick={handleAddPayment} className={styles.addPaymentButton}>
                Add Payment Info
            </button>
            {payments.length > 0 ? (
                payments.map((payment, index) => (
                    <PaymentCard
                        key={index}
                        payment={payment}
                        onEdit={() => handleEditPayment(payment)}
                        onDelete={() => handleDeletePayment(payment.id)} // Truyền hàm xử lý xóa
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

            {isConfirmModalOpen && (
                <ConfirmModal
                    title='Bạn có chắc chắn muốn xóa thông tin thanh toán này?'
                    isOpen={isConfirmModalOpen}
                    onClose={() => setIsConfirmModalOpen(false)} // Đóng modal nếu hủy
                    onSubmit={confirmDeletePayment} // Xóa khi xác nhận
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
                Edit
            </button>
            <button onClick={onDelete} className={styles.deleteButton}>
                Remove
            </button>
        </div>
    );
}

export default MyPaymentInfo;
