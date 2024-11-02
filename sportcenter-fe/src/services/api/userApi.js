import axiosClient from './axiosClient';

const userApi = {
    myProfile() {
        const url = '/user/myProfile';
        return axiosClient.get(url);
    },
    updateProfile(userRequest) {
        const url = '/user/updateProfile';
        return axiosClient.put(url, userRequest);
    },

    // bookings
    myBookings(userId) {
        const url = `/booking/myBookings/${userId}`;
        return axiosClient.get(url);
    },

    // registered tournaments
    myTournaments() {
        const url = '/tounament/myTournaments';
        return axiosClient.get(url);
    },
    myTeamInTournament(tournamentId) {
        const url = `/tounament/myTeamInTournament/${tournamentId}`;
        return axiosClient.get(url);
    },
    unregisterTournament(unregisterRequest) {
        const url = '/tounament/unregister';
        return axiosClient.patch(url, unregisterRequest);
    },
    myTeams() {
        const url = '/team/myTeams';
        return axiosClient.get(url);
    },
};

export default userApi;
