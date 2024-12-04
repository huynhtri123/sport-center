import axiosClient from '../axiosClient';

const bookingApi = {
    // đầu vào phải là giờ việt nam và kiểu +7
    updateAndGetSchedule(onDayScheduleRequest) {
        const url = '/public/booking/updateAndGetSchedule';
        return axiosClient.put(url, onDayScheduleRequest);
    },
    // đầu vào phải là giờ việt nam nhưng kiểu +0
    createBooking(bookingRequest) {
        const url = '/booking/create';
        return axiosClient.post(url, bookingRequest);
    },
    confirm(bookingId) {
        const url = `/booking/confirm/${bookingId}`;
        return axiosClient.put(url);
    },
    cancelBooking(bookingId) {
        const url = `/booking/cancel/${bookingId}`;
        return axiosClient.put(url);
    },

    // đặt theo lịch cứng
    createRecurringBooking(recurringBookingRequest) {
        const url = '/booking/createRecurring';
        return axiosClient.post(url, recurringBookingRequest);
    },
    confirmRecurring(recurringBookingId) {
        const url = `/booking/confirmRecurring/${recurringBookingId}`;
        return axiosClient.put(url);
    },

    // lấy giá tiền trước khi đặt
    getBookingPrice(bookingRequest) {
        const url = '/booking/getBookingPrice';
        return axiosClient.post(url, bookingRequest);
    },
    getRecurringBookingPrice(recurringBookingRequest) {
        const url = '/booking/getRecurringBookingPrice';
        return axiosClient.post(url, recurringBookingRequest);
    },
    getAllActive(page = 0, size = 3) {
        const url = `/booking/getAllActive?page=${page}&size=${size}`;
        return axiosClient.get(url);
    },
    getRecurringByBookingId(bookingId) {
        const url = `/recurring/getByBookingId?bookingId=${bookingId}`;
        return axiosClient.get(url);
    },
    cancelRecurring(bookingId) {
        const url = `/recurring/cancel/${bookingId}`;
        return axiosClient.put(url);
    },
};

export default bookingApi;
