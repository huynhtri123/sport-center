import React, { useEffect, useState } from 'react';
import { Pie } from 'react-chartjs-2';
import revenueApi from '../../../services/api/revenue/revenueApi';
import { RecurringIntervalType } from '../../../utils/enums/RecurringIntervalType';

function BookingPieChart({ styles }) {
    const [pieChartData, setPieChartData] = useState({
        labels: ['Single Bookings', 'BiWeekly Recurring', 'Weekly Recurring'],
        datasets: [
            {
                data: [0, 0, 0],
                backgroundColor: ['rgba(255, 206, 86, 0.6)', 'rgba(75, 192, 192, 0.6)', 'rgba(153, 102, 255, 0.6)'],
                borderColor: ['rgba(255, 206, 86, 1)', 'rgba(75, 192, 192, 1)', 'rgba(153, 102, 255, 1)'],
                borderWidth: 1,
            },
        ],
    });

    useEffect(() => {
        const fetchBookingData = async () => {
            try {
                const countSingleBooking = await revenueApi.countSingleBooking();
                const weeklyRecurringBooking = await revenueApi.countRecurringBookingByType(
                    RecurringIntervalType.WEEKLY
                );
                const biWeeklyRecurringBooking = await revenueApi.countRecurringBookingByType(
                    RecurringIntervalType.BIWEEKLY
                );

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
            } catch (error) {
                console.error('Failed to fetch booking data:', error);
            }
        };

        fetchBookingData();
    }, []);

    const options = {
        responsive: true,
        plugins: {
            legend: { position: 'right' },
            title: { display: true, text: 'Types of Bookings' },
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
    };

    return (
        <div>
            <h4 className={styles.h4Title}>Booking Distribution</h4>
            <div style={{ maxWidth: '400px', margin: '0 auto' }}>
                <Pie data={pieChartData} options={options} />
            </div>
        </div>
    );
}

export default BookingPieChart;
