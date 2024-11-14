import styles from './paymentModal.module.scss';
import userApi from '../../services/api/userApi';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

function PaymentModal({ isOpen, onClose, onSubmit, price }) {
    const [accountBalance, setAccountBalance] = useState(0);

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
            // gọi hàm tạo booking
            const bookingSuccess = await onSubmit();
            if (bookingSuccess) {
                const balancePaymentResponse = await userApi.makePaymentByBalance(price);
                // console.log(balancePaymentResponse);
                toast.success(balancePaymentResponse.message);
            }
        } catch (err) {
            console.error(err);
        }
    };

    // thanh toán bằng cả số dư và thẻ
    const handleRemainingPaymentAndSubmit = async (remainingAmount) => {
        try {
            // gọi hàm tạo booking
            const bookingSuccess = await onSubmit();
            if (bookingSuccess) {
                // thanh toán bằng toàn bộ số dư
                const balancePaymentResponse = await userApi.makePaymentByBalance(accountBalance);
                console.log(balancePaymentResponse);

                // thanh toán phần còn lại bằng thẻ: gọi api thanh toán với số tiền remainingAmount
                toast.info('Phần còn lại: ' + remainingAmount);
                console.log('Phần còn lại: ', remainingAmount);
                // nếu thanh toán ko thành công thì huỷ booking

                toast.success(balancePaymentResponse.message);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handlePaymentByCard = (price) => {
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
