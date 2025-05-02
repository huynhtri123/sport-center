/* eslint-disable react-hooks/exhaustive-deps */
import React from 'react';
import clsx from 'clsx';
import styles from './timeSlotGrid.module.scss';

export default function TimeSlotGrid({ timeSlots, setStartTime, bookingProbabilities }) {
    return (
        <div className={styles.timeSlotGrid}>
            {timeSlots.length > 0 ? (
                timeSlots.map((slot, index) => {
                    const slotStartTime = new Date(slot.startTime);
                    const currentTimeVN = new Date(new Date().getTime() + 7 * 60 * 60 * 1000);
                    const isPastSlot = slotStartTime < currentTimeVN;
                    const isAvailable = slot.status === 'AVAILABLE';
                    const hour = parseInt(slot.startTime.substring(11, 13)); // Lấy giờ

                    const probability = bookingProbabilities ? bookingProbabilities[hour] : undefined;

                    return (
                        <div
                            key={index}
                            className={clsx(
                                styles.timeSlot,
                                isAvailable && !isPastSlot ? styles.available : styles.inUse
                            )}
                            onClick={
                                isAvailable && !isPastSlot
                                    ? () => setStartTime(slot.startTime.substring(11, 16))
                                    : undefined
                            }
                        >
                            {probability !== undefined && probability >= 0.7 && (
                                <div className={styles.hotCorner}>Hot 🔥</div>
                            )}
                            <span>
                                {slot.startTime.substring(11, 16)} - {slot.endTime.substring(11, 16)}
                            </span>
                            {probability !== undefined && (
                                <div className={styles.probabilityLabel}>
                                    {(probability * 100).toFixed(0)}% likely booked
                                </div>
                            )}
                        </div>
                    );
                })
            ) : (
                <p>There are no available time slots for the selected day.</p>
            )}
        </div>
    );
}
