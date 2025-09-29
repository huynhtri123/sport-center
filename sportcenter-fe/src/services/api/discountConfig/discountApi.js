import axiosClient from '../axiosClient';

const discountApi = {
    create(discountConfigRequest) {
        return axiosClient.post('/discount', discountConfigRequest);
    },

    getAll() {
        return axiosClient.get('/public/discount');
    },

    getById(id) {
        return axiosClient.get(`/discount/${id}`);
    },

    update(id, discountConfigRequest) {
        return axiosClient.put(`/discount/${id}`, discountConfigRequest);
    },

    softDelete(id) {
        return axiosClient.put(`/discount/soft-delete/${id}`);
    },

    restore(id) {
        return axiosClient.put(`/discount/restore/${id}`);
    },
};

export default discountApi;
