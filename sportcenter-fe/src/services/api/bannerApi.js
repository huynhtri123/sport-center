import axiosClient from './axiosClient';

const bannerApi = {
    getAllActive() {
        const url = '/auth/banner/all-active';
        return axiosClient.get(url);
    },
};

export default bannerApi;
