import axiosClient from './axiosClient';

const sportApi = {
    create(sportRequest) {
        const url = '/sport/create';
        return axiosClient.post(url, sportRequest);
    },
    getAllActive() {
        const url = '/sport/getAllActive';
        return axiosClient.get(url);
    },
};

export default sportApi;
