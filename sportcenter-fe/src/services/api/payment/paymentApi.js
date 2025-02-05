import axiosClient from '../axiosClient';

const paymentApi = {
    pay(vnpayRequest) {
        const url = '/payment/create-payment';
        return axiosClient.post(url, vnpayRequest);
    },
};

export default paymentApi;
