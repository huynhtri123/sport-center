import axiosClient from './axiosClient';

const authApi = {
    signin(signinRequest) {
        const url = '/auth/signin';
        return axiosClient.post(url, signinRequest);
    },
    refreshToken(refreshTokenRequest) {
        const url = '/auth/refreshToken';
        return axiosClient.post(url, refreshTokenRequest);
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
        const url = '/auth/getVerify';
        return axiosClient.post(url, getVerifyRequest);
    },
    renewPassword(userId, renewPasswordRequest) {
        const url = `/auth/renewPassword/${userId}`;
        return axiosClient.patch(url, renewPasswordRequest);
    },
};

export default authApi;
