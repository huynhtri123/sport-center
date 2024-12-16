import axiosClient from './axiosClient';

const revenueApi = {
    countSingleBooking() {
        const url = '/revenue/countSingleBooking';
        return axiosClient.get(url);
    },
    countRecurringBookingByType(type) {
        const url = `/revenue/countRecurringBookingByType?type=${type}`;
        return axiosClient.get(url);
    },
    getRevenueLastSixMonths() {
        const url = '/booking/revenue/lastSixMonths';
        return axiosClient.get(url);
    },
};

export default revenueApi;
