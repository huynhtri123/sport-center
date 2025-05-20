import React, { useState } from 'react';
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
} from 'recharts';
import styles from '../../../assets/css/Profile/invoiceChart.module.scss';

const InvoiceChart = ({ invoices }) => {
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

    const transactionTypeData = invoices.reduce((acc, invoice) => {
        const { transactionType } = invoice;
        acc[transactionType] = (acc[transactionType] || 0) + invoice.amount;
        return acc;
    }, {});

    const totalAmount = Object.values(transactionTypeData).reduce((sum, val) => sum + val, 0);

    // Tính phần trăm chưa làm tròn
    const rawPercentages = Object.entries(transactionTypeData).map(([type, total]) => ({
        name: type,
        value: total,
        rawPercentage: (total / totalAmount) * 100,
    }));

    // Tính phần trăm làm tròn 1 chữ số thập phân
    const roundedPercentages = rawPercentages.map((item) => ({
        ...item,
        percentage: Number(item.rawPercentage.toFixed(1)),
    }));

    // State quản lý loại ẩn hiện
    const [hiddenTypes, setHiddenTypes] = useState({});

    // Xử lý khi click legend để toggle ẩn hiện
    const handleLegendClick = (data) => {
        const { value: typeName } = data;
        setHiddenTypes((prev) => ({
            ...prev,
            [typeName]: !prev[typeName],
        }));
    };

    // Lọc ra các item hiện
    const visibleItems = roundedPercentages.filter((item) => !hiddenTypes[item.name]);

    // Tổng giá trị của các phần hiện
    const visibleTotal = visibleItems.reduce((sum, item) => sum + item.value, 0);

    // Tính lại dữ liệu cho PieChart: nếu ẩn thì value=0, % tính theo tổng mới
    const pieData = roundedPercentages.map((item) => {
        if (hiddenTypes[item.name]) {
            return { ...item, value: 0, percentage: 0 };
        }
        const newPercentage = visibleTotal > 0 ? (item.value / visibleTotal) * 100 : 0;
        return { ...item, percentage: Number(newPercentage.toFixed(1)) };
    });

    // Tính tiền refund và chi tiêu dựa trên dữ liệu gốc (không thay đổi)
    const totalRefund = transactionTypeData['REFUND'] || 0;
    const totalSpent = totalAmount - totalRefund;

    const moneyFlowData = [
        { name: 'Spent', value: totalSpent },
        { name: 'Refund', value: totalRefund },
    ];

    return (
        <div className={styles.invoiceChartContainer} style={{ display: 'flex', gap: '40px' }}>
            <div className={styles.chartWrapper} style={{ flex: 1 }}>
                <div className={styles.chartItem}>
                    <h4>Transaction Type Breakdown</h4>
                    <ResponsiveContainer width='100%' height={300}>
                        <PieChart>
                            <Pie
                                data={pieData}
                                cx='50%'
                                cy='50%'
                                labelLine={false}
                                label={({ percentage }) => (percentage > 0 ? `${percentage}%` : '')}
                                outerRadius={100}
                                fill='#8884d8'
                                dataKey='value'
                            >
                                {pieData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={
                                            COLORS[
                                                roundedPercentages.findIndex((item) => item.name === entry.name) %
                                                    COLORS.length
                                            ]
                                        }
                                    />
                                ))}
                            </Pie>
                            <Tooltip
                                formatter={(value, name, props) => [
                                    `${value.toLocaleString()} VND (${props.payload.percentage}%)`,
                                    name,
                                ]}
                            />
                            <Legend
                                onClick={handleLegendClick}
                                // custom formatter để gạch ngang khi ẩn
                                formatter={(value) => {
                                    const isHidden = hiddenTypes[value];
                                    return (
                                        <span
                                            style={{
                                                textDecoration: isHidden ? 'line-through' : 'none',
                                                cursor: 'pointer',
                                            }}
                                        >
                                            {value}
                                        </span>
                                    );
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className={styles.chartWrapper} style={{ flex: 1 }}>
                <div className={styles.chartItem}>
                    <h4>Money Flow</h4>
                    <ResponsiveContainer width='100%' height={300}>
                        <BarChart data={moneyFlowData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray='3 3' />
                            <XAxis dataKey='name' />
                            <YAxis />
                            <Tooltip formatter={(value) => `${value.toLocaleString()} VND`} />
                            <Bar dataKey='value' fill='#82ca9d' />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default InvoiceChart;
