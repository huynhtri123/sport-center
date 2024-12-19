import axiosClient from './axiosClient';

const sportApi = {
    // Create a new sport
    create(sportRequest) {
        return axiosClient.post('/sport/create', sportRequest);
    },

    // Get a sport by ID
    getById(sportId) {
        return axiosClient.get(`/public/sport/getById/${sportId}`);
    },

    // Update a sport by ID
    update(sportId, sportRequest) {
        return axiosClient.put(`/sport/updateById/${sportId}`, sportRequest);
    },

    // Permanently delete a sport by ID
    delete(sportId) {
        return axiosClient.delete(`/sport/${sportId}`);
    },

    // Soft delete a sport by ID
    softDelete(sportId) {
        return axiosClient.patch(`/sport/softDelete/${sportId}`);
    },

    // Restore a soft-deleted sport by ID
    restore(sportId) {
        return axiosClient.patch(`/sport/restore/${sportId}`);
    },

    // Get all active sports
    getAllActive: (page, size) => {
        return axiosClient.get(`/public/sport/getAllActive?page=${page}&size=${size}`);
    },
};

export default sportApi;
