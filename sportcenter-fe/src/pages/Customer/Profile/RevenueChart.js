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

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Title, Tooltip, Legend);

const RevenueChart = () => {
    const [year, setYear] = useState(new Date().getFullYear());
    const [bookings, setBookings] = useState([]);

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const response = await userApi.myBookings(year);
                setBookings(response.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchBookings();
    }, [year]);

    const monthlyBookings = Array(12).fill(0);
    bookings.forEach((booking) => {
        if (booking.startTime) {
            const month = new Date(booking.startTime).getMonth();
            if (!isNaN(month) && month >= 0 && month < 12) {
                monthlyBookings[month] += 1; // Đếm số lượng bookings thay vì cộng totalPrice
            }
        }
    });

    const months = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
    ];

    const data = {
        labels: months,
        datasets: [
            {
                label: 'Number of Bookings',
                data: monthlyBookings, // số lượng bookings
                fill: false,
                backgroundColor: 'rgba(75,192,192,0.4)',
                borderColor: 'rgba(75,192,192,1)',
                tension: 0.1,
            },
        ],
    };

    return (
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '5px' }}>
            <h2 style={{ textAlign: 'center' }}>Booking Statistics Chart</h2>
            <div style={{ textAlign: 'center', marginBottom: '10px' }}>
                <label>Select Year: </label>
                <select value={year} onChange={(e) => setYear(parseInt(e.target.value))}>
                    {Array.from({ length: 7 }, (_, i) => new Date().getFullYear() - 3 + i).map((yr) => (
                        <option key={yr} value={yr}>
                            {yr}
                        </option>
                    ))}
                </select>
            </div>
            <Line data={data} />
        </div>
    );
};

export default RevenueChart;
