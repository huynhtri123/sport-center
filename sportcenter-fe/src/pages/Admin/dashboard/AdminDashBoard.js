import React, { useState } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Link } from 'react-router-dom';
import ManageFields from '../field/ManageFields';
// import ManageTeams from './team/ManageTeams';
import styles from '../../../assets/css/Admin/manage/admin.module.scss';
import ManageInvoices from '../invoice/ManageInvoice';
import ManageSports from '../sport/ManageSports';
import Signout from '../../Auth/Signout';
import ManageCourses from '../course/ManageCourses';
import ManageTournaments from '../tournament/ManageTournaments';
import ManageBookings from '../booking/ManageBookings';
import ManageUser from '../user/ManageUser';
import ManageNotifications from '../notification/ManageNotifications';
import InvoiceChart from './InvoiceChart';
import RevenueChart from './RevenueChart';
import BookingPieChart from './BookingPieChart';
import BookingByFieldChart from './BookingByFieldChart';

// Đăng ký các thành phần của Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

function AdminDashboard() {
    const [selectedSection, setSelectedSection] = useState('Dashboard');
    const sections = [
        { name: 'Dashboard', icon: 'fa-solid fa-chart-line' },
        { name: 'Manage Fields', icon: 'fa-solid fa-hockey-puck' },
        { name: 'Manage Courses', icon: 'fa-solid fa-dumbbell' },
        { name: 'Manage Sports', icon: 'fa-solid fa-basketball-ball' },
        { name: 'Manage Bookings', icon: 'fa-solid fa-calendar-check' },
        { name: 'Manage Invoices', icon: 'fa-solid fa-money-bill' },
        // { name: 'Manage Teams', icon: 'fa-solid fa-people-group' },
        { name: 'Manage Tournaments', icon: 'fa-solid fa-trophy' },
        { name: 'Manage Users', icon: 'fa-solid fa-users' },
        { name: 'Manage Notifications', icon: 'fa-solid fa-bell' },
    ];

    const renderContent = () => {
        switch (selectedSection) {
            case 'Dashboard':
                return (
                    <div className={styles.dashboardExpanded}>
                        <div className={styles.chartContainer}>
                            <div className={styles.chartWrapper}>
                                <RevenueChart styles={styles} />
                            </div>

                            <div className={styles.chartWrapper}>
                                <InvoiceChart styles={styles} />
                            </div>

                            <div className={`${styles.chartWrapper} ${styles.smallChartWrapper}`}>
                                <BookingPieChart styles={styles} />
                            </div>

                            <div className={styles.chartWrapper}>
                                <BookingByFieldChart styles={styles} />
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
            // case 'Manage Teams':
            //     return <ManageTeams />;
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
