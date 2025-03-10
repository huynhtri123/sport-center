/* eslint-disable no-unused-vars */
import styles from './paymentModal.module.scss';
import userApi from '../../services/api/userApi';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useUser } from '../../customs/hooks';
import { PaymentStatus } from '../../utils/enums/PaymentStatus';
import { TransactionType } from '../../utils/enums/TransactionType';
import { useNavigate } from 'react-router-dom';
import invoiceApi from '../../services/api/invoiceApi';
import bookingApi from '../../services/api/booking/bookingApi';
import { usePaymentData } from '../../customs/hooks';
import tournamentApi from '../../services/api/tournamentApi';
import { useLoading } from '../../customs/hooks';

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
    const [isLoadingContext, setIsLoadingContext] = useLoading();

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

    const makePaymentByBalance = async (price, transactionType) => {
        try {
            const balancePaymentResponse = await userApi.makePaymentByBalance(price, transactionType);
            //console.log(price);
            if (balancePaymentResponse && balancePaymentResponse.data != null) {
                //console.log(balancePaymentResponse);
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

    // ham xu ly chinh cho booking by balance
    const balancePaymentForBooking = async () => {
        try {
            // gọi api đặt sân bước 1 ko thành công thì out luôn
            const bookingResponse = await onSubmit(); // booking || recurringBooking
            // console.log(bookingResponse);
            if (!bookingResponse) return;

            // đặt sân bước 1 thành công -> thanh toán (BE da tao hoa don)
            const balancePaymentResponse = await makePaymentByBalance(price, TransactionType.BOOKING);
            if (!balancePaymentResponse) return;

            // thanh toán thành công -> gọi api đặt sân bước 2
            const bookingId = bookingResponse.id;
            const confirmResponse = await confirmBooking(bookingId);
            if (!confirmResponse) return;
        } catch (err) {
            console.error('Error during balance payment:', err);
        } finally {
            // tat loading o component cha
            setIsLoadingContext(false);
        }
    };

    // ham xu ly chinh cho tournament by balance
    const balancePaymentForTournament = async () => {
        try {
            // gọi hàm đăng kí giải đấu từ cha
            const registerResponse = await onSubmit();
            if (!registerResponse) return;

            // đăng kí bước 1 thành công -> thanh toán
            const balancePaymentResponse = await makePaymentByBalance(price, TransactionType.REGISTRATION_FEE);
            if (!balancePaymentResponse) return;

            const registerOrderId = registerResponse.id || '';
            const confirmResponse = await tournamentApi.confirmRegister(registerOrderId);
            toast.success(confirmResponse.message);
        } catch (err) {
            console.error('Error during balance payment:', err);
        } finally {
            // tat loading o component cha
            setIsLoadingContext(false);
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

    // ham xu ly thanh toan lon xon
    const handleRemainingPaymentAndSubmit = async (remainingAmount) => {
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
                <h2>Payment</h2>
                <p>
                    Total amount to pay: <strong>{price} VND</strong>
                </p>
                <p>
                    Current balance: <strong>{accountBalance} VND</strong>
                </p>

                {accountBalance === 0 ? (
                    <p>You do not have any available balance.</p>
                ) : remainingAmount > 0 ? (
                    <p>
                        Additional amount to pay: <strong>{remainingAmount} VND</strong>
                    </p>
                ) : (
                    <p>The payment will be fully covered by your balance.</p>
                )}

                <div className={styles.buttonContainer}>
                    {accountBalance === 0 ? (
                        <button className={styles.cardButton} onClick={handlePaymentByCard}>
                            Pay fully by card
                        </button>
                    ) : remainingAmount > 0 ? (
                        <>
                            <button
                                className={styles.balanceButton}
                                onClick={() => handleRemainingPaymentAndSubmit(remainingAmount)}
                            >
                                Use balance and pay {remainingAmount} VND by card
                            </button>
                            <button className={styles.cardButton} onClick={handlePaymentByCard}>
                                Pay fully by card
                            </button>
                        </>
                    ) : (
                        <button className={styles.balanceButton} onClick={handleBalancePaymentAndSubmit}>
                            Pay with balance
                        </button>
                    )}
                    <button className={styles.cancelButton} onClick={onClose}>
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}

export default PaymentModal;
