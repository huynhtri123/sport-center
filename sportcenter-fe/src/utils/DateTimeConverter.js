export const formatDateToZoneDateTime = (date) => {
    const d = new Date(date);
    return d.toISOString(); // Trả về định dạng ISO (UTC) (+0)
};
