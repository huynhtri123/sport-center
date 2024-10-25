import axiosClient from './axiosClient';

const fieldApi = {
    findByType(type) {
        const url = `/field/findByType?type=${type}`;
        return axiosClient.get(url);
    },
    findById(fieldId) {
        const url = `/field/getById/${fieldId}`;
        return axiosClient.get(url);
    },
};

export default fieldApi;
