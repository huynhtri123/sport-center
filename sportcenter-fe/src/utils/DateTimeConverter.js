export const formatDateToZoneDateTime = (date) => {
    const d = new Date(date);
    return d.toISOString(); // Trả về định dạng ISO (UTC) (+0)
};

// ngay/thang/nam
export const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    return date.toLocaleDateString('vi-VN', options); // Đảm bảo định dạng dd/mm/yyyy
};
