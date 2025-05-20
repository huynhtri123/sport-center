import { Line } from 'react-chartjs-2';
import { useState, useEffect } from 'react';
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
import userApi from '../../../services/api/user/userApi';
import styles from '../../../assets/css/Profile/bookingRevenue.module.scss';

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Title, Tooltip, Legend);

const chartOptions = {
    responsive: true,
    plugins: {
        legend: {
            position: 'top',
        },
        title: {
            display: false,
        },
    },
    scales: {
        y: {
            beginAtZero: true,
            ticks: {
                stepSize: 1,
                precision: 0,
            },
        },
    },
};

const RevenueChart = () => {
    const [year, setYear] = useState(new Date().getFullYear());
    const [bookings, setBookings] = useState([]);

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const response = await userApi.myBookings(year);
                setBookings(response.data);
            } catch (error) {
                console.error('Failed to fetch bookings:', error);
            }
        };

        fetchBookings();
    }, [year]);

    const monthlyCounts = Array(12).fill(0);
    bookings.forEach((booking) => {
        if (booking.startTime) {
            const month = new Date(booking.startTime).getMonth();
            if (!isNaN(month)) monthlyCounts[month] += 1;
        }
    });

    const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const data = {
        labels: monthLabels,
        datasets: [
            {
                label: 'Bookings',
                data: monthlyCounts,
                borderColor: '#4bc0c0',
                backgroundColor: 'rgba(75,192,192,0.2)',
                tension: 0.3,
                pointBackgroundColor: '#4bc0c0',
            },
        ],
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2>Booking Statistics</h2>
                <p>Monthly booking count for the selected year.</p>
            </div>

            <div className={styles.controls}>
                <label htmlFor='yearSelect'>Select Year:</label>
                <select id='yearSelect' value={year} onChange={(e) => setYear(parseInt(e.target.value))}>
                    {Array.from({ length: 7 }, (_, i) => new Date().getFullYear() - 3 + i).map((yr) => (
                        <option key={yr} value={yr}>
                            {yr}
                        </option>
                    ))}
                </select>
            </div>

            <div className={styles.chartWrapper}>
                <Line data={data} options={chartOptions} />
            </div>
        </div>
    );
};

export default RevenueChart;
