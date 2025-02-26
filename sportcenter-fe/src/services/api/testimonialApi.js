import axiosClient from './axiosClient';

const testimonialApi = {
    getAllActive() {
        const url = '/auth/testimonial/all-active';
        return axiosClient.get(url);
    },
};

export default testimonialApi;
