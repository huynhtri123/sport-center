/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Table, Button, Badge, Select } from 'antd';
import bookingApi from '../../../services/api/booking/bookingApi';
import userApi from '../../../services/api/user/userApi';
import formatCurrency from '../../../utils/formatCurrency';
import styles from '../../../assets/css/profile/myBookings.module.scss';
import PDFModal from '../../../components/modal/PDFModal';
import { connectWebSocket, disconnectWebSocket } from '../../../services/websocket/connect';
import { Processing } from '../../../components/loadings/Processing';

const { Option } = Select;

function MyBookings({ bookings, setMyBookings, getMyProfile, userId }) {
    const [isLoading, setIsLoading] = useState(false);
    const [selectedType, setSelectedType] = useState('All');
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [isPDFModalVisible, setIsPDFModalVisible] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [isRecurringCancel, setIsRecurringCancel] = useState(false);

    useEffect(() => {
        connectWebSocket(
            (updatedBooking) => {
                fetchBookings(selectedYear);
            },
            (newNotification) => {
                console.log('🔔 Notification mới nhận:', newNotification);
            }
        );

        return () => {
            console.log('🔌 Ngắt kết nối WebSocket');
            disconnectWebSocket();
        };
    }, []);

    const showCancelConfirm = (booking) => {
        console.log(booking);
        setSelectedBooking(booking);
        setIsRecurringCancel(false);
        setIsPDFModalVisible(true);
    };

    const showCancelRecurringConfirm = (booking) => {
        console.log(booking);
        setSelectedBooking(booking);
        setIsRecurringCancel(true);
        setIsPDFModalVisible(true);
    };

    const fetchBookings = async (year) => {
        try {
            setIsLoading(true);
            const response = await userApi.myBookings(year);
            setMyBookings(response.data);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleYearChange = (year) => {
        setSelectedYear(year);
    };

    const handleCancelBookingSubmit = async (bookingId) => {
        try {
            setIsLoading(true);
            const response = await bookingApi.cancelBooking(bookingId);
            toast.info(response.message);
            setMyBookings((prev) => prev.filter((b) => b.id !== bookingId));
            getMyProfile();
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancelRecurring = async (bookingId) => {
        try {
            setIsLoading(true);
            const response = await bookingApi.cancelRecurring(bookingId);
            toast.success(response.message);
            setMyBookings((prev) => prev.filter((b) => !response.data.bookingIds.includes(b.id)));
            getMyProfile();
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const columns = [
        {
            title: 'Field Name',
            dataIndex: 'fieldResponse',
            key: 'field',
            render: (field) => field.fieldName,
            width: 240,
        },
        {
            title: 'Start Time',
            dataIndex: 'startTime',
            key: 'startTime',
            render: (startTime) => new Date(startTime).toLocaleString('vi-VN', { hour12: false }),
            sorter: (a, b) => new Date(a.startTime) - new Date(b.startTime),
            width: 180,
        },
        {
            title: 'End Time',
            dataIndex: 'endTime',
            key: 'endTime',
            render: (endTime) => new Date(endTime).toLocaleString('vi-VN', { hour12: false }),
            sorter: (a, b) => new Date(a.endTime) - new Date(b.endTime),
            width: 180,
        },
        {
            title: 'Total Price',
            dataIndex: 'totalPrice',
            key: 'price',
            render: formatCurrency,
            sorter: (a, b) => a.totalPrice - b.totalPrice,
            width: 140,
        },
        {
            title: 'Booking Type',
            dataIndex: 'recurring',
            key: 'type',
            render: (recurring) => (
                <Badge color={recurring ? 'orange' : 'blue'} text={recurring ? 'Recurring' : 'One-time'} />
            ),
            filters: [
                { text: 'One-time', value: false },
                { text: 'Recurring', value: true },
            ],
            onFilter: (value, record) => record.recurring === value,
            width: 180,
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, booking) => (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {/* Cancel single booking */}
                    <Button
                        type='default'
                        title={
                            booking.recurring
                                ? 'Cancel only this booking in the package'
                                : 'Cancel this individual booking'
                        }
                        style={{ background: '#f0ad4e', color: '#fff' }}
                        onClick={() => showCancelConfirm(booking)}
                    >
                        <i className='fa-solid fa-calendar-xmark me-2'></i>
                        {booking.recurring ? 'Cancel One' : 'Cancel'}
                    </Button>

                    {/* Cancel whole package */}
                    {booking.recurring && (
                        <Button
                            type='default'
                            title='Cancel the entire package, including all individual bookings in it'
                            style={{ background: '#6c757d', color: '#fff' }}
                            onClick={() => showCancelRecurringConfirm(booking)}
                        >
                            <i className='fa-solid fa-layer-group me-2'></i>
                            Cancel Package
                        </Button>
                    )}
                </div>
            ),
            width: 100,
        },
    ];

    return (
        <div className={styles.container}>
            {isLoading && <Processing />}

            <PDFModal
                visible={isPDFModalVisible}
                onConfirm={() => {
                    isRecurringCancel
                        ? handleCancelRecurring(selectedBooking.id)
                        : handleCancelBookingSubmit(selectedBooking.id);
                    setIsPDFModalVisible(false);
                }}
                onCancel={() => setIsPDFModalVisible(false)}
            />

            <Table
                columns={columns}
                dataSource={bookings
                    .filter(
                        (b) =>
                            selectedType === 'All' ||
                            (selectedType === 'Single' && !b.isRecurring) ||
                            (selectedType === 'Recurring' && b.isRecurring)
                    )
                    .map((b) => ({ ...b, key: b.id }))}
                pagination={{ pageSize: 5, showSizeChanger: false }}
            />
        </div>
    );
}

export default MyBookings;
