import axiosClient from './axiosClient';

const userApi = {
    myProfile() {
        const url = '/user/myProfile';
        return axiosClient.get(url);
    },
    updateProfile(userRequest) {
        const url = '/user/updateProfile';
        return axiosClient.put(url, userRequest);
    },

    // bookings
    myBookings(userId) {
        const url = `/booking/myBookings/${userId}`;
        return axiosClient.get(url);
    },

    // registered tournaments
    myTournaments() {
        const url = '/tounament/myTournaments';
        return axiosClient.get(url);
    },
    myTeamInTournament(tournamentId) {
        const url = `/tounament/myTeamInTournament/${tournamentId}`;
        return axiosClient.get(url);
    },
    unregisterTournament(unregisterRequest) {
        const url = '/tounament/unregister';
        return axiosClient.patch(url, unregisterRequest);
    },
    myTeams() {
        const url = '/team/myTeams';
        return axiosClient.get(url);
    },

    getAllActive() {
        return axiosClient.get('/user/getAllActive');
    },

    // Soft delete a user by ID
    softDelete(userId) {
        return axiosClient.delete(`/user/softDelete/${userId}`);
    },
    // Payment
    addPaymentInfo(newPayment, userId) {
        const url = `/user/addPayment/${userId}`;
        return axiosClient.put(url, newPayment); // Use PUT for adding payment info
    },

    updatePaymentInfo(updatedPayment, userId, paymentId) {
        const url = `/user/updatePayment/${userId}/${paymentId}`; // Include userId and paymentId in the URL
        return axiosClient.put(url, updatedPayment); // Sending updated payment data in the body
    },
    deletePaymentInfo(userId, paymentId) {
        const url = `/user/deletePayment/${userId}/${paymentId}`;
        return axiosClient.delete(url); // Use DELETE for removing payment info
    },

    getAccountBalance() {
        const url = '/user/getAccountBalance';
        return axiosClient.get(url);
    },
    makePaymentByBalance(amountToPay) {
        const url = `/user/makePaymentByBalance?amountToPay=${amountToPay}`;
        return axiosClient.patch(url);
    },
    getCurrentUser() {
        const url = '/user/getCurrentUser';
        return axiosClient.get(url);
    },
    getUserById(userId) {
        const url = `/user/getUserById/${userId}`;
        return axiosClient.get(url);
    },
};

export default userApi;
