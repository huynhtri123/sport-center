import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Table, Button, Badge, Modal, Select } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import bookingApi from '../../../services/api/booking/bookingApi';
import userApi from '../../../services/api/userApi';
import formatCurrency from '../../../utils/formatCurrency';
import styles from '../../../assets/css/Profile/myBookings.module.scss';
import { Loading } from '../../../components/Loading/Loading';

const { confirm } = Modal;
const { Option } = Select;

function MyBookings({ bookings, setMyBookings, getMyProfile, userId }) {
    const [isLoading, setIsLoading] = useState(false);
    const [selectedType, setSelectedType] = useState('All');
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [filteredBookings, setFilteredBookings] = useState(bookings);

    useEffect(() => {
        fetchBookings(selectedYear);
    }, [selectedYear]);

    const fetchBookings = async (year) => {
        try {
            setIsLoading(true);
            const response = await userApi.myBookings(year);
            console.log('Fetched Bookings:', response.data); // Kiểm tra dữ liệu API
            setMyBookings(response.data); // Cập nhật state chính xác
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleYearChange = (year) => {
        setSelectedYear(year);
    };
    const handleTypeChange = (value) => {
        setSelectedType(value);
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

    const showCancelConfirm = (booking) => {
        confirm({
            title: `Are you sure you want to cancel this booking?`,
            icon: <ExclamationCircleOutlined />,
            content: booking.recurring
                ? 'This is part of a recurring booking. Only this session will be canceled, and you will not receive a refund.'
                : 'You will receive a full refund.',
            onOk() {
                handleCancelBookingSubmit(booking.id);
            },
        });
    };

    const showCancelRecurringConfirm = (booking) => {
        confirm({
            title: `Are you sure you want to cancel the entire recurring booking?`,
            icon: <ExclamationCircleOutlined />,
            content: 'You will receive a 50% refund of the total remaining bookings in the cycle.',
            onOk() {
                handleCancelRecurring(booking.id);
            },
        });
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
                pagination={{ pageSize: 5 }}
            />
        </div>
    );
}

export default MyBookings;
