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

    uploadVideo(file) {
        const url = `/file/video/upload`; // Đường dẫn API upload video
        const formData = new FormData();
        formData.append('file', file); // Append file video vào form data
        return axiosClient.post(url, formData, {
            headers: {
                'Content-Type': 'multipart/form-data', // Header cho multipart
            },
        });
    },
};

export default fileApi;
