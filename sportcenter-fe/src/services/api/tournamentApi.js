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
        const url = `/public/tounament/all-active?page=${page}&size=${size}`;
        return axiosClient.get(url);
    },
    getById(tournamentId) {
        const url = `/public/tounament/${tournamentId}`;
        return axiosClient.get(url);
    },
    getRegistedTeams(tournamentId) {
        const url = `/public/tounament/registed-teams/${tournamentId}`;
        return axiosClient.get(url);
    },
    register(registerRequest) {
        const url = '/tounament/register';
        return axiosClient.patch(url, registerRequest, {
            headers: {
                'Content-Type': 'multipart/form-data', // Header để gửi FormData
            },
        });
    },
    checkRegistrationEligibility(registerRequest) {
        const url = '/tournament/checkRegistrationEligibility';
        return axiosClient.patch(url, registerRequest);
    },
    softDelete(tournamentId) {
        const url = `/tounament/soft-delete/${tournamentId}`;
        return axiosClient.patch(url);
    },
    searchTournaments(query, page, size) {
        const url = `/public/tounament/search-by-name?tournamentName=${query}&page=${page}&size=${size}`;
        return axiosClient.get(url);
    },
    getRegisteredTeams(tournamentId) {
        const url = `/public/tounament/registed-teams/${tournamentId}`;
        return axiosClient.get(url);
    },
    updateTeam(tournamentRegisterRequest, teamId) {
        const url = `/tournament/team/${teamId}`;
        return axiosClient.put(url, tournamentRegisterRequest, {
            headers: {
                'Content-Type': 'multipart/form-data', // Header để gửi FormData
            },
        });
    },
};

export default tournamentApi;
