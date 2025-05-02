/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState, useCallback } from 'react';
import styles from './createMatches.module.scss';
import { toast } from 'react-toastify';
import { Modal } from 'antd';
import fieldApi from '../../../services/api/field/fieldApi';
import bookingApi from '../../../services/api/booking/bookingApi';
import { connectWebSocket, disconnectWebSocket } from '../../../services/websocket/connect';
import TimeSlotGrid from '../../Customer/Booking/TimeSlotGrid';
import matchApi from '../../../services/api/match/matchApi';
import { Loading } from '../../../components/Loading/Loading';

export default function CreateMatches({ onCancel, tournament, getMatches, getAdvancingTeams, getStandings }) {
    const [fields, setFields] = useState([]);
    const [selectedFieldId, setSelectedFieldId] = useState('');
    const [selectedDate, setSelectedDate] = useState('');
    const [timeSlots, setTimeSlots] = useState([]);
    const [startTime, setStartTime] = useState(''); // Start time từ TimeSlotGrid
    const [numberOfHours, setNumberOfHours] = useState(1); // Số giờ
    const [gap, setGap] = useState(0); // Khoảng cách giữa các trận
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Khi component mount, kết nối WebSocket
        connectWebSocket(
            (updatedBooking) => {
                // Xử lý cập nhật booking
                if (selectedDate) {
                    fetchTimeSlots(selectedFieldId, selectedDate);
                }
            },
            (newNotification) => {
                // Xử lý notification mới
                console.log('🔔 Notification mới nhận:', newNotification);
            }
        );

        // Cleanup khi component bị unmount (rời khỏi trang)
        return () => {
            disconnectWebSocket(); // Ngắt kết nối WebSocket khi component unmount
        };
    }, [selectedDate]); // Chỉ chạy 1 lần khi component mount

    useEffect(() => {
        const fetchField = async () => {
            try {
                const response = await fieldApi.findBySportId(tournament.sport.id);
                setFields(response.data);
                if (response.data.length > 0) {
                    setSelectedFieldId(response.data[0].id);
                }
            } catch (err) {
                console.error(err);
            }
        };

        fetchField();
    }, [tournament.sport.id]);

    const fetchTimeSlots = useCallback(async (fieldId, date) => {
        if (!fieldId || !date) return;

        const schedule = {
            fieldId: fieldId,
            startOfDay: `${date}T00:00:00+07:00`,
            endOfDay: `${date}T23:59:00+07:00`,
        };

        try {
            const response = await bookingApi.updateAndGetSchedule(schedule);
            setTimeSlots(response.data.timeSlots || []);
        } catch (error) {
            console.error('Error fetching time slots:', error);
        }
    }, []);

    useEffect(() => {
        if (selectedFieldId && selectedDate) {
            fetchTimeSlots(selectedFieldId, selectedDate);
        }
    }, [selectedFieldId, selectedDate, fetchTimeSlots]);

    const handleSubmit = async () => {
        if (!startTime || !numberOfHours || gap === undefined || gap === null) {
            toast.error('Please fill in all required fields.');
            return;
        }

        setLoading(true);

        const startDateTimeString = `${selectedDate}T${startTime}:00+00:00`;
        const startTimeUTC = new Date(startDateTimeString).toISOString();

        const request = {
            tournamentId: tournament.id,
            fieldId: selectedFieldId,
            startTime: startTimeUTC,
            numberOfHours,
            gapBetweenMatches: gap,
        };

        try {
            const response = await matchApi.createMatches(request);
            getMatches(tournament.id);
            getAdvancingTeams(tournament.id);
            getStandings(tournament.id);
            toast.success(response.message);
            onCancel(); // đóng form
        } catch (error) {
            const errMessage = error?.response?.data?.message || 'Error';
            console.error(errMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmSubmit = () => {
        if (!startTime || !numberOfHours || gap === undefined || gap === null) {
            toast.error('Please fill in all required fields.');
            return;
        }

        const modal = Modal.confirm({
            title: 'Confirm match schedule creation?',
            content: (
                <div>
                    <p>
                        <strong>Date:</strong> {selectedDate}
                    </p>
                    <p>
                        <strong>Start time:</strong> {startTime}
                    </p>
                    <p>
                        <strong>Duration per match (hours):</strong> {numberOfHours}
                    </p>
                    <p>
                        <strong>Gap between matches (hours):</strong> {gap}
                    </p>
                </div>
            ),
            okText: 'Confirm',
            cancelText: 'Cancel',
            onOk: () => {
                modal.destroy(); // Close modal immediately on confirm
                setTimeout(handleSubmit, 0); // Trigger submit after modal closes
            },
        });
    };

    return (
        <div className={styles.container}>
            {loading && <Loading></Loading>}
            <button className={styles.btn} onClick={onCancel}>
                Close
            </button>

            {/* Chọn sân */}
            {fields.length > 0 && (
                <>
                    <label htmlFor='fieldSelect'>Choose a field: </label>
                    <select
                        id='fieldSelect'
                        value={selectedFieldId}
                        onChange={(e) => setSelectedFieldId(e.target.value)}
                    >
                        {fields.map((field) => (
                            <option key={field.id} value={field.id}>
                                {field.fieldName}
                            </option>
                        ))}
                    </select>
                </>
            )}

            {/* Chọn ngày */}
            <div style={styles.selectDateInput}>
                <label htmlFor='dateSelect'>Choose start date: </label>
                <input
                    type='date'
                    id='dateSelect'
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                />
            </div>

            {/* Hiển thị TimeSlotGrid */}
            {timeSlots.length > 0 ? (
                <TimeSlotGrid
                    timeSlots={timeSlots}
                    setStartTime={setStartTime} // Gán hàm lấy startTime từ TimeSlotGrid
                />
            ) : (
                selectedDate && <p>There is no time frame available for this date.</p>
            )}

            {/* Hiển thị startTime */}
            {startTime && (
                <div style={{ marginTop: '1rem' }}>
                    <p>
                        Selected Start Time: <strong>{startTime}</strong>
                    </p>
                </div>
            )}

            {/* Input cho số giờ của mỗi trận đấu*/}
            <div style={{ marginTop: '1rem' }}>
                <label htmlFor='numberOfHours'>Duration per match (hours): </label>
                <input
                    type='number'
                    id='numberOfHours'
                    value={numberOfHours}
                    min={1}
                    max={24}
                    onChange={(e) => setNumberOfHours(Number(e.target.value))}
                />
            </div>

            {/* Input cho gap giữa các trận đấu */}
            <div style={{ marginTop: '1rem' }}>
                <label htmlFor='gap'>Gap between matches (hours): </label>
                <input
                    type='number'
                    id='gap'
                    value={gap}
                    min={0}
                    max={24}
                    onChange={(e) => setGap(Number(e.target.value))}
                />
            </div>

            {/* Nút Submit */}
            <button className={styles.btn} onClick={handleConfirmSubmit} disabled={loading}>
                {loading ? 'Submitting...' : 'Submit'}
            </button>
        </div>
    );
}
