import axiosClient from '../axiosClient';

const authApi = {
    signin(signinRequest) {
        const url = '/auth/signin';
        return axiosClient.post(url, signinRequest);
    },
    refreshToken() {
        const url = '/auth/refresh-token';
        return axiosClient.post(url);
    },
    signup(signupRequest) {
        const url = '/auth/signup';
        return axiosClient.post(url, signupRequest);
    },
    signupStep2(userId, verifyRequest) {
        const url = `/auth/signup/${userId}`;
        return axiosClient.post(url, verifyRequest);
    },
    getVerify(getVerifyRequest) {
        const url = '/auth/get-verify';
        return axiosClient.post(url, getVerifyRequest);
    },
    renewPassword(userId, renewPasswordRequest) {
        const url = `/auth/renew-password/${userId}`;
        return axiosClient.patch(url, renewPasswordRequest);
    },
    signout() {
        const url = '/signout';
        return axiosClient.post(url);
    },
};

export default authApi;
