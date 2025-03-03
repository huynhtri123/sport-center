import axiosClient from './axiosClient';

const revenueApi = {
    countSingleBooking() {
        const url = '/revenue/count-single-booking';
        return axiosClient.get(url);
    },
    countRecurringBookingByType(type) {
        const url = `/revenue/count-recurring-by-type?type=${type}`;
        return axiosClient.get(url);
    },
    getRevenueLastSixMonths(year) {
        const url = `/invoice/revenue/last-six-months?year=${year}`;
        return axiosClient.get(url);
    },
};

export default revenueApi;
