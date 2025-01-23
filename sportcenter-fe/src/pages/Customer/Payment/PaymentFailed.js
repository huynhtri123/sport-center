import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/Button/Button';
import styles from '../../../assets/css/Payment/paymentFailed.module.scss';

export default function PaymentFailed() {
    const navigate = useNavigate();

    return (
        <div className={styles.failedContainer}>
            <h1>Payment Failed!</h1>
            <p>Unfortunately, your payment was not successful. Please try again or contact support for assistance.</p>

            <Button className={styles.retryButton} onClick={() => navigate('/')}>
                Back to Home
            </Button>
        </div>
    );
}
