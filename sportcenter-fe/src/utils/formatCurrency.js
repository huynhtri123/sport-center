const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0, // Không hiển thị phần thập phân
    }).format(amount);
};

export default formatCurrency;
