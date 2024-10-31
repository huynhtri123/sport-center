import axiosClient from './axiosClient';

const tournamentApi = {
    getAllActive() {
        const url = '/tounament/getAllActive';
        return axiosClient.get(url);
    },
    getById(tournamentId) {
        const url = `/tounament/getById/${tournamentId}`;
        return axiosClient.get(url);
    },
    getRegistedTeams(tournamentId) {
        const url = `/tounament/getRegistedTeams/${tournamentId}`;
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
};

export default tournamentApi;
