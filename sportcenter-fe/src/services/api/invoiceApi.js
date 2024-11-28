import axiosClient from './axiosClient';

const invoiceApi = {
    create(invoiceRequest) {
        const url = '/invoice/create';
        return axiosClient.post(url, invoiceRequest);
    },
    getAllActive() {
        const url = '/invoice/getAllActive';
        return axiosClient.get(url);
    },
    myInvoices() {
        const url = '/invoice/myInvoices';
        return axiosClient.get(url);
    },
    softDelete(invoiceId) {
        const url = `/invoice/softDelete/${invoiceId}`;
        return axiosClient.put(url);
    },
    restore(invoiceId) {
        const url = `/invoice/restore/${invoiceId}`;
        return axiosClient.put(url);
    },
    forceDelete(invoiceId) {
        const url = `/invoice/forceDelete/${invoiceId}`;
        return axiosClient.delete(url);
    },
};

export default invoiceApi;
