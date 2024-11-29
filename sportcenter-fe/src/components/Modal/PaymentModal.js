// src/components/PaymentModal.js
import styles from './paymentModal.module.scss';
import userApi from '../../services/api/userApi';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useUser } from '../../customs/hooks';
import { PaymentMethod } from '../../utils/enums/PaymentMethod';
import { PaymentStatus } from '../../utils/enums/PaymentStatus';
import { TransactionType } from '../../utils/enums/TransactionType';
import { useNavigate } from 'react-router-dom';
import { useGetBookings } from '../../customs/hooks';
import invoiceApi from '../../services/api/invoiceApi';

function PaymentModal({ isOpen, onClose, onSubmit, price, isBookingPayment, isRegistrationPayment, field, selectedDate, startTime, numberOfHours }) {
    const [accountBalance, setAccountBalance] = useState(0);
    const [user, setUser] = useUser();
    const navigate = useNavigate();
    const [bookingData, setBookingData] = useGetBookings(); // Destructure bookings and setBookings

    const fetchUser = async () => {
        try {
            const userResponse = await userApi.getCurrentUser();
            setUser(userResponse.data);
        } catch (err) {
            console.error('Error fetching user:', err);
        }
    };

    useEffect(() => {
        fetchUser();
    }, []);

    const getAccountBalance = async () => {
        try {
            const response = await userApi.getAccountBalance();
            setAccountBalance(response.data);
        } catch (err) {
            console.error('Error fetching account balance:', err);
        }
    };

    useEffect(() => {
        getAccountBalance();
    }, []);

    const remainingAmount = Math.max(price - accountBalance, 0);

    const handleBalancePaymentAndSubmit = async () => {
        try {
            const submitResponse = await onSubmit();
            if (submitResponse) {
                const balancePaymentResponse = await userApi.makePaymentByBalance(price);
                if (balancePaymentResponse.data) {
                    toast.success(balancePaymentResponse.message);

                    const transactionType = isBookingPayment
                        ? TransactionType.BOOKING
                        : TransactionType.REGISTRATION_FEE;

                    const invoiceRequest = {
                        userId: user.id,
                        totalAmount: price,
                        paymentStatus: PaymentStatus.PAID,
                        paymentMethod: PaymentMethod.ACCOUNT_BALANCE,
                        transactionType: transactionType,
                    };
                    const invoiceResponse = await invoiceApi.create(invoiceRequest);
                    if (invoiceResponse.data) {
                        toast.info(invoiceResponse.message);
                    } else {
                        toast.error('Tạo hóa đơn thất bại!');
                    }
                }
            }
        } catch (err) {
            console.error('Error during balance payment:', err);
        }
    };

    const handleRemainingPaymentAndSubmit = async (remainingAmount) => {
        try {
            const submitResponse = await onSubmit();
            if (submitResponse) {
                const balancePaymentResponse = await userApi.makePaymentByBalance(accountBalance);
                if (balancePaymentResponse.data) {
                    toast.success(balancePaymentResponse.message);
                    if (remainingAmount > 0) {
                        toast.info('Thanh toán phần này: ' + remainingAmount);
                    }

                    const transactionType = isBookingPayment
                        ? TransactionType.BOOKING
                        : TransactionType.REGISTRATION_FEE;

                    const invoiceRequest = {
                        userId: user.id,
                        totalAmount: price,
                        paymentStatus: PaymentStatus.PAID,
                        paymentMethod: PaymentMethod.ACCOUNT_BALANCE,
                        transactionType: transactionType,
                    };
                    const invoiceResponse = await invoiceApi.create(invoiceRequest);
                    if (invoiceResponse.data) {
                        toast.info(invoiceResponse.message);
                    } else {
                        toast.error('Tạo hóa đơn thất bại!');
                    }
                } else {
                    toast.error('Thanh toán số dư không thành công!');
                }
            }
        } catch (err) {
            console.error('Error during remaining payment:', err);
        }
    };

    const handlePaymentByCard = async () => {
        const bookingData = {
            price,
            userId: user.id,
            remainingAmount,
            field,
            selectedDate,
            startTime,
            numberOfHours,
        };
        console.log(bookingData);

        // Update bookings state
        setBookingData(bookingData);

        navigate('/payments');
    };

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <h2>Thanh Toán</h2>
                <p>
                    Tổng số tiền cần thanh toán: <strong>{price} VND</strong>
                </p>
                <p>
                    Số dư hiện có: <strong>{accountBalance} VND</strong>
                </p>

                {accountBalance === 0 ? (
                    <p>Bạn không có số dư khả dụng.</p>
                ) : remainingAmount > 0 ? (
                    <p>
                        Số tiền cần thanh toán thêm: <strong>{remainingAmount} VND</strong>
                    </p>
                ) : (
                    <p>Thanh toán sẽ được thực hiện toàn bộ bằng số dư.</p>
                )}

                <div className={styles.buttonContainer}>
                    {accountBalance === 0 ? (
                        <button className={styles.cardButton} onClick={handlePaymentByCard}>
                            Thanh toán toàn bộ bằng thẻ
                        </button>
                    ) : remainingAmount > 0 ? (
                        <>
                            <button
                                className={styles.balanceButton}
                                onClick={() => handleRemainingPaymentAndSubmit(remainingAmount)}
                            >
                                Sử dụng số dư và thanh toán {remainingAmount} VND bằng thẻ
                            </button>
                            <button className={styles.cardButton} onClick={handlePaymentByCard}>
                                Thanh toán toàn bộ bằng thẻ
                            </button>
                        </>
                    ) : (
                        <button className={styles.balanceButton} onClick={handleBalancePaymentAndSubmit}>
                            Thanh toán bằng số dư
                        </button>
                    )}
                    <button className={styles.cancelButton} onClick={onClose}>
                        Hủy
                    </button>
                </div>
            </div>
        </div>
    );
}

export default PaymentModal;