import axiosClient from './axiosClient';

const invoiceApi = {
    create(invoiceRequest) {
        const url = '/invoice/create';
        return axiosClient.post(url, invoiceRequest);
    },
    getAllActive() {
        const url = '/invoice/all-active';
        return axiosClient.get(url);
    },
    myInvoices() {
        const url = '/invoice/my-invoices';
        return axiosClient.get(url);
    },
    softDelete(invoiceId) {
        const url = `/invoice/soft-delete/${invoiceId}`;
        return axiosClient.put(url);
    },
    restore(invoiceId) {
        const url = `/invoice/restore/${invoiceId}`;
        return axiosClient.put(url);
    },
    forceDelete(invoiceId) {
        const url = `/invoice/force-delete/${invoiceId}`;
        return axiosClient.delete(url);
    },
};

export default invoiceApi;
