import React from 'react';
import styles from '../../../assets/css/Profile/myBookings.module.scss';

function MyBookings({ bookings }) {
    return (
        <div className={styles.myBookingsContainer}>
            <div className={styles.bookingList}>
                {bookings.length > 0 ? (
                    bookings.map((booking) => <BookingCard key={booking.id} booking={booking} />)
                ) : (
                    <p>No bookings available.</p>
                )}
            </div>
        </div>
    );
}

function BookingCard({ booking }) {
    return (
        <div className={styles.bookingCard}>
            <h4>{booking.fieldResponse.fieldName}</h4>
            <p>
                <span>Booking Date:</span>
                <span>{booking.bookingDate}</span>
            </p>
            <p>
                <span>Start Time:</span>
                <span>{booking.startTime}</span>
            </p>
            <p>
                <span>End Time:</span>
                <span>{booking.endTime}</span>
            </p>
            <p>
                <span>Hours:</span>
                <span>{booking.numberOfHours}</span>
            </p>
            <p>
                <span>Total Price:</span>
                <span>${booking.totalPrice}</span>
            </p>
        </div>
    );
}

export default MyBookings;
