import axiosClient from "./axiosClient";

const authApi = {
    signin(signinRequest) {
        const url = "/auth/signin";
        return axiosClient.post(url, signinRequest);
    },
    refreshToken(refreshTokenRequest) {
        const url = "/auth/refreshToken";
        return axiosClient.post(url, refreshTokenRequest);
    },
};

export default authApi;
