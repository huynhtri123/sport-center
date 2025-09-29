import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import bookingApi from '../../../services/api/booking/bookingApi';

function BookingByFieldChart({ styles }) {
    const [chartData, setChartData] = useState({
        labels: [],
        datasets: [
            {
                label: 'Bookings per Field',
                data: [],
                backgroundColor: 'rgba(54, 162, 235, 0.6)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1,
            },
        ],
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await bookingApi.getAll();
                console.log(response);
                const bookings = response.data.content || []; // depends on your pagination structure

                // Tính số lần mỗi sân được booking
                const bookingCountByField = {};

                bookings.forEach((booking) => {
                    const fieldName = booking.fieldResponse?.fieldName || 'Unknown Field';
                    bookingCountByField[fieldName] = (bookingCountByField[fieldName] || 0) + 1;
                });

                const labels = Object.keys(bookingCountByField);
                const data = Object.values(bookingCountByField);

                setChartData({
                    labels,
                    datasets: [
                        {
                            label: 'Bookings per Field',
                            data,
                            backgroundColor: 'rgba(54, 162, 235, 0.6)',
                            borderColor: 'rgba(54, 162, 235, 1)',
                            borderWidth: 1,
                        },
                    ],
                });
            } catch (error) {
                console.error('Failed to fetch booking data:', error);
            }
        };

        fetchData();
    }, []);

    const options = {
        responsive: true,
        plugins: {
            legend: { display: false },
            title: { display: true, text: 'Bookings Count by Field' },
        },
        scales: {
            x: {
                ticks: {
                    autoSkip: false,
                    font: {
                        size: 10,
                    },
                },
            },
            y: {
                beginAtZero: true,
            },
        },
    };

    return (
        <div>
            <h4 className={styles.h4Title}>Field Booking Statistics</h4>
            <Bar data={chartData} options={options} />
        </div>
    );
}

export default BookingByFieldChart;
