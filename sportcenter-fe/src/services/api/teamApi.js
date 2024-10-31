import axiosClient from './axiosClient';

const teamApi = {
    create(teamRequest) {
        const url = '/team/create';
        return axiosClient.post(url, teamRequest);
    },
};

export default teamApi;
