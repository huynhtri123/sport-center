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
};

export default userApi;
