import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/Button/Button';
import styles from '../../../assets/css/Payment/paymentConfirmation.module.scss';

export default function PaymentConfirmation() {
    const navigate = useNavigate();

    return (
        <div className={styles.confirmationContainer}>
            <h1>Payment successfully!</h1>
            <p>Your order and payment were successful. Thank you!</p>

            <Button className={styles.backButton} onClick={() => navigate('/')}>
                Back to Home
            </Button>
        </div>
    );
}
