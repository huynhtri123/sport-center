/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import Button from '../../../components/Button/Button';
import styles from '../../../assets/css/Payment/payments.module.scss';
import { usePaymentData } from '../../../customs/hooks';
import { Loading } from '../../../components/Loading/Loading';
import { useUser } from '../../../customs/hooks';
import formatCurrency from '../../../utils/formatCurrency';
import { TransactionType } from '../../../utils/enums/TransactionType';
import paymentApi from '../../../services/api/payment/paymentApi';

export default function Payments() {
    const [paymentData] = usePaymentData(); // nạp dữ liệu payment được set từ PaymentModal (gồm có các hàm,...)
    const [user, setUser] = useUser();
    const { amount, onSubmit, type, createInvoice, confirmBooking, makePaymentByBalance, amountByBalance } =
        paymentData || {};
    const [isLoading, setIsLoading] = useState(false);

    const cardPaymentForBooking = async () => {
        try {
            // 1. đặt sân bước 1
            const bookingResponse = await onSubmit(); // booking || recurringBooking
            if (!bookingResponse) return;

            // 2. nếu đặt sân bước 1 thành công -> thanh toán
            // thanh toán bằng vnpay (nếu có số dư thì BE xử lý luôn r)
            const transactionType = TransactionType.BOOKING;
            const invoiceAmount = amountByBalance ? amount - amountByBalance : amount;
            const bookingId = bookingResponse.id;
            const vnpayRequest = {
                userId: user.id,
                amount: invoiceAmount,
                amountByBalance: amountByBalance || 0,
                transactionType: transactionType,
                bookingId: bookingId || '',
            };
            // thanh toán + đặt sân bước 2 luôn
            const response = await paymentApi.pay(vnpayRequest);
            window.location.href = response.url;

            // sau khi thanh toán, BE tự điều hướng
        } catch (err) {
            console.error(err);
        }
    };

    const cardPaymentForTournament = async () => {
        try {
            // 1. đăng ký giải đấu
            const registerTournamentResponse = await onSubmit(); // register tournament
            if (!registerTournamentResponse) {
                return;
            }
            const registerOrderId = registerTournamentResponse.id || '';

            // 2. thanh toán
            const transactionType = TransactionType.REGISTRATION_FEE;
            const invoiceAmount = amountByBalance ? amount - amountByBalance : amount;
            const vnpayRequest = {
                userId: user.id,
                amount: invoiceAmount,
                amountByBalance: amountByBalance || 0,
                transactionType: transactionType,
                registerOrderId,
            };
            const response = await paymentApi.pay(vnpayRequest);
            window.location.href = response.url;

            // BE tự điều hướng về
        } catch (err) {
            console.error(err);
        }
    };

    const handlePayment = async () => {
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

    const invoiceAmount = amountByBalance ? amount - amountByBalance : amount;
    // const info = {
    //     name: user?.fullName,
    //     email: user?.email,
    //     invoiceAmount: invoiceAmount,
    //     transactionType: type,
    // };
    // console.log(info);

    return (
        <div className={styles.paymentContainer}>
            {isLoading && <Loading />}
            <section className={styles.userDetails}>
                <h1>Payment Details</h1>
                <img
                    src='https://media.istockphoto.com/id/1302890997/vector/hand-holding-debit-or-credit-card-for-payment.jpg?s=612x612&w=0&k=20&c=OP-4pSwFTiCdPEuUwnxpVFHieozYLJIx8-KdHfmwC_s='
                    alt='Payment Illustration'
                    className={styles.paymentImage}
                />
                <div className={styles.details}>
                    <p>
                        <strong>Name:</strong> {user?.fullName}
                    </p>
                    <p>
                        <strong>Email:</strong> {user?.email}
                    </p>
                    <p>
                        <strong>Total Amount:</strong> {formatCurrency(invoiceAmount)}
                    </p>
                    <p>
                        <strong>Transaction Type:</strong> {type}
                    </p>
                </div>
            </section>

            <section className={styles.paymentSection}>
                <h2>Select Payment Method</h2>
                <div className={styles.paymentMethod}>
                    <div className={styles.vnpayCard}>
                        <img
                            src='https://vnpay.vn/s1/statics.vnpay.vn/2023/6/0oxhzjmxbksr1686814746087.png'
                            alt='VNPay Logo'
                            className={styles.vnpayLogo}
                        />
                        <h3>VNPay Payment</h3>
                        <p>Pay securely through VNPay gateway.</p>
                        <Button type='button' onClick={() => handlePayment()} className={styles.payButton}>
                            Proceed to Pay
                        </Button>
                    </div>
                </div>
            </section>
        </div>
    );
}
