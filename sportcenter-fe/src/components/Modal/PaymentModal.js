/* eslint-disable no-unused-vars */
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
import invoiceApi from '../../services/api/invoiceApi';
import bookingApi from '../../services/api/booking/bookingApi';
import { usePaymentData } from '../../customs/hooks';

function PaymentModal({
    isOpen,
    onClose,
    onSubmit,
    price,
    isBookingPayment,
    isRegistrationPayment,
    fetchTimeSlots,
    isRecurring,
}) {
    const [accountBalance, setAccountBalance] = useState(0);
    const [user, setUser] = useUser();
    const navigate = useNavigate();
    const [paymentData, setPaymenData] = usePaymentData();

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
        // eslint-disable-next-line react-hooks/exhaustive-deps
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

    const makePaymentByBalance = async (price) => {
        try {
            const balancePaymentResponse = await userApi.makePaymentByBalance(price);
            console.log(price);
            if (balancePaymentResponse && balancePaymentResponse.data != null) {
                console.log(balancePaymentResponse);
                // toast.success(balancePaymentResponse.message);
                return true;
            }
            toast.error('Payment by balance failed!');
            return false;
        } catch (err) {
            console.error(err);
            return false;
        }
    };

    const confirmBooking = async (bookingId) => {
        try {
            // console.log(isRecurring);
            const response = isRecurring
                ? await bookingApi.confirmRecurring(bookingId)
                : await bookingApi.confirm(bookingId);
            if (response) {
                toast.success(response.message);
                fetchTimeSlots();
                return true;
            }
            toast.error('Failed to confirm booking!');
            return false;
        } catch (err) {
            console.error(err);
            return false;
        }
    };

    const createInvoice = async (userId, price, transactionType, paymentMethod) => {
        const invoiceRequest = {
            userId: userId,
            amount: price,
            paymentStatus: PaymentStatus.PAID,
            paymentMethod: paymentMethod,
            transactionType: transactionType,
        };

        try {
            const response = await invoiceApi.create(invoiceRequest);
            if (response?.data) {
                // toast.info(response.message);
                return true;
            }
            toast.error('Failed to create invoice!');
            return false;
        } catch (err) {
            console.error(err);
            return false;
        }
    };

    const balancePaymentForBooking = async () => {
        try {
            // gọi api đặt sân bước 1 ko thành công thì out luôn
            const bookingResponse = await onSubmit(); // booking || recurringBooking
            // console.log(bookingResponse);
            if (!bookingResponse) return;

            // đặt sân bước 1 thành công -> thanh toán
            const balancePaymentResponse = await makePaymentByBalance(price);
            if (!balancePaymentResponse) return;

            // thanh toán thành công -> gọi api đặt sân bước 2
            // console.log(bookingResponse);
            const bookingId = bookingResponse.id;
            const confirmResponse = await confirmBooking(bookingId);
            if (!confirmResponse) return;

            // đặt sân bước 2 thành công -> tạo hoá đơn
            const transactionType = TransactionType.BOOKING;
            await createInvoice(user.id, price, transactionType, PaymentMethod.ACCOUNT_BALANCE);
        } catch (err) {
            console.error('Error during balance payment:', err);
        }
    };

    const balancePaymentForTournament = async () => {
        try {
            // gọi hàm đăng kí giải đấu từ cha
            const registerResponse = await onSubmit();
            // console.log(registerResponse);
            if (!registerResponse) return;

            // đăng kí bước 1 thành công -> thanh toán
            const balancePaymentResponse = await makePaymentByBalance(price);
            if (!balancePaymentResponse) return;

            // thanh toán thành công -> đăng ký bước 2

            // đăng ký bước 2 thành công -> tạo hoá đơn
            const transactionType = TransactionType.REGISTRATION_FEE;
            await createInvoice(user.id, price, transactionType, PaymentMethod.ACCOUNT_BALANCE);
        } catch (err) {
            console.error('Error during balance payment:', err);
        }
    };

    // thanh toán toàn bộ bằng số dư
    const handleBalancePaymentAndSubmit = async () => {
        if (isBookingPayment) {
            await balancePaymentForBooking();
        } else if (isRegistrationPayment) {
            await balancePaymentForTournament();
        }
    };

    const handleRemainingPaymentAndSubmit = async (remainingAmount) => {
        // toast.info('thanh toán nửa nạc nửa mỡ: ', remainingAmount);
        const paymentData = {
            amount: price,
            onSubmit: onSubmit,
            type: isBookingPayment ? TransactionType.BOOKING : TransactionType.REGISTRATION_FEE,
            createInvoice,
            confirmBooking,
            makePaymentByBalance,
            amountByBalance: price - remainingAmount, // số tiền cần thanh toán bằng số dư
        };
        setPaymenData(paymentData);

        navigate('/payments');
    };

    const handlePaymentByCard = async () => {
        const paymentData = {
            amount: price,
            onSubmit: onSubmit,
            type: isBookingPayment ? TransactionType.BOOKING : TransactionType.REGISTRATION_FEE,
            createInvoice,
            confirmBooking,
        };
        setPaymenData(paymentData);

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
