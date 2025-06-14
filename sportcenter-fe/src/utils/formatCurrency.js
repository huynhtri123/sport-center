const formatCurrency = (amount) => {
    if (typeof amount !== 'number') {
        amount = Number(amount) || 0;
    }

    // Format số có dấu chấm ngăn cách (như 1.000.000)
    const formattedNumber = new Intl.NumberFormat('vi-VN', {
        style: 'decimal',
        maximumFractionDigits: 0,
        useGrouping: true,
    }).format(amount);

    return `${formattedNumber} VND`;
};

export default formatCurrency;
