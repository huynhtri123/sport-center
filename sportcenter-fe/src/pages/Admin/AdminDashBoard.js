import React, { useEffect, useState } from 'react';
import styles from '../../assets/css/admin.module.scss';
import { Pie, Bar } from 'react-chartjs-2';
import ManageFields from './Field/ManageFields';
import ManageTeams from './ManageTeams';
import ManageInvoices from './ManageInvoice';
import ManageSports from './ManageSports';
import Signout from '../Auth/Signout';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import ManageCourses from './ManageCourses';
import ManageTournaments from './Tournament/ManageTournaments';
import ManageBookings from './ManageBookings';
import revenueApi from '../../services/api/revenueApi';
import { RecurringIntervalType } from '../../utils/enums/RecurringIntervalType';

// Đăng ký các thành phần của Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

function AdminDashboard() {
    const [selectedSection, setSelectedSection] = useState('Dashboard');
    const [pieChartData, setPieChartData] = useState({
        labels: ['Single Bookings', 'Daily Recurring', 'Weekly Recurring', 'Monthly Recurring'],
        datasets: [
            {
                data: [0, 0, 0, 0],
                backgroundColor: [
                    'rgba(255, 206, 86, 0.6)',
                    'rgba(75, 192, 192, 0.6)',
                    'rgba(153, 102, 255, 0.6)',
                    'rgba(255, 99, 132, 0.6)',
                ],
                borderColor: [
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 99, 132, 1)',
                ],
                borderWidth: 1,
            },
        ],
    });

    const [revenueData, setRevenueData] = useState({
        labels: [],
        datasets: [
            {
                label: 'Revenue in USD',
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
    ];

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch booking counts
                const countSingleBooking = await revenueApi.countSingleBooking();
                const dailyRecurringBooking = await revenueApi.countRecurringBookingByType(RecurringIntervalType.DAILY);
                const weeklyRecurringBooking = await revenueApi.countRecurringBookingByType(RecurringIntervalType.WEEKLY);
                const monthlyRecurringBooking = await revenueApi.countRecurringBookingByType(RecurringIntervalType.MONTHLY);

                const totalBookings = countSingleBooking.data + dailyRecurringBooking.data + weeklyRecurringBooking.data + monthlyRecurringBooking.data;

                const normalizedData = totalBookings > 0
                    ? [
                        (countSingleBooking.data / totalBookings) * 100,
                        (dailyRecurringBooking.data / totalBookings) * 100,
                        (weeklyRecurringBooking.data / totalBookings) * 100,
                        (monthlyRecurringBooking.data / totalBookings) * 100,
                    ]
                    : [0, 0, 0, 0];

                setPieChartData((prev) => ({
                    ...prev,
                    datasets: [{
                        ...prev.datasets[0],
                        data: normalizedData,
                    }],
                }));

                // Fetch revenue for the last 6 months
                const revenueResponse = await revenueApi.getRevenueLastSixMonths();
                const revenueData = revenueResponse.data;

                // Chuyển đổi dữ liệu thành mảng cho biểu đồ
                const months = Object.keys(revenueData);
                const amounts = Object.values(revenueData);

                setRevenueData((prev) => ({
                    ...prev,
                    labels: months,
                    datasets: [{
                        ...prev.datasets[0],
                        data: amounts,
                    }],
                }));
            } catch (error) {
                console.error('Failed to fetch booking data:', error);
            }
        };

        fetchData();
    }, []);

    const renderContent = () => {
        switch (selectedSection) {
            case 'Dashboard':
                return (
                    <div className={styles.dashboardExpanded}>
                        <h2>Dashboard Overview</h2>
                        <p>Some detailed statistics and data can be shown here.</p>
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