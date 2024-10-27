import axiosClient from './axiosClient';

const fileApi = {
    uploadImage(file) {
        const url = `/file/image/upload`;
        const formData = new FormData();
        formData.append('file', file);
        return axiosClient.post(url, formData, {
            headers: {
                'Content-Type': 'multipart/form-data', // Cần phải thiết lập kiểu nội dung cho multipart
            },
        });
    },
};

export default fileApi;
