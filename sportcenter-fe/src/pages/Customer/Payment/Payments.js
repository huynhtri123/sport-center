import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import bookingApi from '../../../services/api/booking/bookingApi';
import Button from '../../../components/Button/Button';
import styles from '../../../assets/css/Payment/payments.module.scss';
import userApi from '../../../services/api/userApi';

export default function Payments() {
    const location = useLocation();
    const navigate = useNavigate();
    const [isProcessing, setIsProcessing] = useState(false);
    const [userInfo, setUserInfo] = useState({ email: '', fullName: '' });
    const [savedPaymentInfo, setSavedPaymentInfo] = useState(null);
    
    // Card payment details
    const [cardNumber, setCardNumber] = useState('');
    const [issueDate, setIssueDate] = useState('');
    const [cardName, setCardName] = useState('');

    const { field, selectedDate, startTime, numberOfHours, totalPrice } = location.state || {};
  
    // Redirect if data is missing
    useEffect(() => {
        if (!field || !selectedDate || !startTime) {
            // Điều hướng nếu dữ liệu bị thiếu
            navigate('/payment-confirmation'); // Điều hướng về trang booking để người dùng có thể chọn lại dữ liệu.
            return;
        }
    
        // Tiếp tục fetch thông tin người dùng nếu tất cả dữ liệu cần thiết đã có
        const fetchUserProfile = async () => {
            try {
                const response = await userApi.myProfile();
                const { email, fullName, paymentInfos } = response.data;
                setUserInfo({ email, fullName });
    
                // Set thông tin thanh toán nếu có
                if (paymentInfos && paymentInfos.length > 0) {
                    setSavedPaymentInfo(paymentInfos[0]);
    
                    // Set giá trị mặc định cho form nếu thông tin thanh toán đã có
                    setCardNumber(paymentInfos[0].cardNumber || '');
                    setIssueDate(paymentInfos[0].issueDate || '');
                    setCardName(paymentInfos[0].cardHolderName || '');
                }
            } catch (err) {
                console.error('Error fetching user info:', err);
                toast.error('Failed to load user payment information.');
            }
        };
    
        fetchUserProfile();
    }, [field, selectedDate, startTime, navigate]);
    

        

    const handlePayment = async () => {
        try {
            setIsProcessing(true); // Start processing

            // Ensure card details are filled
            if (!cardNumber || !issueDate || !cardName) {
                toast.error('Please enter valid card details.');
                setIsProcessing(false);
                return;
            }

            // Format start time into UTC string
            const startDateTimeString = `${selectedDate}T${startTime}:00+00:00`;
            const startTimeUTC = new Date(startDateTimeString).toISOString();

            // Prepare booking request data
            const bookingRequest = {
                fieldId: field.id,
                startTime: startTimeUTC,
                numberOfHours: numberOfHours,
            };

            // Call the booking API
            const response = await bookingApi.createBooking(bookingRequest);

            // Check if the booking was successful
            if (response?.status === 200 && response?.data?.message) {
                // Show success toast
                toast.success(response.data.message);

                // Redirect to payment confirmation
                navigate('/payment-confirmation', {
                    state: {
                        field: field,
                        selectedDate: selectedDate,
                        startTime: startTime,
                        numberOfHours: numberOfHours,
                        totalPrice: field.price * numberOfHours,
                    },
                    replace: true, // Prevent back navigation
                });
            } else {
                toast.error('Booking failed!');
            }
        } catch (error) {
            console.error('Error during booking:', error);
            toast.error('Failed to create booking after payment.');
        } finally {
            setIsProcessing(false); // End processing
        }
    };

    // Fallback in case of missing required data
    if (!field || !selectedDate || !startTime) {
        return <div>Loading...</div>; // Or redirect to booking if data is missing
    }

    return (
        <div className={styles.paymentContainer}>
            <div className={styles.fieldSummary}>
                <h1>{field.fieldName}</h1>
                <h2>{totalPrice} VND</h2>
                <p>{field.description}</p>
                <div className={styles.fieldImageContainer}>
                    <img src={field.imageUrl} alt={field.fieldName} className={styles.fieldImage} />
                </div>
                <p><strong>Number of hours booked:</strong> {numberOfHours}</p>
            </div>

            <div className={styles.paymentFormContainer}>
                <h2>Pay with card</h2>
                <form className={styles.paymentForm}>
                    <div className={styles.formGroup}>
                        <label htmlFor='cardNumber'>Card number:</label>
                        <input
                            type='text'
                            id='cardNumber'
                            placeholder='Enter card number'
                            value={cardNumber}
                            onChange={(e) => setCardNumber(e.target.value)}
                            required
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor='issueDate'>Issue date:</label>
                        <input
                            type='text'
                            id='issueDate'
                            placeholder='MM/YY'
                            value={issueDate}
                            onChange={(e) => setIssueDate(e.target.value)}
                            required
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor='cardName'>Name on card:</label>
                        <input
                            type='text'
                            id='cardName'
                            placeholder='Enter cardholder name'
                            value={cardName}
                            onChange={(e) => setCardName(e.target.value)}
                            required
                        />
                    </div>

                    <Button
                        type='button'
                        onClick={handlePayment}
                        disabled={isProcessing}
                        className={styles.paymentButton}
                    >
                        {isProcessing ? 'Processing...' : 'Pay Now'}
                    </Button>
                    <div className={styles.logoContainer}>
                        <img 
                            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQefI6pAZDTEXZqfmgJTghDkO1wpT39ZsuR8A&s" 
                            alt="Visa Logo" 
                            className={styles.paymentLogo} 
                        />
                        <img 
                            src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Logo_BIDV.svg/2560px-Logo_BIDV.svg.png" 
                            alt="Banking Logo" 
                            className={styles.paymentLogo} 
                        />
                    </div>
                </form>
            </div>
        </div>
    );
}