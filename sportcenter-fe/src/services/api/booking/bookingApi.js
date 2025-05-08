import axiosClient from '../axiosClient';

const bookingApi = {
    // đầu vào phải là giờ việt nam và kiểu +7
    updateAndGetSchedule(onDayScheduleRequest) {
        const url = '/public/booking/update-and-get-schedule';
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
        const url = '/recurring/create';
        return axiosClient.post(url, recurringBookingRequest);
    },
    confirmRecurring(recurringBookingId) {
        const url = `/recurring/confirm/${recurringBookingId}`;
        return axiosClient.put(url);
    },

    // lấy giá tiền trước khi đặt
    getBookingPrice(bookingRequest) {
        const url = '/booking/price';
        return axiosClient.post(url, bookingRequest);
    },
    getRecurringBookingPrice(recurringBookingRequest) {
        const url = '/recurring/price';
        return axiosClient.post(url, recurringBookingRequest);
    },
    getRecurringTimeSlots(recurringBookingRequest) {
        const url = '/recurring/timeSlots';
        return axiosClient.post(url, recurringBookingRequest);
    },
    getAllActive(page = 0, size = 3) {
        const url = `/booking/all-active?page=${page}&size=${size}`;
        return axiosClient.get(url);
    },
    getRecurringByBookingId(bookingId) {
        const url = `/recurring/by-booking?bookingId=${bookingId}`;
        return axiosClient.get(url);
    },
    cancelRecurring(bookingId) {
        const url = `/recurring/cancel/${bookingId}`;
        return axiosClient.put(url);
    },
    getRemainingAmout(bookingId) {
        const url = `/recurring/remaining-price/${bookingId}`;
        return axiosClient.get(url);
    },
    searchByFieldName(fieldName, page = 0, size = 5) {
        const url = `/booking/search-by-field-name?fieldName=${fieldName}&page=${page}&size=${size}`;
        return axiosClient.get(url);
    },
    searchByUserName(userName, page = 0, size = 5) {
        const url = `/booking/search-by-user-name?userName=${userName}&page=${page}&size=${size}`;
        return axiosClient.get(url);
    },
};

export default bookingApi;
