import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import revenueApi from '../../../services/api/revenue/revenueApi';

function RevenueChart({ styles }) {
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
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

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await revenueApi.getRevenueLastSixMonths(selectedYear);
                const revenueData = response.data;

                const months = Object.keys(revenueData);
                const revenues = months.map((month) => revenueData[month].revenue);
                const refunds = months.map((month) => revenueData[month].refund_fee);

                const shortMonths = months.map((month) => {
                    const [monthName] = month.split(' ');
                    return monthName.substring(0, 3);
                });

                setRevenueData({
                    labels: shortMonths,
                    datasets: [
                        {
                            label: 'Income',
                            data: revenues,
                            backgroundColor: 'rgba(75, 192, 192, 0.6)',
                            borderColor: 'rgba(75, 192, 192, 1)',
                            borderWidth: 1,
                            hidden: true,
                        },
                        {
                            label: 'Refund',
                            data: refunds,
                            backgroundColor: 'rgba(255, 99, 132, 0.6)',
                            borderColor: 'rgba(255, 99, 132, 1)',
                            borderWidth: 1,
                            hidden: true,
                        },
                        {
                            label: 'Net Revenue',
                            data: revenues.map((rev, idx) => rev - refunds[idx]),
                            backgroundColor: 'rgba(153, 102, 255, 0.6)', // tím
                            borderColor: 'rgba(153, 102, 255, 1)',
                            borderWidth: 1,
                        },
                    ],
                });
            } catch (error) {
                console.error('Failed to fetch revenue data:', error);
            }
        };

        fetchData();
    }, [selectedYear]);

    const options = {
        responsive: true,
        plugins: {
            legend: { position: 'top' },
            title: { display: true, text: 'Total Revenue and Refund for the Year (VND)' },
        },
        scales: {
            x: {
                ticks: {
                    autoSkip: false,
                    maxRotation: 0,
                    minRotation: 0,
                    font: {
                        size: 8,
                        weight: 'bolder',
                    },
                },
            },
        },
    };

    return (
        <div>
            <div className={styles.yearSelectWrapper}>
                <label htmlFor='yearSelect'>Select Year:</label>
                <select id='yearSelect' value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))}>
                    {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                        <option key={year} value={year}>
                            {year}
                        </option>
                    ))}
                </select>
            </div>
            <h4 className={styles.h4Title}>Monthly Revenue</h4>
            <Bar data={revenueData} options={options} />
        </div>
    );
}

export default RevenueChart;
