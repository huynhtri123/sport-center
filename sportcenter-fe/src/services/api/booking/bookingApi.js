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
};

export default bookingApi;
