import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useUser } from '../../../customs/hooks';
import bookingApi from '../../../services/api/booking/bookingApi';
import Button from '../../../components/Button/Button';
import styles from '../../../assets/css/Payment/payments.module.scss';
import userApi from '../../../services/api/userApi';
import { useGetBookings } from '../../../customs/hooks'; // Importing context

export default function Payments() {
    const navigate = useNavigate();
    const [user, setUser] = useUser();
    const [bookingData, setBookingData] = useGetBookings(); // Getting booking data from context
    const [isProcessing, setIsProcessing] = useState(false);
    const [userInfo, setUserInfo] = useState({ email: '', fullName: '' });
    const [selectedPaymentIndex, setSelectedPaymentIndex] = useState(0); // State to track selected payment

    // Extract booking details from context
    const { field, selectedDate, startTime, numberOfHours, price } = bookingData || {};

    useEffect(() => {
        if (!bookingData) {
            navigate('/booking'); // Redirect if data is missing
            return;
        }

        // Fetch user profile details
        const fetchUserProfile = async () => {
            try {
                const response = await userApi.myProfile();
                const { email, fullName } = response.data;
                setUserInfo({ email, fullName });
            } catch (err) {
                console.error('Error fetching user info:', err);
                toast.error('Failed to load user payment information.');
            }
        };
        fetchUserProfile();
    }, [bookingData, navigate]);

    // Handle payment submission
    const handlePayment = async () => {
        try {
            setIsProcessing(true); // Start processing

            // Ensure user info is present
            if (!userInfo.email || !userInfo.fullName) {
                toast.error('User information is incomplete.');
                setIsProcessing(false);
                return;
            }

            // Prepare booking request data
            const bookingRequest = {
                fieldId: field.id,
                startTime: new Date(`${selectedDate}T${startTime}:00`).toISOString(),
                numberOfHours: numberOfHours,
            };

            // Log the request to ensure all data is correct
            console.log('Booking Request:', bookingRequest);

            // Call the booking API
            const response = await bookingApi.createBooking(bookingRequest);
            console.log('API Response:', response); // Log the response

            // Check if the booking was successful
            if (response?.status === 200 && response?.data?.message) {
                toast.success(response.data.message);
                navigate('/payment-confirmation', {
                    state: {
                        field,
                        selectedDate,
                        startTime,
                        numberOfHours,
                        totalPrice: price,
                    },
                    replace: true,
                });
            } else {
                console.error('Error creating booking:', response?.data?.message || 'Unknown error');
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

    // Handle payment method selection
    const handlePaymentSelection = (event) => {
        setSelectedPaymentIndex(event.target.value); // Update the selected payment index
    };

    // Get the currently selected payment info
    const selectedPayment = user?.paymentInfos?.[selectedPaymentIndex] || {};

    return (
        <div className={styles.paymentContainer}>
            <div className={styles.fieldSummary}>
                <h1>{field.fieldName}</h1>
                <h2>{price} VND</h2>
                <p>{field.description}</p>
                <div className={styles.fieldImageContainer}>
                    <img src={field.imageUrl} alt={field.fieldName} className={styles.fieldImage} />
                </div>
                <p><strong>Number of hours booked:</strong> {numberOfHours}</p>
            </div>

            <div className={styles.paymentFormContainer}>
                <h2>Pay with card</h2>
                <form className={styles.paymentForm}>
                    {/* Dropdown to select payment method */}
                    <div className={styles.formGroup}>
                        <label htmlFor="paymentMethod">Select Payment Method:</label>
                        <select
                            id="paymentMethod"
                            value={selectedPaymentIndex}
                            onChange={handlePaymentSelection}
                        >
                            {user?.paymentInfos?.map((payment, index) => (
                                <option key={index} value={index}>
                                    {payment.cardHolderName} - {payment.cardNumber}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Display selected payment details */}
                    <div className={styles.formGroup}>
                        <label htmlFor="cardNumber">Card number:</label>
                        <input
                            type="text"
                            id="cardNumber"
                            placeholder={selectedPayment.cardNumber || 'Enter card number'}
                            value={selectedPayment.cardNumber || ''}
                            readOnly
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="issueDate">Issue date:</label>
                        <input
                            type="text"
                            id="issueDate"
                            placeholder="MM/YY"
                            value={selectedPayment.issueDate || ''}
                            readOnly
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="cardName">Name on card:</label>
                        <input
                            type="text"
                            id="cardName"
                            placeholder="Enter cardholder name"
                            value={selectedPayment.cardHolderName || ''}
                            readOnly
                        />
                    </div>

                    <Button
                        type="button"
                        onClick={handlePayment}
                        disabled={isProcessing}
                        className={styles.paymentButton}
                    >
                        {isProcessing ? 'Processing...' : 'Pay Now'}
                    </Button>
                </form>
            </div>
        </div>
    );
}