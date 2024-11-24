import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/Button/Button';
import styles from '../../../assets/css/Payment/paymentConfirmation.module.scss';

export default function PaymentConfirmation() {
    const navigate = useNavigate();

    return (
        <div className={styles.confirmationContainer}>
            <h1>Payment and Booking Confirmed!</h1>
            <p>Your booking and payment were successful. Thank you!</p>

            <Button className={styles.backButton} onClick={() => navigate('/sport-center')}>
                Back to Home
            </Button>
        </div>
    );
}
