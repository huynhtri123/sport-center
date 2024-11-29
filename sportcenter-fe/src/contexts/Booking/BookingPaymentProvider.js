// src/contexts/Booking/BookingProvider.js
import { useState, useEffect } from 'react';
import BookingPaymentContext from './BookingPaymentContext';
import bookingApi from '../../services/api/booking/bookingApi'; // Adjust the path as necessary

function BookingPaymentProvider({ children }) {
    const [bookingData, setBookingData] = useState({});


    return (
        <BookingPaymentContext.Provider value={[bookingData, setBookingData]}>
            {children}
        </BookingPaymentContext.Provider>
    );
}

export default BookingPaymentProvider;