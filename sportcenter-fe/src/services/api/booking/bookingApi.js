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
    cancelBooking(bookingId) {
        const url = `/booking/cancelBooking/${bookingId}`;
        return axiosClient.put(url);
    },

    // đặt theo lịch cứng
    createRecurringBooking(recurringBookingRequest) {
        const url = '/booking/createRecurring';
        return axiosClient.post(url, recurringBookingRequest);
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
    getAllActive() {
        const url = '/booking/getAllActive';
        return axiosClient.get(url);
    },
};

export default bookingApi;
