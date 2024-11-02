import axiosClient from '../axiosClient';

const bookingApi = {
    updateAndGetSchedule(onDayScheduleRequest) {
        const url = '/public/booking/updateAndGetSchedule';
        return axiosClient.put(url, onDayScheduleRequest);
    },
    createBooking(bookingRequest) {
        const url = '/booking/create';
        return axiosClient.post(url, bookingRequest);
    },
};

export default bookingApi;
