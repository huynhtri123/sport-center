// src/components/admin/charts/InvoiceChart.jsx
import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import invoiceApi from '../../../services/api/invoice/invoiceApi';

function InvoiceChart({ styles }) {
    const [invoiceChartData, setInvoiceChartData] = useState({
        labels: [],
        datasets: [],
    });

    const fetchInvoices = async () => {
        try {
            const response = await invoiceApi.getAllActive();
            const invoices = response.data;

            const grouped = {
                BOOKING: { CARD: 0, ACCOUNT_BALANCE: 0 },
                REGISTRATION_FEE: { CARD: 0, ACCOUNT_BALANCE: 0 },
                REFUND: { CARD: 0, ACCOUNT_BALANCE: 0 },
            };

            invoices.forEach(({ transactionType, paymentMethod, amount }) => {
                if (grouped[transactionType] && grouped[transactionType][paymentMethod] !== undefined) {
                    grouped[transactionType][paymentMethod] += amount;
                }
            });

            const chartData = {
                labels: Object.keys(grouped),
                datasets: [
                    {
                        label: 'CARD',
                        data: Object.values(grouped).map((g) => g.CARD),
                        backgroundColor: 'rgba(54, 162, 235, 0.6)',
                    },
                    {
                        label: 'ACCOUNT_BALANCE',
                        data: Object.values(grouped).map((g) => g.ACCOUNT_BALANCE),
                        backgroundColor: 'rgba(255, 206, 86, 0.6)',
                    },
                    {
                        label: 'TOTAL',
                        data: Object.values(grouped).map((g) => g.CARD + g.ACCOUNT_BALANCE),
                        backgroundColor: 'rgba(75, 192, 192, 0.6)',
                    },
                ],
            };

            setInvoiceChartData(chartData);
        } catch (error) {
            console.error('Failed to fetch invoices: ', error);
        }
    };

    useEffect(() => {
        fetchInvoices();
    }, []);

    return (
        <div style={{ marginTop: '54px' }}>
            <h4 className={styles.h4Title}>Transaction Types and Payment Methods</h4>
            <Bar
                data={invoiceChartData}
                options={{
                    responsive: true,
                    plugins: {
                        legend: { position: 'top' },
                        title: {
                            display: true,
                            text: 'Transaction Breakdown by Payment Method (VND)',
                        },
                    },
                    scales: {
                        y: {
                            ticks: {
                                callback: function (value) {
                                    return value.toLocaleString('vi-VN');
                                },
                            },
                        },
                    },
                }}
            />
        </div>
    );
}

export default InvoiceChart;
