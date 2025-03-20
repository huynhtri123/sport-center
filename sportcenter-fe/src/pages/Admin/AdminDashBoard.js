import React, { useEffect, useState } from 'react';
import styles from '../../assets/css/Admin/admin.module.scss';
import { Pie, Bar } from 'react-chartjs-2';
import ManageFields from './field/ManageFields';
import ManageTeams from './team/ManageTeams';
import ManageInvoices from './invoice/ManageInvoice';
import ManageSports from './sport/ManageSports';
import Signout from '../Auth/Signout';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import ManageCourses from './course/ManageCourses';
import ManageTournaments from './tournament/ManageTournaments';
import ManageBookings from './booking/ManageBookings';
import ManageUser from './user/ManageUser';
import ManageNotifications from './notification/ManageNotifications';
import revenueApi from '../../services/api/revenue/revenueApi';
import { RecurringIntervalType } from '../../utils/enums/RecurringIntervalType';
import { Link } from 'react-router-dom';

// Đăng ký các thành phần của Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

function AdminDashboard() {
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedSection, setSelectedSection] = useState('Dashboard');
    const [pieChartData, setPieChartData] = useState({
        labels: ['Single Bookings', 'BiWeekly Recurring', 'Weekly Recurring'],
        datasets: [
            {
                data: [0, 0, 0, 0],
                backgroundColor: ['rgba(255, 206, 86, 0.6)', 'rgba(75, 192, 192, 0.6)', 'rgba(153, 102, 255, 0.6)'],
                borderColor: ['rgba(255, 206, 86, 1)', 'rgba(75, 192, 192, 1)', 'rgba(153, 102, 255, 1)'],
                borderWidth: 1,
            },
        ],
    });

    const [revenueData, setRevenueData] = useState({
        labels: [],
        datasets: [
            {
                label: 'Revenue in VND',
                data: [],
                backgroundColor: [
                    'rgba(75, 192, 192, 0.6)',
                    'rgba(153, 102, 255, 0.6)',
                    'rgba(255, 159, 64, 0.6)',
                    'rgba(255, 99, 132, 0.6)',
                    'rgba(54, 162, 235, 0.6)',
                    'rgba(255, 206, 86, 0.6)',
                ],
                borderColor: [
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)',
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                ],
                borderWidth: 1,
            },
        ],
    });

    const sections = [
        { name: 'Dashboard', icon: 'fa-solid fa-chart-line' },
        { name: 'Manage Fields', icon: 'fa-solid fa-hockey-puck' },
        { name: 'Manage Courses', icon: 'fa-solid fa-dumbbell' },
        { name: 'Manage Sports', icon: 'fa-solid fa-basketball-ball' },
        { name: 'Manage Bookings', icon: 'fa-solid fa-calendar-check' },
        { name: 'Manage Invoices', icon: 'fa-solid fa-money-bill' },
        { name: 'Manage Teams', icon: 'fa-solid fa-people-group' },
        { name: 'Manage Tournaments', icon: 'fa-solid fa-trophy' },
        { name: 'Manage Users', icon: 'fa-solid fa-users' },
        { name: 'Manage Notifications', icon: 'fa-solid fa-bell' },
    ];

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch booking counts
                const countSingleBooking = await revenueApi.countSingleBooking();
                const weeklyRecurringBooking = await revenueApi.countRecurringBookingByType(
                    RecurringIntervalType.WEEKLY
                );
                const biWeeklyRecurringBooking = await revenueApi.countRecurringBookingByType(
                    RecurringIntervalType.BIWEEKLY
                );

                const totalBookings =
                    countSingleBooking.data + biWeeklyRecurringBooking.data + weeklyRecurringBooking.data;

                const rawData = [countSingleBooking.data, biWeeklyRecurringBooking.data, weeklyRecurringBooking.data];

                setPieChartData((prev) => ({
                    ...prev,
                    datasets: [
                        {
                            ...prev.datasets[0],
                            data: rawData,
                        },
                    ],
                }));

                // Fetch revenue for the last 6 months
                const revenueResponse = await revenueApi.getRevenueLastSixMonths(selectedYear);
                const revenueData = revenueResponse.data;

                // Chuyển đổi dữ liệu thành mảng cho biểu đồ
                const months = Object.keys(revenueData);
                // const amounts = Object.values(revenueData);
                const revenues = months.map((month) => revenueData[month].revenue);
                const refunds = months.map((month) => revenueData[month].refund_fee);

                const shortMonths = months.map((month) => {
                    const [monthName] = month.split(' '); // Lấy phần tên tháng
                    return monthName.substring(0, 3); // Cắt 3 chữ cái đầu tiên
                });

                setRevenueData({
                    labels: shortMonths,
                    datasets: [
                        {
                            label: 'Revenue (VND)',
                            data: revenues,
                            backgroundColor: 'rgba(75, 192, 192, 0.6)',
                            borderColor: 'rgba(75, 192, 192, 1)',
                            borderWidth: 1,
                        },
                        {
                            label: 'Refund Fee (VND)',
                            data: refunds,
                            backgroundColor: 'rgba(255, 99, 132, 0.6)',
                            borderColor: 'rgba(255, 99, 132, 1)',
                            borderWidth: 1,
                        },
                    ],
                });
            } catch (error) {
                console.error('Failed to fetch booking data:', error);
            }
        };

        fetchData();
    }, [selectedYear]);

    const renderContent = () => {
        switch (selectedSection) {
            case 'Dashboard':
                return (
                    <div className={styles.dashboardExpanded}>
                        <h2>Dashboard Overview</h2>
                        <p>Some detailed statistics and data can be shown here.</p>
                        {/* Dropdown chọn năm */}
                        <div className='mb-4'>
                            <label className='text-lg font-semibold mr-2'>Select Year:</label>
                            <select
                                value={selectedYear}
                                onChange={(e) => {
                                    const newYear = Number(e.target.value);
                                    setSelectedYear(newYear);
                                }}
                                className='border p-2 rounded-md'
                            >
                                {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                                    <option key={year} value={year}>
                                        {year}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className={styles.chartContainer}>
                            <div className={styles.chartWrapper}>
                                <h3>Monthly Revenue</h3>
                                <Bar
                                    data={revenueData}
                                    options={{
                                        responsive: true,
                                        plugins: {
                                            legend: {
                                                position: 'top',
                                            },
                                            title: {
                                                display: true,
                                                text: 'Revenue in the Last 6 Months',
                                            },
                                        },
                                        scales: {
                                            x: {
                                                ticks: {
                                                    autoSkip: false, // Hiển thị tất cả nhãn
                                                    maxRotation: 0, // Đặt góc xoay nhãn về 0
                                                    minRotation: 0, // Đặt góc xoay tối thiểu về 0
                                                    font: {
                                                        size: 8, // Thay đổi kích thước chữ cho nhãn tháng
                                                        weight: 'bolder',
                                                    },
                                                },
                                            },
                                        },
                                    }}
                                />
                            </div>
                            <div className={`${styles.chartWrapper} ${styles.smallChartWrapper}`}>
                                <h3>Booking Distribution</h3>
                                <Pie
                                    data={pieChartData}
                                    options={{
                                        responsive: true,
                                        plugins: {
                                            legend: {
                                                position: 'right',
                                            },
                                            title: {
                                                display: true,
                                                text: 'Types of Bookings',
                                            },
                                            tooltip: {
                                                callbacks: {
                                                    label: function (tooltipItem) {
                                                        const dataset = tooltipItem.dataset;
                                                        const index = tooltipItem.dataIndex;
                                                        const value = dataset.data[index];
                                                        return `${tooltipItem.label}: ${value} bookings`;
                                                    },
                                                },
                                            },
                                        },
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                );
            case 'Manage Fields':
                return <ManageFields />;
            case 'Manage Sports':
                return <ManageSports />;
            case 'Manage Courses':
                return <ManageCourses />;
            case 'Manage Tournaments':
                return <ManageTournaments />;
            case 'Manage Bookings':
                return <ManageBookings />;
            case 'Manage Teams':
                return <ManageTeams />;
            case 'Manage Invoices':
                return <ManageInvoices />;
            case 'Manage Users':
                return <ManageUser />;
            case 'Manage Notifications':
                return <ManageNotifications />;
            default:
                return <h2>Welcome to Admin Dashboard</h2>;
        }
    };

    return (
        <div className={styles.adminContainer}>
            <nav className={styles.sidebar} role='navigation' aria-label='Admin Panel'>
                <h2>Admin Panel</h2>
                <ul className={styles.navList}>
                    {sections.map((section) => (
                        // eslint-disable-next-line jsx-a11y/role-supports-aria-props
                        <li
                            key={section.name}
                            className={`${styles.navItem} ${selectedSection === section.name ? styles.active : ''}`}
                            onClick={() => setSelectedSection(section.name)}
                            role='menuitem'
                            aria-selected={selectedSection === section.name}
                        >
                            <i className={section.icon} aria-hidden='true'></i>
                            <span>{section.name}</span>
                        </li>
                    ))}
                </ul>

                <Link className={styles.link} to={'/'}>
                    <i className='fa-solid fa-arrow-right-long me-2'></i>
                    Go to Home Page
                </Link>
            </nav>

            <div className={styles.content}>
                <header className={styles.header}>
                    <h1>{selectedSection}</h1>
                    <Signout />
                </header>
                <div className={styles.mainContent}>{renderContent()}</div>
            </div>
        </div>
    );
}

export default AdminDashboard;
