import axiosClient from './axiosClient';

const tournamentApi = {
    create(formData) {
        const url = '/tounament/create';
        return axiosClient.post(url, formData);
    },
    update(tournamentId, formData) {
        const url = `/tounament/update/${tournamentId}`;
        return axiosClient.put(url, formData);
    },
    getAllActive(page, size) {
        const url = `/public/tounament/getAllActive?page=${page}&size=${size}`;
        return axiosClient.get(url);
    },
    getById(tournamentId) {
        const url = `/public/tounament/getById/${tournamentId}`;
        return axiosClient.get(url);
    },
    getRegistedTeams(tournamentId) {
        const url = `/public/tounament/getRegistedTeams/${tournamentId}`;
        return axiosClient.get(url);
    },
    register(registerRequest) {
        const url = '/tounament/register';
        return axiosClient.patch(url, registerRequest);
    },
    checkRegistrationEligibility(registerRequest) {
        const url = '/tournament/checkRegistrationEligibility';
        return axiosClient.patch(url, registerRequest);
    },
    softDelete(tournamentId) {
        const url = `/tounament/softDelete/${tournamentId}`;
        return axiosClient.patch(url);
    },
};

export default tournamentApi;
