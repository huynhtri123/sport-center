import React from 'react';
import styles from './RecurringTimeSlotsModal.module.scss';
import { formatToISODate, formatToISOTime } from '../../utils/DateTimeConverter';

const RecurringTimeSlotsModal = ({ timeSlots, onClose }) => {
    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <h4>Recurring Time Slots</h4>
                <ul className={styles.timeSlotList}>
                    {timeSlots.length > 0 ? (
                        timeSlots.map((slot, index) => {
                            return (
                                <li key={index} className={styles.timeSlotItem}>
                                    <div className={styles.timeInfo}>
                                        <strong>Time slot {index + 1}</strong>
                                        <span>
                                            {formatToISOTime(slot.startTime)}. {formatToISODate(slot.startTime)} -{' '}
                                            {formatToISOTime(slot.endTime)}. {formatToISODate(slot.startTime)}
                                        </span>
                                    </div>
                                </li>
                            );
                        })
                    ) : (
                        <p>No time slots available.</p>
                    )}
                </ul>
                <button className={styles.closeButton} onClick={onClose}>
                    Close
                </button>
            </div>
        </div>
    );
};

export default RecurringTimeSlotsModal;
