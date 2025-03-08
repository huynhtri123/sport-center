export const formatDateToZoneDateTime = (date) => {
    const d = new Date(date);
    return d.toISOString(); // Trả về định dạng ISO (UTC) (+0)
};

// Tách ngày (YYYY-MM-DD) - Trả về định dạng ISO
export const formatToISODate = (dateString) => {
    const [year, month, day] = new Date(dateString).toISOString().split('T')[0].split('-');
    return `${day}/${month}/${year}`; // Đổi thứ tự thành DD/MM/YYYY
};

// Tách giờ (HH:mm) - Trả về định dạng ISO
export const formatToISOTime = (dateString) => {
    return new Date(dateString).toISOString().split('T')[1].slice(0, 5); // Lấy HH:mm
};

// ngay/thang/nam
export const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    return date.toLocaleDateString('vi-VN', options); // Đảm bảo định dạng dd/mm/yyyy
};
