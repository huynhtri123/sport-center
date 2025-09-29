import axiosClient from '../axiosClient';

const galleryApi = {
    getAllActive() {
        const url = '/auth/gallery/all-active';
        return axiosClient.get(url);
    },
};

export default galleryApi;
