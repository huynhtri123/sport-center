import styles from './paymentModal.module.scss';
import userApi from '../../services/api/userApi';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useUser } from '../../customs/hooks';
import { PaymentMethod } from '../../utils/enums/PaymentMethod';
import { PaymentStatus } from '../../utils/enums/PaymentStatus';
import { TransactionType } from '../../utils/enums/TransactionType';
import invoiceApi from '../../services/api/invoiceApi';

function PaymentModal({ isOpen, onClose, onSubmit, price, isBookingPayment, isRegistrationPayment }) {
    const [accountBalance, setAccountBalance] = useState(0);
    const [user, setUser] = useUser();

    const fetchUser = async () => {
        try {
            const userResponse = await userApi.getCurrentUser();
            // console.log(userResponse);
            setUser(userResponse.data);
        } catch (err) {
            console.error(err);
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
            console.error(err);
        }
    };

    useEffect(() => {
        getAccountBalance();
    }, []);

    // Tính số tiền còn lại cần thanh toán sau khi trừ số dư
    const remainingAmount = Math.max(price - accountBalance, 0);

    const handleBalancePaymentAndSubmit = async () => {
        try {
            // gọi hàm subnit từ cha (booking || register tournament)
            const submitResponse = await onSubmit();
            if (submitResponse) {
                const balancePaymentResponse = await userApi.makePaymentByBalance(price);
                // có data nghĩa là thành công
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
                    // console.log(invoiceResponse);
                    if (invoiceResponse.data) {
                        toast.info(invoiceResponse.message);
                    } else {
                        toast.error('Tạo hóa đơn thất bại!');
                    }
                }
            }
        } catch (err) {
            console.error(err);
        }
    };

    // thanh toán bằng cả số dư và thẻ
    const handleRemainingPaymentAndSubmit = async (remainingAmount) => {
        try {
            // gọi hàm submit từ cha (booking || register tournament)
            const submitResponse = await onSubmit();
            if (submitResponse) {
                // thanh toán 1 phần bằng số dư
                const balancePaymentResponse = await userApi.makePaymentByBalance(accountBalance);
                // có data nghĩa là thành công
                if (balancePaymentResponse.data) {
                    toast.success(balancePaymentResponse.message);
                    // phần còn lại thanh toán bằng thẻ
                    if (remainingAmount > 0) {
                        // Gọi API thanh toán bằng thẻ với số tiền còn lại
                        //trung: thanh toán số tiền = remainingAmount
                        toast.info('Trung thanh toán phần này: ' + remainingAmount);
                        // nếu thanh toán ko thành công thì huỷ booking****
                    }
                    // Sau khi thanh toán xong, tạo hóa đơn
                    const transactionType = isBookingPayment
                        ? TransactionType.BOOKING
                        : TransactionType.REGISTRATION_FEE;

                    const invoiceRequest = {
                        userId: user.id,
                        totalAmount: price, // Tổng số tiền (là số dư + phần còn lại)
                        paymentStatus: PaymentStatus.PAID,
                        paymentMethod: PaymentMethod.ACCOUNT_BALANCE, // Hoặc bạn có thể kết hợp PaymentMethod nếu thanh toán bằng thẻ
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
            console.error(err);
        }
    };

    const handlePaymentByCard = (price) => {
        //trung
        toast.info('Gọi api thanh toán bằng thẻ: ' + price);
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
                        // Nếu số dư = 0, chỉ hiển thị nút thanh toán bằng thẻ
                        <button className={styles.cardButton} onClick={() => handlePaymentByCard(price)}>
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
                            <button className={styles.cardButton} onClick={() => handlePaymentByCard(price)}>
                                Thanh toán toàn bộ bằng thẻ
                            </button>
                        </>
                    ) : (
                        <button className={styles.balanceButton} onClick={() => handleBalancePaymentAndSubmit()}>
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
