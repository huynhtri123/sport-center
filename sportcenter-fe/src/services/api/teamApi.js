import axiosClient from './axiosClient';

const teamApi = {
    create(teamRequest) {
        const url = '/team/create';
        return axiosClient.post(url, teamRequest);
    },
    softDelete(teamId) {
        const url = `/team/softDelete/${teamId}`;
        return axiosClient.patch(url);
    },
    forceDelete(teamId) {
        const url = `/team/forceDelete/${teamId}`;
        return axiosClient.delete(url);
    },
};

export default teamApi;
