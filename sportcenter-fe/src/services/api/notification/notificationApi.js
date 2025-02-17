import axiosClient from '../axiosClient';

const notificationApi = {
    // user-notification
    getAllByUserId(userId) {
        const url = `/user-notification/user/${userId}`;
        return axiosClient.get(url);
    },
    setReadAll(userId) {
        const url = `/user-notification/user/${userId}/set-read`;
        return axiosClient.put(url);
    },

    // notification
    getNotificationsForUser(userId, page = 0, size = 5, sortBy = 'createdAt', sortDir = 'desc') {
        return axiosClient.get(`/notification/user/${userId}`, {
            params: { page, size, sortBy, sortDir },
        });
    },
    create(request) {
        const url = '/notification/create';
        return axiosClient.post(url, request);
    },
    getAllActive(page = 0, size = 5, sortBy = 'createdAt', sortDir = 'desc') {
        return axiosClient.get(`/notification/all-active`, {
            params: { page, size, sortBy, sortDir },
        });
    },
    update(notificationId, request) {
        const url = `/notification/update/${notificationId}`;
        return axiosClient.put(url, request);
    },
    softDelete(notificationId) {
        const url = `/notification/soft-delete/${notificationId}`;
        return axiosClient.patch(url);
    },
};

export default notificationApi;
