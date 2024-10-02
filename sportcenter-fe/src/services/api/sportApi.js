import axiosClient from "./axiosClient";

const sportApi = {
    create(sportRequest) {
        const url = "/sport/create";
        return axiosClient.post(url, sportRequest);
    },
};

export default sportApi;
