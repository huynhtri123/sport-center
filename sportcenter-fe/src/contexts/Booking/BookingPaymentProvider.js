// src/contexts/Booking/BookingProvider.js
import { useState } from 'react';
import BookingPaymentContext from './BookingPaymentContext';

function BookingPaymentProvider({ children }) {
    const [bookingData, setBookingData] = useState({});

    return (
        <BookingPaymentContext.Provider value={[bookingData, setBookingData]}>
            {children}
        </BookingPaymentContext.Provider>
    );
}

export default BookingPaymentProvider;
