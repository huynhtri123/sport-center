/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Table, Button, Badge, Select } from 'antd';
import bookingApi from '../../../services/api/booking/bookingApi';
import userApi from '../../../services/api/user/userApi';
import formatCurrency from '../../../utils/formatCurrency';
import styles from '../../../assets/css/Profile/myBookings.module.scss';
import { Loading } from '../../../components/Loading/Loading';
import PDFModal from '../../../components/Modal/PDFModal';
import { connectWebSocket, disconnectWebSocket } from '../../../services/websocket/connect';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    LineElement,
    PointElement,
    LinearScale,
    CategoryScale,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

// Đăng ký các thành phần cần thiết của Chart.js
ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Title, Tooltip, Legend);

const { Option } = Select;

const RevenueChart = ({ bookings }) => {
    const monthlyRevenue = Array(12).fill(0);

    bookings.forEach(booking => {
        const month = new Date(booking.startTime).getMonth();
        monthlyRevenue[month] += booking.totalPrice;
    });

    const months = [
        'January', 'February', 'March', 'April',
        'May', 'June', 'July', 'August',
        'September', 'October', 'November', 'December'
    ];

    const data = {
        labels: months,
        datasets: [
            {
                label: 'Booking Cost',
                data: monthlyRevenue,
                fill: false,
                backgroundColor: 'rgba(75,192,192,0.4)',
                borderColor: 'rgba(75,192,192,1)',
                tension: 0.1,
            },
        ],
    };

    return (
        <div>
            <h2 style={{ textAlign: 'center' }}>Booking Statistics Chart</h2>
            <Line data={data} />
        </div>
    );
};

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
        setSelectedBooking(booking);
        setIsRecurringCancel(false);
        setIsPDFModalVisible(true);
    };

    const showCancelRecurringConfirm = (booking) => {
        setSelectedBooking(booking);
        setIsRecurringCancel(true);
        setIsPDFModalVisible(true);
    };

    useEffect(() => {
        fetchBookings(selectedYear);
    }, [selectedYear]);

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
                    <Button
                        type='default'
                        style={{ background: '#d4dfea', color: '#fff' }}
                        onClick={() => showCancelConfirm(booking)}
                    >
                        Cancel
                    </Button>
                    {booking.recurring && (
                        <Button
                            type='default'
                            style={{ background: '#dcd7c8 ', color: '#fff' }}
                            onClick={() => showCancelRecurringConfirm(booking)}
                        >
                            Cancel Recurring
                        </Button>
                    )}
                </div>
            ),
            width: 100,
        },
    ];

    return (
        <div className={styles.container}>
            {isLoading && <Loading />}

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

            {/* Thêm Select Box chọn năm */}
            <div className={styles.filter}>
                <label style={{ marginRight: '10px', marginBottom: '16px', fontWeight: 'bold', color: 'black' }}>
                    Select Year:
                </label>
                <Select defaultValue={selectedYear} onChange={handleYearChange} style={{ width: 120 }}>
                    {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                        <Option key={year} value={year}>
                            {year}
                        </Option>
                    ))}
                </Select>
            </div>

            <RevenueChart bookings={bookings} />

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