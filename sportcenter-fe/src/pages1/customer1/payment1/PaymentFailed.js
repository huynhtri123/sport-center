import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import Button from '../../../components/button/button';
import styles from '../../../assets/css/payment/paymentFailed.module.scss';

export default function PaymentFailed() {
    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const errorMessage = queryParams.get('error');

    return (
        <div className={styles.failedContainer}>
            <h1>Payment Failed!</h1>
            {errorMessage ? (
                <p>{errorMessage}</p>
            ) : (
                <p>
                    Unfortunately, your payment was not successful. Please try again or contact support for assistance.
                </p>
            )}

            <Button className={styles.retryButton} onClick={() => navigate('/')}>
                Back to Home
            </Button>
        </div>
    );
}
