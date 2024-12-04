/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import Button from '../../../components/Button/Button';
import styles from '../../../assets/css/Payment/payments.module.scss';
import { usePaymentData } from '../../../customs/hooks';
import { useNavigate } from 'react-router-dom';
import { Loading } from '../../../components/Loading/Loading';
import { useUser } from '../../../customs/hooks';
import formatCurrency from '../../../utils/formatCurrency';
import { TransactionType } from '../../../utils/enums/TransactionType';
import { PaymentMethod } from '../../../utils/enums/PaymentMethod';
import ConfirmModal from '../../../components/Modal/ConfirmModal';

// cải tiến: trưởng hợp thanh toán CARD thất bại
export default function Payments() {
    const [paymentData] = usePaymentData(); // nạp dữ liệu payment được set từ PaymentModal (gồm có các hàm,...)
    const [user, setUser] = useUser();
    const { amount, onSubmit, type, createInvoice, confirmBooking, makePaymentByBalance, amountByBalance } =
        paymentData || {};
    const [selectedPaymentIndex, setSelectedPaymentIndex] = useState(0);
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const toggleModal = () => {
        setIsModalOpen(!isModalOpen);
    };

    // console.log('check user', user);
    // console.log('check ammout by balance:', amountByBalance);

    // Kiểm tra xem user có thông tin paymentInfos không
    const hasPaymentInfos = user?.paymentInfos?.length > 0;
    // Nếu không có paymentInfos, hiển thị thông báo yêu cầu người dùng thêm thông tin thanh toán
    if (!hasPaymentInfos) {
        return (
            <div className={styles.noPaymentInfo}>
                <p
                    onClick={() => navigate('/profile')}
                    style={{
                        cursor: 'pointer',
                        color: '#007bff', // Màu của liên kết
                        textDecoration: 'underline', // Gạch chân
                        fontWeight: 'bold', // Tăng độ nổi bật
                    }}
                    onMouseEnter={(e) => {
                        // Tạo hiệu ứng khi hover
                        e.target.style.color = '#0056b3';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.color = '#007bff';
                    }}
                >
                    You currently have no payment methods. Please add one.
                </p>
            </div>
        );
    }

    const handlePaymentSelection = (event) => {
        setSelectedPaymentIndex(event.target.value);
    };

    const selectedPayment = user?.paymentInfos?.[selectedPaymentIndex] || {};

    const cardPaymentForBooking = async () => {
        try {
            // buoc 1
            const bookingResponse = await onSubmit(); // booking || recurringBooking
            // console.log(bookingResponse);
            if (!bookingResponse) return;

            // thanh toan
            const transactionType = TransactionType.BOOKING;
            // 1. kiem tra neu có amountByBalance nghia la thanh toan lon xon
            if (amountByBalance) {
                const balancePaymentResponse = await makePaymentByBalance(amountByBalance);
                // console.log(amountByBalance);
                // console.log(balancePaymentResponse);
                if (!balancePaymentResponse) return;

                // tao hoa don balance
                await createInvoice(user.id, amountByBalance, transactionType, PaymentMethod.ACCOUNT_BALANCE);
            }
            // toast.success('Thanh toán thành công');

            // thanh toán thành công -> gọi api đặt sân bước 2
            // console.log(bookingResponse);
            const bookingId = bookingResponse.id;
            const confirmResponse = await confirmBooking(bookingId);
            if (!confirmResponse) return;

            // đặt sân bước 2 thành công -> tạo hoá đơn
            const invoiceAmount = amountByBalance ? amount - amountByBalance : amount;
            await createInvoice(user.id, invoiceAmount, transactionType, PaymentMethod.CARD);
            navigate('/payment-confirmation');
        } catch (err) {
            console.error(err);
        }
    };

    const cardPaymentForTournament = async () => {
        try {
            // buoc 1
            const registerTournamentResponse = await onSubmit(); // register tournament
            // console.log(registerTournamentResponse);
            if (!registerTournamentResponse) {
                navigate('/tournaments');
                return;
            }

            // thanh toan
            const transactionType = TransactionType.REGISTRATION_FEE;
            // 1. kiem tra neu có amountByBalance nghia la thanh toan lon xon
            if (amountByBalance) {
                const balancePaymentResponse = await makePaymentByBalance(amountByBalance);
                // console.log(amountByBalance);
                // console.log(balancePaymentResponse);
                if (!balancePaymentResponse) {
                    // huy dki
                    return;
                }
                // tao hoa don balance
                await createInvoice(user.id, amountByBalance, transactionType, PaymentMethod.ACCOUNT_BALANCE);
            }
            // toast.success('Thanh toán thành công');
            // thanh toán không thành công thì gọi hàm huỷ register

            // tạo hoá đơn
            const invoiceAmount = amountByBalance ? amount - amountByBalance : amount;
            await createInvoice(user.id, invoiceAmount, transactionType, PaymentMethod.CARD);
            navigate('/payment-confirmation');
        } catch (err) {
            console.error(err);
        }
    };

    const handlePayment = async (e) => {
        e.preventDefault();
        try {
            setIsLoading(true);
            if (type === TransactionType.BOOKING) {
                await cardPaymentForBooking();
            } else if (type === TransactionType.REGISTRATION_FEE) {
                await cardPaymentForTournament();
            }
        } catch (err) {
            console.error(err);
            // navigate('/tournaments');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.paymentContainer}>
            {isLoading && <Loading></Loading>}
            <section className={styles.userDetails}>
                <h1>Payment Details</h1>
                <p>
                    <strong>Name:</strong> {user?.fullName}
                </p>
                <p>
                    <strong>Email:</strong> {user?.email}
                </p>
                <p>
                    <strong>Phone:</strong> {user?.phoneNumber}
                </p>
                <p>
                    <strong>Total Amount:</strong> {formatCurrency(amount)}
                </p>
                <p>
                    <strong>Transaction Type:</strong> {type}
                </p>
            </section>

            <section className={styles.paymentSection}>
                <h2>Select Payment Method</h2>

                <form className={styles.paymentForm}>
                    <div className={styles.formGroup}>
                        <label htmlFor='paymentMethod'>Payment Method</label>
                        <select id='paymentMethod' value={selectedPaymentIndex} onChange={handlePaymentSelection}>
                            {user?.paymentInfos?.map((payment, index) => (
                                <option key={index} value={index}>
                                    {payment.cardHolderName} - {payment.cardNumber.slice(-4)}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.paymentDetails}>
                        <p>
                            <strong>Card Number:</strong> {selectedPayment.cardNumber}
                        </p>
                        <p>
                            <strong>Issue Date:</strong> {selectedPayment.issueDate}
                        </p>
                        <p>
                            <strong>Name on Card:</strong> {selectedPayment.cardHolderName}
                        </p>
                    </div>

                    <Button type='button' onClick={() => toggleModal()} className={styles.payButton}>
                        Pay Now
                    </Button>

                    {isModalOpen && (
                        <ConfirmModal
                            title={'Bạn có chắc muốn thực hiện thanh toán?'}
                            isOpen={isModalOpen}
                            onClose={toggleModal}
                            onSubmit={handlePayment}
                        ></ConfirmModal>
                    )}
                </form>
            </section>
        </div>
    );
}
