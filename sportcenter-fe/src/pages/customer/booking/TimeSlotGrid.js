/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState } from 'react';
import clsx from 'clsx';
import styles from './timeSlotGrid.module.scss';
import { BookingDiscount } from '../../../utils/constants/BookingDiscount';

export default function TimeSlotGrid({ timeSlots, setStartTime, bookingProbabilities, startTimeRef }) {
    const [selectedTime, setSelectedTime] = useState(null);
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

                    // css cho timeSlot
                    const isSelected = slot.startTime === selectedTime;
                    const slotStyle = clsx(
                        styles.timeSlot,
                        isPastSlot ? styles.isPastSlot : isAvailable ? styles.available : styles.inUse,
                        isSelected && styles.selected // thêm class nếu slot được chọn
                    );

                    return (
                        <div
                            key={index}
                            className={clsx(styles.timeSlot, slotStyle)}
                            onClick={
                                isAvailable && !isPastSlot
                                    ? () => {
                                          const timeStr = slot.startTime.substring(11, 16);
                                          setStartTime(timeStr);
                                          setSelectedTime(slot.startTime);

                                          if (startTimeRef?.current) {
                                              startTimeRef.current.focus();
                                              startTimeRef.current.scrollIntoView({
                                                  behavior: 'smooth',
                                                  block: 'center',
                                              });
                                          }
                                      }
                                    : undefined
                            }
                        >
                            {/* Hot + Low demand badge */}
                            {probability !== undefined &&
                                Math.round(probability * 100) >= BookingDiscount.HOT_RATE * 100 && (
                                    <div className={styles.hotCorner}>Hot 🔥</div>
                                )}
                            {/* {slot.isLowDemand && <div className={styles.lowDemandBadge}>-50%</div>} */}
                            {slot.isLowDemand && <div className={styles.lowDemandBadge}>-{slot.discount}%</div>}

                            {/* Selected badge
                            {isSelected && <div className={styles.startBadge}>Start</div>} */}

                            {/* Time range */}
                            <span>
                                {slot.startTime.substring(11, 16)} - {slot.endTime.substring(11, 16)}
                            </span>

                            {/* Probability info */}
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
