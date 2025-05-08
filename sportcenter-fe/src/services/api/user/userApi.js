import axiosClient from '../axiosClient';

const userApi = {
    myProfile() {
        const url = '/user/my-profile';
        return axiosClient.get(url);
    },
    updateProfile(formData) {
        const url = '/user/update-profile';
        return axiosClient.put(url, formData, {
            headers: {
                'Content-Type': 'multipart/form-data', // Header để gửi FormData
            },
        });
    },

    // bookings
    myBookings(year = null) {
        const url = `/booking/my-bookings`;
        return axiosClient.get(url, {
            params: year ? { year } : {},
        });
    },

    allBookings(userId) {
        const url = `/booking/all-bookings/${userId}`;
        return axiosClient.get(url);
    },

    // registered tournaments
    myTournaments() {
        const url = '/tounament/my-tournaments';
        return axiosClient.get(url);
    },
    myTeamInTournament(tournamentId) {
        const url = `/tounament/my-team/${tournamentId}`;
        return axiosClient.get(url);
    },
    unregisterTournament(unregisterRequest) {
        const url = '/tounament/unregister';
        return axiosClient.patch(url, unregisterRequest);
    },
    myTeams() {
        const url = '/team/my-teams';
        return axiosClient.get(url);
    },

    getAllActive(page, size) {
        return axiosClient.get(`/user/all-active?page=${page}&size=${size}`);
    },

    // Soft delete a user by ID
    softDelete(userId) {
        return axiosClient.delete(`/user/soft-delete/${userId}`);
    },
    // Payment
    addPaymentInfo(newPayment, userId) {
        const url = `/user/add-payment/${userId}`;
        return axiosClient.put(url, newPayment); // Use PUT for adding payment info
    },

    updatePaymentInfo(updatedPayment, userId, paymentId) {
        const url = `/user/update-payment/${userId}/${paymentId}`; // Include userId and paymentId in the URL
        return axiosClient.put(url, updatedPayment); // Sending updated payment data in the body
    },
    deletePaymentInfo(userId, paymentId) {
        const url = `/user/payment/${userId}/${paymentId}`;
        return axiosClient.delete(url); // Use DELETE for removing payment info
    },

    getAccountBalance() {
        const url = '/user/account-balance';
        return axiosClient.get(url);
    },
    makePaymentByBalance(amountToPay, transactionType) {
        const url = `/user/balance-pay?amountToPay=${amountToPay}&transactionType=${transactionType}`;
        return axiosClient.patch(url);
    },
    getCurrentUser() {
        const url = '/public/user/current-user';
        return axiosClient.get(url);
    },
    getUserById(userId) {
        const url = `/user/${userId}`;
        return axiosClient.get(url);
    },
    getMyInvoices() {
        const url = '/user/my-invoices';
        return axiosClient.get(url);
    },
    deleteInvoice(invoiceId) {
        const url = `/user/my-invoices/${invoiceId}`; // The URL for deleting an invoice
        return axiosClient.delete(url); // Use DELETE method to remove the invoice
    },
    getUsersByName(name, page, size) {
        const url = `/user/search-by-name?name=${name}&page=${page}&size=${size}`;
        return axiosClient.get(url);
    },
};

export default userApi;
