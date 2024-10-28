import axiosClient from './axiosClient';

const sportApi = {
    // Tạo mới một môn thể thao
    create(sportRequest) {
        const url = '/sport/create';
        return axiosClient.post(url, sportRequest);
    },

    // Lấy thông tin môn thể thao theo ID
    getById(sportId) {
        const url = `/sport/getById/${sportId}`;
        return axiosClient.get(url);
    },

    // Cập nhật thông tin môn thể thao theo ID
    update(sportId, sportRequest) {
        const url = `/sport/update/${sportId}`;
        return axiosClient.put(url, sportRequest);
    },

    // Xóa mềm môn thể thao theo ID
    softDelete(sportId) {
        const url = `/sport/softDelete/${sportId}`;
        return axiosClient.patch(url);
    },
    delete(sportId) {
        const url = `/sport/delete/${sportId}`;
        return axiosClient.delete(url);
    },

    // Lấy danh sách tất cả các môn thể thao
    getAll() {
        const url = '/sport/getAll';
        return axiosClient.get(url);
    },

    // Khôi phục môn thể thao đã bị xóa mềm theo ID
    restore(sportId) {
        const url = `/sport/restore/${sportId}`;
        return axiosClient.patch(url);
    }
};

export default sportApi;
