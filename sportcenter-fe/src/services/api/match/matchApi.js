import axiosClient from '../axiosClient';

const matchApi = {
    getAllActive() {
        const url = '/match/all-active';
        return axiosClient.get(url);
    },
    getById(matchId) {
        const url = `/match/${matchId}`;
        return axiosClient.get(url);
    },
    createMatches(request) {
        const url = '/match/create-matches';
        return axiosClient.post(url, request);
    },
    updateResult(request) {
        const url = '/match/update-result';
        return axiosClient.put(url, request);
    },
    getByTournament(tournamentId) {
        const url = `/match/tournament/${tournamentId}`;
        return axiosClient.get(url);
    },
    award(tournamentId) {
        const url = `/match/award/${tournamentId}`;
        return axiosClient.put(url);
    },
};

export default matchApi;
